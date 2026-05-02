export type SchoolId = 'aoyama' | 'meiji' | 'chiba_shoka'

export type MaterialType =
  | 'literature'
  | 'keyword'
  | 'problem_awareness'
  | 'motivation'
  | 'experience'
  | 'analysis'

export type ReuseTarget =
  | 'thesis'
  | 'aoyama'
  | 'meiji'
  | 'chiba_shoka'
  | 'interview'
  | 'research_plan'

export type Priority = 'high' | 'medium' | 'low'

export type SchoolStatus = 'not_started' | 'in_progress' | 'completed'

export interface CommonMaterial {
  id: string
  title: string
  content: string
  type: MaterialType
  tags: string[]
  reuseTargets: ReuseTarget[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  category: 'thesis' | 'exam' | SchoolId
  deadline?: string
  priority: Priority
  completed: boolean
  createdAt: string
}

export interface Reference {
  id: string
  title: string
  author: string
  year?: number
  journal?: string        // 掲載誌・出版社
  notes: string           // メモ
  background?: string     // 研究背景
  researchQuestion?: string
  answer?: string
  utilization?: string    // 自分の研究への活用
  includeInReport?: boolean
}

export interface TeacherComment {
  id: string
  content: string
  date: string
}

export interface Draft {
  id: string
  title: string
  content: string
  updatedAt: string
}

export interface TimetableItem {
  id: string
  period: string   // 例: "4月第1週"
  task: string
  done: boolean
}

export interface ReportDraft {
  synthesis: string
  ownRQ: string
  nextTasks: string
  questions: string
}

export interface Thesis {
  theme: string
  problemAwareness: string
  hypothesis: string
  structure: string
  references: Reference[]
  teacherComments: TeacherComment[]
  nextActions: string[]
  drafts: Draft[]
  timetable: TimetableItem[]
  reportDraft?: ReportDraft
}

export interface RequiredDocument {
  id: string
  name: string
  completed: boolean
}

export interface SchoolData {
  id: SchoolId
  name: string
  researchPlanMemo: string
  interviewMemo: string
  characteristicsMemo: string
  status: SchoolStatus
  requiredDocuments: RequiredDocument[]
  examSubjects: string[]
  tasks: Task[]
}

export interface ExamPrep {
  overview: string
  interviewPrep: string
  researchPlanMemo: string
  tasks: Task[]
}

export interface ResearchPlan {
  provisionalTitle: string
  background: string
  problemAwareness: string
  literatureReview: string
  researchGap: string
  researchQuestion: string
  purpose: string
  methodology: string
  expectedConclusion: string
  references: string
  schoolAdjustment: string
}

export interface AppState {
  thesis: Thesis
  examPrep: ExamPrep
  schools: Record<SchoolId, SchoolData>
  materials: CommonMaterial[]
  researchPlan: ResearchPlan
}
