import type { ProjectEvidenceCard, TrainingAttempt } from './trainingTypes'

const DB_NAME = 'interview-workbench-v1'
const DB_VERSION = 1
const PROJECTS = 'projects'
const ATTEMPTS = 'attempts'
const FALLBACK_KEY = 'interview-workbench-fallback-v1'

function readFallback(): Record<string, unknown[]> {
  if (typeof localStorage === 'undefined') return { [PROJECTS]: [], [ATTEMPTS]: [] }
  try {
    return JSON.parse(localStorage.getItem(FALLBACK_KEY) || `{ "${PROJECTS}": [], "${ATTEMPTS}": [] }`)
  } catch {
    return { [PROJECTS]: [], [ATTEMPTS]: [] }
  }
}

function writeFallback(storeName: string, value: unknown, removeId?: string) {
  const data = readFallback()
  const items = data[storeName] || []
  const id = (value as { id?: string })?.id || removeId
  data[storeName] = removeId
    ? items.filter(item => (item as { id?: string }).id !== removeId)
    : [...items.filter(item => (item as { id?: string }).id !== id), value]
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(data))
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(PROJECTS)) db.createObjectStore(PROJECTS, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(ATTEMPTS)) db.createObjectStore(ATTEMPTS, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readAll<T>(storeName: string): Promise<T[]> {
  if (typeof indexedDB === 'undefined') return (readFallback()[storeName] || []) as T[]
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  }).finally(() => db.close())
}

async function put<T>(storeName: string, value: T): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    writeFallback(storeName, value)
    return
  }
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).put(value)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  }).finally(() => db.close())
}

async function remove(storeName: string, id: string): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    writeFallback(storeName, {}, id)
    return
  }
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  }).finally(() => db.close())
}

export function listProjects() {
  return readAll<ProjectEvidenceCard>(PROJECTS).then(items => items.sort((a, b) => b.updatedAt - a.updatedAt))
}

export function saveProject(project: ProjectEvidenceCard) {
  return put(PROJECTS, project)
}

export function deleteProject(id: string) {
  return remove(PROJECTS, id)
}

export function listAttempts() {
  return readAll<TrainingAttempt>(ATTEMPTS).then(items => items.sort((a, b) => b.completedAt - a.completedAt))
}

export function saveAttempt(attempt: TrainingAttempt) {
  return put(ATTEMPTS, attempt)
}

export async function exportWorkbenchData() {
  return JSON.stringify({
    schemaVersion: 1,
    exportedAt: Date.now(),
    projects: await listProjects(),
    attempts: await listAttempts()
  }, null, 2)
}

export async function importWorkbenchData(raw: string) {
  if (raw.length > 5_000_000) throw new Error('备份文件超过 5MB，请检查文件内容')
  const data = JSON.parse(raw)
  if (data?.schemaVersion !== 1 || !Array.isArray(data.projects) || !Array.isArray(data.attempts)) {
    throw new Error('不支持的训练数据格式')
  }
  await Promise.all([
    ...data.projects.map((item: ProjectEvidenceCard) => saveProject(item)),
    ...data.attempts.map((item: TrainingAttempt) => saveAttempt(item))
  ])
}
