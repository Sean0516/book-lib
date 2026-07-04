---
title: 案例：死锁与锁等待激增
description: 从 InnoDB 等待图定位订单与库存反向加锁。
outline: deep
---

# 案例：死锁与锁等待激增

> [!IMPORTANT]
> 本案例为教学构造，重点是等待图、事务边界和可验证修复。

## 场景数据

| 项目 | 正常 | 故障 |
| --- | ---: | ---: |
| 峰值事务 | 2,400 TPS | 2,500 TPS |
| 死锁 | `< 1/min` | 48/min |
| 锁等待 TP99 | 18 ms | 2.7 s |
| 回滚率 | 0.03% | 4.6% |
| 热门 SKU 流量占比 | 8% | 43% |

## 面试版事故回答

两条流程分别按“订单→库存预占”和“库存预占→订单”更新相同行，热门 SKU 放大并发后形成
环形等待。`SHOW ENGINE INNODB STATUS` 给出最近死锁，`performance_schema.data_locks`
和事务 trace 还原锁顺序。先降低热门 SKU 并发、缩短事务并对死锁做带抖动的有限重试；
长期统一为“订单→库存”顺序，把远程调用移出事务，并用唯一业务键保证重试幂等。压测
必须保持 43% 热点分布，平均流量测试无法证明修复。

## 架构与故障传播

```mermaid
sequenceDiagram
  participant A as "支付确认 T1"
  participant O as "orders"
  participant I as "inventory_reservations"
  participant B as "取消订单 T2"
  A->>O: 锁 order#7
  B->>I: 锁 sku#9/order#7
  A->>I: 等待 T2
  B->>O: 等待 T1
```

## 时间线

| 时间 | 证据 | 动作 |
| --- | --- | --- |
| 20:00 | 热门活动开始 | TPS 正常 |
| 20:03 | 死锁 21/min | 保存死锁样本 |
| 20:06 | 回滚率 4.6% | 限制热门 SKU 并发 |
| 20:12 | 等待图确认反向加锁 | 下线取消流程新版本 |
| 20:28 | 死锁降至 2/min | 统一锁顺序灰度 |
| 21:10 | 峰值回放通过 | 恢复流量 |

## 从观察到结论

| 观察 | 推断 | 尚不能断言 |
| --- | --- | --- |
| TPS 基本不变 | 不是整体流量暴涨 | 无热点 |
| 热门 SKU 43% | 行竞争显著 | 一定存在死锁 |
| 等待图形成环 | 两事务互相等待 | 只需无限重试 |
| 事务含远程调用 | 持锁时间被放大 | 移出后业务一定正确 |

## 取证过程

```sql
SHOW ENGINE INNODB STATUS\G
SELECT * FROM performance_schema.data_lock_waits;
SELECT * FROM performance_schema.data_locks
WHERE OBJECT_NAME IN ('orders', 'inventory_reservations');
SELECT trx_id, trx_started, trx_query
FROM information_schema.innodb_trx
ORDER BY trx_started;
```

## 止血决策

1. 按 SKU 串行化最热的更新，保护其他商品。
2. 回滚引入反向锁序的新流程。
3. 死锁仅重试 2 次，使用指数退避和抖动；锁超时不盲目重试。
4. 暂停事务内风险校验远程调用，改用已缓存结果。

## 永久修复

```sql
START TRANSACTION;
SELECT id FROM orders WHERE id = ? FOR UPDATE;
SELECT id FROM inventory_reservations
 WHERE order_id = ? AND sku_id = ? FOR UPDATE;
UPDATE inventory_reservations SET state = ? WHERE id = ?;
UPDATE orders SET state = ? WHERE id = ?;
COMMIT;
```

所有写流程采用同一锁序；远程调用在事务前完成，事务内只做本地校验与写入。预占表增加
`UNIQUE(order_id, sku_id)`，重试不会重复创建记录。

## 方案取舍

| 方案 | 收益 | 风险 | 使用 |
| --- | --- | --- | --- |
| 有限死锁重试 | 吸收偶发冲突 | 放大持续争用 | 必须幂等 |
| 统一锁序 | 消除主要环路 | 需改所有路径 | 主修复 |
| 降低隔离级别 | 可能减少部分锁 | 一致性语义变化 | 不作为首选 |
| 热点排队 | 控制单行并发 | 增加热点延迟 | 活动期保护 |

## 验证与回滚

| 指标 | 故障 | 通过标准 |
| --- | ---: | ---: |
| 死锁 | 48/min | `< 1/min` |
| 锁等待 TP99 | 2.7 s | `< 50 ms` |
| 回滚率 | 4.6% | `< 0.1%` |
| 热点分布 | 43% | 压测保持 43% |

灰度死锁超过 5/min、库存对账不平或事务 TP99 超 150 ms 即回滚。

## 复盘与防复发

- 数据访问层记录事务名、锁序和持锁时间。
- 代码评审禁止事务中远程调用。
- 压测模型保留 Zipf 热点，不只做均匀流量。
- 死锁样本自动归档并按 SQL digest 聚类。

## 面试官追问与评分

1. 一级：死锁和锁等待的区别？——死锁形成环并被检测回滚；等待可能最终获得锁。
2. 二级：为什么重试必须幂等？——原事务可能部分产生外部副作用。
3. 三级：统一锁序仍有等待怎么办？——减少事务范围、热点排队或调整业务模型。

| 维度 | 5 分要求 |
| --- | --- |
| 正确性 | 能画出等待环 |
| 证据 | 使用 InnoDB 与 performance_schema |
| 取舍 | 重试、隔离级别、排队边界清晰 |
| 可运维性 | 有热点压测和对账 |
| 表达 | 锁序与事务边界讲清楚 |

## 延伸学习

[慢 SQL 案例](./slow-sql-timeout) · [订单存储设计](./high-concurrency-order-storage) ·
[返回数据库案例](./)

