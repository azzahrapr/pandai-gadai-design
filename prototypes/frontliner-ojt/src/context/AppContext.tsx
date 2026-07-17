import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AppUser, DailyChecklist, PenaksiranRecord, Assessment, FinalEvaluation, ScoreBreakdown, FLProfile, KanitProfile } from '../types'
import { MOCK_USERS, INITIAL_CHECKLISTS, INITIAL_PENAKSIRAN, INITIAL_ASSESSMENTS } from '../data/mockData'

export interface ModuleDecision {
  action: 'carry-over' | 'close'
  reason?: string
  note?: string
}

export interface Level2Unlock {
  flId: string
  kanitId: string
  moduleDecisions: Record<string, ModuleDecision>
  unlockedAt: string
}

interface AppContextType {
  currentUser: AppUser | null
  checklists: DailyChecklist[]
  penaksiranRecords: PenaksiranRecord[]
  assessments: Assessment[]
  finalEvaluations: FinalEvaluation[]
  level2Unlocks: Record<string, Level2Unlock>
  login: (userId: string) => void
  logout: () => void
  resetData: () => void
  submitChecklist: (checklist: DailyChecklist) => void
  scoreChecklist: (checklistId: string, score: number, note: string) => void
  scoreChecklistTasks: (checklistId: string, taskScores: { taskId: string; score: number; note?: string }[], overallNote?: string) => void
  addPenaksiran: (record: PenaksiranRecord) => void
  scorePenaksiran: (recordId: string, intoolsValue: number, score: number, note: string) => void
  submitAssessment: (assessment: Assessment) => void
  submitFinalEvaluation: (evaluation: FinalEvaluation) => void
  unlockLevel2: (flId: string, moduleDecisions: Record<string, ModuleDecision>) => void
  getFlUsers: () => AppUser[]
  getUserById: (id: string) => AppUser | undefined
  getFlChecklists: (flId: string) => DailyChecklist[]
  getFlPenaksiran: (flId: string) => PenaksiranRecord[]
  getFlAssessment: (flId: string) => Assessment | undefined
  getFlFinalEvaluation: (flId: string) => FinalEvaluation | undefined
  getFlScoreBreakdown: (flId: string) => ScoreBreakdown
  getTodayChecklist: (flId: string) => DailyChecklist | undefined
}

const AppContext = createContext<AppContextType>(null!)

// Bump this when the shape of stored data changes to auto-invalidate old saves.
const STORAGE_VERSION = 'v1'
const PREFIX = `pandai-gadai-ojt-${STORAGE_VERSION}`

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value))
  } catch { /* storage full or unavailable */ }
}

function clearAll() {
  const keys = ['currentUserId', 'checklists', 'penaksiran', 'assessments', 'finalEvaluations', 'level2Unlocks']
  keys.forEach(k => localStorage.removeItem(`${PREFIX}:${k}`))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const id = load<string | null>('currentUserId', null)
    return id ? (MOCK_USERS.find(u => u.id === id) ?? null) : null
  })
  const [checklists, setChecklists] = useState<DailyChecklist[]>(() => load('checklists', INITIAL_CHECKLISTS))
  const [penaksiranRecords, setPenaksiranRecords] = useState<PenaksiranRecord[]>(() => load('penaksiran', INITIAL_PENAKSIRAN))
  const [assessments, setAssessments] = useState<Assessment[]>(() => load('assessments', INITIAL_ASSESSMENTS))
  const [finalEvaluations, setFinalEvaluations] = useState<FinalEvaluation[]>(() => load('finalEvaluations', []))
  const [level2Unlocks, setLevel2Unlocks] = useState<Record<string, Level2Unlock>>(() => load('level2Unlocks', {}))

  useEffect(() => { save('checklists', checklists) }, [checklists])
  useEffect(() => { save('penaksiran', penaksiranRecords) }, [penaksiranRecords])
  useEffect(() => { save('assessments', assessments) }, [assessments])
  useEffect(() => { save('finalEvaluations', finalEvaluations) }, [finalEvaluations])
  useEffect(() => { save('level2Unlocks', level2Unlocks) }, [level2Unlocks])

  function login(userId: string) {
    const user = MOCK_USERS.find(u => u.id === userId)
    if (user) {
      setCurrentUser(user)
      save('currentUserId', userId)
    }
  }

  function logout() {
    setCurrentUser(null)
    localStorage.removeItem(`${PREFIX}:currentUserId`)
  }

  function resetData() {
    clearAll()
    setCurrentUser(null)
    setChecklists(INITIAL_CHECKLISTS)
    setPenaksiranRecords(INITIAL_PENAKSIRAN)
    setAssessments(INITIAL_ASSESSMENTS)
    setFinalEvaluations([])
    setLevel2Unlocks({})
  }

  function submitChecklist(checklist: DailyChecklist) {
    setChecklists(prev => {
      const exists = prev.find(c => c.id === checklist.id)
      if (exists) return prev.map(c => c.id === checklist.id ? checklist : c)
      return [...prev, checklist]
    })
  }

  function scoreChecklist(checklistId: string, score: number, note: string) {
    setChecklists(prev => prev.map(c =>
      c.id === checklistId
        ? { ...c, status: 'scored', kanitScore: score, kanitNote: note, kanitScoredAt: new Date().toISOString() }
        : c
    ))
  }

  function scoreChecklistTasks(
    checklistId: string,
    taskScores: { taskId: string; score: number; note?: string }[],
    overallNote?: string
  ) {
    const avgScore = taskScores.length > 0
      ? Math.round(taskScores.reduce((sum, ts) => sum + ts.score, 0) / taskScores.length)
      : 0
    const scoreMap = Object.fromEntries(taskScores.map(ts => [ts.taskId, ts]))
    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c
      return {
        ...c,
        status: 'scored' as const,
        kanitScore: avgScore,
        kanitNote: overallNote ?? '',
        kanitScoredAt: new Date().toISOString(),
        tasks: c.tasks?.map(t => {
          const ts = scoreMap[t.taskId]
          return ts ? { ...t, kanitScore: ts.score, kanitNote: ts.note } : t
        }),
      }
    }))
  }

  function addPenaksiran(record: PenaksiranRecord) {
    setPenaksiranRecords(prev => [...prev, record])
  }

  function scorePenaksiran(recordId: string, intoolsValue: number, score: number, note: string) {
    setPenaksiranRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r
      const accuracy = Math.min(100, (1 - Math.abs(r.flEstimate - intoolsValue) / intoolsValue) * 100)
      return { ...r, intoolsValue, accuracy: Math.max(0, accuracy), kanitScore: score, kanitNote: note, kanitScoredAt: new Date().toISOString() }
    }))
  }

  function submitAssessment(assessment: Assessment) {
    setAssessments(prev => {
      const exists = prev.find(a => a.id === assessment.id)
      if (exists) return prev.map(a => a.id === assessment.id ? assessment : a)
      return [...prev, assessment]
    })
  }

  function unlockLevel2(flId: string, moduleDecisions: Record<string, ModuleDecision>) {
    if (!currentUser) return
    setLevel2Unlocks(prev => ({
      ...prev,
      [flId]: { flId, kanitId: currentUser.id, moduleDecisions, unlockedAt: new Date().toISOString() },
    }))
  }

  function submitFinalEvaluation(evaluation: FinalEvaluation) {
    setFinalEvaluations(prev => {
      const exists = prev.find(e => e.flId === evaluation.flId)
      if (exists) return prev.map(e => e.flId === evaluation.flId ? evaluation : e)
      return [...prev, evaluation]
    })
  }

  function getFlUsers(): AppUser[] {
    return MOCK_USERS.filter(u => u.role === 'fl')
  }

  function getUserById(id: string): AppUser | undefined {
    return MOCK_USERS.find(u => u.id === id)
  }

  function getFlChecklists(flId: string): DailyChecklist[] {
    return checklists.filter(c => c.flId === flId).sort((a, b) => a.day - b.day)
  }

  function getFlPenaksiran(flId: string): PenaksiranRecord[] {
    return penaksiranRecords.filter(r => r.flId === flId).sort((a, b) => a.day - b.day)
  }

  function getFlAssessment(flId: string): Assessment | undefined {
    return assessments.find(a => a.flId === flId)
  }

  function getFlFinalEvaluation(flId: string): FinalEvaluation | undefined {
    return finalEvaluations.find(e => e.flId === flId)
  }

  function getTodayChecklist(flId: string): DailyChecklist | undefined {
    const flUser = MOCK_USERS.find(u => u.id === flId)
    if (!flUser) return undefined
    const profile = flUser.profile as FLProfile
    const day = profile.currentDay
    return checklists.find(c => c.flId === flId && c.day === day)
  }

  function getFlScoreBreakdown(flId: string): ScoreBreakdown {
    const flChecks = checklists.filter(c => c.flId === flId && c.status === 'scored')
    let daysScored = 0
    const allTaskScores: number[] = []
    for (const c of flChecks) {
      if (c.tasks) {
        const ts = c.tasks.filter(t => t.kanitScore !== undefined).map(t => t.kanitScore!)
        if (ts.length > 0) { allTaskScores.push(...ts); daysScored++ }
        else if (c.kanitScore !== undefined) { allTaskScores.push(c.kanitScore); daysScored++ }
      } else if (c.kanitScore !== undefined) {
        allTaskScores.push(c.kanitScore); daysScored++
      }
    }
    const dailyProgressScore = allTaskScores.length > 0
      ? Math.round(allTaskScores.reduce((a, b) => a + b, 0) / allTaskScores.length)
      : null

    const assessment = assessments.find(a => a.flId === flId && a.status === 'selesai')
    const assessmentScore = assessment?.mcqScore ?? null

    const penaksiran = penaksiranRecords.filter(r => r.flId === flId && r.kanitScore !== undefined)
    const penaksiranScore = penaksiran.length > 0
      ? Math.round(penaksiran.reduce((sum, r) => sum + (r.kanitScore ?? 0), 0) / penaksiran.length)
      : null

    let totalScore: number | null = null
    let passed: boolean | null = null

    if (dailyProgressScore !== null && assessmentScore !== null) {
      totalScore = Math.round(dailyProgressScore * 0.6 + assessmentScore * 0.4)
      passed = totalScore >= 75
    } else if (dailyProgressScore !== null) {
      totalScore = null
    }

    return {
      dailyProgressScore,
      assessmentScore,
      penaksiranScore,
      totalScore,
      passed,
      daysScored,
      penaksiranCount: penaksiran.length,
    }
  }

  return (
    <AppContext.Provider value={{
      currentUser, checklists, penaksiranRecords, assessments, finalEvaluations, level2Unlocks,
      login, logout, resetData, submitChecklist, scoreChecklist, scoreChecklistTasks,
      addPenaksiran, scorePenaksiran, submitAssessment, submitFinalEvaluation, unlockLevel2,
      getFlUsers, getUserById, getFlChecklists, getFlPenaksiran,
      getFlAssessment, getFlFinalEvaluation, getFlScoreBreakdown, getTodayChecklist,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
