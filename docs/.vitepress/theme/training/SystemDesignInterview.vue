<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import ScorePanel from './ScorePanel.vue'
import { factLabels, systemDesignScenarios, type FactCategory, type SystemDesignScenario } from './systemDesignScenarios'
import { saveAttempt } from './trainingStore'
import type { ScoreDimension, TrainingAnswer } from './trainingTypes'

type Stage = 'select' | 'brief' | 'clarify' | 'design' | 'challenge' | 'review'
const stage = ref<Stage>('select')
const scenario = ref<SystemDesignScenario | null>(null)
const asked = ref<FactCategory[]>([])
const clarificationNotes = ref('')
const designAnswer = ref('')
const challengeAnswers = ref<string[]>(['', ''])
const challengeIndex = ref(0)
const rewrittenAnswer = ref('')
const startedAt = ref(Date.now())
const saved = ref(false)

const dimensions = ref<ScoreDimension[]>([])
const revealedFacts = computed(() => scenario.value ? asked.value.map(category => ({ category, text: scenario.value?.facts[category] })).filter(item => item.text) : [])
const missingRequired = computed(() => scenario.value?.required.filter(category => !asked.value.includes(category)) || [])
const progress = computed(() => ({ select: 0, brief: 1, clarify: 2, design: 3, challenge: 4, review: 5 }[stage.value]))

function selectScenario(item: SystemDesignScenario) {
  scenario.value = item
  stage.value = 'brief'
  asked.value = []
  clarificationNotes.value = ''
  designAnswer.value = ''
  challengeAnswers.value = ['', '']
  challengeIndex.value = 0
  rewrittenAnswer.value = ''
  startedAt.value = Date.now()
  saved.value = false
}

function ask(category: FactCategory) {
  if (!asked.value.includes(category) && scenario.value?.facts[category]) asked.value.push(category)
}

function startDesign() {
  stage.value = 'design'
}

function startChallenges() {
  if (!designAnswer.value.trim()) return
  stage.value = 'challenge'
}

function nextChallenge() {
  if (!challengeAnswers.value[challengeIndex.value].trim()) return
  if (challengeIndex.value === 0) challengeIndex.value = 1
  else prepareReview()
}

function prepareReview() {
  if (!scenario.value) return
  const labels = ['约束澄清', '核心设计', '方案取舍', '故障恢复', '指标表达']
  dimensions.value = scenario.value.checkpoints.map((checkpoints, index) => ({
    id: `system-${index}`,
    label: labels[index],
    score: index === 0 ? Math.min(5, Math.round((scenario.value!.required.length - missingRequired.value.length) / scenario.value!.required.length * 5)) : 0,
    evidence: index === 0 ? asked.value.map(category => factLabels[category]) : [],
    missing: index === 0 ? missingRequired.value.map(category => factLabels[category]) : checkpoints
  }))
  stage.value = 'review'
}

function changeScore(id: string, score: number) {
  const item = dimensions.value.find(dimension => dimension.id === id)
  if (item) item.score = score
}

async function finish() {
  if (!scenario.value) return
  const answers: TrainingAnswer[] = [
    { stage: 'clarify', prompt: '你主动澄清了哪些约束？', answer: `${asked.value.map(category => factLabels[category]).join('、')}\n${clarificationNotes.value}` },
    { stage: 'design', prompt: scenario.value.brief, answer: designAnswer.value },
    ...scenario.value.injections.map((prompt, index) => ({ stage: `challenge-${index + 1}`, prompt, answer: challengeAnswers.value[index] }))
  ]
  await saveAttempt({ id: crypto.randomUUID(), mode: 'system-design', targetId: scenario.value.id, targetTitle: scenario.value.title, startedAt: startedAt.value, completedAt: Date.now(), answers, dimensions: dimensions.value, weaknessTags: missingRequired.value.map(category => `缺少${factLabels[category]}`), rewrittenAnswer: rewrittenAnswer.value })
  saved.value = true
}
</script>

<template>
  <main class="workbench-shell system-workbench">
    <header class="workbench-hero"><div><p>SYSTEM DESIGN · 02</p><h1>先问对问题，<em>再设计系统。</em></h1></div><p>题目不会提前交代完整约束。主动澄清容量、一致性、SLO 和迁移，再接受两轮现场变化。</p></header>
    <nav class="workbench-tabs" aria-label="实战训练"><a href="./project-defense">项目答辩</a><a class="active" href="./system-design">系统设计</a><a href="./leadership">领导力</a><a href="./history">能力报告</a></nav>

    <div v-if="stage !== 'select'" class="stage-rail" aria-label="训练进度"><span v-for="(name, index) in ['题目', '澄清', '设计', '注入', '复盘']" :key="name" :class="{ active: progress >= index + 1 }"><i>{{ index + 1 }}</i>{{ name }}</span></div>

    <section v-if="stage === 'select'" class="workbench-section scenario-library">
      <div class="section-kicker"><span>01</span><div><strong>选择一场未知</strong><small>八个场景，约束与答案尚未展示</small></div></div>
      <div class="scenario-grid"><button v-for="item in systemDesignScenarios" :key="item.id" type="button" @click="selectScenario(item)"><span>{{ item.area }}</span><strong>{{ item.title }}</strong><small>难度 {{ '●'.repeat(item.difficulty) }}{{ '○'.repeat(3 - item.difficulty) }}</small><i>开始 ↗</i></button></div>
    </section>

    <section v-else-if="scenario" id="design-room" class="workbench-section design-room">
      <button class="text-action" type="button" @click="stage = 'select'">← 更换场景</button>
      <article class="interview-prompt"><small>AMBIGUOUS BRIEF · {{ scenario.area }}</small><h2>{{ scenario.brief }}</h2></article>

      <template v-if="stage === 'brief'">
        <div class="stage-instruction"><strong>现在不要画架构图。</strong><p>先判断哪些信息会改变你的设计，然后进入澄清阶段。</p></div>
        <button class="primary-action" type="button" @click="stage = 'clarify'">开始澄清约束 →</button>
      </template>

      <template v-if="stage === 'clarify'">
        <div class="section-kicker"><span>02</span><div><strong>你想先问什么？</strong><small>点击代表你主动向面试官提出了这一类问题</small></div></div>
        <div class="fact-buttons"><button v-for="(label, category) in factLabels" :key="category" type="button" :disabled="!scenario.facts[category]" :class="{ asked: asked.includes(category) }" @click="ask(category)"><span>{{ asked.includes(category) ? '✓' : '?' }}</span>{{ label }}</button></div>
        <div v-if="revealedFacts.length" class="revealed-facts"><article v-for="fact in revealedFacts" :key="fact.category"><small>{{ factLabels[fact.category] }}</small><p>{{ fact.text }}</p></article></div>
        <label class="editor-label" for="clarification-notes">记录你的其他澄清问题</label><textarea id="clarification-notes" v-model="clarificationNotes" class="answer-editor" rows="4" placeholder="例如：哪些步骤必须同步返回？流量的热点分布如何？"></textarea>
        <button class="primary-action" type="button" @click="startDesign">约束足够，开始设计 →</button>
      </template>

      <template v-if="stage === 'design'">
        <div class="section-kicker"><span>03</span><div><strong>给出第一版架构</strong><small>目标与约束 → 核心链路 → 数据语义 → 取舍 → 风险与指标</small></div></div>
        <textarea v-model="designAnswer" class="answer-editor design-answer" rows="14" placeholder="不要只写组件名。说明每个关键选择解决什么约束、留下什么风险。"></textarea>
        <button class="primary-action" type="button" :disabled="!designAnswer.trim()" @click="startChallenges">提交架构，接受现场变化 →</button>
      </template>

      <template v-if="stage === 'challenge'">
        <article class="injection-card"><small>LIVE INJECTION · {{ challengeIndex + 1 }}/2</small><h3>{{ scenario.injections[challengeIndex] }}</h3><p>不能推翻全部重来。说明止损动作、架构调整、残余风险和恢复验收。</p></article>
        <textarea v-model="challengeAnswers[challengeIndex]" class="answer-editor" rows="9" placeholder="你的现场应对……"></textarea>
        <button class="primary-action" type="button" :disabled="!challengeAnswers[challengeIndex].trim()" @click="nextChallenge">{{ challengeIndex === 0 ? '进入第二次变化 →' : '结束推演，查看复盘 →' }}</button>
      </template>

      <template v-if="stage === 'review'">
        <div v-if="missingRequired.length" class="missed-constraints"><strong>你没有主动问到</strong><span v-for="category in missingRequired" :key="category">{{ factLabels[category] }}</span></div>
        <ScorePanel :dimensions="dimensions" @change="changeScore" />
        <section class="reference-checkpoints"><div v-for="(items, index) in scenario.checkpoints" :key="index"><strong>{{ dimensions[index].label }}</strong><span v-for="item in items" :key="item">{{ item }}</span></div></section>
        <a class="reference-link" :href="withBase(scenario.referencePath)">回到相关深度专题核对 →</a>
        <label class="editor-label" for="design-rewrite">重写你的架构回答</label><textarea id="design-rewrite" v-model="rewrittenAnswer" class="answer-editor" rows="10" placeholder="补齐遗漏约束、方案取舍、故障恢复与验证指标。"></textarea>
        <button class="primary-action" type="button" @click="finish">保存本次系统设计</button><p v-if="saved" class="success-note">已保存到综合能力报告。</p>
      </template>
    </section>
  </main>
</template>
