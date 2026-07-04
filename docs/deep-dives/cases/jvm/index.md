---
title: JVM 完整案例
description: 从线程、CPU、GC 与延迟目标完成 JVM 生产问题推演。
---

# JVM 完整案例

训练目标是把 JVM 指标、线程栈、火焰图、GC 和代码变更连成证据链，而不是背命令。

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
