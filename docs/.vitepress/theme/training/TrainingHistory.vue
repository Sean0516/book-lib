<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { exportWorkbenchData, importWorkbenchData, listAttempts, listProjects } from './trainingStore'
import type { ProjectEvidenceCard, TrainingAttempt } from './trainingTypes'
import { totalScore } from './trainingTypes'

const attempts = ref<TrainingAttempt[]>([])
const projects = ref<ProjectEvidenceCard[]>([])
const message = ref('')

const modes = {
  project: { label: '项目答辩', index: '01' },
  'system-design': { label: '系统设计', index: '02' },
  leadership: { label: '领导力', index: '03' }
}

const modeStats = computed(() => Object.entries(modes).map(([id, meta]) => {
  const items = attempts.value.filter(item => item.mode === id)
  return { id, ...meta, count: items.length, average: items.length ? Math.round(items.reduce((sum, item) => sum + totalScore(item.dimensions), 0) / items.length) : 0 }
}))

const weaknessStats = computed(() => {
  const counts: Record<string, number> = {}
  attempts.value.forEach(item => item.weaknessTags.forEach(tag => { counts[tag] = (counts[tag] || 0) + 1 }))
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
})

const projectCompleteness = computed(() => projects.value.map(project => {
  const values = [project.background, project.problem, project.scale, project.ownership, project.alternatives, project.design, project.migration, project.conflict, project.result, project.reflection]
  return { id: project.id, title: project.title, value: Math.round(values.filter(Boolean).length / values.length * 100) }
}))

async function refresh() {
  attempts.value = await listAttempts()
  projects.value = await listProjects()
}

async function downloadData() {
  const raw = await exportWorkbenchData()
  const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `interview-workbench-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

async function uploadData(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    await importWorkbenchData(await file.text())
    await refresh()
    message.value = '训练数据导入完成'
  } catch (error) {
    message.value = error instanceof Error ? error.message : '导入失败'
  }
  input.value = ''
}

onMounted(refresh)
</script>

<template>
  <main class="workbench-shell history-workbench">
    <header class="workbench-hero"><div><p>CAPABILITY REPORT · 04</p><h1>不是做了多少题，<em>而是同一种缺口是否在减少。</em></h1></div><p>汇总三类实战训练，观察分数、项目证据完整度和反复出现的薄弱模式。</p></header>
    <nav class="workbench-tabs" aria-label="实战训练"><a href="./project-defense">项目答辩</a><a href="./system-design">系统设计</a><a href="./leadership">领导力</a><a class="active" href="./history">能力报告</a></nav>

    <section id="report" class="workbench-section report-overview">
      <article v-for="stat in modeStats" :key="stat.id"><span>{{ stat.index }}</span><strong>{{ stat.average }}<small>/25</small></strong><p>{{ stat.label }} · {{ stat.count }} 次</p><i :style="{ width: `${stat.average / 25 * 100}%` }"></i></article>
    </section>

    <div class="report-grid">
      <section class="workbench-section"><div class="section-kicker"><span>01</span><div><strong>项目证据完整度</strong><small>资深架构师建议准备至少 3 个项目</small></div></div><div v-if="projectCompleteness.length" class="progress-list"><article v-for="project in projectCompleteness" :key="project.id"><div><strong>{{ project.title }}</strong><span>{{ project.value }}%</span></div><i><b :style="{ width: `${project.value}%` }"></b></i></article></div><p v-else class="empty-copy">还没有项目证据卡。</p></section>
      <section class="workbench-section"><div class="section-kicker"><span>02</span><div><strong>反复出现的缺口</strong><small>优先重练出现次数最多的模式</small></div></div><div v-if="weaknessStats.length" class="weakness-list"><span v-for="([tag, count], index) in weaknessStats" :key="tag"><i>{{ String(index + 1).padStart(2, '0') }}</i><strong>{{ tag }}</strong><b>{{ count }} 次</b></span></div><p v-else class="empty-copy">完成训练后，这里会显示薄弱标签。</p></section>
    </div>

    <section class="workbench-section attempt-history"><div class="section-kicker"><span>03</span><div><strong>最近训练</strong><small>保留原始回答、评分和改写答案</small></div></div><div v-if="attempts.length" class="attempt-list"><article v-for="attempt in attempts.slice(0, 12)" :key="attempt.id"><span>{{ modes[attempt.mode].label }}</span><div><strong>{{ attempt.targetTitle }}</strong><small>{{ new Date(attempt.completedAt).toLocaleDateString('zh-CN') }} · {{ attempt.answers.length }} 轮回答</small></div><b>{{ totalScore(attempt.dimensions) }}/25</b></article></div><p v-else class="empty-copy">还没有完成的实战训练。</p></section>

    <section class="workbench-section data-tools"><div><strong>本地数据备份</strong><p>项目经历和训练回答只保存在当前浏览器。建议定期导出 JSON 备份。</p></div><span>{{ message }}</span><button class="primary-action" type="button" @click="downloadData">导出训练数据</button><label class="import-action">导入备份<input type="file" accept="application/json" @change="uploadData"></label></section>
  </main>
</template>
