# JVM 与并发深度精选 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first deep-content sample module with six interview-ready JVM/concurrency articles, one Full GC teaching case, bidirectional links, navigation, and verified mobile-friendly VitePress output.

**Architecture:** Add an isolated `docs/deep-dives/jvm-concurrency/` content unit without expanding the existing 520-question bank. Each article follows a two-layer model—an immediately usable 60–90 second answer followed by mechanisms, diagrams, code/configuration, trade-offs, metrics, follow-ups, and scoring—while the case study links the six topics into one coherent production-style investigation.

**Tech Stack:** VitePress, Markdown, Mermaid, Java, JVM unified logging, shell-based structural checks, Playwright browser verification

---

## File map

- `docs/deep-dives/index.md`: deep-content landing page and three role-based routes.
- `docs/deep-dives/jvm-concurrency/index.md`: module goals, prerequisites, article sequence, and case entry.
- `docs/deep-dives/jvm-concurrency/01-gc-selection-and-tuning.md`: collector selection and evidence-led tuning.
- `docs/deep-dives/jvm-concurrency/02-memory-leak-diagnosis.md`: metrics-to-reference-chain leak investigation.
- `docs/deep-dives/jvm-concurrency/03-thread-pool-sizing.md`: capacity-driven pool sizing and backpressure.
- `docs/deep-dives/jvm-concurrency/04-lock-contention.md`: contention diagnosis and alternative designs.
- `docs/deep-dives/jvm-concurrency/05-jmm-and-visibility.md`: JMM, happens-before, volatile, and locks.
- `docs/deep-dives/jvm-concurrency/06-high-cpu-diagnosis.md`: process/thread/stack/GC/hot-method diagnosis.
- `docs/deep-dives/jvm-concurrency/case-full-gc-latency.md`: coherent Full GC and TP99 teaching case.
- `docs/.vitepress/config.mts`: navbar and deep-dive sidebar.
- `docs/index.md`: homepage deep-content entry.
- `docs/fundamentals/基础模块2-JVM基础-标准答案库.md`: links to relevant deep articles.
- `docs/fundamentals/基础模块3-并发基础-标准答案库.md`: links to relevant deep articles.
- `docs/.vitepress/theme/custom.css`: reusable deep-content metadata and score-card styling.

## Shared article contract

Every one of the six question articles must contain these exact discoverable markers:

```markdown
## 60–90 秒速答
## 面试官评分点
## 一句话记忆
## 常见失分
## 原理与边界
## 工程落地
## 方案对比
## 指标与验证
## 三级追问
## 自测与评分
```

Each article must also contain:

- frontmatter with `title`, `description`, and `outline: deep`;
- at least one `mermaid` block;
- at least one Java, shell, JVM log, or configuration code block;
- one Markdown table whose columns cover `适用场景 | 收益 | 代价 | 风险`;
- three numbered follow-ups labelled `原理追问`, `工程追问`, and `架构追问`;
- a 25-point rubric with correctness, depth, trade-offs, structure, and operability;
- a metric definition with formula/measurement method, source, example baseline, and action;
- an explicit note that numerical baselines are examples and require workload calibration;
- links to the module index, the Full GC case where relevant, and the original question bank.

Do not repeat generic prose between articles. Every example, metric, diagram, and trade-off must be specific to
the article’s mechanism.

### Task 1: Create the deep-content entry points

**Files:**
- Create: `docs/deep-dives/index.md`
- Create: `docs/deep-dives/jvm-concurrency/index.md`

- [ ] **Step 1: Establish the failing inventory check**

Run:

```bash
test -f docs/deep-dives/index.md
test -f docs/deep-dives/jvm-concurrency/index.md
```

Expected: FAIL because both entry pages are absent.

- [ ] **Step 2: Write the global deep-content landing page**

Create `docs/deep-dives/index.md` with:

- title `深度精选`;
- explanation of the breadth-bank/depth-layer model;
- a prominent JVM/concurrency module link;
- route tables for `高级 Java 后端`, `架构师/技术负责人`, and `AI 架构师`;
- a quality legend explaining diagrams, code, cases, metrics, and 25-point scoring;
- a note that later modules will be added only after the sample module passes review.

- [ ] **Step 3: Write the JVM/concurrency module page**

Create `docs/deep-dives/jvm-concurrency/index.md` with:

- prerequisites linking to the original JVM and concurrency banks;
- six ordered article links using the filenames in the file map;
- one Full GC case link;
- two study routes: `面试前 30 分钟` and `系统学习 3 小时`;
- a self-check checklist: can explain, draw, diagnose, compare, and quantify.

- [ ] **Step 4: Verify entry pages**

Run:

```bash
rg -n '高级 Java 后端|架构师/技术负责人|AI 架构师|JVM 与并发' docs/deep-dives/index.md
rg -n '01-gc-selection|02-memory-leak|03-thread-pool|04-lock-contention|05-jmm|06-high-cpu|case-full-gc' docs/deep-dives/jvm-concurrency/index.md
```

Expected: all three routes and all seven content links match.

- [ ] **Step 5: Commit**

```bash
git add docs/deep-dives
git commit -m "docs: add deep-dive learning entry points"
```

### Task 2: Write GC selection and memory-leak articles

**Files:**
- Create: `docs/deep-dives/jvm-concurrency/01-gc-selection-and-tuning.md`
- Create: `docs/deep-dives/jvm-concurrency/02-memory-leak-diagnosis.md`

- [ ] **Step 1: Confirm article contract initially fails**

Run:

```bash
for f in docs/deep-dives/jvm-concurrency/01-gc-selection-and-tuning.md docs/deep-dives/jvm-concurrency/02-memory-leak-diagnosis.md; do
  test -f "$f"
done
```

Expected: FAIL because the articles do not exist.

- [ ] **Step 2: Write the GC selection article**

The answer must lead with workload goals rather than collector slogans. Include:

- a collector decision flow among G1, ZGC, and Shenandoah;
- a Mermaid flow from `SLO/heap/allocation rate` to collector choice and load testing;
- JVM 17/21 unified logging examples using `-Xlog:gc*,safepoint`;
- an example baseline table covering p99 pause, allocation rate, promotion rate, CPU overhead, and Full GC;
- trade-offs between throughput, pause target, heap size, operational maturity, and JDK support;
- a tuning loop: baseline → one-variable change → replay → compare → rollback;
- follow-ups about `MaxGCPauseMillis`, concurrent collector CPU cost, and when tuning cannot fix a leak.

- [ ] **Step 3: Write the memory-leak article**

Include:

- a Mermaid evidence path from `old-gen after-GC rising` to histogram, dump, dominator tree, and GC roots;
- commands for `jcmd GC.class_histogram`, `GC.heap_dump`, and JFR recording;
- a small Java `ThreadLocal` or unbounded cache leak example plus the corrected version;
- distinction table for leak, high live set, allocation burst, and insufficient heap;
- metrics: after-GC old-gen slope, retained size, Full GC frequency, allocation rate;
- follow-ups about dump timing, production impact, classloader leaks, and why adding heap delays rather than fixes.

- [ ] **Step 4: Validate the two articles**

Run:

```bash
for f in docs/deep-dives/jvm-concurrency/0{1,2}-*.md; do
  rg -q '^## 60–90 秒速答$' "$f"
  rg -q '^```mermaid$' "$f"
  rg -q '^## 三级追问$' "$f"
  rg -q '25 分' "$f"
done
```

Expected: every assertion passes.

- [ ] **Step 5: Commit**

```bash
git add docs/deep-dives/jvm-concurrency/01-gc-selection-and-tuning.md docs/deep-dives/jvm-concurrency/02-memory-leak-diagnosis.md
git commit -m "docs: add GC and memory leak deep dives"
```

### Task 3: Write thread-pool and lock-contention articles

**Files:**
- Create: `docs/deep-dives/jvm-concurrency/03-thread-pool-sizing.md`
- Create: `docs/deep-dives/jvm-concurrency/04-lock-contention.md`

- [ ] **Step 1: Write the thread-pool article**

Include:

- a 60–90 second answer that begins with arrival rate, service time, downstream capacity, and latency SLO;
- Little’s Law `L = λW`, clearly marked as an estimate rather than a magic sizing formula;
- a Mermaid queue diagram showing caller, bounded executor, downstream pool, rejection, and fallback;
- Java `ThreadPoolExecutor` with named threads, bounded queue, explicit timeout, metrics, and rejection;
- comparison of fixed, elastic, virtual-thread, and async/event-loop approaches;
- worked example with 200 QPS, 80 ms mean service time, 300 ms p99, downstream maximum 40 concurrent calls;
- metrics for active ratio, queue wait p99, rejection rate, task duration, and downstream saturation;
- follow-ups on CPU-bound versus IO-bound, unbounded queues, virtual threads, and retry storms.

- [ ] **Step 2: Write the lock-contention article**

Include:

- a Mermaid timeline showing runnable, blocked, lock holder, and downstream call;
- commands and interpretation for `jcmd Thread.print -l`, JFR lock events, and async-profiler lock mode;
- a Java example that incorrectly performs remote IO inside `synchronized`, then narrows the critical section;
- comparison of lock narrowing, striping, read/write locks, CAS, immutable snapshots, and actor/queue models;
- metrics for blocked time, contention count, lock hold p99, runnable threads, and throughput;
- follow-ups on fairness, CAS under high contention, lock elimination, and correctness risks.

- [ ] **Step 3: Validate the two articles**

Run:

```bash
for f in docs/deep-dives/jvm-concurrency/0{3,4}-*.md; do
  rg -q '^## 60–90 秒速答$' "$f"
  rg -q '^```mermaid$' "$f"
  rg -q '^## 方案对比$' "$f"
  rg -q '适用场景.*收益.*代价.*风险' "$f"
done
```

Expected: every assertion passes.

- [ ] **Step 4: Commit**

```bash
git add docs/deep-dives/jvm-concurrency/03-thread-pool-sizing.md docs/deep-dives/jvm-concurrency/04-lock-contention.md
git commit -m "docs: add concurrency capacity deep dives"
```

### Task 4: Write JMM and high-CPU articles

**Files:**
- Create: `docs/deep-dives/jvm-concurrency/05-jmm-and-visibility.md`
- Create: `docs/deep-dives/jvm-concurrency/06-high-cpu-diagnosis.md`

- [ ] **Step 1: Write the JMM article**

Include:

- separation of atomicity, visibility, and ordering;
- a Mermaid happens-before graph covering program order, monitor unlock/lock, volatile write/read, thread start/join;
- a broken stop-flag example, a volatile fix, and an atomic compound-operation example;
- comparison of volatile, synchronized, `Lock`, atomics, immutable publication, and message passing;
- metrics framed as verification signals—stress-test failures, stale-read count, contention, and throughput—not
  fictional production counters that the JVM cannot directly expose;
- follow-ups on DCL, final-field semantics, volatile compound operations, and why `sleep` is not synchronization.

- [ ] **Step 2: Write the high-CPU article**

Include:

- the complete Linux/JVM workflow: process → native thread → hexadecimal nid → stack → GC/JFR/profile;
- commands using `top`, `pidstat`, `printf '%x'`, `jcmd`, JFR, and async-profiler;
- a Mermaid decision tree distinguishing GC, busy loop, lock spin, serialization, regex, and kernel/system CPU;
- an example stack correlation with timestamps rather than one isolated snapshot;
- comparison of thread dumps, JFR, sampling profiler, and eBPF-oriented system profiling;
- metrics for process CPU, user/system split, run queue, GC CPU, hot-thread persistence, and request impact;
- follow-ups on container CPU quota, safepoints, one-core saturation, and emergency mitigation.

- [ ] **Step 3: Validate all six articles against the contract**

Run:

```bash
for f in docs/deep-dives/jvm-concurrency/0[1-6]-*.md; do
  for marker in '60–90 秒速答' '面试官评分点' '一句话记忆' '常见失分' '原理与边界' '工程落地' '方案对比' '指标与验证' '三级追问' '自测与评分'; do
    rg -q "^## $marker$" "$f"
  done
  rg -q '^```mermaid$' "$f"
  rg -q '适用场景.*收益.*代价.*风险' "$f"
  rg -q '原理追问' "$f"
  rg -q '工程追问' "$f"
  rg -q '架构追问' "$f"
done
```

Expected: every assertion passes for six files.

- [ ] **Step 4: Commit**

```bash
git add docs/deep-dives/jvm-concurrency/05-jmm-and-visibility.md docs/deep-dives/jvm-concurrency/06-high-cpu-diagnosis.md
git commit -m "docs: add JMM and high CPU deep dives"
```

### Task 5: Write the Full GC teaching case

**Files:**
- Create: `docs/deep-dives/jvm-concurrency/case-full-gc-latency.md`

- [ ] **Step 1: Write a consistent incident dataset**

Use one fictional-but-explicit teaching scenario:

```text
Service: recommendation aggregation API
Runtime: JDK 17, G1, 8 GiB heap, 4 vCPU
Normal load: 650 QPS
Normal TP99: 180 ms
Incident TP99: 4.8 s
Old-gen after-GC: rises from 2.1 GiB to 6.7 GiB over 42 minutes
Full GC: 0/h to 7 in 15 minutes
Dominant retained object: tenant rule cache, 4.3 GiB
Trigger: cache key gained a request timestamp and became effectively unbounded
```

All later diagrams, logs, calculations, and conclusions must use this dataset.

- [ ] **Step 2: Write the case article**

Include:

- teaching-case disclosure;
- incident background, impact, timeline, and initial hypotheses;
- dependency/metric Mermaid diagram and an investigation sequence diagram;
- representative but clearly abbreviated GC log and histogram excerpts;
- evidence table separating observations from inferences;
- emergency actions: stop cache growth, cap entries, shed optional traffic, preserve evidence;
- permanent fix with bounded cache key, weight/TTL policy, and regression test;
- rollback and validation plan;
- metric before/after table;
- retrospective with detection, design, testing, and operating-control improvements;
- links to all six deep articles.

- [ ] **Step 3: Check dataset consistency**

Run:

```bash
rg -n '650 QPS|180 ms|4\\.8 s|2\\.1 GiB|6\\.7 GiB|42 分钟|7 次|4\\.3 GiB' docs/deep-dives/jvm-concurrency/case-full-gc-latency.md
```

Expected: every scenario value appears in the case.

- [ ] **Step 4: Commit**

```bash
git add docs/deep-dives/jvm-concurrency/case-full-gc-latency.md
git commit -m "docs: add Full GC latency teaching case"
```

### Task 6: Integrate navigation and bidirectional links

**Files:**
- Modify: `docs/.vitepress/config.mts`
- Modify: `docs/index.md`
- Modify: `docs/fundamentals/基础模块2-JVM基础-标准答案库.md`
- Modify: `docs/fundamentals/基础模块3-并发基础-标准答案库.md`
- Modify: `docs/.vitepress/theme/custom.css`

- [ ] **Step 1: Add explicit deep-dive navigation**

In `config.mts`:

- add navbar item `{ text: '深度精选', link: '/deep-dives/' }`;
- add `/deep-dives/` sidebar with global entry, module entry, six articles, and the Full GC case;
- keep existing sidebars unchanged.

- [ ] **Step 2: Add homepage entry**

Add a `深度精选` feature to `docs/index.md` describing diagrams, code, cases, metrics, and interview scoring,
linking to `/deep-dives/`.

- [ ] **Step 3: Add original-bank links**

Add a short `::: tip 深度阅读` block after the matching questions:

- JVM bank: GC selection, memory leak, high CPU.
- Concurrency bank: thread pool, lock contention, JMM/visibility.

Each block links to the corresponding deep article and the teaching case when relevant. Preserve all original
answer content.

- [ ] **Step 4: Add focused styling**

Add reusable CSS for:

- compact article metadata lists;
- readable wide comparison tables with mobile overflow;
- score/rubric callouts;
- print-safe Mermaid and code regions.

Do not introduce JavaScript or custom Vue components.

- [ ] **Step 5: Verify navigation and links**

Run:

```bash
rg -n \"深度精选|/deep-dives/\" docs/.vitepress/config.mts docs/index.md
rg -n 'deep-dives/jvm-concurrency' docs/fundamentals/基础模块{2-JVM基础,3-并发基础}-标准答案库.md
```

Expected: navbar/sidebar/homepage and six original-bank links are present.

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/config.mts docs/.vitepress/theme/custom.css docs/index.md docs/fundamentals
git commit -m "feat: integrate JVM deep dives into documentation"
```

### Task 7: Quality, build, and browser verification

**Files:**
- Modify only files that fail checks.

- [ ] **Step 1: Run structural quality checks**

Run:

```bash
test "$(find docs/deep-dives/jvm-concurrency -maxdepth 1 -name '0[1-6]-*.md' | wc -l | tr -d ' ')" = 6
test "$(find docs/deep-dives/jvm-concurrency -maxdepth 1 -name 'case-*.md' | wc -l | tr -d ' ')" = 1
test "$(rg '^```mermaid$' docs/deep-dives/jvm-concurrency -g '*.md' | wc -l | tr -d ' ')" -ge 2
test "$(rg '^```(java|bash|shell|text|properties|yaml)$' docs/deep-dives/jvm-concurrency -g '*.md' | wc -l | tr -d ' ')" -ge 3
if rg -n 'T[B]D|T[O]DO|待补充|真实公司|行业标准' docs/deep-dives/jvm-concurrency; then exit 1; fi
```

Expected: six questions, one case, minimum visual/code counts, and no placeholders or misleading claims.

- [ ] **Step 2: Perform editorial consistency review**

Read all seven files in sequence and verify:

- no answer contradicts another article;
- example numbers are internally consistent;
- commands state prerequisites and production impact;
- example baselines are labelled for calibration;
- speech answers fit approximately 60–90 seconds;
- Mermaid node labels render safely when punctuation is present;
- links and filenames match `config.mts`.

Record fixes directly in the affected article.

- [ ] **Step 3: Run both production builds**

Run:

```bash
npm run build
BASE_PATH=/book-lib/ npm run build
```

Expected: both commands exit 0 with no dead-link or Markdown rendering error.

- [ ] **Step 4: Verify desktop interactions**

Start `npm run dev -- --host 127.0.0.1`, then verify:

- homepage `深度精选` entry;
- deep-dive sidebar order;
- local search for `Full GC` and `happens-before`;
- original-bank to deep-article links;
- deep-article to case and module links;
- dark-mode readability.

- [ ] **Step 5: Verify mobile reading**

At 390×844, inspect one diagram-heavy article, one wide table, one code block, and the Full GC case. Confirm:

- no body-level horizontal overflow;
- code, table, and Mermaid regions scroll horizontally;
- 60–90 second answer appears before long detail;
- headings wrap naturally;
- navigation remains usable.

- [ ] **Step 6: Run final repository checks**

Run:

```bash
git status --short
git diff --check
```

Expected: only intentional verification fixes are uncommitted; imported legacy files may retain Markdown
hard-break whitespace, but new deep-dive files must have no accidental trailing whitespace.

- [ ] **Step 7: Commit verification fixes**

```bash
git add docs
git commit -m "fix: polish JVM deep-dive content"
```

Skip only if Step 2–5 require no changes.
