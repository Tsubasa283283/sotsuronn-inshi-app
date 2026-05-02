'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { AppState, Thesis, ExamPrep, SchoolData, SchoolId, CommonMaterial, ResearchPlan } from './types'
import { loadState, saveState, saveSnapshot } from './storage'

interface AppContextValue {
  state: AppState
  updateThesis: (patch: Partial<Thesis>) => void
  updateExamPrep: (patch: Partial<ExamPrep>) => void
  updateSchool: (id: SchoolId, patch: Partial<SchoolData>) => void
  addMaterial: (m: CommonMaterial) => void
  updateMaterial: (m: CommonMaterial) => void
  deleteMaterial: (id: string) => void
  updateResearchPlan: (patch: Partial<ResearchPlan>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())

  // セッション開始時に自動スナップショット（データがある場合のみ）
  useEffect(() => {
    const hasData =
      state.thesis.theme ||
      state.materials.length > 0 ||
      state.examPrep.tasks.length > 0
    if (hasData) {
      const now = new Date()
      const label = `自動保存 ${now.toLocaleDateString('ja-JP')} ${now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
      saveSnapshot(state, label)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 起動時1回のみ

  // Persist on every change（メイン＋ミラーへ二重書き込み）
  useEffect(() => {
    saveState(state)
  }, [state])

  const updateThesis = useCallback((patch: Partial<Thesis>) => {
    setState((s) => ({ ...s, thesis: { ...s.thesis, ...patch } }))
  }, [])

  const updateExamPrep = useCallback((patch: Partial<ExamPrep>) => {
    setState((s) => ({ ...s, examPrep: { ...s.examPrep, ...patch } }))
  }, [])

  const updateSchool = useCallback((id: SchoolId, patch: Partial<SchoolData>) => {
    setState((s) => ({
      ...s,
      schools: { ...s.schools, [id]: { ...s.schools[id], ...patch } },
    }))
  }, [])

  const addMaterial = useCallback((m: CommonMaterial) => {
    setState((s) => ({ ...s, materials: [m, ...s.materials] }))
  }, [])

  const updateMaterial = useCallback((m: CommonMaterial) => {
    setState((s) => ({
      ...s,
      materials: s.materials.map((x) => (x.id === m.id ? m : x)),
    }))
  }, [])

  const deleteMaterial = useCallback((id: string) => {
    setState((s) => ({ ...s, materials: s.materials.filter((x) => x.id !== id) }))
  }, [])

  const updateResearchPlan = useCallback((patch: Partial<ResearchPlan>) => {
    setState((s) => ({ ...s, researchPlan: { ...s.researchPlan, ...patch } }))
  }, [])

  return (
    <AppContext.Provider
      value={{
        state,
        updateThesis,
        updateExamPrep,
        updateSchool,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        updateResearchPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
