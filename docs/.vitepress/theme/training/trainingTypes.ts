export type WorkbenchMode = 'project' | 'system-design' | 'leadership'

export type ScoreDimension = {
  id: string
  label: string
  score: number
  evidence: string[]
  missing: string[]
}

export type TrainingAnswer = {
  stage: string
  prompt: string
  answer: string
}

export type TrainingAttempt = {
  id: string
  mode: WorkbenchMode
  targetId: string
  targetTitle: string
  startedAt: number
  completedAt: number
  answers: TrainingAnswer[]
  dimensions: ScoreDimension[]
  weaknessTags: string[]
  rewrittenAnswer: string
}

export type MetricSource = 'verified' | 'estimated' | 'unknown'

export type ProjectMetric = {
  id: string
  name: string
  before: string
  after: string
  source: MetricSource
}

export type ProjectEvidenceCard = {
  id: string
  title: string
  role: string
  background: string
  problem: string
  scale: string
  ownership: string
  alternatives: string
  design: string
  migration: string
  conflict: string
  result: string
  reflection: string
  metrics: ProjectMetric[]
  createdAt: number
  updatedAt: number
}

export const scoreBands = {
  ready: 22,
  solid: 17
} as const

export function totalScore(dimensions: ScoreDimension[]) {
  return dimensions.reduce((sum, item) => sum + item.score, 0)
}
