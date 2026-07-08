---
title: JVM 完整案例
description: 从线程、CPU、GC 与延迟目标完成 JVM 生产问题推演。
---

# JVM 完整案例

训练目标是把 JVM 指标、线程栈、火焰图、GC 和代码变更连成证据链，而不是背命令。


## 可反向回答的题库问题

读完这些 JVM 案例后，不只是能讲“怎么调参数”，更应该能回答下面这些题：

- Full GC、内存泄漏、老年代增长分别怎么定位？
- CPU 100% 时，如何从进程、线程、栈和代码路径一步步缩小范围？
- 线程池核心线程数、最大线程数、队列长度和拒绝策略如何设计？
- 低延迟 Java 服务里，GC、对象分配、锁竞争和异步化分别怎么取舍？
- 线上止血和长期治理的边界在哪里？


## 前置知识

- [GC 选型与调优](../../jvm-concurrency/01-gc-selection-and-tuning)
- [线程池容量模型](../../jvm-concurrency/03-thread-pool-sizing)
- [CPU 飙高排查](../../jvm-concurrency/06-high-cpu-diagnosis)

## 案例

1. [既有案例：Full GC 导致 TP99 飙升](../../jvm-concurrency/case-full-gc-latency)
2. [CPU 持续 100% 排查](./high-cpu-incident)
3. [线程池耗尽与服务雪崩](./thread-pool-exhaustion)
4. [低延迟 Java 服务设计](./low-latency-java-service)

[返回案例库](../) · [下一模块：数据库](../database/)
