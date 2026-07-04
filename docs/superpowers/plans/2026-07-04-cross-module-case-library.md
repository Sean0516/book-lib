# Cross-Module Case Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 15 production-depth interview cases across JVM, database, Redis, messaging, and system design, with searchable navigation, cross-links, and verified desktop/mobile rendering.

**Architecture:** Keep each case as an independent Markdown page under `docs/deep-dives/cases/<module>/`, with one index per module and a shared case-library index. Preserve the existing Full GC URL, link it from the JVM case index, and integrate all new pages through the existing VitePress sidebar and deep-dive landing page.

**Tech Stack:** VitePress 1.6.4, Markdown, Mermaid, Java/SQL/bash/configuration examples, local search, responsive CSS.

---

## File Map

**Create:**

- `docs/deep-dives/cases/index.md` — case-library overview and learning routes.
- `docs/deep-dives/cases/jvm/index.md` — JVM case entry, including the existing Full GC case.
- `docs/deep-dives/cases/jvm/high-cpu-incident.md`
- `docs/deep-dives/cases/jvm/thread-pool-exhaustion.md`
- `docs/deep-dives/cases/jvm/low-latency-java-service.md`
- `docs/deep-dives/cases/database/index.md`
- `docs/deep-dives/cases/database/slow-sql-timeout.md`
- `docs/deep-dives/cases/database/deadlock-and-lock-wait.md`
- `docs/deep-dives/cases/database/high-concurrency-order-storage.md`
- `docs/deep-dives/cases/redis/index.md`
- `docs/deep-dives/cases/redis/hot-key-overload.md`
- `docs/deep-dives/cases/redis/cache-breakdown-and-inconsistency.md`
- `docs/deep-dives/cases/redis/highly-available-cache.md`
- `docs/deep-dives/cases/messaging/index.md`
- `docs/deep-dives/cases/messaging/message-backlog.md`
- `docs/deep-dives/cases/messaging/duplicate-loss-and-disorder.md`
- `docs/deep-dives/cases/messaging/reliable-event-driven-architecture.md`
- `docs/deep-dives/cases/system-design/index.md`
- `docs/deep-dives/cases/system-design/flash-sale-overload.md`
- `docs/deep-dives/cases/system-design/cascading-failure.md`
- `docs/deep-dives/cases/system-design/high-concurrency-order-system.md`

**Modify:**

- `docs/.vitepress/config.mts` — case sidebar groups and links.
- `docs/deep-dives/index.md` — add complete-case-library entry and learning routes.
- `docs/deep-dives/jvm-concurrency/index.md` — add JVM case-library link.
- `docs/deep-dives/jvm-concurrency/03-thread-pool-sizing.md` — link thread-pool incident.
- `docs/deep-dives/jvm-concurrency/06-high-cpu-diagnosis.md` — link high-CPU incident.
- `docs/architecture/架构模块4-数据架构-标准答案库.md` — link database cases.
- `docs/fundamentals/基础模块6-缓存与消息基础-标准答案库.md` — link Redis and messaging cases.
- `docs/architecture/架构模块1-系统设计与容量规划-标准答案库.md` — link system-design cases.

## Shared Content Contract

Every incident case must use these exact second-level sections:

```markdown
## 场景数据
## 面试版事故回答
## 架构与故障传播
## 时间线
## 从观察到结论
## 取证过程
## 止血决策
## 永久修复
## 方案取舍
## 验证与回滚
## 复盘与防复发
## 面试官追问与评分
## 延伸学习
```

Every architecture case must use these exact second-level sections:

```markdown
## 需求与约束
## 面试版设计回答
## 容量估算
## 核心架构
## 数据模型与接口
## 关键链路
## 方案取舍
## 一致性与故障处理
## 扩容与演进
## 指标与验收
## 面试官追问与评分
## 延伸学习
```

Each case must contain an IMPORTANT disclaimer, at least one Mermaid diagram, one code/command/configuration block, one comparison or metric table, internally consistent numbers, three levels of follow-up questions, and a 25-point rubric covering correctness, evidence, trade-offs, operability, and expression.

### Task 1: Create the Case-Library Navigation Skeleton

**Files:**
- Create: `docs/deep-dives/cases/index.md`
- Create: `docs/deep-dives/cases/jvm/index.md`
- Create: `docs/deep-dives/cases/database/index.md`
- Create: `docs/deep-dives/cases/redis/index.md`
- Create: `docs/deep-dives/cases/messaging/index.md`
- Create: `docs/deep-dives/cases/system-design/index.md`

- [ ] **Step 1: Create the six entry pages**

The main index must list all 15 new cases in a five-row table with columns `模块 / 故障案例 / 架构案例 / 建议顺序`. Each module index must state its training goals, prerequisites, two incident cases, one architecture case, and links to the previous and next modules. The JVM index must additionally link `../../jvm-concurrency/case-full-gc-latency`.

- [ ] **Step 2: Verify every planned link target is represented**

Run:

```bash
rg -o '\\]\\([^)]+' docs/deep-dives/cases/*/index.md docs/deep-dives/cases/index.md
```

Expected: output contains links for all 15 case slugs plus the existing Full GC case.

- [ ] **Step 3: Commit the entry pages**

```bash
git add docs/deep-dives/cases
git commit -m "docs: add cross-module case library entry points"
```

### Task 2: Add Three Complete JVM Cases

**Files:**
- Create: `docs/deep-dives/cases/jvm/high-cpu-incident.md`
- Create: `docs/deep-dives/cases/jvm/thread-pool-exhaustion.md`
- Create: `docs/deep-dives/cases/jvm/low-latency-java-service.md`

- [ ] **Step 1: Write the high-CPU incident**

Use a Java API at 1,200 QPS where CPU rises from 38% to 97%, TP99 rises from 210 ms to 3.2 s, and one request path repeatedly parses a 1.8 MiB rules payload. Prove the root cause by correlating `top -H`, `jstack`, async-profiler, allocation rate, and a deployment diff. Include rollback, parsed-rule caching with bounded cardinality, and acceptance targets of CPU below 60% and TP99 below 300 ms for 30 minutes.

- [ ] **Step 2: Write the thread-pool exhaustion incident**

Use 900 QPS, a 200-thread request pool, a downstream timeout change from 300 ms to 3 s, queue growth to 10,000, and retry amplification to 2.4 calls per user request. Show Little's Law, thread dumps, pool metrics, bulkhead isolation, deadline propagation, bounded queues, and retry-budget validation.

- [ ] **Step 3: Write the low-latency Java architecture case**

Design for 8,000 peak QPS, TP99 below 80 ms, 99.95% availability, and 3× burst tolerance. Compare G1 and ZGC, synchronous and asynchronous dependency calls, platform and virtual threads, cache boundaries, load shedding, warm-up, observability, and a staged migration.

- [ ] **Step 4: Validate the JVM content contract**

Run:

```bash
for f in docs/deep-dives/cases/jvm/*.md; do
  test "$(rg -c '^```mermaid$' "$f")" -ge 1 || exit 1
  test "$(rg -c '^## 面试官追问与评分$' "$f")" -eq 1 || exit 1
done
```

Expected: exit status `0`.

- [ ] **Step 5: Commit the JVM cases**

```bash
git add docs/deep-dives/cases/jvm
git commit -m "docs: add complete JVM interview cases"
```

### Task 3: Add Three Complete Database Cases

**Files:**
- Create: `docs/deep-dives/cases/database/slow-sql-timeout.md`
- Create: `docs/deep-dives/cases/database/deadlock-and-lock-wait.md`
- Create: `docs/deep-dives/cases/database/high-concurrency-order-storage.md`

- [ ] **Step 1: Write the slow-SQL incident**

Use a 120-million-row MySQL 8 orders table, a query that scans 8.6 million rows, DB CPU rising from 42% to 93%, and API TP99 rising from 260 ms to 5.1 s. Include `EXPLAIN ANALYZE`, data distribution, a composite covering-index decision, online index rollout, plan regression monitoring, and rollback thresholds.

- [ ] **Step 2: Write the deadlock and lock-wait incident**

Use two order workflows that update `orders` and `inventory_reservations` in opposite order, creating 48 deadlocks/minute at peak. Include `SHOW ENGINE INNODB STATUS`, `performance_schema.data_locks`, transaction timelines, canonical lock ordering, smaller transaction scope, bounded deadlock retry, and validation under skewed SKU traffic.

- [ ] **Step 3: Write the order-storage architecture case**

Design for 50,000 order writes/s at peak, 2 billion orders/year, seven-year retention, per-user queries, merchant reconciliation, and no duplicate orders. Compare single-cluster partitioning, sharding, and log-first ingestion; define IDs, shard keys, indexes, CDC, archive tiers, migration, and reconciliation.

- [ ] **Step 4: Run the module contract check and commit**

```bash
for f in docs/deep-dives/cases/database/*.md; do
  test "$(rg -c '^```mermaid$' "$f")" -ge 1 || exit 1
  test "$(rg -c '^## 面试官追问与评分$' "$f")" -eq 1 || exit 1
done
git add docs/deep-dives/cases/database
git commit -m "docs: add complete database interview cases"
```

Expected: checks pass and one commit is created.

### Task 4: Add Three Complete Redis Cases

**Files:**
- Create: `docs/deep-dives/cases/redis/hot-key-overload.md`
- Create: `docs/deep-dives/cases/redis/cache-breakdown-and-inconsistency.md`
- Create: `docs/deep-dives/cases/redis/highly-available-cache.md`

- [ ] **Step 1: Write the hot-key incident**

Use 180,000 cache operations/s where one celebrity-product key receives 62% of reads, one Redis shard reaches 96% CPU, and TP99 rises from 12 ms to 480 ms. Show `redis-cli --hotkeys`, per-key sampling, local-cache replication, key fan-out, stale-read bounds, and hot-key promotion/demotion.

- [ ] **Step 2: Write the cache-breakdown and inconsistency incident**

Use a 20-minute product TTL, 35,000 simultaneous misses after expiration, DB connection saturation, and a price update that remains stale for 11 minutes. Separate breakdown from consistency failure; compare mutex rebuild, logical expiration, jitter, CDC invalidation, delayed double delete, and versioned values.

- [ ] **Step 3: Write the highly available cache architecture case**

Design for 1.2 million reads/s, 80,000 writes/s, 99.99% availability, region failover within 60 seconds, and bounded staleness of 5 seconds. Cover local plus Redis cache layers, Cluster sharding, replica lag, failover, hot/big keys, cache warm-up, DB protection, and capacity watermarks.

- [ ] **Step 4: Run the module contract check and commit**

Use the Task 3 check with directory `docs/deep-dives/cases/redis`, then:

```bash
git add docs/deep-dives/cases/redis
git commit -m "docs: add complete Redis interview cases"
```

Expected: checks pass and one commit is created.

### Task 5: Add Three Complete Messaging Cases

**Files:**
- Create: `docs/deep-dives/cases/messaging/message-backlog.md`
- Create: `docs/deep-dives/cases/messaging/duplicate-loss-and-disorder.md`
- Create: `docs/deep-dives/cases/messaging/reliable-event-driven-architecture.md`

- [ ] **Step 1: Write the backlog incident**

Use ingress rising from 20,000 to 55,000 messages/s while consumers remain at 28,000/s, backlog reaching 48 million, and oldest-message age reaching 31 minutes. Calculate drain time, distinguish partition and consumer bottlenecks, show safe horizontal expansion, downstream protection, and replay validation.

- [ ] **Step 2: Write the duplicate/loss/disorder incident**

Use payment events where producer retries create 0.7% duplicates, acknowledgement timing loses 1,240 events during a crash, and cross-partition processing reorders status transitions. Cover outbox, idempotency keys, consumer transaction boundaries, partition keys, state-machine guards, reconciliation, and poison-message handling.

- [ ] **Step 3: Write the reliable event-driven architecture case**

Design an order-payment-inventory event flow for 30,000 commands/s, end-to-end P99 below 3 seconds, no silent loss, and replay for 30 days. Compare Kafka and RocketMQ semantics where relevant; define outbox/CDC, schemas, partitioning, retries, DLQ, idempotency, tracing, replay, and disaster recovery.

- [ ] **Step 4: Run the module contract check and commit**

Use the Task 3 check with directory `docs/deep-dives/cases/messaging`, then:

```bash
git add docs/deep-dives/cases/messaging
git commit -m "docs: add complete messaging interview cases"
```

Expected: checks pass and one commit is created.

### Task 6: Add Three Complete System-Design Cases

**Files:**
- Create: `docs/deep-dives/cases/system-design/flash-sale-overload.md`
- Create: `docs/deep-dives/cases/system-design/cascading-failure.md`
- Create: `docs/deep-dives/cases/system-design/high-concurrency-order-system.md`

- [ ] **Step 1: Write the flash-sale incident**

Use traffic jumping from 8,000 to 420,000 requests/s in 12 seconds, gateway CPU at 100%, inventory DB connections exhausted, and 3,600 oversold units. Trace missing admission control, non-atomic inventory checks, retries, and synchronous dependency calls; include layered throttling, token inventory, queueing, reconciliation, and recovery.

- [ ] **Step 2: Write the cascading-failure incident**

Use a recommendation dependency slowing from 80 ms to 2.5 s, caller retries multiplying traffic 3.1×, shared thread pools saturating, and checkout availability falling to 71%. Include dependency topology, deadline budgets, bulkheads, circuit breakers, fallback quality, retry budgets, and game-day verification.

- [ ] **Step 3: Write the high-concurrency order-system architecture case**

Design for 100,000 order attempts/s, 20,000 successful orders/s, no duplicate order creation, 99.99% availability, and payment completion within 15 minutes. Cover admission, idempotency, inventory reservation, order state machine, events, storage partitioning, reconciliation, degradation, multi-region recovery, and capacity estimates.

- [ ] **Step 4: Run the module contract check and commit**

Use the Task 3 check with directory `docs/deep-dives/cases/system-design`, then:

```bash
git add docs/deep-dives/cases/system-design
git commit -m "docs: add complete system-design interview cases"
```

Expected: checks pass and one commit is created.

### Task 7: Integrate Sidebar, Landing Pages, and Cross-Links

**Files:**
- Modify: `docs/.vitepress/config.mts`
- Modify: `docs/deep-dives/index.md`
- Modify: `docs/deep-dives/jvm-concurrency/index.md`
- Modify: `docs/deep-dives/jvm-concurrency/03-thread-pool-sizing.md`
- Modify: `docs/deep-dives/jvm-concurrency/06-high-cpu-diagnosis.md`
- Modify: `docs/architecture/架构模块4-数据架构-标准答案库.md`
- Modify: `docs/fundamentals/基础模块6-缓存与消息基础-标准答案库.md`
- Modify: `docs/architecture/架构模块1-系统设计与容量规划-标准答案库.md`

- [ ] **Step 1: Add typed case-navigation arrays**

In `config.mts`, define one item array per module, headed by its module index and followed by the three cases. Add five collapsed sidebar groups under `/deep-dives/` after `JVM 与并发`; the group names are `JVM 完整案例`, `数据库完整案例`, `Redis 完整案例`, `消息队列完整案例`, and `系统设计完整案例`.

- [ ] **Step 2: Add landing-page and bidirectional links**

Add a “完整案例库” section to `docs/deep-dives/index.md`, a case-library callout to the JVM module index, related-case links to the two JVM articles, and a concise `> [!TIP]` block near the start of each original question-bank file pointing to its module case index.

- [ ] **Step 3: Verify link strings and commit**

```bash
rg -n '/deep-dives/cases/' docs/.vitepress/config.mts docs/deep-dives docs/fundamentals docs/architecture
git add docs/.vitepress/config.mts docs/deep-dives docs/fundamentals docs/architecture
git commit -m "feat: integrate complete case library"
```

Expected: all five module indexes and all 15 cases appear in sidebar or content links.

### Task 8: Run Automated Content and Build Verification

**Files:**
- Verify: all files under `docs/deep-dives/cases/`

- [ ] **Step 1: Verify counts and required content**

```bash
test "$(find docs/deep-dives/cases -mindepth 2 -type f -name '*.md' ! -name index.md | wc -l | tr -d ' ')" = "15"
test "$(find docs/deep-dives/cases -mindepth 2 -type f -name index.md | wc -l | tr -d ' ')" = "5"
test "$(rg -l '^```mermaid$' docs/deep-dives/cases/*/*.md | wc -l | tr -d ' ')" = "15"
test "$(rg -l '^## 面试官追问与评分$' docs/deep-dives/cases/*/*.md | wc -l | tr -d ' ')" = "15"
! rg -n '待补充|尚未完成|真实公司事故' docs/deep-dives/cases
```

Expected: every command exits `0`.

- [ ] **Step 2: Build for local and GitHub Pages paths**

```bash
npm run build
BASE_PATH=/book-lib/ npm run build
```

Expected: both builds complete without dead-link errors.

- [ ] **Step 3: Commit any verification corrections**

If verification required content corrections, stage only those corrected case or navigation files and commit:

```bash
git commit -m "fix: pass case library quality checks"
```

Expected: either a focused correction commit is created or the working tree has no new verification corrections.

### Task 9: Verify Desktop, Mobile, Search, and Final Repository State

**Files:**
- Verify: generated site and Git state.

- [ ] **Step 1: Start the local site**

```bash
npm run dev -- --host 127.0.0.1
```

Expected: VitePress reports a local URL.

- [ ] **Step 2: Check representative pages in a browser**

At desktop width, inspect the case index, one incident case, and one architecture case. At `390×844`, verify the same pages have readable text, no page-level horizontal overflow, horizontally scrollable tables/code, usable Mermaid diagrams, and accessible mobile navigation.

- [ ] **Step 3: Verify local search**

Search for `线程池耗尽`, `死锁`, `热 Key`, `消息积压`, and `级联雪崩`.

Expected: each query returns its corresponding new case and no `docs/superpowers/` design or plan document.

- [ ] **Step 4: Check repository state**

```bash
git status --short
git log --oneline -10
```

Expected: only previously known unrelated changes remain; the case-library work is represented by focused commits from Tasks 1–8.
