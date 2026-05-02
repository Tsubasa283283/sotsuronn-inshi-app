import type { AppState, MaterialType, ReuseTarget } from './types'

export const SCHOOLS = {
  aoyama: { id: 'aoyama' as const, name: '青山学院大学', shortName: '青山学院' },
  meiji: { id: 'meiji' as const, name: '明治大学', shortName: '明治' },
  chiba_shoka: { id: 'chiba_shoka' as const, name: '千葉商科大学', shortName: '千葉商科' },
}

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  literature: '文献メモ',
  keyword: 'キーワード',
  problem_awareness: '問題意識',
  motivation: '志望理由',
  experience: '経験談',
  analysis: '考察',
}

export const REUSE_TARGET_LABELS: Record<ReuseTarget, string> = {
  thesis: '卒論',
  aoyama: '青山学院',
  meiji: '明治',
  chiba_shoka: '千葉商科',
  interview: '面接',
  research_plan: '研究計画書',
}

export const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
}

export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export const STATUS_LABELS = {
  not_started: '未着手',
  in_progress: '対策中',
  completed: '完了',
}

export const STATUS_COLORS = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

export const INITIAL_STATE: AppState = {
  thesis: {
    theme: '',
    problemAwareness: '',
    hypothesis: '',
    structure: '',
    references: [],
    teacherComments: [],
    nextActions: [],
    drafts: [],
    timetable: [],
  },
  examPrep: {
    overview: '',
    interviewPrep: '',
    researchPlanMemo: '',
    tasks: [],
  },
  schools: {
    aoyama: {
      id: 'aoyama',
      name: '青山学院大学',
      researchPlanMemo: '',
      interviewMemo: '',
      characteristicsMemo: '',
      status: 'not_started',
      requiredDocuments: [
        { id: 'doc-ag-1', name: '志願票', completed: false },
        { id: 'doc-ag-2', name: '研究計画書', completed: false },
        { id: 'doc-ag-3', name: '成績証明書', completed: false },
        { id: 'doc-ag-4', name: '卒業見込証明書', completed: false },
      ],
      examSubjects: [],
      tasks: [],
    },
    meiji: {
      id: 'meiji',
      name: '明治大学',
      researchPlanMemo: '',
      interviewMemo: '',
      characteristicsMemo: '',
      status: 'not_started',
      requiredDocuments: [
        { id: 'doc-mj-1', name: '志願票', completed: false },
        { id: 'doc-mj-2', name: '研究計画書', completed: false },
        { id: 'doc-mj-3', name: '成績証明書', completed: false },
        { id: 'doc-mj-4', name: '卒業見込証明書', completed: false },
      ],
      examSubjects: [],
      tasks: [],
    },
    chiba_shoka: {
      id: 'chiba_shoka',
      name: '千葉商科大学',
      researchPlanMemo: '',
      interviewMemo: '',
      characteristicsMemo: '',
      status: 'not_started',
      requiredDocuments: [
        { id: 'doc-cs-1', name: '志願票', completed: false },
        { id: 'doc-cs-2', name: '研究計画書', completed: false },
        { id: 'doc-cs-3', name: '成績証明書', completed: false },
        { id: 'doc-cs-4', name: '卒業見込証明書', completed: false },
      ],
      examSubjects: [],
      tasks: [],
    },
  },
  materials: [],
  researchPlan: {
    provisionalTitle: '',
    background: '',
    problemAwareness: '',
    literatureReview: '',
    researchGap: '',
    researchQuestion: '',
    purpose: '',
    methodology: '',
    expectedConclusion: '',
    references: '',
    schoolAdjustment: '',
  },
}
