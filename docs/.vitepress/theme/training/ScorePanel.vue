<script setup lang="ts">
import { computed } from 'vue'
import type { ScoreDimension } from './trainingTypes'
import { totalScore } from './trainingTypes'

const props = defineProps<{ dimensions: ScoreDimension[]; readonly?: boolean }>()
const emit = defineEmits<{ change: [id: string, score: number] }>()
const total = computed(() => totalScore(props.dimensions))
</script>

<template>
  <section class="score-panel" aria-label="五维评分">
    <header><div><small>INTERVIEW SCORE</small><strong>{{ total }}<span>/ 25</span></strong></div><p>{{ total >= 22 ? '已经接近面试状态' : total >= 17 ? '基础扎实，继续补证据' : '优先修补结构与关键缺口' }}</p></header>
    <div class="score-panel__grid">
      <article v-for="dimension in dimensions" :key="dimension.id">
        <div><strong>{{ dimension.label }}</strong><span>{{ dimension.score }}/5</span></div>
        <div v-if="!readonly" class="score-buttons">
          <button v-for="score in 6" :key="score - 1" type="button" :class="{ active: dimension.score === score - 1 }" @click="emit('change', dimension.id, score - 1)">{{ score - 1 }}</button>
        </div>
        <p v-if="dimension.missing.length">待补：{{ dimension.missing.join('、') }}</p>
      </article>
    </div>
  </section>
</template>
