export type UserRole = 'fl' | 'kanit'
export type MilestoneType = 'minggu1' | 'minggu2'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}
export type SubmissionStatus = 'not_started' | 'submitted' | 'scored'
export type AssessmentStatus = 'not_started' | 'submitted' | 'scored'

export interface LearningMaterial {
  id: string
  title: string
  content: string
}

export interface ChecklistItem {
  id: string
  text: string
  category: string
}

export interface Milestone {
  id: string
  name: string
  shortName: string
  type: MilestoneType
  order: number
  description: string
  unlockDay: number
  estimatedMinutes: number
  materials: LearningMaterial[]
  checklistItems: ChecklistItem[]
  quiz?: QuizQuestion[]
}

export interface ChecklistItemRecord {
  itemId: string
  completed: boolean
  note?: string
}

export interface DailyTaskRecord {
  taskId: string
  taskName: string
  completedItemIds: string[]
  reflection: string
  submittedAt: string
}

export interface DailyChecklist {
  id: string
  day: number
  date: string
  flId: string
  // Legacy format (historical data)
  milestoneId?: string
  milestoneName?: string
  items?: ChecklistItemRecord[]
  // Multi-task format
  tasks?: DailyTaskRecord[]
  status: SubmissionStatus
  submittedAt?: string
  kanitScore?: number
  kanitNote?: string
  kanitScoredAt?: string
}

export interface PenaksiranRecord {
  id: string
  day: number
  date: string
  flId: string
  barangType: string
  barangDescription: string
  flEstimate: number
  intoolsValue?: number
  accuracy?: number
  kanitScore?: number
  kanitNote?: string
  kanitScoredAt?: string
}

export interface MasteryCheck {
  materialId: string
  material: string
  mastered: boolean
}

export interface AssessmentAnswer {
  questionId: string
  question: string
  answer: string
}

export interface Assessment {
  id: string
  flId: string
  day: number
  date: string
  masteryChecks: MasteryCheck[]
  answers: AssessmentAnswer[]
  status: AssessmentStatus
  submittedAt?: string
  kanitScore?: number
  kanitNote?: string
}

export interface ScoreBreakdown {
  dailyProgressScore: number | null
  assessmentScore: number | null
  penaksiranScore: number | null
  totalScore: number | null
  passed: boolean | null
  daysScored: number
  penaksiranCount: number
}

export interface FLProfile {
  id: string
  name: string
  branch: string
  position: string
  startDate: string
  currentDay: number
  kanitId: string
  activeMilestoneIds: string[]
  completedMilestoneIds?: string[]
  quizScores?: Record<string, number>
}

export interface KanitProfile {
  id: string
  name: string
  branch: string
  flIds: string[]
}

export interface AppUser {
  id: string
  name: string
  role: UserRole
  profile: FLProfile | KanitProfile
}
