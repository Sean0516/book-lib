<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ScorePanel from './ScorePanel.vue'
import { leadershipThemes, type LeadershipScenario } from './leadershipScenarios'
import { listProjects, saveAttempt } from './trainingStore'
import type { ProjectEvidenceCard, ScoreDimension, TrainingAnswer } from './trainingTypes'

const projects = ref<ProjectEvidenceCard[]>([])
const selectedProjectId = ref('')
const activeTheme = ref(leadershipThemes[0])
const scenario = ref<LeadershipScenario | null>(null)
const answers = ref<TrainingAnswer[]>([])
const currentAnswer = ref('')
const rewrittenAnswer = ref('')
const startedAt = ref(Date.now())
const saved = ref(false)

const dimensions = ref<ScoreDimension[]>([])
const selectedProject = computed(() => projects.value.find(project => project.id === selectedProjectId.value))
const currentPrompt = computed(() => {
  if (!scenario.value) return ''
  return answers.value.length === 0 ? scenario.value.prompt : scenario.value.followUps[answers.value.length - 1]
})

function selectScenario(item: LeadershipScenario) {
  scenario.value = item
  answers.value = []
  currentAnswer.value = ''
  rewrittenAnswer.value = ''
  startedAt.value = Date.now()
  saved.value = false
  dimensions.value = item.checkpoints.map((missing, index) => ({
    id: `leadership-${index}`,
    label: ['情境与冲突', '职责与证据', '判断与取舍', '影响与落地', '结果与反思'][index],
    score: 0, evidence: [], missing
  }))
}

function submitAnswer() {
  if (!scenario.value || !currentAnswer.value.trim()) return
  answers.value.push({ stage: answers.value.length ? `follow-up-${answers.value.length}` : 'opening', prompt: currentPrompt.value, answer: currentAnswer.value.trim() })
  currentAnswer.value = ''
}

function changeScore(id: string, score: number) {
  const item = dimensions.value.find(dimension => dimension.id === id)
  if (item) item.score = score
}

async function finish() {
  if (!scenario.value || !answers.value.length) return
  const weak = dimensions.value.filter(item => item.score < 4).map(item => `${item.label}不足`)
  if (!answers.value.some(item => /我|本人/.test(item.answer))) weak.push('个人职责不清')
  await saveAttempt({
    id: crypto.randomUUID(), mode: 'leadership', targetId: scenario.value.id, targetTitle: scenario.value.title,
    startedAt: startedAt.value, completedAt: Date.now(), answers: answers.value, dimensions: dimensions.value,
    weaknessTags: weak, rewrittenAnswer: rewrittenAnswer.value
  })
  saved.value = true
}

onMounted(async () => { projects.value = await listProjects() })
</script>

<template>
  <main class="workbench-shell leadership-workbench">
    <header class="workbench-hero"><div><p>LEADERSHIP DEFENSE · 03</p><h1>别只说“协调”，<em>讲清你如何改变结果。</em></h1></div><p>用具体人物、利益冲突、个人判断和结果证据，回答资深架构师的领导力与行为面试。</p></header>
    <nav class="workbench-tabs" aria-label="实战训练"><a href="./project-defense">项目答辩</a><a href="./system-design">系统设计</a><a class="active" href="./leadership">领导力</a><a href="./history">能力报告</a></nav>

    <section class="workbench-section leadership-picker">
      <div class="section-kicker"><span>01</span><div><strong>选择训练主题</strong><small>六个主题，共 24 个真实冲突场景</small></div></div>
      <div class="leadership-themes"><button v-for="theme in leadershipThemes" :key="theme.id" type="button" :class="{ active: activeTheme.id === theme.id }" @click="activeTheme = theme"><strong>{{ theme.name }}</strong><small>{{ theme.description }}</small></button></div>
      <div class="leadership-scenarios"><button v-for="item in activeTheme.scenarios" :key="item.id" type="button" :class="{ active: scenario?.id === item.id }" @click="selectScenario(item)"><span>{{ item.theme }}</span><strong>{{ item.title }}</strong><i>↗</i></button></div>
    </section>

    <section v-if="scenario" id="leadership-room" class="workbench-section leadership-room">
      <header class="story-context"><div class="section-kicker"><span>02</span><div><strong>故事背景</strong><small>可以绑定项目证据卡，避免答案停留在方法论</small></div></div><select v-model="selectedProjectId"><option value="">不绑定项目</option><option v-for="project in projects" :key="project.id" :value="project.id">{{ project.title }}</option></select></header>
      <div v-if="selectedProject" class="linked-project"><span>已绑定</span><strong>{{ selectedProject.title }}</strong><small>{{ selectedProject.problem || '请先在项目答辩工作台补充问题与基线。' }}</small></div>

      <article class="interview-prompt"><small>{{ answers.length ? `FOLLOW-UP · ${answers.length}/3` : 'BEHAVIORAL QUESTION' }}</small><h2>{{ currentPrompt }}</h2></article>
      <div v-for="(answer, index) in answers" :key="index" class="answer-record"><small>{{ answer.stage }}</small><strong>{{ answer.prompt }}</strong><p>{{ answer.answer }}</p></div>
      <template v-if="answers.length < 4">
        <div class="story-structure"><span>情境影响</span><span>冲突约束</span><span>本人判断</span><span>影响过程</span><span>结果证据</span><span>失败反思</span></div>
        <textarea v-model="currentAnswer" class="answer-editor" rows="9" placeholder="不要只写“充分沟通、达成共识”。写出具体参与者、分歧、你的行动和可验证结果。"></textarea>
        <button class="primary-action" type="button" :disabled="!currentAnswer.trim()" @click="submitAnswer">{{ answers.length < 3 ? '提交并接受追问 →' : '完成本轮故事 →' }}</button>
      </template>

      <section v-if="answers.length" class="leadership-review">
        <ScorePanel :dimensions="dimensions" @change="changeScore" />
        <div class="anti-template"><strong>高分检查</strong><p>是否明确“我”做了什么？是否说明谁不同意以及为什么？是否给出替代方案、升级边界、结果数字和失败反思？</p></div>
        <label class="editor-label" for="leadership-rewrite">重写你的领导力故事</label><textarea id="leadership-rewrite" v-model="rewrittenAnswer" class="answer-editor" rows="9" placeholder="情境与影响 → 冲突与约束 → 本人判断 → 影响过程 → 结果证据 → 反思"></textarea>
        <button class="primary-action" type="button" @click="finish">保存本次领导力训练</button><p v-if="saved" class="success-note">已保存到综合能力报告。</p>
      </section>
    </section>
  </main>
</template>
