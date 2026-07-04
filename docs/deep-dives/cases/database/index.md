---
title: 数据库完整案例
description: 从执行计划、锁图与容量约束推演 MySQL 故障和存储架构。
---

# 数据库完整案例

训练目标是先用工作负载和数据库证据确认瓶颈，再选择最低风险修复，最后说明扩展边界。

## 前置知识

熟悉联合索引、MVCC、事务隔离、InnoDB 锁和分片基本概念。

## 案例

1. [慢 SQL 导致接口超时](./slow-sql-timeout)
2. [死锁与锁等待激增](./deadlock-and-lock-wait)
3. [高并发订单存储设计](./high-concurrency-order-storage)

[上一模块：JVM](../jvm/) · [下一模块：Redis](../redis/)

