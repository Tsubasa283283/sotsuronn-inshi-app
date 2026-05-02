import type { AppState } from './types'
import { INITIAL_STATE } from './constants'

const STORAGE_KEY = 'sotsuronn-inyoshi-app'
const MIRROR_KEY  = 'sotsuronn-inyoshi-mirror'   // 二重書き込み用
const SNAPSHOT_KEY = 'sotsuronn-inyoshi-snapshots' // 自動スナップショット用
const MAX_SNAPSHOTS = 10

export interface Snapshot {
  id: string
  timestamp: string   // ISO 8601
  label: string
  state: AppState
}

function mergeState(parsed: AppState): AppState {
  return {
    ...INITIAL_STATE,
    ...parsed,
    thesis: { ...INITIAL_STATE.thesis, ...parsed.thesis },
    examPrep: { ...INITIAL_STATE.examPrep, ...parsed.examPrep },
    schools: {
      aoyama:      { ...INITIAL_STATE.schools.aoyama,      ...parsed.schools?.aoyama },
      meiji:       { ...INITIAL_STATE.schools.meiji,       ...parsed.schools?.meiji },
      chiba_shoka: { ...INITIAL_STATE.schools.chiba_shoka, ...parsed.schools?.chiba_shoka },
    },
    materials: parsed.materials ?? [],
    researchPlan: { ...INITIAL_STATE.researchPlan, ...parsed.researchPlan },
  }
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return INITIAL_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // メインキーが空ならミラーから復旧を試みる
      const mirror = localStorage.getItem(MIRROR_KEY)
      if (mirror) return mergeState(JSON.parse(mirror) as AppState)
      return structuredClone(INITIAL_STATE)
    }
    return mergeState(JSON.parse(raw) as AppState)
  } catch {
    // メインが壊れていたらミラーから復旧
    try {
      const mirror = localStorage.getItem(MIRROR_KEY)
      if (mirror) return mergeState(JSON.parse(mirror) as AppState)
    } catch { /* ignore */ }
    return structuredClone(INITIAL_STATE)
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  const json = JSON.stringify(state)
  // メインと二重書き込み（ミラー）
  localStorage.setItem(STORAGE_KEY, json)
  localStorage.setItem(MIRROR_KEY, json)
}

// ---- Snapshots ----

export function loadSnapshots(): Snapshot[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    return raw ? (JSON.parse(raw) as Snapshot[]) : []
  } catch {
    return []
  }
}

export function saveSnapshot(state: AppState, label: string): void {
  if (typeof window === 'undefined') return
  const snapshots = loadSnapshots()
  const newSnapshot: Snapshot = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    label,
    state,
  }
  // 先頭に追加し、上限を超えたら古いものを削除
  const updated = [newSnapshot, ...snapshots].slice(0, MAX_SNAPSHOTS)
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(updated))
}

export function deleteSnapshot(id: string): void {
  if (typeof window === 'undefined') return
  const updated = loadSnapshots().filter((s) => s.id !== id)
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(updated))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ---- Storage usage ----

export function getStorageUsage(): { usedKB: number; limitKB: number; pct: number } {
  if (typeof window === 'undefined') return { usedKB: 0, limitKB: 5120, pct: 0 }
  const keys = [STORAGE_KEY, MIRROR_KEY, SNAPSHOT_KEY]
  let bytes = 0
  for (const key of keys) {
    const val = localStorage.getItem(key) ?? ''
    bytes += new Blob([val]).size
  }
  const limitKB = 5120
  const usedKB = bytes / 1024
  return { usedKB, limitKB, pct: (usedKB / limitKB) * 100 }
}
