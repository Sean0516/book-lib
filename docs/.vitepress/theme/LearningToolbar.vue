<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { readLearningRecords, removeLearningRecord, writeLearningRecord, type LearningRecord, type LearningStatus } from './learningState'

const route = useRoute()
const { frontmatter } = useData()
const record = ref<LearningRecord | null>(null)

const path = computed(() => route.path)
const title = computed(() => frontmatter.value.title || (typeof document !== 'undefined' ? document.title.split(' | ')[0] : '') || '未命名内容')
const status = computed(() => record.value?.status)

function loadRecord() {
  record.value = readLearningRecords()[path.value] || null
}

function setStatus(next: LearningStatus) {
  const current = record.value
  const updated: LearningRecord = {
    path: path.value,
    title: title.value,
    status: next,
    bookmarked: current?.bookmarked || false,
    updatedAt: Date.now()
  }
  writeLearningRecord(updated)
  record.value = updated
}

function toggleBookmark() {
  const current = record.value
  const bookmarked = !current?.bookmarked
  if (!bookmarked && !current?.status) {
    removeLearningRecord(path.value)
    record.value = null
    return
  }
  const updated: LearningRecord = {
    path: path.value,
    title: title.value,
    status: current?.status || 'learning',
    bookmarked,
    updatedAt: Date.now()
  }
  writeLearningRecord(updated)
  record.value = updated
}

onMounted(loadRecord)
watch(path, loadRecord)
</script>

<template>
  <section class="learning-toolbar" aria-label="学习状态">
    <div class="learning-toolbar__lead">
      <span class="learning-pulse"></span>
      <span><small>学习记录</small><strong>{{ status === 'mastered' ? '这篇已经掌握' : status === 'review' ? '已加入复习' : status === 'learning' ? '正在学习' : '标记你的掌握度' }}</strong></span>
    </div>
    <div class="learning-toolbar__actions">
      <button :class="{ active: status === 'learning' }" type="button" @click="setStatus('learning')">学习中</button>
      <button :class="{ active: status === 'mastered' }" type="button" @click="setStatus('mastered')">已掌握</button>
      <button :class="{ active: status === 'review' }" type="button" @click="setStatus('review')">待复习</button>
      <button class="bookmark-button" :class="{ active: record?.bookmarked }" type="button" :aria-label="record?.bookmarked ? '取消收藏' : '收藏'" @click="toggleBookmark">{{ record?.bookmarked ? '★' : '☆' }}</button>
      <a :href="withBase('/training/')">训练台 →</a>
    </div>
  </section>
</template>
