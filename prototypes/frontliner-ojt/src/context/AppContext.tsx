import { createContext, useContext, useState, ReactNode } from 'react'
import type { AppUser, DailyChecklist, PenaksiranRecord, Assessment, ScoreBreakdown, FLProfile, KanitProfile } from '../types'
import { MOCK_USERS, INITIAL_CHECKLISTS, INITIAL_PENAKSIRAN, INITIAL_ASSESSMENTS } from '../data/mockData'

interface AppContextType {
  currentUser: AppUser | null
  checklists: DailyChecklist[]
  penaksiranRecords: PenaksiranRecord[]
  assessments: Assessment[]
  login: (userId: string) => void
  logout: () => void
  submitChecklist: (checklist: DailyChecklist) => void
  scoreChecklist: (checklistId: string, score: number, note: string) => void
  addPenaksiran: (record: PenaksiranRecord) => void
  scorePenaksiran: (recordId: string, intoolsValue: number, score: number, note: string) => void
  submitAssessment: (assessment: Assessment) => void
  scoreAssessment: (flId: string, score: number, note: string) => void
  getFlUsers: () => AppUser[]
  getUserById: (id: string) => AppUser | undefined
  getFlChecklists: (flId: string) => DailyChecklist[]
  getFlPenaksiran: (flId: string) => PenaksiranRecord[]
  getFlAssessment: (flId: string) => Assessment | undefined
  getFlScoreBreakdown: (flId: string) => ScoreBreakdown
  getTodayChecklist: (flId: string) => DailyChecklist | undefined
}

const AppContext = createContext<AppContextType>(null!)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [checklists, setChecklists] = useState<DailyChecklist[]>(INITIAL_CHECKLISTS)
  const [penaksiranRecords, setPenaksiranRecords] = useState<PenaksiranRecord[]>(INITIAL_PENAKSIRAN)
  const [assessments, setAssessments] = useState<Assessment[]>(INITIAL_ASSESSMENTS)

  function login(userId: string) {
    const user = MOCK_USERS.find(u => u.id === userId)
    if (user) setCurrentUser(user)
  }

  function logout() {
    setCurrentUser(null)
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

  function scoreAssessment(flId: string, score: number, note: string) {
    setAssessments(prev => prev.map(a =>
      a.flId === flId
        ? { ...a, status: 'scored', kanitScore: score, kanitNote: note }
        : a
    ))
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

  function getTodayChecklist(flId: string): DailyChecklist | undefined {
    const flUser = MOCK_USERS.find(u => u.id === flId)
    if (!flUser) return undefined
    const profile = flUser.profile as FLProfile
    const day = profile.currentDay
    return checklists.find(c => c.flId === flId && c.day === day)
  }

  function getFlScoreBreakdown(flId: string): ScoreBreakdown {
    const flChecks = checklists.filter(c => c.flId === flId && c.status === 'scored' && c.kanitScore !== undefined)
    const dailyProgressScore = flChecks.length > 0
      ? Math.round(flChecks.reduce((sum, c) => sum + (c.kanitScore ?? 0), 0) / flChecks.length)
      : null

    const assessment = assessments.find(a => a.flId === flId && a.status === 'scored')
    const assessmentScore = assessment?.kanitScore ?? null

    const penaksiran = penaksiranRecords.filter(r => r.flId === flId && r.kanitScore !== undefined)
    const penaksiranScore = penaksiran.length > 0
      ? Math.round(penaksiran.reduce((sum, r) => sum + (r.kanitScore ?? 0), 0) / penaksiran.length)
      : null

    let totalScore: number | null = null
    let passed: boolean | null = null

    if (dailyProgressScore !== null && assessmentScore !== null && penaksiranScore !== null) {
      totalScore = Math.round(dailyProgressScore * 0.5 + assessmentScore * 0.3 + penaksiranScore * 0.2)
      passed = totalScore >= 75
    } else if (dailyProgressScore !== null) {
      // partial score
      totalScore = null
    }

    return {
      dailyProgressScore,
      assessmentScore,
      penaksiranScore,
      totalScore,
      passed,
      daysScored: flChecks.length,
      penaksiranCount: penaksiran.length,
    }
  }

  return (
    <AppContext.Provider value={{
      currentUser, checklists, penaksiranRecords, assessments,
      login, logout, submitChecklist, scoreChecklist,
      addPenaksiran, scorePenaksiran, submitAssessment, scoreAssessment,
      getFlUsers, getUserById, getFlChecklists, getFlPenaksiran,
      getFlAssessment, getFlScoreBreakdown, getTodayChecklist,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
