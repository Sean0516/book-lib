export type LearningStatus = 'learning' | 'mastered' | 'review'

export type LearningRecord = {
  path: string
  title: string
  status: LearningStatus
  bookmarked: boolean
  updatedAt: number
}

const STORAGE_KEY = 'interview-learning-records-v1'

export function readLearningRecords(): Record<string, LearningRecord> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return {}
  }
}

export function writeLearningRecord(record: LearningRecord) {
  const records = readLearningRecords()
  records[record.path] = record
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  window.dispatchEvent(new CustomEvent('learning-records-changed'))
}

export function removeLearningRecord(path: string) {
  const records = readLearningRecords()
  delete records[path]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  window.dispatchEvent(new CustomEvent('learning-records-changed'))
}

