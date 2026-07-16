<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ScorePanel from './ScorePanel.vue'
import { deleteProject, listProjects, saveAttempt, saveProject } from './trainingStore'
import type { ProjectEvidenceCard, ScoreDimension, TrainingAnswer } from './trainingTypes'

type FieldKey = keyof Pick<ProjectEvidenceCard,
  'background' | 'problem' | 'scale' | 'ownership' | 'alternatives' |
  'design' | 'migration' | 'conflict' | 'result' | 'reflection'>

const fields: Array<{ key: FieldKey; index: string; label: string; hint: string; placeholder: string }> = [
  { key: 'background', index: '01', label: '项目背景', hint: '业务、用户、团队、周期和系统边界', placeholder: '这个项目解决什么业务问题？涉及哪些用户和团队？' },
  { key: 'problem', index: '02', label: '问题与基线', hint: '改造前的故障、瓶颈或业务目标', placeholder: '原系统的问题如何被发现？基线数据是什么？' },
  { key: 'scale', index: '03', label: '规模与约束', hint: 'QPS、数据量、SLO、成本、合规和期限', placeholder: '写下已知数字；不知道的内容明确标记为未知。' },
  { key: 'ownership', index: '04', label: '你的职责', hint: '区分本人决策、参与推动和团队成果', placeholder: '我亲自决定了……我负责推动……团队共同完成……' },
  { key: 'alternatives', index: '05', label: '候选方案', hint: '至少两个方案、放弃理由和验证方式', placeholder: '方案 A / B 的收益、风险、成本和适用边界。' },
  { key: 'design', index: '06', label: '关键设计', hint: '边界、事实源、数据流、一致性和可靠性', placeholder: '描述关键链路，不要只罗列中间件。' },
  { key: 'migration', index: '07', label: '迁移与回退', hint: '试点、灰度、兼容、双轨和退场条件', placeholder: '如何上线、如何验证、什么情况下回退？' },
  { key: 'conflict', index: '08', label: '事故与分歧', hint: '反对意见、错误判断或上线问题', placeholder: '谁提出过不同意见？你做错或调整过什么？' },
  { key: 'result', index: '09', label: '结果证据', hint: '上线前后业务、性能、成本和效率变化', placeholder: '用改造前后数字证明价值，避免只写“顺利上线”。' },
  { key: 'reflection', index: '10', label: '反思与演进', hint: '残余风险、重做选择和下一阶段触发条件', placeholder: '如果重做一次会改变什么？系统何时需要再次演进？' }
]

const topics = [
  { id: 'decision', name: '架构决策', prompt: '请用 90 秒介绍这个项目：先讲业务目标和约束，再讲你做出的关键架构决策及结果。' },
  { id: 'capacity', name: '容量性能', prompt: '这个项目的容量模型从哪里来？你如何证明上线后的安全水位成立？' },
  { id: 'reliability', name: '稳定性', prompt: '这个项目最危险的失败模式是什么？当时如何止损、恢复并防止复发？' },
  { id: 'migration', name: '迁移演进', prompt: '在不能停机的前提下，你如何完成迁移、验证数据并保留回退能力？' },
  { id: 'ownership', name: '个人贡献', prompt: '请明确区分：哪些决策由你做出，哪些由团队共同完成，你如何影响关键参与者？' },
  { id: 'failure', name: '失败复盘', prompt: '讲一次这个项目中的错误判断或失败：你何时发现、如何处理、后来改变了什么机制？' }
]

const followUps: Record<string, string[]> = {
  decision: ['为什么不能继续优化原系统？', '你放弃的方案在什么条件下反而更合适？', '如果目标流量只有原计划的一半，你还会做同样的改造吗？'],
  capacity: ['峰值、平均值和热点分布分别来自哪里？', '哪个资源最先达到拐点？', '如果流量不变但 TP99 翻倍，你先验证什么？'],
  reliability: ['这个方案仍然保留了什么单点或未知风险？', '依赖返回未知结果时如何避免重复副作用？', '恢复后用什么指标判断真的结束了？'],
  migration: ['双轨期间的唯一事实源是谁？', '如何证明新旧结果一致？', '旧路径何时可以真正删除？'],
  ownership: ['反对声音最大的人是谁，你如何改变他的判断？', '如果没有你，项目最可能在哪一步失败？', '哪些结果不能归功于你？'],
  failure: ['你当时忽略了什么早期信号？', '短期止损带来了什么新风险？', '如何证明复盘真的改变了系统或团队？']
}

const projects = ref<ProjectEvidenceCard[]>([])
const activeProject = ref<ProjectEvidenceCard | null>(null)
const selectedTopic = ref(topics[0])
const answers = ref<TrainingAnswer[]>([])
const currentAnswer = ref('')
const rewrittenAnswer = ref('')
const savedMessage = ref('')
const sessionStartedAt = ref(Date.now())
const completed = ref(false)

const dimensions = ref<ScoreDimension[]>([
  { id: 'problem', label: '目标与约束', score: 0, evidence: [], missing: ['业务目标', '量化约束'] },
  { id: 'evidence', label: '职责与证据', score: 0, evidence: [], missing: ['个人职责', '事实来源'] },
  { id: 'tradeoff', label: '方案与取舍', score: 0, evidence: [], missing: ['候选方案', '放弃理由'] },
  { id: 'delivery', label: '风险与落地', score: 0, evidence: [], missing: ['迁移回退', '失败模式'] },
  { id: 'result', label: '结果与反思', score: 0, evidence: [], missing: ['前后指标', '反思演进'] }
])

const filledCount = computed(() => activeProject.value ? fields.filter(item => activeProject.value?.[item.key].trim()).length : 0)
const completion = computed(() => Math.round((filledCount.value / fields.length) * 100))
const projectWeaknesses = computed(() => {
  const project = activeProject.value
  if (!project) return []
  const tags: string[] = []
  if (!project.scale.trim()) tags.push('缺少量化约束')
  if (!project.ownership.trim() || !project.ownership.includes('我')) tags.push('个人职责不清')
  if (!project.alternatives.trim()) tags.push('没有候选方案')
  if (!project.migration.trim()) tags.push('缺少迁移与回退')
  if (!project.result.trim() || !project.metrics.length) tags.push('缺少结果证据')
  if (!project.conflict.trim() || !project.reflection.trim()) tags.push('缺少失败与反思')
  return tags
})

function newProject() {
  const now = Date.now()
  activeProject.value = {
    id: crypto.randomUUID(), title: '未命名架构项目', role: '', background: '', problem: '', scale: '',
    ownership: '', alternatives: '', design: '', migration: '', conflict: '', result: '', reflection: '',
    metrics: [], createdAt: now, updatedAt: now
  }
  completed.value = false
}

async function persistProject() {
  if (!activeProject.value) return
  activeProject.value.updatedAt = Date.now()
  await saveProject(activeProject.value)
  projects.value = await listProjects()
  savedMessage.value = '已保存到当前浏览器'
  window.setTimeout(() => { savedMessage.value = '' }, 1800)
}

async function removeActiveProject() {
  if (!activeProject.value || !window.confirm(`删除项目“${activeProject.value.title}”？训练记录不会被删除。`)) return
  await deleteProject(activeProject.value.id)
  projects.value = await listProjects()
  activeProject.value = projects.value[0] || null
}

function addMetric() {
  activeProject.value?.metrics.push({ id: crypto.randomUUID(), name: '', before: '', after: '', source: 'unknown' })
}

function startDefense(topic: typeof topics[number]) {
  selectedTopic.value = topic
  answers.value = []
  currentAnswer.value = ''
  rewrittenAnswer.value = ''
  completed.value = false
  sessionStartedAt.value = Date.now()
}

function submitAnswer(prompt: string) {
  if (!currentAnswer.value.trim()) return
  answers.value.push({ stage: answers.value.length ? `follow-up-${answers.value.length}` : 'opening', prompt, answer: currentAnswer.value.trim() })
  currentAnswer.value = ''
}

function changeScore(id: string, score: number) {
  const item = dimensions.value.find(dimension => dimension.id === id)
  if (item) item.score = score
}

async function finishDefense() {
  if (!activeProject.value || !answers.value.length) return
  await saveAttempt({
    id: crypto.randomUUID(), mode: 'project', targetId: activeProject.value.id, targetTitle: activeProject.value.title,
    startedAt: sessionStartedAt.value, completedAt: Date.now(), answers: answers.value,
    dimensions: dimensions.value, weaknessTags: projectWeaknesses.value, rewrittenAnswer: rewrittenAnswer.value
  })
  completed.value = true
}

onMounted(async () => {
  projects.value = await listProjects()
  activeProject.value = projects.value[0] || null
})
</script>

<template>
  <main class="workbench-shell project-workbench">
    <header class="workbench-hero">
      <div><p>PROJECT DEFENSE · 01</p><h1>把“参与过”，<em>变成经得住追问。</em></h1></div>
      <p>用真实约束、个人决策和结果证据准备项目。未知数据可以标记为估算或未知，不要编造经历。</p>
    </header>

    <nav class="workbench-tabs" aria-label="实战训练">
      <a class="active" href="./project-defense">项目证据卡</a><a href="./project-defense">连续答辩</a><a href="./system-design">系统设计</a><a href="./leadership">领导力</a><a href="./history">能力报告</a>
    </nav>

    <section id="evidence" class="workbench-section project-editor">
      <aside class="project-list">
        <div class="section-kicker"><span>01</span><div><strong>项目档案</strong><small>建议准备 3 个核心项目</small></div></div>
        <button class="primary-action" type="button" @click="newProject">＋ 新建项目</button>
        <button v-for="project in projects" :key="project.id" class="project-list__item" :class="{ active: activeProject?.id === project.id }" type="button" @click="activeProject = project">
          <strong>{{ project.title }}</strong><small>{{ project.role || '尚未填写角色' }}</small>
        </button>
      </aside>

      <div v-if="activeProject" class="project-form">
        <header class="project-form__head">
          <div><input v-model="activeProject.title" aria-label="项目名称"><input v-model="activeProject.role" aria-label="担任角色" placeholder="你的角色，例如：技术负责人"></div>
          <div class="completion-ring"><strong>{{ completion }}%</strong><small>证据完整度</small></div>
        </header>

        <div v-if="projectWeaknesses.length" class="evidence-gaps"><strong>当前缺口</strong><span v-for="tag in projectWeaknesses" :key="tag">{{ tag }}</span></div>

        <article v-for="field in fields" :key="field.key" class="evidence-field">
          <div><span>{{ field.index }}</span><label :for="field.key">{{ field.label }}</label><small>{{ field.hint }}</small></div>
          <textarea :id="field.key" v-model="activeProject[field.key]" rows="4" :placeholder="field.placeholder"></textarea>
        </article>

        <section class="metrics-editor">
          <header><div><strong>量化证据</strong><small>记录改造前后指标及可信度</small></div><button type="button" @click="addMetric">＋ 添加指标</button></header>
          <div v-for="metric in activeProject.metrics" :key="metric.id" class="metric-row">
            <input v-model="metric.name" aria-label="指标名称" placeholder="例如：发布耗时"><input v-model="metric.before" aria-label="改造前" placeholder="改造前"><input v-model="metric.after" aria-label="改造后" placeholder="改造后">
            <select v-model="metric.source" aria-label="指标来源"><option value="verified">已验证</option><option value="estimated">合理估算</option><option value="unknown">未知</option></select>
          </div>
        </section>

        <footer class="form-actions"><button class="danger-action" type="button" @click="removeActiveProject">删除</button><span>{{ savedMessage }}</span><button class="primary-action" type="button" @click="persistProject">保存项目证据卡</button></footer>
      </div>
      <div v-else class="workbench-empty"><span>01</span><h2>先建立你的第一张项目证据卡</h2><p>建议从最能体现架构决策、迁移落地或故障治理的项目开始。</p><button class="primary-action" type="button" @click="newProject">创建项目</button></div>
    </section>

    <section v-if="activeProject" id="defense" class="workbench-section defense-room">
      <div class="section-kicker"><span>02</span><div><strong>连续答辩</strong><small>先回答，再看下一层追问</small></div></div>
      <div class="topic-switch"><button v-for="topic in topics" :key="topic.id" type="button" :class="{ active: selectedTopic.id === topic.id }" @click="startDefense(topic)">{{ topic.name }}</button></div>

      <article class="interview-prompt"><small>OPENING QUESTION · {{ selectedTopic.name }}</small><h2>{{ selectedTopic.prompt }}</h2></article>
      <div v-for="(answer, index) in answers" :key="`${answer.stage}-${index}`" class="answer-record"><small>{{ answer.stage }}</small><strong>{{ answer.prompt }}</strong><p>{{ answer.answer }}</p></div>

      <template v-if="answers.length < 4">
        <article v-if="answers.length" class="follow-up-prompt"><small>L{{ answers.length }} FOLLOW-UP</small><h3>{{ followUps[selectedTopic.id][answers.length - 1] }}</h3></article>
        <textarea v-model="currentAnswer" class="answer-editor" rows="7" :placeholder="answers.length ? '直接回答追问，给出事实、取舍和结果……' : '先完成第一次回答。建议控制在 90 秒口述长度……'"></textarea>
        <button class="primary-action" type="button" :disabled="!currentAnswer.trim()" @click="submitAnswer(answers.length ? followUps[selectedTopic.id][answers.length - 1] : selectedTopic.prompt)">{{ answers.length < 3 ? '提交并进入下一层追问 →' : '完成本轮回答 →' }}</button>
      </template>

      <section v-if="answers.length" class="defense-review">
        <ScorePanel :dimensions="dimensions" @change="changeScore" />
        <label for="project-rewrite">重写 90 秒高分答案</label><textarea id="project-rewrite" v-model="rewrittenAnswer" rows="7" placeholder="按目标与约束 → 个人决策 → 取舍 → 风险落地 → 结果反思重写。"></textarea>
        <button class="primary-action" type="button" @click="finishDefense">保存本次答辩</button><p v-if="completed" class="success-note">本次答辩已进入能力报告。</p>
      </section>
    </section>
  </main>
</template>
