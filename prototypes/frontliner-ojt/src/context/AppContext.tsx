import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { AppUser, DailyChecklist, PenaksiranRecord, Assessment, FinalEvaluation, ScoreBreakdown, FLProfile, ExtensionRequest, ExtensionType, TaskConfirmation, FLNotification } from '../types'
import { MOCK_TASK_CONFIRMATIONS, MOCK_NOTIFICATIONS } from '../data/mockData'
import { MOCK_USERS, MILESTONES, INITIAL_CHECKLISTS, INITIAL_PENAKSIRAN, INITIAL_ASSESSMENTS, KKM_LATIHAN, KKM_UJIAN_AKHIR } from '../data/mockData'

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

export interface ActiveSession {
  milestoneId: string
  checklistId: string
}

interface AppContextType {
  currentUser: AppUser | null
  isLoading: boolean
  checklists: DailyChecklist[]
  penaksiranRecords: PenaksiranRecord[]
  assessments: Assessment[]
  finalEvaluations: FinalEvaluation[]
  level2Unlocks: Record<string, Level2Unlock>
  activeSession: ActiveSession | null
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  resetData: () => Promise<void>
  resetUserProgress: () => Promise<void>
  submitChecklist: (checklist: DailyChecklist) => void
  scoreChecklist: (checklistId: string, score: number, note: string) => void
  scoreChecklistTasks: (checklistId: string, taskScores: { taskId: string; score: number; note?: string }[], overallNote?: string) => void
  addPenaksiran: (record: PenaksiranRecord) => void
  scorePenaksiran: (recordId: string, intoolsValue: number, score: number, note: string) => void
  submitAssessment: (assessment: Assessment) => void
  submitFinalEvaluation: (evaluation: FinalEvaluation) => void
  unlockLevel2: (flId: string, moduleDecisions: Record<string, ModuleDecision>) => void
  startMilestone: (milestoneId: string) => void
  startSession: (milestoneId: string) => void
  clearSession: () => void
  saveQuizResult: (milestoneId: string, score: number, answers: Record<string, number>) => void
  setCurrentDay: (day: number) => void
  startProgram: () => void
  extensionRequests: ExtensionRequest[]
  requestExtension: (milestoneId: string, type: ExtensionType) => void
  respondExtension: (requestId: string, status: 'approved' | 'rejected', kanitNote?: string) => void
  getFlUsers: () => AppUser[]
  getUserById: (id: string) => AppUser | undefined
  getFlChecklists: (flId: string) => DailyChecklist[]
  getFlPenaksiran: (flId: string) => PenaksiranRecord[]
  getFlAssessment: (flId: string) => Assessment | undefined
  getFlFinalEvaluation: (flId: string) => FinalEvaluation | undefined
  getFlScoreBreakdown: (flId: string) => ScoreBreakdown
  getTodayChecklist: (flId: string) => DailyChecklist | undefined
  taskConfirmations: TaskConfirmation[]
  submitTaskConfirmation: (confirmation: TaskConfirmation) => void
  getItemConfirmations: (flId: string, milestoneId: string, itemId: string) => TaskConfirmation[]
  reviewTaskConfirmation: (confirmationId: string, passed: boolean, kanitNote: string) => void
  notifications: FLNotification[]
  unreadNotificationCount: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

const AppContext = createContext<AppContextType>(null!)

// ── DB ↔ TS transforms ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbChecklist(row: any): DailyChecklist {
  return {
    id: row.id, day: row.day, date: row.date, flId: row.fl_id,
    milestoneId: row.milestone_id ?? undefined,
    milestoneName: row.milestone_name ?? undefined,
    items: row.items ?? undefined,
    tasks: row.tasks ?? undefined,
    status: row.status,
    submittedAt: row.submitted_at ?? undefined,
    kanitScore: row.kanit_score ?? undefined,
    kanitNote: row.kanit_note ?? undefined,
    kanitScoredAt: row.kanit_scored_at ?? undefined,
  }
}

function toDbChecklist(c: DailyChecklist) {
  return {
    id: c.id, day: c.day, date: c.date, fl_id: c.flId,
    milestone_id: c.milestoneId ?? null,
    milestone_name: c.milestoneName ?? null,
    items: c.items ?? null,
    tasks: c.tasks ?? null,
    status: c.status,
    submitted_at: c.submittedAt ?? null,
    kanit_score: c.kanitScore ?? null,
    kanit_note: c.kanitNote ?? null,
    kanit_scored_at: c.kanitScoredAt ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbPenaksiran(row: any): PenaksiranRecord {
  return {
    id: row.id, day: row.day, date: row.date, flId: row.fl_id,
    barangType: row.barang_type,
    barangDescription: row.barang_description,
    flEstimate: row.fl_estimate,
    intoolsValue: row.intools_value ?? undefined,
    accuracy: row.accuracy ?? undefined,
    kanitScore: row.kanit_score ?? undefined,
    kanitNote: row.kanit_note ?? undefined,
    kanitScoredAt: row.kanit_scored_at ?? undefined,
  }
}

function toDbPenaksiran(r: PenaksiranRecord) {
  return {
    id: r.id, day: r.day, date: r.date, fl_id: r.flId,
    barang_type: r.barangType,
    barang_description: r.barangDescription,
    fl_estimate: r.flEstimate,
    intools_value: r.intoolsValue ?? null,
    accuracy: r.accuracy ?? null,
    kanit_score: r.kanitScore ?? null,
    kanit_note: r.kanitNote ?? null,
    kanit_scored_at: r.kanitScoredAt ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbAssessment(row: any): Assessment {
  return {
    id: row.id, flId: row.fl_id, day: row.day, date: row.date,
    masteryChecks: row.mastery_checks ?? [],
    answers: row.answers ?? [],
    status: row.status,
    submittedAt: row.submitted_at ?? undefined,
    mcqScore: row.mcq_score ?? undefined,
  }
}

function toDbAssessment(a: Assessment) {
  return {
    id: a.id, fl_id: a.flId, day: a.day, date: a.date,
    mastery_checks: a.masteryChecks,
    answers: a.answers,
    status: a.status,
    submitted_at: a.submittedAt ?? null,
    mcq_score: a.mcqScore ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbFinalEval(row: any): FinalEvaluation {
  return {
    id: row.id, flId: row.fl_id, kanitId: row.kanit_id,
    submittedAt: row.submitted_at,
    softSkills: row.soft_skills ?? [],
    attitudeScore: row.attitude_score,
    feedback: row.feedback,
    recommendation: row.recommendation,
  }
}

function toDbFinalEval(e: FinalEvaluation) {
  return {
    id: e.id, fl_id: e.flId, kanit_id: e.kanitId,
    submitted_at: e.submittedAt,
    soft_skills: e.softSkills,
    attitude_score: e.attitudeScore,
    feedback: e.feedback,
    recommendation: e.recommendation,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbExtension(row: any): ExtensionRequest {
  return {
    id: row.id,
    flId: row.fl_id,
    milestoneId: row.milestone_id,
    type: row.type,
    status: row.status,
    requestedAt: row.requested_at,
    respondedAt: row.responded_at ?? undefined,
    kanitId: row.kanit_id ?? undefined,
    kanitNote: row.kanit_note ?? undefined,
  }
}

function toDbExtension(r: ExtensionRequest) {
  return {
    id: r.id,
    fl_id: r.flId,
    milestone_id: r.milestoneId,
    type: r.type,
    status: r.status,
    requested_at: r.requestedAt,
    responded_at: r.respondedAt ?? null,
    kanit_id: r.kanitId ?? null,
    kanit_note: r.kanitNote ?? null,
  }
}

// ── Provider ──────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checklists, setChecklists] = useState<DailyChecklist[]>([])
  const [penaksiranRecords, setPenaksiranRecords] = useState<PenaksiranRecord[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [finalEvaluations, setFinalEvaluations] = useState<FinalEvaluation[]>([])
  const [level2Unlocks, setLevel2Unlocks] = useState<Record<string, Level2Unlock>>({})
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [extensionRequests, setExtensionRequests] = useState<ExtensionRequest[]>([])

  // Stable refs to avoid stale closures in effects
  const checklistsRef = useRef(checklists)
  useEffect(() => { checklistsRef.current = checklists }, [checklists])
  const extensionRequestsRef = useRef(extensionRequests)
  useEffect(() => { extensionRequestsRef.current = extensionRequests }, [extensionRequests])


  // ── Auth initialization ──────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userId = session.user.user_metadata?.userId as string
        setCurrentUser(MOCK_USERS.find(u => u.id === userId) ?? null)
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userId = session.user.user_metadata?.userId as string
        setCurrentUser(MOCK_USERS.find(u => u.id === userId) ?? null)
      } else {
        setCurrentUser(null)
        setChecklists([])
        setPenaksiranRecords([])
        setAssessments([])
        setFinalEvaluations([])
        setLevel2Unlocks({})
        setActiveSession(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Data loading + realtime ──────────────────────────────
  useEffect(() => {
    if (!currentUser) return
    loadAll()

    const channel = supabase.channel('ojt-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_checklists' }, ({ eventType, new: row }) => {
        if (eventType === 'INSERT') {
          const cl = fromDbChecklist(row)
          setChecklists(prev => prev.some(c => c.id === cl.id) ? prev : [...prev, cl])
        } else if (eventType === 'UPDATE') {
          setChecklists(prev => prev.map(c => c.id === row.id ? fromDbChecklist(row) : c))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'penaksiran_records' }, ({ eventType, new: row }) => {
        if (eventType === 'INSERT') {
          const r = fromDbPenaksiran(row)
          setPenaksiranRecords(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r])
        } else if (eventType === 'UPDATE') {
          setPenaksiranRecords(prev => prev.map(r => r.id === row.id ? fromDbPenaksiran(row) : r))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, ({ eventType, new: row }) => {
        if (eventType === 'INSERT') {
          const a = fromDbAssessment(row)
          setAssessments(prev => prev.some(x => x.id === a.id) ? prev : [...prev, a])
        } else if (eventType === 'UPDATE') {
          setAssessments(prev => prev.map(a => a.id === row.id ? fromDbAssessment(row) : a))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'final_evaluations' }, ({ eventType, new: row }) => {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const e = fromDbFinalEval(row)
          setFinalEvaluations(prev => {
            const exists = prev.some(x => x.id === e.id)
            return exists ? prev.map(x => x.id === e.id ? e : x) : [...prev, e]
          })
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'level2_unlocks' }, ({ eventType, new: row }) => {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          setLevel2Unlocks(prev => ({
            ...prev,
            [row.fl_id]: { flId: row.fl_id, kanitId: row.kanit_id, moduleDecisions: row.module_decisions, unlockedAt: row.unlocked_at },
          }))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fl_profiles' }, ({ eventType, new: row }) => {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          applyFlProfiles([row])
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'extension_requests' }, ({ eventType, new: row }) => {
        if (eventType === 'INSERT') {
          const r = fromDbExtension(row)
          setExtensionRequests(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r])
        } else if (eventType === 'UPDATE') {
          setExtensionRequests(prev => prev.map(x => x.id === row.id ? fromDbExtension(row) : x))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser?.id])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applyFlProfiles(rows: any[]) {
    setCurrentUser(prev => {
      if (!prev || prev.role !== 'fl') return prev
      const row = rows.find((r: { fl_id: string }) => r.fl_id === prev.id)
      if (!row) return prev
      const mockProfile = MOCK_USERS.find(u => u.id === prev.id)?.profile as FLProfile
      const prevProfile = prev.profile as FLProfile
      // Merge DB milestone IDs with mockData, filter to currently-valid milestone IDs only
      const validIds = new Set(MILESTONES.map(m => m.id))
      const mergeIds = (...arrays: (string[] | undefined | null)[]) =>
        [...new Set(arrays.flat().filter((id): id is string => !!id && validIds.has(id)))]
      return {
        ...prev,
        profile: {
          ...mockProfile,
          // Dev-panel-set values are client-only (never written to the DB) — preserve
          // them across realtime fl_profiles refreshes instead of reverting to mockData.
          currentDay: prevProfile.currentDay,
          hasStarted: prevProfile.hasStarted ?? mockProfile.hasStarted,
          activeMilestoneIds: mergeIds(row.active_milestone_ids, mockProfile.activeMilestoneIds),
          completedMilestoneIds: (mockProfile.completedMilestoneIds ?? []).filter(id => validIds.has(id)),
          quizScores: row.quiz_scores ?? {},
          quizAnswers: row.quiz_answers ?? {},
          quizAttempts: row.quiz_attempts ?? {},
        },
      }
    })
  }

  async function loadAll() {
    const [clRes, pkRes, asRes, feRes, l2Res, fpRes, extRes] = await Promise.all([
      supabase.from('daily_checklists').select('*'),
      supabase.from('penaksiran_records').select('*'),
      supabase.from('assessments').select('*'),
      supabase.from('final_evaluations').select('*'),
      supabase.from('level2_unlocks').select('*'),
      supabase.from('fl_profiles').select('*'),
      supabase.from('extension_requests').select('*'),
    ])

    // Seed on first run (empty DB)
    if ((clRes.data?.length ?? 0) === 0) {
      await Promise.all([
        supabase.from('daily_checklists').upsert(INITIAL_CHECKLISTS.map(toDbChecklist), { onConflict: 'id' }),
        supabase.from('penaksiran_records').upsert(INITIAL_PENAKSIRAN.map(toDbPenaksiran), { onConflict: 'id' }),
        supabase.from('assessments').upsert(INITIAL_ASSESSMENTS.map(toDbAssessment), { onConflict: 'id' }),
      ])
      const [cl2, pk2, as2] = await Promise.all([
        supabase.from('daily_checklists').select('*'),
        supabase.from('penaksiran_records').select('*'),
        supabase.from('assessments').select('*'),
      ])
      if (cl2.data) setChecklists(cl2.data.map(fromDbChecklist))
      if (pk2.data) setPenaksiranRecords(pk2.data.map(fromDbPenaksiran))
      if (as2.data) setAssessments(as2.data.map(fromDbAssessment))
    } else {
      if (clRes.data) setChecklists(clRes.data.map(fromDbChecklist))
      if (pkRes.data) setPenaksiranRecords(pkRes.data.map(fromDbPenaksiran))
      if (asRes.data) setAssessments(asRes.data.map(fromDbAssessment))
    }

    if (feRes.data) setFinalEvaluations(feRes.data.map(fromDbFinalEval))
    if (l2Res.data) {
      const unlocks: Record<string, Level2Unlock> = {}
      l2Res.data.forEach(row => {
        unlocks[row.fl_id] = { flId: row.fl_id, kanitId: row.kanit_id, moduleDecisions: row.module_decisions, unlockedAt: row.unlocked_at }
      })
      setLevel2Unlocks(unlocks)
    }

    if (extRes.data) setExtensionRequests(extRes.data.map(fromDbExtension))

    // Seed fl_profiles on first run
    if ((fpRes.data?.length ?? 0) === 0) {
      const flSeed = MOCK_USERS.filter(u => u.role === 'fl').map(u => {
        const p = u.profile as FLProfile
        return { fl_id: u.id, current_day: p.currentDay, active_milestone_ids: p.activeMilestoneIds, completed_milestone_ids: p.completedMilestoneIds ?? [], quiz_scores: p.quizScores ?? {}, quiz_answers: p.quizAnswers ?? {}, quiz_attempts: p.quizAttempts ?? {} }
      })
      await supabase.from('fl_profiles').upsert(flSeed, { onConflict: 'fl_id' })
      const fp2 = await supabase.from('fl_profiles').select('*')
      applyFlProfiles(fp2.data ?? [])
    } else {
      applyFlProfiles(fpRes.data ?? [])
    }
  }

  // ── Auth actions ─────────────────────────────────────────

  async function login(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  function logout() {
    supabase.auth.signOut()
  }

  async function resetUserProgress(): Promise<void> {
    if (!currentUser || currentUser.role !== 'fl') return
    const flId = currentUser.id
    const preservedDay = (currentUser.profile as FLProfile).currentDay
    const mockUser = MOCK_USERS.find(u => u.id === flId)
    const mockProfile = mockUser?.profile as FLProfile | undefined

    // Wipe this user's rows from Supabase (fire-and-forget)
    supabase.from('daily_checklists').delete().eq('fl_id', flId).then()
    supabase.from('fl_profiles').delete().eq('fl_id', flId).then()
    supabase.from('extension_requests').delete().eq('fl_id', flId).then()

    // Update in-memory immediately — keep currentDay from dev panel
    setChecklists(prev => prev.filter(c => c.flId !== flId))
    setExtensionRequests(prev => prev.filter(r => r.flId !== flId))
    setActiveSession(null)
    setTaskConfirmations(prev => {
      const next = prev.filter(c => c.flId !== flId)
      localStorage.setItem('task-confirmations', JSON.stringify(next))
      return next
    })
    setLevel2Unlocks(prev => {
      const { [flId]: _removed, ...rest } = prev
      return rest
    })
    // Clear any leftover in-progress drafts for this user (checklist & session forms)
    const draftPrefixes = [`checklist-draft-${flId}-`, `session-draft-${flId}-`]
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && draftPrefixes.some(p => key.startsWith(p))) {
        localStorage.removeItem(key)
      }
    }
    setCurrentUser(prev => {
      if (!prev || prev.role !== 'fl') return prev
      return {
        ...prev,
        profile: {
          ...prev.profile as FLProfile,
          currentDay: preservedDay,
          activeMilestoneIds: mockProfile?.activeMilestoneIds ?? [],
          completedMilestoneIds: [],
          quizScores: {},
          quizAnswers: {},
          quizAttempts: {},
        },
      }
    })
  }

  async function resetData(): Promise<void> {
    await Promise.all([
      supabase.from('daily_checklists').delete().neq('id', ''),
      supabase.from('penaksiran_records').delete().neq('id', ''),
      supabase.from('assessments').delete().neq('id', ''),
      supabase.from('final_evaluations').delete().neq('id', ''),
      supabase.from('level2_unlocks').delete().neq('fl_id', ''),
      supabase.from('fl_profiles').delete().neq('fl_id', ''),
      supabase.from('extension_requests').delete().neq('id', ''),
    ])
    await loadAll()
    setFinalEvaluations([])
    setLevel2Unlocks({})
    setExtensionRequests([])
  }

  function startMilestone(milestoneId: string) {
    if (!currentUser || currentUser.role !== 'fl') return
    const profile = currentUser.profile as FLProfile
    if (profile.activeMilestoneIds?.includes(milestoneId)) return
    const newActive = [...(profile.activeMilestoneIds ?? []), milestoneId]
    setCurrentUser(prev => {
      if (!prev || prev.role !== 'fl') return prev
      return { ...prev, profile: { ...prev.profile as FLProfile, activeMilestoneIds: newActive } }
    })
    supabase.from('fl_profiles').update({ active_milestone_ids: newActive }).eq('fl_id', currentUser.id)
      .then(({ error }) => { if (error) console.error('[supabase] startMilestone failed:', error) })
  }

  function startSession(milestoneId: string) {
    if (!currentUser || currentUser.role !== 'fl') return
    const profile = currentUser.profile as FLProfile
    const day = profile.currentDay
    const ocTaskIds = ['opening-cabang', 'closing-cabang']

    if (milestoneId === 'opening-cabang' || milestoneId === 'closing-cabang') {
      // Reuse existing today's OC session if partially in progress
      const existing = checklistsRef.current.find(c =>
        c.flId === currentUser.id && c.day === day && c.tasks?.some(t => ocTaskIds.includes(t.taskId))
        && !ocTaskIds.every(tid => c.tasks!.some(t => t.taskId === tid))
      )
      setActiveSession({
        milestoneId,
        checklistId: existing?.id ?? `cl-${currentUser.id}-oc-d${day}`,
      })
    } else {
      setActiveSession({
        milestoneId,
        checklistId: `cl-${currentUser.id}-${milestoneId}-d${day}-${Date.now()}`,
      })
    }
  }

  function clearSession() {
    setActiveSession(null)
  }

  function setCurrentDay(day: number) {
    // 0 = pre-Day-1 ("H-1" and earlier) — the program hasn't started yet.
    const clamped = Math.max(0, Math.min(14, day))
    setCurrentUser(prev => {
      if (!prev || prev.role !== 'fl') return prev
      return { ...prev, profile: { ...prev.profile as FLProfile, currentDay: clamped } }
    })
  }

  function startProgram() {
    setCurrentUser(prev => {
      if (!prev || prev.role !== 'fl') return prev
      return { ...prev, profile: { ...prev.profile as FLProfile, hasStarted: true } }
    })
  }

  function requestExtension(milestoneId: string, type: ExtensionType) {
    if (!currentUser || currentUser.role !== 'fl') return
    const existing = extensionRequests.find(
      r => r.flId === currentUser.id && r.milestoneId === milestoneId && r.type === type && r.status === 'pending'
    )
    if (existing) return
    const req: ExtensionRequest = {
      id: `ext-${currentUser.id}-${milestoneId}-${type}-${Date.now()}`,
      flId: currentUser.id,
      milestoneId,
      type,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    }
    setExtensionRequests(prev => [...prev, req])
    supabase.from('extension_requests').insert(toDbExtension(req))
      .then(({ error }) => { if (error) console.error('[supabase] requestExtension failed:', error) })
  }

  function respondExtension(requestId: string, status: 'approved' | 'rejected', kanitNote?: string) {
    if (!currentUser) return
    const now = new Date().toISOString()
    setExtensionRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, status, kanitId: currentUser.id, kanitNote, respondedAt: now }
        : r
    ))
    supabase.from('extension_requests').update({
      status,
      kanit_id: currentUser.id,
      kanit_note: kanitNote ?? null,
      responded_at: now,
    }).eq('id', requestId)
      .then(({ error }) => { if (error) console.error('[supabase] respondExtension failed:', error) })
  }

  function saveQuizResult(milestoneId: string, score: number, answers: Record<string, number>) {
    if (!currentUser || currentUser.role !== 'fl') return
    const profile = currentUser.profile as FLProfile
    const newScores = { ...(profile.quizScores ?? {}), [milestoneId]: score }
    const newAnswers = { ...(profile.quizAnswers ?? {}), [milestoneId]: answers }
    const newAttempts = { ...(profile.quizAttempts ?? {}), [milestoneId]: (profile.quizAttempts?.[milestoneId] ?? 0) + 1 }
    setCurrentUser(prev => {
      if (!prev) return prev
      return { ...prev, profile: { ...prev.profile as FLProfile, quizScores: newScores, quizAnswers: newAnswers, quizAttempts: newAttempts } }
    })
    supabase.from('fl_profiles').update({ quiz_scores: newScores, quiz_answers: newAnswers, quiz_attempts: newAttempts }).eq('fl_id', currentUser.id).then()
  }

  // ── Data mutations (optimistic + background write) ───────

  function submitChecklist(checklist: DailyChecklist) {
    setChecklists(prev => {
      const exists = prev.find(c => c.id === checklist.id)
      return exists ? prev.map(c => c.id === checklist.id ? checklist : c) : [...prev, checklist]
    })
    supabase.from('daily_checklists').upsert(toDbChecklist(checklist), { onConflict: 'id' })
      .then(({ error }) => { if (error) console.error('[supabase] submitChecklist failed:', error) })
  }

  function scoreChecklist(checklistId: string, score: number, note: string) {
    const now = new Date().toISOString()
    setChecklists(prev => prev.map(c =>
      c.id === checklistId ? { ...c, status: 'scored', kanitScore: score, kanitNote: note, kanitScoredAt: now } : c
    ))
    supabase.from('daily_checklists').update({ status: 'scored', kanit_score: score, kanit_note: note, kanit_scored_at: now }).eq('id', checklistId).then()
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
    const now = new Date().toISOString()

    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c
      return { ...c, status: 'scored' as const, kanitScore: avgScore, kanitNote: overallNote ?? '', kanitScoredAt: now, tasks: c.tasks?.map(t => { const ts = scoreMap[t.taskId]; return ts ? { ...t, kanitScore: ts.score, kanitNote: ts.note } : t }) }
    }))

    const cl = checklistsRef.current.find(c => c.id === checklistId)
    if (cl) {
      const updated = { ...cl, status: 'scored' as const, kanitScore: avgScore, kanitNote: overallNote ?? '', kanitScoredAt: now, tasks: cl.tasks?.map(t => { const ts = scoreMap[t.taskId]; return ts ? { ...t, kanitScore: ts.score, kanitNote: ts.note } : t }) }
      supabase.from('daily_checklists').upsert(toDbChecklist(updated), { onConflict: 'id' }).then()
    }
  }

  function addPenaksiran(record: PenaksiranRecord) {
    setPenaksiranRecords(prev => [...prev, record])
    supabase.from('penaksiran_records').insert(toDbPenaksiran(record)).then()
  }

  function scorePenaksiran(recordId: string, intoolsValue: number, score: number, note: string) {
    const now = new Date().toISOString()
    setPenaksiranRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r
      const accuracy = Math.max(0, Math.min(100, (1 - Math.abs(r.flEstimate - intoolsValue) / intoolsValue) * 100))
      const updated = { ...r, intoolsValue, accuracy, kanitScore: score, kanitNote: note, kanitScoredAt: now }
      supabase.from('penaksiran_records').update({ intools_value: intoolsValue, accuracy, kanit_score: score, kanit_note: note, kanit_scored_at: now }).eq('id', recordId).then()
      return updated
    }))
  }

  function submitAssessment(assessment: Assessment) {
    setAssessments(prev => {
      const exists = prev.find(a => a.id === assessment.id)
      return exists ? prev.map(a => a.id === assessment.id ? assessment : a) : [...prev, assessment]
    })
    supabase.from('assessments').upsert(toDbAssessment(assessment), { onConflict: 'id' }).then()
  }

  function unlockLevel2(flId: string, moduleDecisions: Record<string, ModuleDecision>) {
    if (!currentUser) return
    const unlock: Level2Unlock = { flId, kanitId: currentUser.id, moduleDecisions, unlockedAt: new Date().toISOString() }
    setLevel2Unlocks(prev => ({ ...prev, [flId]: unlock }))
    supabase.from('level2_unlocks').upsert({ fl_id: flId, kanit_id: currentUser.id, module_decisions: moduleDecisions, unlocked_at: unlock.unlockedAt }, { onConflict: 'fl_id' }).then()
  }

  function submitFinalEvaluation(evaluation: FinalEvaluation) {
    setFinalEvaluations(prev => {
      const exists = prev.find(e => e.flId === evaluation.flId)
      return exists ? prev.map(e => e.flId === evaluation.flId ? evaluation : e) : [...prev, evaluation]
    })
    supabase.from('final_evaluations').upsert(toDbFinalEval(evaluation), { onConflict: 'id' }).then()
  }

  // ── Read helpers (unchanged) ─────────────────────────────

  const [taskConfirmations, setTaskConfirmations] = useState<TaskConfirmation[]>(() => {
    try {
      const stored = localStorage.getItem('task-confirmations')
      const fromStorage: TaskConfirmation[] = stored ? JSON.parse(stored) : []
      const storedIds = new Set(fromStorage.map(c => c.id))
      const extras = MOCK_TASK_CONFIRMATIONS.filter(m => !storedIds.has(m.id))
      return [...fromStorage, ...extras]
    } catch { return MOCK_TASK_CONFIRMATIONS }
  })

  function submitTaskConfirmation(confirmation: TaskConfirmation) {
    setTaskConfirmations(prev => {
      const next = [...prev, confirmation]
      localStorage.setItem('task-confirmations', JSON.stringify(next))
      return next
    })
  }

  function getItemConfirmations(flId: string, milestoneId: string, itemId: string): TaskConfirmation[] {
    return taskConfirmations.filter(c => c.flId === flId && c.milestoneId === milestoneId && c.itemId === itemId)
  }

  function reviewTaskConfirmation(confirmationId: string, passed: boolean, kanitNote: string) {
    const now = new Date().toISOString()
    setTaskConfirmations(prev => {
      const next = prev.map(c => c.id === confirmationId ? { ...c, kanitPassed: passed, kanitNote, kanitReviewedAt: now } : c)
      localStorage.setItem('task-confirmations', JSON.stringify(next))
      return next
    })
  }

  const [notificationsAll, setNotificationsAll] = useState<FLNotification[]>(MOCK_NOTIFICATIONS)

  const notifications = notificationsAll.filter(n => n.flId === currentUser?.id)
  const unreadNotificationCount = notifications.filter(n => !n.read).length

  function markNotificationRead(id: string) {
    setNotificationsAll(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllNotificationsRead() {
    setNotificationsAll(prev => prev.map(n => ({ ...n, read: true })))
  }

  function getFlUsers() { return MOCK_USERS.filter(u => u.role === 'fl') }
  function getUserById(id: string) { return MOCK_USERS.find(u => u.id === id) }
  function getFlChecklists(flId: string) { return checklists.filter(c => c.flId === flId).sort((a, b) => a.day - b.day) }
  function getFlPenaksiran(flId: string) { return penaksiranRecords.filter(r => r.flId === flId).sort((a, b) => a.day - b.day) }
  function getFlAssessment(flId: string) { return assessments.find(a => a.flId === flId) }
  function getFlFinalEvaluation(flId: string) { return finalEvaluations.find(e => e.flId === flId) }

  function getTodayChecklist(flId: string) {
    const flUser = MOCK_USERS.find(u => u.id === flId)
    if (!flUser) return undefined
    const day = (flUser.profile as FLProfile).currentDay
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

    const finalEval = finalEvaluations.find(e => e.flId === flId)

    // 3-component gate (2026-08-10 rework) — no more single weighted total. Tidak Lulus
    // the moment ANY known component dips below its own KKM (fail-fast, even before the
    // other components are decided); Lulus only once all 3 are known and all clear KKM.
    const latihanPassed = dailyProgressScore !== null ? dailyProgressScore >= KKM_LATIHAN : null
    const ujianPassed = assessmentScore !== null ? assessmentScore >= KKM_UJIAN_AKHIR : null
    const evaluasiPassed = finalEval ? finalEval.recommendation === 'lulus' : null
    const anyFailed = latihanPassed === false || ujianPassed === false || evaluasiPassed === false
    const allIn = latihanPassed !== null && ujianPassed !== null && evaluasiPassed !== null
    const passed = anyFailed ? false : allIn ? true : null

    return {
      dailyProgressScore, assessmentScore, penaksiranScore, daysScored, penaksiranCount: penaksiran.length,
      latihanPassed, ujianPassed, evaluasiPassed, passed,
    }
  }

  return (
    <AppContext.Provider value={{
      currentUser, isLoading, checklists, penaksiranRecords, assessments, finalEvaluations, level2Unlocks,
      login, logout, resetData, resetUserProgress, submitChecklist, scoreChecklist, scoreChecklistTasks,
      addPenaksiran, scorePenaksiran, submitAssessment, submitFinalEvaluation, unlockLevel2,
      activeSession, startMilestone, startSession, clearSession, saveQuizResult, setCurrentDay, startProgram,
      extensionRequests, requestExtension, respondExtension,
      getFlUsers, getUserById, getFlChecklists, getFlPenaksiran,
      getFlAssessment, getFlFinalEvaluation, getFlScoreBreakdown, getTodayChecklist,
      taskConfirmations, submitTaskConfirmation, getItemConfirmations, reviewTaskConfirmation,
      notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
