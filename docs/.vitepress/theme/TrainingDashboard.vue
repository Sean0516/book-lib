<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { readLearningRecords, type LearningRecord } from './learningState'

type Role = 'backend' | 'architect' | 'ai'
type Question = { title: string; area: string; role: Role[]; link: string; checkpoints: string[] }

const records = ref<LearningRecord[]>([])
const role = ref<Role>('architect')
const session = ref<Question[]>([])
const revealed = ref<Record<number, boolean>>({})
const scores = ref<Record<number, number>>({})

const questions: Question[] = [
  { title: '流量没涨，线程池为什么仍然会耗尽？', area: 'JVM / 稳定性', role: ['backend', 'architect'], link: '/deep-dives/capacity-performance/01-capacity-model', checkpoints: ['Little’s Law', '等待时间', '连接池', '重试放大', '止血指标'] },
  { title: '支付成功但订单未更新，你如何处理？', area: '分布式一致性', role: ['backend', 'architect'], link: '/deep-dives/distributed-stability/01-distributed-consistency', checkpoints: ['事实源', '幂等', '状态机', '补偿对账', '一致性 SLO'] },
  { title: '如何证明一次压测结果接近真实生产？', area: '性能工程', role: ['backend', 'architect'], link: '/deep-dives/capacity-performance/02-realistic-load-testing', checkpoints: ['开放模型', '热点分布', '数据规模', '缓存状态', '容量拐点'] },
  { title: '推荐服务变慢，如何避免拖垮结算？', area: '稳定性', role: ['backend', 'architect'], link: '/deep-dives/distributed-stability/02-traffic-protection', checkpoints: ['deadline', '重试预算', '熔断', '隔离', '半开恢复'] },
  { title: 'RAG 正确率下降，怎么定位是哪一层？', area: 'RAG', role: ['ai', 'architect'], link: '/deep-dives/ai-architecture/01-rag-quality-loop', checkpoints: ['摄取', 'Recall@K', '重排', '忠实度', '失败分类'] },
  { title: 'Agent 工具调用超时，为什么不能直接重试？', area: 'Agent', role: ['ai', 'architect'], link: '/deep-dives/ai-architecture/02-agent-production-safety', checkpoints: ['未知结果', '幂等键', '状态查询', '审批', '审计'] },
  { title: '小模型便宜 70%，为什么整体成本可能更高？', area: 'AI 成本', role: ['ai', 'architect'], link: '/deep-dives/ai-architecture/03-model-routing-cost', checkpoints: ['成功任务成本', '升级率', '重试', '人工接管', '质量门槛'] },
  { title: 'Kubernetes liveness 为什么可能放大数据库故障？', area: '云原生', role: ['backend', 'architect'], link: '/deep-dives/cloud-governance/01-kubernetes-reliability', checkpoints: ['探针语义', '重启风暴', '缓存回源', 'PDB 边界', '演练'] },
  { title: '数据库字段删除如何做到可回滚发布？', area: '交付', role: ['backend', 'architect'], link: '/deep-dives/cloud-governance/02-progressive-delivery', checkpoints: ['Expand', 'Migrate', 'Contract', '混部兼容', '数据门禁'] },
  { title: '如何证明内部平台真的提升了效率？', area: '平台工程', role: ['architect'], link: '/deep-dives/cloud-governance/03-platform-engineering', checkpoints: ['前置时间', '变更失败率', '自助成功率', '绕行率', '开发者体验'] },
  { title: '订单、支付、履约的领域边界怎么划？', area: 'DDD', role: ['backend', 'architect'], link: '/deep-dives/business-evolution/01-domain-discovery', checkpoints: ['统一语言', '变化原因', '不变量', '数据所有权', '上下文映射'] },
  { title: '单体拆微服务，第一刀应该怎么选？', area: '系统演进', role: ['backend', 'architect'], link: '/deep-dives/business-evolution/03-strangler-migration', checkpoints: ['边界', '业务价值', '事实源', '灰度回退', '旧路径退场'] },
  { title: '合法 JWT 为什么仍可能跨租户越权？', area: '安全', role: ['backend', 'architect', 'ai'], link: '/deep-dives/security-compliance/01-identity-authorization', checkpoints: ['认证非授权', '对象归属', 'tenantId 信任', '执行点', '审计'] },
  { title: 'Prompt Injection 的真正防线在哪里？', area: 'AI 安全', role: ['ai', 'architect'], link: '/deep-dives/security-compliance/04-security-incident-ai', checkpoints: ['不可信数据', '模型外策略', '工具白名单', '出口限制', '审批'] },
  { title: '如何设计一个高并发订单系统？', area: '系统设计', role: ['backend', 'architect'], link: '/deep-dives/cases/system-design/high-concurrency-order-system', checkpoints: ['约束容量', '事实源', '同步异步', '分片演进', 'SLO 验收'] }
]

const roleOptions: { id: Role; name: string }[] = [
  { id: 'backend', name: '高级后端' },
  { id: 'architect', name: '架构师' },
  { id: 'ai', name: 'AI 架构' }
]

const routes = {
  backend: [
    ['JVM 与并发', '/deep-dives/jvm-concurrency/'], ['数据与消息', '/deep-dives/data-reliability/'],
    ['容量与性能', '/deep-dives/capacity-performance/'], ['分布式稳定性', '/deep-dives/distributed-stability/']
  ],
  architect: [
    ['容量与性能', '/deep-dives/capacity-performance/'], ['分布式稳定性', '/deep-dives/distributed-stability/'],
    ['业务与演进', '/deep-dives/business-evolution/'], ['云原生治理', '/deep-dives/cloud-governance/'],
    ['安全合规', '/deep-dives/security-compliance/']
  ],
  ai: [
    ['AI 架构闭环', '/deep-dives/ai-architecture/'], ['RAG 质量', '/deep-dives/ai-architecture/01-rag-quality-loop'],
    ['Agent 安全', '/deep-dives/ai-architecture/02-agent-production-safety'], ['AI 安全', '/deep-dives/security-compliance/04-security-incident-ai']
  ]
} as const

const stats = computed(() => ({
  learning: records.value.filter((item) => item.status === 'learning').length,
  mastered: records.value.filter((item) => item.status === 'mastered').length,
  review: records.value.filter((item) => item.status === 'review').length,
  bookmarked: records.value.filter((item) => item.bookmarked).length
}))
const reviewItems = computed(() => records.value.filter((item) => item.status === 'review' || item.bookmarked).sort((a, b) => b.updatedAt - a.updatedAt))
const sessionScore = computed(() => Object.values(scores.value).reduce((sum, value) => sum + value, 0))

function loadRecords() { records.value = Object.values(readLearningRecords()) }
function startSession() {
  const pool = questions.filter((question) => question.role.includes(role.value))
  session.value = [...pool].sort(() => Math.random() - 0.5).slice(0, 5)
  revealed.value = {}
  scores.value = {}
}
function toggleReveal(index: number) { revealed.value[index] = !revealed.value[index] }

onMounted(() => {
  loadRecords()
  startSession()
  window.addEventListener('learning-records-changed', loadRecords)
})
onBeforeUnmount(() => window.removeEventListener('learning-records-changed', loadRecords))
</script>

<template>
  <main class="training-dashboard">
    <header class="training-hero">
      <div><p>LEARNING DESK · 09</p><h1>把“看过”，<em>变成能讲出来。</em></h1></div>
      <p>进度留在你的浏览器里。选路线、抽五题、给自己打分，再回到薄弱专题。</p>
    </header>

    <section class="training-stats" aria-label="学习统计">
      <div><span>{{ stats.learning }}</span><small>学习中</small></div>
      <div><span>{{ stats.mastered }}</span><small>已掌握</small></div>
      <div><span>{{ stats.review }}</span><small>待复习</small></div>
      <div><span>{{ stats.bookmarked }}</span><small>已收藏</small></div>
    </section>

    <section class="training-section role-route">
      <div class="training-section__head"><span>01</span><div><h2>岗位路线</h2><p>先建立主干，再用案例补深度。</p></div></div>
      <div class="role-switch">
        <button v-for="item in roleOptions" :key="item.id" :class="{ active: role === item.id }" @click="role = item.id; startSession()">{{ item.name }}</button>
      </div>
      <ol class="route-line">
        <li v-for="(item, index) in routes[role]" :key="item[1]"><span>{{ String(index + 1).padStart(2, '0') }}</span><a :href="withBase(item[1])">{{ item[0] }}</a></li>
      </ol>
    </section>

    <section class="training-section mock-session">
      <div class="training-section__head"><span>02</span><div><h2>随机模拟 · 5 题</h2><p>先口述 90 秒，再展开检查点并自评。</p></div><button class="new-session" @click="startSession">重新抽题 ↻</button></div>
      <article v-for="(question, index) in session" :key="question.title" class="mock-question">
        <div class="mock-question__number">Q{{ index + 1 }}</div>
        <div class="mock-question__body">
          <small>{{ question.area }}</small><h3>{{ question.title }}</h3>
          <div class="mock-question__actions"><button @click="toggleReveal(index)">{{ revealed[index] ? '收起检查点' : '展开检查点' }}</button><a :href="withBase(question.link)">回到专题 ↗</a></div>
          <ul v-if="revealed[index]" class="checkpoints"><li v-for="point in question.checkpoints" :key="point">{{ point }}</li></ul>
        </div>
        <div class="self-score"><small>自评 / 5</small><div><button v-for="score in 5" :key="score" :class="{ active: scores[index] === score }" @click="scores[index] = score">{{ score }}</button></div></div>
      </article>
      <footer class="session-total"><span>本轮得分</span><strong>{{ sessionScore }}<small>/ 25</small></strong><p>{{ sessionScore >= 22 ? '已经接近面试状态。' : sessionScore >= 17 ? '基础不错，重点补检查点。' : '回到专题，用结构重新复述。' }}</p></footer>
    </section>

    <section class="training-section review-list">
      <div class="training-section__head"><span>03</span><div><h2>复习清单</h2><p>来自你在文档顶部标记的待复习与收藏。</p></div></div>
      <div v-if="reviewItems.length" class="review-items"><a v-for="item in reviewItems" :key="item.path" :href="withBase(item.path)"><span>{{ item.status === 'review' ? '待复习' : '收藏' }}</span><strong>{{ item.title }}</strong><i>→</i></a></div>
      <div v-else class="review-empty"><strong>清单还是空的。</strong><p>阅读任意题目时，在顶部标记“待复习”或点击 ☆ 收藏。</p></div>
    </section>
  </main>
</template>
