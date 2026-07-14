<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, withBase } from 'vitepress'

type Topic = {
  title: string
  group: '基础' | '架构' | 'AI'
  description: string
  link: string
  keywords: string
}

const router = useRouter()
const query = ref('')
const searchInput = ref<HTMLInputElement>()
const recent = ref<Topic | null>(null)

const topics: Topic[] = [
  { title: 'Java 基础与集合', group: '基础', description: '语言特性、集合与工程实践', link: '/fundamentals/基础模块1-Java基础与集合-标准答案库', keywords: 'hashmap arraylist 泛型 反射' },
  { title: 'JVM 基础', group: '基础', description: '内存、GC、类加载与调优', link: '/fundamentals/基础模块2-JVM基础-标准答案库', keywords: '虚拟机 垃圾回收 gc classloader' },
  { title: '并发基础', group: '基础', description: '线程、锁、线程池与 JMM', link: '/fundamentals/基础模块3-并发基础-标准答案库', keywords: '并发 锁 synchronized volatile 线程池 jmm' },
  { title: '计算机基础', group: '基础', description: '网络、操作系统与 Linux', link: '/fundamentals/基础模块4-计算机基础-标准答案库', keywords: 'tcp http 操作系统 linux 网络' },
  { title: '数据库基础', group: '基础', description: '索引、事务、锁与 SQL', link: '/fundamentals/基础模块5-数据库基础-标准答案库', keywords: 'mysql 索引 事务 sql mvcc 慢查询 慢 sql' },
  { title: '缓存与消息', group: '基础', description: 'Redis、MQ 与一致性', link: '/fundamentals/基础模块6-缓存与消息基础-标准答案库', keywords: 'redis kafka mq 缓存 消息队列' },
  { title: 'Spring 基础', group: '基础', description: 'IoC、AOP、事务与启动流程', link: '/fundamentals/基础模块7-Spring基础-标准答案库', keywords: 'spring boot ioc aop bean 事务' },
  { title: '算法与数据结构', group: '基础', description: '复杂度、常用结构与算法', link: '/fundamentals/基础模块8-算法与数据结构基础-标准答案库', keywords: '算法 数据结构 leetcode 复杂度' },
  { title: '系统设计与容量规划', group: '架构', description: '估算、SLO 与方案取舍', link: '/architecture/架构模块1-系统设计与容量规划-标准答案库', keywords: '容量 qps slo 系统设计' },
  { title: '分布式架构基础', group: '架构', description: '一致性、共识与分布式事务', link: '/architecture/架构模块2-分布式架构基础-标准答案库', keywords: 'cap raft paxos 分布式事务' },
  { title: '微服务治理', group: '架构', description: '拆分、注册发现与流量治理', link: '/architecture/架构模块3-微服务治理-标准答案库', keywords: '微服务 熔断 限流 注册中心' },
  { title: '数据架构', group: '架构', description: '存储选型、分片与数据治理', link: '/architecture/架构模块4-数据架构-标准答案库', keywords: '分库分表 数据库 分片 存储' },
  { title: '消息与异步架构', group: '架构', description: '事件驱动、可靠性与积压治理', link: '/architecture/架构模块5-消息与异步架构-标准答案库', keywords: '消息队列 kafka 事件驱动 积压' },
  { title: '稳定性与高可用', group: '架构', description: '容灾、降级与故障演练', link: '/architecture/架构模块6-稳定性与高可用-标准答案库', keywords: '高可用 容灾 降级 混沌工程' },
  { title: '可观测性与运维', group: '架构', description: '日志、指标、链路与告警', link: '/architecture/架构模块7-可观测性与运维体系-标准答案库', keywords: '监控 tracing metrics logging' },
  { title: '性能工程', group: '架构', description: '压测、定位与全链路优化', link: '/architecture/架构模块8-性能工程-标准答案库', keywords: '性能 压测 火焰图 延迟 tp99' },
  { title: '安全与合规', group: '架构', description: '认证、授权与数据安全', link: '/architecture/架构模块9-安全与合规-标准答案库', keywords: '安全 oauth jwt 权限 加密' },
  { title: '云原生与平台化', group: '架构', description: '容器、Kubernetes 与平台工程', link: '/architecture/架构模块10-云原生与平台化-标准答案库', keywords: 'k8s kubernetes docker devops' },
  { title: '业务建模与领域拆分', group: '架构', description: 'DDD、边界与复杂业务建模', link: '/architecture/架构模块11-业务建模与领域拆分-标准答案库', keywords: 'ddd 领域驱动 建模 聚合' },
  { title: '架构治理与技术管理', group: '架构', description: '演进、决策与团队协作', link: '/architecture/架构模块12-架构治理与技术管理-标准答案库', keywords: '技术管理 adr 架构治理' },
  { title: 'LLM 基础与模型选型', group: 'AI', description: '模型原理、能力边界与选型', link: '/ai/AI模块1-LLM基础与模型选型-标准答案库', keywords: 'llm transformer token 模型选型' },
  { title: 'RAG 与检索工程', group: 'AI', description: '切分、召回、重排与评估', link: '/ai/AI模块2-RAG架构设计与检索工程-标准答案库', keywords: 'rag embedding 向量数据库 检索' },
  { title: 'Agent 与工具调用', group: 'AI', description: '规划、工具、记忆与可靠性', link: '/ai/AI模块3-Agent系统与工具调用-标准答案库', keywords: 'agent function calling mcp 智能体' },
  { title: 'AI 服务化与成本', group: 'AI', description: '推理服务、性能与成本优化', link: '/ai/AI模块4-AI服务化、性能与成本优化-标准答案库', keywords: '推理 gpu 成本 batching 服务化' },
  { title: 'AI 安全与治理', group: 'AI', description: '护栏、隐私与合规治理', link: '/ai/AI模块5-AI安全、合规与治理-标准答案库', keywords: 'ai 安全 prompt injection 合规' },
  { title: 'AI 评测与业务 ROI', group: 'AI', description: '评测体系、实验与价值验证', link: '/ai/AI模块6-AI评测、实验与业务ROI-标准答案库', keywords: 'eval 评测 ab实验 roi' }
]

const normalizedQuery = computed(() => query.value.trim().toLowerCase())
const results = computed(() => {
  if (!normalizedQuery.value) return []
  const terms = normalizedQuery.value.split(/\s+/)
  return topics.filter((topic) => {
    const searchable = `${topic.title} ${topic.description} ${topic.keywords}`.toLowerCase()
    return terms.every((term) => searchable.includes(term))
  }).slice(0, 7)
})

const openTopic = (topic: Topic) => {
  localStorage.setItem('interview-recent-topic', JSON.stringify(topic))
  router.go(withBase(topic.link))
}

const openFirstResult = () => {
  if (results.value[0]) openTopic(results.value[0])
}

const focusSearch = (event: KeyboardEvent) => {
  if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
    event.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => {
  const saved = localStorage.getItem('interview-recent-topic')
  if (saved) {
    try { recent.value = JSON.parse(saved) }
    catch { localStorage.removeItem('interview-recent-topic') }
  }

  window.addEventListener('keydown', focusSearch)
})

onBeforeUnmount(() => window.removeEventListener('keydown', focusSearch))
</script>

<template>
  <main class="learning-home">
    <section class="home-intro">
      <div class="home-intro-copy">
        <p class="eyebrow"><span></span> 高级后端 · 架构 · AI</p>
        <h1>今天，<br><em>先学哪一题？</em></h1>
        <p class="intro-note">直接搜索知识点，或沿一条短路径开始。答案、追问与案例都已整理好。</p>
      </div>

      <div class="search-workspace">
        <label for="topic-search">定位知识点</label>
        <div class="search-field" :class="{ active: query }">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
          <input
            id="topic-search"
            ref="searchInput"
            v-model="query"
            type="search"
            placeholder="试试：JVM、慢 SQL、RAG…"
            autocomplete="off"
            @keydown.enter="openFirstResult"
          >
          <kbd>/</kbd>
        </div>

        <div v-if="normalizedQuery" class="search-results" aria-live="polite">
          <button v-for="topic in results" :key="topic.link" type="button" @click="openTopic(topic)">
            <span class="result-group">{{ topic.group }}</span>
            <span><strong>{{ topic.title }}</strong><small>{{ topic.description }}</small></span>
            <span class="result-arrow">↗</span>
          </button>
          <p v-if="!results.length" class="empty-result">没有匹配的模块，试试右上角全文搜索。</p>
        </div>

        <div v-else class="quick-terms">
          <span>常用定位</span>
          <button v-for="term in ['线程池', 'Redis', '系统设计', 'Agent']" :key="term" @click="query = term">{{ term }}</button>
        </div>
      </div>
    </section>

    <section class="resume-strip">
      <div>
        <span class="section-number">01</span>
        <span class="section-label">开始学习</span>
      </div>
      <a v-if="recent" :href="withBase(recent.link)" class="resume-action">
        <span><small>继续上次</small><strong>{{ recent.title }}</strong></span>
        <i>→</i>
      </a>
      <a v-else :href="withBase('/guides/高频100题-抽认卡版')" class="resume-action">
        <span><small>15 分钟热身</small><strong>从高频 100 题开始</strong></span>
        <i>→</i>
      </a>
    </section>

    <section class="training-entry">
      <div><span class="section-number">NOW</span><span class="section-label">练习模式</span></div>
      <a :href="withBase('/training/')"><span><small>随机 5 题 · 掌握度 · 复习清单</small><strong>进入面试训练台</strong></span><i>→</i></a>
    </section>

    <section class="study-paths">
      <div class="section-heading">
        <div><span class="section-number">02</span><span class="section-label">按目标学习</span></div>
        <p>不需要从第一页开始。选你现在最需要的路线。</p>
      </div>

      <div class="path-list">
        <a :href="withBase('/guides/高频100题-抽认卡版')" class="path-item path-primary">
          <span class="path-index">A</span>
          <span class="path-main"><small>面试前 7 天</small><strong>高频冲刺</strong><em>100 道抽认卡 · 快速查漏</em></span>
          <span class="path-time">每天 30 min</span><i>↗</i>
        </a>
        <a :href="withBase('/fundamentals/')" class="path-item">
          <span class="path-index">B</span>
          <span class="path-main"><small>高级 Java 后端</small><strong>夯实底层</strong><em>Java → JVM → 并发 → 数据库</em></span>
          <span class="path-time">8 个模块</span><i>↗</i>
        </a>
        <a :href="withBase('/architecture/')" class="path-item">
          <span class="path-index">C</span>
          <span class="path-main"><small>架构师 / 技术负责人</small><strong>建立决策框架</strong><em>容量 → 分布式 → 稳定性 → 治理</em></span>
          <span class="path-time">12 个模块</span><i>↗</i>
        </a>
        <a :href="withBase('/ai/')" class="path-item">
          <span class="path-index">D</span>
          <span class="path-main"><small>AI 架构方向</small><strong>走向生产</strong><em>LLM → RAG → Agent → 评测</em></span>
          <span class="path-time">6 个模块</span><i>↗</i>
        </a>
      </div>
    </section>

    <section class="library-map">
      <div class="section-heading">
        <div><span class="section-number">03</span><span class="section-label">题库地图</span></div>
        <p>三个知识域，一组用于把答案讲深的真实案例。</p>
      </div>

      <div class="map-grid">
        <a :href="withBase('/fundamentals/')"><span>01—08</span><strong>基础</strong><small>Java / JVM / 并发 / 数据库</small></a>
        <a :href="withBase('/architecture/')"><span>09—20</span><strong>架构</strong><small>系统设计 / 分布式 / 稳定性</small></a>
        <a :href="withBase('/ai/')"><span>21—26</span><strong>AI</strong><small>LLM / RAG / Agent / 评测</small></a>
        <a :href="withBase('/deep-dives/')" class="map-deep"><span>27 CASES</span><strong>深度精选</strong><small>证据链 / 取舍 / 三级追问</small></a>
      </div>
    </section>

    <footer class="home-footer">
      <p>520+ 道问题 · 26 个模块 · 27 个完整案例</p>
      <a :href="withBase('/guides/基础8+架构12+AI6-总索引')">查看完整索引 <span>→</span></a>
    </footer>
  </main>
</template>
