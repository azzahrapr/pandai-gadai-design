import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useTour } from '../../context/TourContext'
import { MILESTONES, DAILY_TASKS, getEffectiveTarget } from '../../data/mockData'
import type { FLProfile } from '../../types'
import { StatusKelulusanCard } from '../../components/StatusKelulusanCard'

const DAILY_SCHEDULE: Record<string, { fromDay: number; toDay: number }> = {
  'closing-cabang':    { fromDay: 1,  toDay: 3  },
  'opening-cabang':   { fromDay: 4,  toDay: 6  },
  'personal-grooming':{ fromDay: 1,  toDay: 13 },
  'pelayanan-nasabah':{ fromDay: 8,  toDay: 13 },
  'pelayanan-nasabah-transaksi': { fromDay: 8, toDay: 13 },
  'customer-service-wa': { fromDay: 8, toDay: 13 },
}

const PENAKSIRAN_IDS = new Set(['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb'])

// Shared status vocabulary for BOTH Level 1 and Level 2 task cards — one status set,
// one rendering (TaskCard below), so the two levels never drift apart visually/copy-wise.
type TaskStatus = 'pending' | 'incomplete' | 'done' | 'upcoming' | 'overdue' | 'failed' | 'awaiting_review'

export default function FLDashboard() {
  const { currentUser, level2Unlocks, getFlChecklists, getFlAssessment, getItemConfirmations, getFlScoreBreakdown, getFlFinalEvaluation } = useApp()
  const profile = currentUser!.profile as FLProfile
  const day = profile.currentDay
  const allChecklists = getFlChecklists(currentUser!.id)

  // A checklist passes once minRequired items are checked — defaults to all items when unset.
  function requiredCountFor(milestoneId: string, total: number): number {
    return DAILY_TASKS.find(t => t.id === milestoneId)?.minRequired ?? total
  }

  // Only a handful of Level 1 modules (Canvassing, SOP Administrasi, Packing) can be
  // carried over into Level 2 with an expanded target — see level2Target/level2TargetForPass.
  function carriedOverFor(milestoneId: string): boolean {
    return level2Unlocks[currentUser!.id]?.moduleDecisions?.[milestoneId]?.action === 'carry-over'
  }

  // Personal Grooming spans both weeks (day 1-13). Once Level 2 territory begins (day 8+),
  // it carries over to the Level 2 list automatically — no kanit approval needed, unlike
  // the Level 1 overdue/remedial flow — so the FL doesn't need to flip back to Level 1 for it.
  function dailyListLevel(m: typeof MILESTONES[0]) {
    return m.id === 'personal-grooming' && day >= 8 ? 'minggu2' : m.type
  }

  // "Selesai" must mean fully resolved, latihan AND quiz both — a module with latihan
  // fully passed but its quiz still pending/unresolved is NOT done yet, even though
  // isWeeklyDone (latihan-only) already says so. Kept as a bucketing check here rather
  // than folded into isWeeklyDone itself, since isWeeklyDone also drives the latihan
  // badge's own green/amber color in TaskCard — that badge should stay accurate to
  // latihan's own state regardless of the quiz, same as the Mini Quiz badge is separate.
  function isQuizDoneForModule(m: typeof MILESTONES[0]): boolean {
    const hasQuizField = (m.quiz?.length ?? 0) > 0
    if (!hasQuizField) return true
    const score = profile.quizScores?.[m.id]
    const attempts = profile.quizAttempts?.[m.id] ?? 0
    return score !== undefined && (score >= 75 || attempts >= MAX_QUIZ_ATTEMPTS)
  }
  function isItemPendingBucket(i: { m: typeof MILESTONES[0]; s: TaskStatus }): boolean {
    if (i.s === 'pending' || i.s === 'overdue') return true
    if (i.s === 'done') return !isQuizDoneForModule(i.m)
    return false
  }
  function isItemDoneBucket(i: { m: typeof MILESTONES[0]; s: TaskStatus }): boolean {
    if (i.s === 'done') return isQuizDoneForModule(i.m)
    return i.s === 'incomplete' || i.s === 'failed' || i.s === 'awaiting_review'
  }

  function hasDraft(milestoneId: string) {
    try {
      const key = `checklist-draft-${currentUser!.id}-${milestoneId}-d${day}`
      const raw = localStorage.getItem(key)
      if (!raw) return false
      const parsed = JSON.parse(raw) as string[]
      return Array.isArray(parsed) && parsed.length > 0
    } catch { return false }
  }
  const dayProgress = Math.round((Math.min(day, 13) / 13) * 100)
  const existingAssessment = getFlAssessment(currentUser!.id)


  const todayDailyMilestoneIds = Object.entries(DAILY_SCHEDULE)
    .filter(([, { fromDay, toDay }]) => day !== 7 && day >= fromDay && day <= toDay)
    .map(([id]) => id)
  const todayDailyMilestones = MILESTONES.filter(m => todayDailyMilestoneIds.includes(m.id))

  const dailyMilestoneIds = Object.keys(DAILY_SCHEDULE)
  // Non-daily "weekly" modules for EITHER level (Level 1 weekly modules + Level 2's
  // Penaksiran modules) — filtered by type per-level when building each unified item list.
  const weeklyModules = day < 14
    ? MILESTONES.filter(m => !dailyMilestoneIds.includes(m.id))
    : []

  const submittedAllChecklists = allChecklists.filter(c => c.status === 'submitted' || c.status === 'scored')
  const scoredAllChecklists = allChecklists.filter(c => c.status === 'scored')
  const weeklyProgress: Record<string, { actual: number; expected: number; expectedForPass: number; actualReviewed: number }> = Object.fromEntries(
    weeklyModules.map(m => {
      const carriedOver = carriedOverFor(m.id)
      if (profile.completedMilestoneIds?.includes(m.id)) {
        const expected = m.submissionType === 'individual'
          ? m.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).attempts, 0)
          : getEffectiveTarget(m, carriedOver).attempts
        return [m.id, { actual: expected, expected, expectedForPass: expected, actualReviewed: expected }]
      }
      if (m.submissionType === 'individual') {
        // Rejected confirmations (kanitPassed === false) don't count toward the target.
        const actual = m.checklistItems.reduce((sum, item) =>
          sum + getItemConfirmations(currentUser!.id, m.id, item.id).filter(c => c.kanitPassed !== false).length, 0
        )
        const actualReviewed = m.checklistItems.reduce((sum, item) =>
          sum + getItemConfirmations(currentUser!.id, m.id, item.id).filter(c => c.kanitPassed === true).length, 0
        )
        const expected = m.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).attempts, 0)
        const expectedForPass = m.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).forPass, 0)
        return [m.id, { actual, expected, expectedForPass, actualReviewed }]
      }
      const matchesModule = (cl: typeof allChecklists[number]) => PENAKSIRAN_IDS.has(m.id)
        ? cl.milestoneId === m.id
        : cl.tasks?.some(t => {
            if (t.taskId !== m.id) return false
            if (t.reflection?.startsWith('Kode SBG:')) return true
            const total = m.checklistItems?.length ?? 0
            return total === 0 || t.completedItemIds.length >= requiredCountFor(m.id, total)
          })
      const count = submittedAllChecklists.filter(matchesModule).length
      const countReviewed = scoredAllChecklists.filter(matchesModule).length
      const { attempts: expected, forPass: expectedForPass } = getEffectiveTarget(m, carriedOver)
      return [m.id, { actual: count, expected, expectedForPass, actualReviewed: countReviewed }]
    })
  )

  const submittedTodayTasks = allChecklists
    .filter(c => c.day === day && (c.status === 'submitted' || c.status === 'scored'))
    .flatMap(c => (c.tasks ?? []).map(t => ({ ...t, _scored: c.status === 'scored' })))
    .filter(t => todayDailyMilestoneIds.includes(t.taskId))

  const dailyCompletedIds = new Set(
    submittedTodayTasks
      .filter(t => {
        if (t.reflection?.startsWith('Kode SBG:')) return true
        const ms = MILESTONES.find(m => m.id === t.taskId)
        const total = ms?.checklistItems?.length ?? 0
        return total === 0 || t.completedItemIds.length >= requiredCountFor(t.taskId, total)
      })
      .map(t => t.taskId)
  )

  const dailyReviewedIds = new Set(
    submittedTodayTasks.filter(t => dailyCompletedIds.has(t.taskId) && t._scored).map(t => t.taskId)
  )
  const dailyAwaitingReviewIds = new Set(
    [...dailyCompletedIds].filter(id => !dailyReviewedIds.has(id))
  )

  const dailyIncompleteIds = new Set(
    submittedTodayTasks
      .filter(t => !dailyCompletedIds.has(t.taskId))
      .map(t => t.taskId)
  )

  // Daily-schedule milestones that haven't started yet (any distance away, not just tomorrow) —
  // shown as "Akan Datang" so trainees can see what's coming without waiting for today to be done.
  const upcomingDailyMilestones = Object.entries(DAILY_SCHEDULE)
    .filter(([, { fromDay }]) => day < fromDay)
    .map(([id]) => MILESTONES.find(m => m.id === id))
    .filter((m): m is typeof MILESTONES[number] => !!m)

  const isWeeklyDone = (m: typeof MILESTONES[0]) =>
    (profile.completedMilestoneIds?.includes(m.id) ?? false) ||
    ((weeklyProgress[m.id]?.actualReviewed ?? 0) >= (weeklyProgress[m.id]?.expectedForPass ?? 1))
  const isWeeklyAwaitingReview = (m: typeof MILESTONES[0]) =>
    !isWeeklyDone(m) && ((weeklyProgress[m.id]?.actual ?? 0) >= (weeklyProgress[m.id]?.expected ?? 1))

  const { hasCompleted: onboardingCompleted, stepIndex: tourStepIndex } = useTour()

  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date()
    const end = new Date(); end.setHours(23, 59, 59, 999)
    return Math.max(0, end.getTime() - now.getTime())
  })
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      const end = new Date(); end.setHours(23, 59, 59, 999)
      setTimeLeft(Math.max(0, end.getTime() - now.getTime()))
    }, 1000)
    return () => clearInterval(id)
  }, [])
  function formatCountdown(ms: number) {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  const remainingDailyItems = todayDailyMilestones.filter(m => !dailyCompletedIds.has(m.id))
  const l1Milestones = MILESTONES.filter(m => m.type === 'minggu1')
  const l2Milestones = MILESTONES.filter(m => m.type === 'minggu2')
  // A module that's definitively "Tidak Lulus" (kanit closed it, or day 13 passed with the
  // target never met) has nothing left to do — count it toward the level's progress too,
  // so the bar doesn't sit short forever once the module's story is actually over.
  function isModuleFailed(milestoneId: string): boolean {
    if (profile.completedMilestoneIds?.includes(milestoneId)) return false
    const closedByKanit = level2Unlocks[currentUser!.id]?.moduleDecisions?.[milestoneId]?.action === 'close'
    return closedByKanit || day >= 13
  }
  const completedL1 = l1Milestones.filter(m => (profile.completedMilestoneIds?.includes(m.id) ?? false) || isModuleFailed(m.id)).length
  const completedL2 = l2Milestones.filter(m => (profile.completedMilestoneIds?.includes(m.id) ?? false) || isModuleFailed(m.id)).length
  const l1Pct = Math.round((completedL1 / l1Milestones.length) * 100)
  const l2Pct = Math.round((completedL2 / l2Milestones.length) * 100)
  // Level 2 opens purely on its own start date — Level 1 completion no longer gates it.
  // Kanit approval only decides the fate of individual late Level 1 modules (carry-over
  // vs closed/"Tidak Lulus"), not whether the FL can move on to Level 2 material.
  const l2Available = day >= 8

  const completedDailyItems = todayDailyMilestones.filter(m => dailyCompletedIds.has(m.id))

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'done' | 'upcoming'>('pending')
  const [l2Filter, setL2Filter] = useState<'all' | 'pending' | 'done' | 'upcoming'>('pending')
  const [activeCard, setActiveCard] = useState<'level1' | 'level2'>(l2Available ? 'level2' : 'level1')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const l2CardRef = useRef<HTMLDivElement>(null)

  // Auto-focus the Level 2 card whenever it becomes available — whether that's already
  // true on first load, or it flips true mid-session (e.g. kanit unlocks access, or the
  // dev panel jumps the day forward) while the FL is still looking at Level 1.
  useEffect(() => {
    if (l2Available) {
      setActiveCard('level2')
      if (scrollContainerRef.current && l2CardRef.current) {
        scrollContainerRef.current.scrollLeft = l2CardRef.current.offsetLeft - 16
      }
    }
  }, [l2Available])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const handle = () => {
      setActiveCard(el.scrollLeft > el.clientWidth * 0.4 ? 'level2' : 'level1')
    }
    el.addEventListener('scroll', handle, { passive: true })
    return () => el.removeEventListener('scroll', handle)
  }, [])

  function fmtDeadline(startDate: string, plusDays: number): string {
    const d = new Date(startDate)
    d.setDate(d.getDate() + plusDays)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  const l1DaysLeft = Math.max(0, 6 - day)
  const isPastL1Deadline = day >= 7
  const l2DaysLeft = Math.max(0, 13 - day)
  const l1Deadline = fmtDeadline(profile.startDate, 5)
  const l2Deadline = fmtDeadline(profile.startDate, 12)

  const l1OnlyDailyIds = Object.entries(DAILY_SCHEDULE)
    .filter(([, { toDay }]) => toDay <= 6)
    .map(([id]) => id)
  // Progress for EVERY daily-scheduled milestone (not just L1-overdue ones) — daily items
  // still carry a multi-day attempt target (target/targetForPass), same shape as weekly
  // modules, just fulfilled via daily checklist submissions instead of practice sessions.
  // TaskCard's "n/n latihan" badge needs this available on day 1, not only once overdue.
  const dailyMilestoneProgress: Record<string, { actual: number; expected: number; expectedForPass: number; actualReviewed: number }> = Object.fromEntries(
    MILESTONES.filter(m => dailyMilestoneIds.includes(m.id)).map(m => {
      const carriedOver = carriedOverFor(m.id)
      if (profile.completedMilestoneIds?.includes(m.id)) {
        const expected = getEffectiveTarget(m, carriedOver).attempts
        return [m.id, { actual: expected, expected, expectedForPass: expected, actualReviewed: expected }]
      }
      const matchesModule = (cl: typeof allChecklists[number]) => cl.tasks?.some(t => {
        if (t.taskId !== m.id) return false
        if (t.reflection?.startsWith('Kode SBG:')) return true
        const total = m.checklistItems?.length ?? 0
        return total === 0 || t.completedItemIds.length >= requiredCountFor(m.id, total)
      })
      const count = submittedAllChecklists.filter(matchesModule).length
      const countReviewed = scoredAllChecklists.filter(matchesModule).length
      const { attempts: expected, forPass: expectedForPass } = getEffectiveTarget(m, carriedOver)
      return [m.id, { actual: count, expected, expectedForPass, actualReviewed: countReviewed }]
    })
  )
  const l1OverdueDailyMilestones = isPastL1Deadline
    ? MILESTONES.filter(m => l1OnlyDailyIds.includes(m.id)).filter(m => {
        const p = dailyMilestoneProgress[m.id]
        return (p?.actual ?? 0) < (p?.expected ?? 1)
      })
    : []
  const pgBreakDayProgress: Record<string, { actual: number; expected: number; actualReviewed: number }> = (day === 7) ? (() => {
    const matchesPg = (cl: typeof allChecklists[number]) => cl.day >= 1 && cl.day <= 6 && cl.tasks?.some(t => t.taskId === 'personal-grooming')
    const actual = submittedAllChecklists.filter(matchesPg).length
    const actualReviewed = scoredAllChecklists.filter(matchesPg).length
    return { 'personal-grooming': { actual, expected: 6, actualReviewed } }
  })() : {}
  const allModuleProgress = { ...weeklyProgress, ...dailyMilestoneProgress, ...pgBreakDayProgress }

  return (
    <div className="p-4 md:p-8">
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Halo, {profile.name.split(' ')[0]}</h1>
        <p className="text-[#65758B] text-sm mt-1">
          {day === 13
            ? (existingAssessment
                ? 'Selamat! Kamu sudah menyelesaikan semua latihan dan ujian akhir.'
                : 'Hari terakhir OJT! Kerjakan ujian akhir sekarang.')
            : l2Available
              ? 'Segera selesaikan materi di Level 2!'
              : 'Segera selesaikan materi di Level 1!'}
        </p>
      </div>

      {/* Onboarding guide — only ever shown on Day 1 (the FL's first time entering the
          course). Explicitly reverted from the earlier "show on any day until completed"
          behavior — the user decided a stale Day-1 welcome card reappearing on later days
          would be worse than the (accepted) edge case of someone dodging it via reload. */}
      {day === 1 && !onboardingCompleted && tourStepIndex === null && (
        <OnboardingGuide />
      )}

      {/* Assessment alert — a full-width section (not a card) so it reads as its own
          moment rather than one more item in the card list below. */}
      {day === 13 && !existingAssessment && (
        <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-5 mb-6 bg-[#E5F2FF]">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xl">🎓</span>
            <p className="text-lg font-semibold text-[#0F1729]">Ujian Akhir OJT siap dikerjakan!</p>
          </div>
          <p className="text-xs text-[#65758B] leading-relaxed mb-4 max-w-md">Kamu sudah mencapai hari akhir training. Selesaikan ujian akhir untuk mendapatkan penilaian akhir.</p>
          <Link to="/fl/assessment" className="w-full flex items-center justify-center h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors">
            Mulai Sekarang →
          </Link>
        </div>
      )}
      {day === 13 && existingAssessment && (() => {
        const finalScores = getFlScoreBreakdown(currentUser!.id)
        // Same rule as FLScores.tsx/KanitResults.tsx: don't reveal the gate until the
        // rapot akhir is actually filled in — fail-fast can otherwise flag "Tidak Lulus"
        // here off of just one component, before the kanit has even weighed in.
        if (!getFlFinalEvaluation(currentUser!.id)) return null
        return (
          <div className="mb-6">
            <StatusKelulusanCard
              passed={finalScores.passed}
              action={{ label: 'Lihat Nilai Saya', to: '/fl/scores' }}
            />
          </div>
        )
      })()}


      {/* Progress Belajar carousel */}
      <div className="mb-6" data-tour="level-carousel">
        {/* scroll-padding-left ensures snap accounts for the pl-4 so the card doesn't snap flush to screen edge */}
        <div
          ref={scrollContainerRef}
          className="-mx-4 pl-4 flex gap-3 pb-2"
          style={{ overflowX: 'auto', scrollSnapType: 'x mandatory', scrollPaddingLeft: '16px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {/* Level 1 — always first */}
          <div
            className="flex-shrink-0 rounded-2xl p-5 bg-[#F0FDF4] border border-[#BBF7D0]"
            style={{ width: '82%', scrollSnapAlign: 'start', transform: activeCard === 'level1' ? 'scale(1)' : 'scale(0.93)', transition: 'transform 0.3s ease', transformOrigin: 'center' }}
          >
            <p className="text-base font-bold text-[#0F1729] leading-tight">Level 1</p>
            <p className="text-xs text-[#15803D] mt-1">Deadline: {l1Deadline}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#15803D]">{completedL1}/{l1Milestones.length} modul</span>
                <span className="text-xs font-bold text-[#15803D]">{l1Pct}%</span>
              </div>
              <div className="h-1.5 bg-[#DCFCE7] rounded-full overflow-hidden">
                <div className="h-full bg-[#16A34A] rounded-full transition-all" style={{ width: `${Math.max(l1Pct, l1Pct > 0 ? 4 : 0)}%` }} />
              </div>
            </div>
            <Link
              to="/fl/milestones"
              className={`mt-4 flex items-center justify-center h-9 rounded-xl text-sm font-semibold transition-colors ${l1Pct === 100 ? 'bg-white text-[#0F1729] border border-[#CBD5E1] hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF]' : 'bg-[#16A34A] hover:bg-[#15803D] text-white'}`}
            >
              {l1Pct === 100 ? 'Pelajari Lagi' : day === 1 ? 'Mulai Belajar' : 'Lanjut Belajar'}
            </Link>
          </div>

          {/* Level 2 — always second; unlocked or locked */}
          {l2Available ? (
            <div
              ref={l2CardRef}
              className="flex-shrink-0 rounded-2xl p-5 bg-[#FAF5FF] border border-[#E9D5FF]"
              style={{ width: '82%', scrollSnapAlign: 'start', transform: activeCard === 'level2' ? 'scale(1)' : 'scale(0.93)', transition: 'transform 0.3s ease', transformOrigin: 'center' }}
            >
              <p className="text-base font-bold text-[#0F1729] leading-tight">Level 2</p>
              <p className="text-xs text-[#7E22CE] mt-1">Deadline: {l2Deadline}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#7E22CE]">{completedL2}/{l2Milestones.length} modul</span>
                  <span className="text-xs font-bold text-[#7E22CE]">{l2Pct}%</span>
                </div>
                <div className="h-1.5 bg-[#F3E8FF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#9333EA] rounded-full transition-all" style={{ width: `${l2Pct}%` }} />
                </div>
              </div>
              <Link
                to="/fl/milestones"
                className={`mt-4 flex items-center justify-center h-9 rounded-xl text-sm font-semibold transition-colors ${l2Pct === 100 ? 'bg-white text-[#0F1729] border border-[#CBD5E1] hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF]' : 'bg-[#9333EA] hover:bg-[#7E22CE] text-white'}`}
              >
                {l2Pct === 100 ? 'Pelajari Lagi' : 'Lanjut Belajar'}
              </Link>
            </div>
          ) : (
            <div
              className="flex-shrink-0 rounded-2xl p-5 bg-[#F8FAFC] border border-[#E1E7EF]"
              style={{ width: '82%', scrollSnapAlign: 'start', transform: activeCard === 'level2' ? 'scale(1)' : 'scale(0.93)', transition: 'transform 0.3s ease', transformOrigin: 'center' }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-base font-bold text-[#CBD5E1] leading-tight">Level 2</p>
                <span className="flex-shrink-0 text-base">🔒</span>
              </div>
              <p className="text-xs text-[#E1E7EF] mt-1">Tersedia mulai hari ke-8</p>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#CBD5E1]">0/{l2Milestones.length} modul</span>
                  <span className="text-xs font-bold text-[#CBD5E1]">0%</span>
                </div>
                <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E1E7EF] rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          )}

          {/* right padding sentinel */}
          <div className="flex-shrink-0 w-4" />
        </div>
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className={`rounded-full transition-all duration-300 ${activeCard === 'level1' ? 'w-5 h-[6px] bg-[#023DFF]' : 'w-[6px] h-[6px] bg-[#CBD5E1]'}`} />
          <div className={`rounded-full transition-all duration-300 ${activeCard === 'level2' ? 'w-5 h-[6px] bg-[#023DFF]' : 'w-[6px] h-[6px] bg-[#CBD5E1]'}`} />
        </div>
      </div>

      {/* Task / Module list — switches based on which level card is visible. Hidden once
          the final assessment is submitted since everything is already done by then. */}
      {day < 14 && !(day === 13 && existingAssessment) && (
        <div>
          {activeCard === 'level1' ? (() => {
            // Build unified item list — Level 1 (minggu1)
            const l1RemainingDaily = remainingDailyItems.filter(m => dailyListLevel(m) === 'minggu1')
            const l1CompletedDaily = completedDailyItems.filter(m => dailyListLevel(m) === 'minggu1')
            const l1PendingWeekly = weeklyModules.filter(m => m.type === 'minggu1' && !isWeeklyDone(m) && !isWeeklyAwaitingReview(m))
            const l1AwaitingReviewWeekly = weeklyModules.filter(m => m.type === 'minggu1' && isWeeklyAwaitingReview(m))
            const l1DoneWeekly = weeklyModules.filter(m => m.type === 'minggu1' && isWeeklyDone(m))
            const pgBreakDayMilestone = day === 7 ? MILESTONES.find(m => m.id === 'personal-grooming') : undefined
            const pgProgress = pgBreakDayProgress['personal-grooming']
            const pgBreakDayDone = pgProgress ? pgProgress.actualReviewed >= pgProgress.expected : false
            const pgBreakDayAwaitingReview = pgProgress && !pgBreakDayDone
              ? pgProgress.actual >= pgProgress.expected
              : false
            const items: { m: (typeof MILESTONES)[0]; s: TaskStatus; isDaily: boolean }[] = [
              // Pending first
              ...l1RemainingDaily.filter(m => !dailyIncompleteIds.has(m.id)).map(m => ({ m, s: 'pending' as TaskStatus, isDaily: true })),
              ...(!isPastL1Deadline ? l1PendingWeekly.map(m => ({ m, s: 'pending' as TaskStatus, isDaily: false })) : []),
              // Overdue / gak lulus
              ...(isPastL1Deadline ? l1PendingWeekly.map(m => ({ m, s: 'overdue' as TaskStatus, isDaily: false })) : []),
              ...l1OverdueDailyMilestones.map(m => ({ m, s: 'overdue' as TaskStatus, isDaily: true })),
              ...(pgBreakDayMilestone && !pgBreakDayDone && !pgBreakDayAwaitingReview ? [{ m: pgBreakDayMilestone, s: 'failed' as TaskStatus, isDaily: true }] : []),
              ...l1RemainingDaily.filter(m => dailyIncompleteIds.has(m.id)).map(m => ({ m, s: 'incomplete' as TaskStatus, isDaily: true })),
              // Menunggu penilaian kanit
              ...l1CompletedDaily.filter(m => dailyAwaitingReviewIds.has(m.id)).map(m => ({ m, s: 'awaiting_review' as TaskStatus, isDaily: true })),
              ...(pgBreakDayMilestone && pgBreakDayAwaitingReview ? [{ m: pgBreakDayMilestone, s: 'awaiting_review' as TaskStatus, isDaily: true }] : []),
              ...l1AwaitingReviewWeekly.map(m => ({ m, s: 'awaiting_review' as TaskStatus, isDaily: false })),
              // Selesai last
              ...l1CompletedDaily.filter(m => dailyReviewedIds.has(m.id)).map(m => ({ m, s: 'done' as TaskStatus, isDaily: true })),
              ...(pgBreakDayMilestone && pgBreakDayDone ? [{ m: pgBreakDayMilestone, s: 'done' as TaskStatus, isDaily: true }] : []),
              ...l1DoneWeekly.map(m => ({ m, s: 'done' as TaskStatus, isDaily: false })),
              // Akan Datang last — daily-schedule modules that haven't started yet, at any distance
              ...upcomingDailyMilestones.filter(m => m.type === 'minggu1').map(m => ({ m, s: 'upcoming' as TaskStatus, isDaily: true })),
            ]
            if (items.length === 0) return null

            const overdueCount = items.filter(i => i.s === 'overdue').length
            const pendingCount = items.filter(isItemPendingBucket).length
            const doneCount = items.filter(isItemDoneBucket).length
            const upcomingCount = items.filter(i => i.s === 'upcoming').length
            const visible = taskFilter === 'all' ? items
              : taskFilter === 'pending' ? items.filter(isItemPendingBucket)
              : taskFilter === 'upcoming' ? items.filter(i => i.s === 'upcoming')
              : items.filter(isItemDoneBucket)

            return (
              <>
                {/* Failed Level 1 modules banner */}
                {isPastL1Deadline && overdueCount > 0 && (
                  <div className="flex items-center gap-2.5 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg px-3 py-2.5 mb-3">
                    <span className="text-sm flex-shrink-0">⚠️</span>
                    <p className="text-xs text-[#DC2626] font-medium leading-relaxed">{overdueCount} modul melewati deadline Level 1 · menunggu persetujuan kanit untuk remedial</p>
                  </div>
                )}

                <TaskFilterChips filter={taskFilter} onChange={setTaskFilter} all={items.length} pending={pendingCount} done={doneCount} upcoming={upcomingCount} />

                {/* Unified task cards */}
                <div className="space-y-2" data-tour="daily-tasks">
                  {visible.map(({ m, s, isDaily }) => (
                    <TaskCard key={`${m.id}-${s}`} m={m} s={s} isDaily={isDaily} day={day} daysLeft={l1DaysLeft} timeLeft={timeLeft} allModuleProgress={allModuleProgress} startDate={profile.startDate} quizScores={profile.quizScores ?? {}} quizAttempts={profile.quizAttempts ?? {}} />
                  ))}

                  {visible.length === 0 && taskFilter === 'done' && (
                    <p className="text-sm text-[#94A3B8] text-center py-4">Belum ada tugas yang selesai.</p>
                  )}
                  {visible.length === 0 && taskFilter === 'pending' && (
                    <p className="text-sm text-[#94A3B8] text-center py-4">Semua tugas sudah dikerjakan 🎉</p>
                  )}
                  {visible.length === 0 && taskFilter === 'upcoming' && (
                    <p className="text-sm text-[#94A3B8] text-center py-4">Tidak ada modul yang akan datang.</p>
                  )}
                </div>
              </>
            )
          })() : l2Available ? (() => {
            // Build unified item list — Level 2 (minggu2). Same status vocabulary and
            // TaskCard rendering as Level 1 — no separate "overdue"/"failed" states since
            // Level 2 has no remedial-deadline mechanic (day 14 is a dead buffer day).
            const l2RemainingDaily = remainingDailyItems.filter(m => dailyListLevel(m) === 'minggu2')
            const l2CompletedDaily = completedDailyItems.filter(m => dailyListLevel(m) === 'minggu2')
            const l2PendingWeekly = weeklyModules.filter(m => m.type === 'minggu2' && !isWeeklyDone(m) && !isWeeklyAwaitingReview(m))
            const l2AwaitingReviewWeekly = weeklyModules.filter(m => m.type === 'minggu2' && isWeeklyAwaitingReview(m))
            const l2DoneWeekly = weeklyModules.filter(m => m.type === 'minggu2' && isWeeklyDone(m))
            const items: { m: (typeof MILESTONES)[0]; s: TaskStatus; isDaily: boolean }[] = [
              ...l2RemainingDaily.filter(m => !dailyIncompleteIds.has(m.id)).map(m => ({ m, s: 'pending' as TaskStatus, isDaily: true })),
              ...l2PendingWeekly.map(m => ({ m, s: 'pending' as TaskStatus, isDaily: false })),
              ...l2RemainingDaily.filter(m => dailyIncompleteIds.has(m.id)).map(m => ({ m, s: 'incomplete' as TaskStatus, isDaily: true })),
              ...l2CompletedDaily.filter(m => dailyAwaitingReviewIds.has(m.id)).map(m => ({ m, s: 'awaiting_review' as TaskStatus, isDaily: true })),
              ...l2AwaitingReviewWeekly.map(m => ({ m, s: 'awaiting_review' as TaskStatus, isDaily: false })),
              ...l2CompletedDaily.filter(m => dailyReviewedIds.has(m.id)).map(m => ({ m, s: 'done' as TaskStatus, isDaily: true })),
              ...l2DoneWeekly.map(m => ({ m, s: 'done' as TaskStatus, isDaily: false })),
              ...upcomingDailyMilestones.filter(m => m.type === 'minggu2').map(m => ({ m, s: 'upcoming' as TaskStatus, isDaily: true })),
            ]
            if (items.length === 0) return null

            const pendingCount = items.filter(isItemPendingBucket).length
            const doneCount = items.filter(isItemDoneBucket).length
            const upcomingCount = items.filter(i => i.s === 'upcoming').length
            const visible = l2Filter === 'all' ? items
              : l2Filter === 'pending' ? items.filter(isItemPendingBucket)
              : l2Filter === 'upcoming' ? items.filter(i => i.s === 'upcoming')
              : items.filter(isItemDoneBucket)

            return (
              <>
                <TaskFilterChips filter={l2Filter} onChange={setL2Filter} all={items.length} pending={pendingCount} done={doneCount} upcoming={upcomingCount} />

                <div className="space-y-2">
                  {visible.map(({ m, s, isDaily }) => (
                    <TaskCard key={`${m.id}-${s}`} m={m} s={s} isDaily={isDaily} day={day} daysLeft={l2DaysLeft} timeLeft={timeLeft} allModuleProgress={allModuleProgress} startDate={profile.startDate} quizScores={profile.quizScores ?? {}} quizAttempts={profile.quizAttempts ?? {}} />
                  ))}

                  {visible.length === 0 && l2Filter === 'done' && (
                    <p className="text-sm text-[#94A3B8] text-center py-4">Belum ada modul yang selesai.</p>
                  )}
                  {visible.length === 0 && l2Filter === 'pending' && (
                    <p className="text-sm text-[#94A3B8] text-center py-4">Semua modul sudah dikerjakan 🎉</p>
                  )}
                  {visible.length === 0 && l2Filter === 'upcoming' && (
                    <p className="text-sm text-[#94A3B8] text-center py-4">Tidak ada modul yang akan datang.</p>
                  )}
                </div>
              </>
            )
          })() : (
            // Level 2 locked — whole-level lock screen, unrelated to per-task status
            <div className="space-y-2">
              {l2Milestones.map(m => (
                <div key={m.id} className="bg-white rounded-xl border border-[#E1E7EF] px-4 py-3 flex items-center gap-3 opacity-60">
                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-base">🔒</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-[#94A3B8]">{m.name}</p>
                    <p className="text-xs mt-0.5 text-[#CBD5E1]">Tersedia mulai hari ke-8</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Text-only onboarding would just be a wall of bullets — instead this launches an
// interactive walkthrough (TourOverlay/TourContext) that navigates the FL through the
// real dashboard/milestones UI, spotlighting the actual element being explained (level
// progress, daily task cards, module status, module detail). Mandatory: no close/skip —
// the only way past this card is to click through the tour to its last step.
function OnboardingGuide() {
  const { start } = useTour()
  return (
    <div className="relative mb-6 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">👋</span>
        <p className="text-base font-bold text-[#0F1729]">Kenalan dulu sama cara kerja OJT, yuk!</p>
      </div>
      <p className="text-xs text-[#65758B] mb-4 leading-relaxed">
        Yuk lihat langsung di halamannya, biar makin paham soal progress belajar, tugas, dan modul yang perlu dikerjakan.
      </p>
      <button
        onClick={start}
        className="w-full h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Mulai Tur →
      </button>
    </div>
  )
}

function TaskFilterChips({ filter, onChange, all, pending, done, upcoming }: {
  filter: 'all' | 'pending' | 'done' | 'upcoming'
  onChange: (f: 'all' | 'pending' | 'done' | 'upcoming') => void
  all: number; pending: number; done: number; upcoming: number
}) {
  const chips = [
    { key: 'all' as const, label: 'Semua', count: all },
    { key: 'pending' as const, label: 'Belum Dikerjakan', count: pending },
    ...(upcoming > 0 ? [{ key: 'upcoming' as const, label: 'Akan Datang', count: upcoming }] : []),
    { key: 'done' as const, label: 'Selesai', count: done },
  ]
  return (
    <div className="flex gap-2 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {chips.map(chip => (
        <button key={chip.key} onClick={() => onChange(chip.key)}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-3xl text-sm font-semibold border transition-colors ${
            filter === chip.key
              ? 'bg-[#E5F2FF] border-[#023DFF] text-[#023DFF]'
              : 'bg-white border-[#E1E7EF] text-[#0F1729] hover:bg-[#F8FAFC]'
          }`}
        >
          {chip.label}
          <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold ${
            filter === chip.key ? 'bg-[#023DFF] text-white' : 'bg-[#E1E7EF] text-[#65758B]'
          }`}>{chip.count}</span>
        </button>
      ))}
    </div>
  )
}

// Shared per-task status card — used by BOTH Level 1 and Level 2 unified item lists so
// checkbox styling, subtitle copy, and countdown behavior never drift apart between levels.
const MAX_QUIZ_ATTEMPTS = 2

function TaskCard({ m, s, isDaily, day, daysLeft, timeLeft, allModuleProgress, startDate, quizScores, quizAttempts }: {
  m: (typeof MILESTONES)[number]
  s: TaskStatus
  isDaily: boolean
  day: number
  daysLeft: number
  timeLeft: number
  allModuleProgress: Record<string, { actual: number; expected: number }>
  startDate: string
  quizScores: Record<string, number>
  quizAttempts: Record<string, number>
}) {
  // A quiz is only "resolved" (no more reminder needed) once passed, or once the
  // one-retry allowance (MAX_QUIZ_ATTEMPTS) has been used up without passing.
  const hasQuiz = (m.quiz?.length ?? 0) > 0
  const quizScoreForM = quizScores?.[m.id]
  const quizResolved = quizScoreForM !== undefined && (quizScoreForM >= 75 || (quizAttempts?.[m.id] ?? 0) >= MAX_QUIZ_ATTEMPTS)
  const quizPassed = quizScoreForM !== undefined && quizScoreForM >= 75
  const quizUnlocked = day >= (m.unlockDay ?? 1)
  const quizPending = hasQuiz && quizUnlocked && !quizResolved
  function fmtDateForDay(dayNum: number): string {
    const d = new Date(startDate)
    d.setDate(d.getDate() + dayNum - 1)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function formatCountdown(ms: number) {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const mi = Math.floor((totalSec % 3600) / 60)
    const sec = totalSec % 60
    return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Only "pending" (not yet submitted today, still actionable) goes to Submit Latihan.
  // Every other resolved/submitted state (done, awaiting review, failed, overdue,
  // incomplete) has nothing left to submit today, so it goes to the milestone detail
  // page instead. "upcoming" isn't clickable at all.
  const href = s === 'upcoming' ? null : s === 'pending' ? `/fl/milestones/${m.id}/tasks` : `/fl/milestones/${m.id}`

  // "incomplete" (today's daily attempt fell short) isn't a final verdict by itself — the
  // module can still be retried on a later day within its own schedule window (e.g.
  // Personal Grooming runs day 1–13; one bad day mid-window doesn't fail the module). Only
  // once there's no day left to retry (today was the LAST day in its window) does an
  // incomplete attempt actually become a final failure — visually treated the same as
  // s === 'failed' from that point on (red checkbox/badge, no more description).
  const isLastChanceIncomplete = s === 'incomplete' && day + 1 > (DAILY_SCHEDULE[m.id]?.toDay ?? day)

  // While a quiz is still pending, a module's pass/fail checkbox stays neutral — checking
  // or crossing it would contradict Modul Belajar, which still shows the module "Aktif"
  // until the quiz is resolved too.
  const quizBlocksVerdict = quizPending && (s === 'done' || s === 'failed' || s === 'overdue' || s === 'incomplete')

  const checkbox = quizBlocksVerdict
    ? <div className="w-5 h-5 rounded border-2 border-[#CBD5E1] flex-shrink-0" />
    : s === 'done'
    ? <div className="w-5 h-5 rounded border-2 bg-[#16A34A] border-[#16A34A] flex-shrink-0 flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    : s === 'awaiting_review'
      ? <div className="w-5 h-5 rounded border-2 border-[#CBD5E1] flex-shrink-0" />
    : (isLastChanceIncomplete || s === 'overdue' || s === 'failed')
      ? <div className="w-5 h-5 rounded border-2 bg-[#FEE2E2] border-[#FCA5A5] flex-shrink-0 flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M6.5 1.5l-5 5M1.5 1.5l5 5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
      : s === 'upcoming'
        ? <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-base">🔒</span>
        : <div className="w-5 h-5 rounded border-2 border-[#CBD5E1] flex-shrink-0" />

  // Description is now ALWAYS the deadline — latihan/quiz done-ness is communicated purely
  // via the two badges' colors (row 2) instead of swapping this text between "Menunggu
  // penilaian kanit" / "Belum berhasil..." / "Kerjakan mini quiz..." depending on status.
  // Two deliberate exceptions: "upcoming" (not accessible yet, so there's no deadline to
  // show — "Batas pengerjaan hari ini" would be factually wrong, not just redundant) and
  // "overdue" (the deadline itself has already passed, so restating it is meaningless —
  // it says the module missed it instead).
  const subtitleNode = s === 'upcoming'
    ? <span className="text-[#CBD5E1]">
        {DAILY_SCHEDULE[m.id]?.fromDay === day + 1
          ? 'Tersedia mulai besok'
          : `Tersedia mulai tanggal ${fmtDateForDay(DAILY_SCHEDULE[m.id]?.fromDay ?? day + 1)}`}
      </span>
    : s === 'overdue'
      ? <span className="text-[#94A3B8]">Tidak selesai tepat waktu</span>
    : isDaily
      ? <span className="text-[#94A3B8]">
          Batas pengerjaan hari ini{' '}
          <span className="text-xs text-[#B27202] font-medium tabular-nums">
            {formatCountdown(timeLeft)}
          </span>
        </span>
      : <span className="text-[#94A3B8]">
          {daysLeft === 0
            ? <>Batas pengerjaan hari ini{' '}<span className="text-xs text-[#B27202] font-medium tabular-nums">{formatCountdown(timeLeft)}</span></>
            : `Batas pengerjaan ${daysLeft} hari lagi`}
        </span>

  const titleColor = (isLastChanceIncomplete || s === 'upcoming' || s === 'failed' || s === 'overdue') ? 'text-[#94A3B8]' : 'text-[#0F1729]'
  const cardBase = `bg-white rounded-xl border border-[#E1E7EF] px-4 py-3 min-h-[68px] flex items-center gap-3 ${s === 'upcoming' ? 'opacity-60' : ''}`

  // "Done" only collapses to name-only once BOTH latihan AND the quiz are actually done —
  // not just when s === 'done', since that only reflects latihan. While the quiz is still
  // pending (quizPending), everything stays visible: latihan badge, quiz badge (still
  // grey), and the deadline line — there's still something owed, so nothing gets hidden.
  const isFullyDone = s === 'done' && !quizPending
  // A daily module only allows one submission per day — once today's is in (whatever the
  // outcome: incomplete, awaiting review, or done), "Batas pengerjaan hari ini {countdown}"
  // is misleading, since there's nothing left they can actually do before the deadline
  // passes. Scoped to isDaily only — weekly modules allow resubmitting the same day, so
  // their deadline stays genuinely actionable even after a submission (see the "can a user
  // submit another weekly session while awaiting review" thread — confirmed not blocked).
  const isDailyResolvedToday = isDaily && (s === 'incomplete' || s === 'awaiting_review' || s === 'done')
  // No remedial once truly failed (either s === 'failed', or incomplete with no day left to
  // retry) — restating a deadline that can no longer be met adds nothing.
  const hideDescription = isFullyDone || s === 'failed' || isLastChanceIncomplete || isDailyResolvedToday

  // Row 2: latihan progress AND mini quiz status shown together, always — not one only
  // once the other resolves. Hidden entirely while "upcoming" (not accessible yet) or once
  // isFullyDone (nothing left to communicate beyond the module name).
  const progress = allModuleProgress[m.id]
  const latihanBadge = s !== 'upcoming' && !isFullyDone && progress && (
    <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border leading-none tabular-nums ${
      s === 'done'
        ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]'
        : s === 'failed' || isLastChanceIncomplete
          ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
          : (progress.actual ?? 0) > 0
            ? 'bg-[#FEFDEA] border-[#E0A200] text-[#B27202]'
            : 'bg-[#F8FAFC] border-[#E1E7EF] text-[#94A3B8]'
    }`}>
      {progress.actual}/{progress.expected} latihan
    </span>
  )
  // Shown even before the quiz's own unlock date — as a locked state (🔒, no count) rather
  // than hidden — so latihan and quiz status are ALWAYS both visible together, same as
  // everywhere else on this card, instead of the quiz badge only appearing once relevant.
  const quizBadge = s !== 'upcoming' && !isFullyDone && hasQuiz && (
    <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border leading-none tabular-nums ${
      !quizUnlocked
        ? 'bg-white border-dashed border-[#E1E7EF] text-[#CBD5E1]'
        : !quizResolved
          ? 'bg-[#F8FAFC] border-[#E1E7EF] text-[#94A3B8]'
          : quizPassed
            ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]'
            : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
    }`}>
      {quizUnlocked ? `${quizPassed ? 1 : 0}/1 Mini Quiz` : '🔒 Mini Quiz'}
    </span>
  )

  const inner = (
    <>
      {checkbox}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${titleColor}`}>{m.name}</p>
        {(latihanBadge || quizBadge) && (
          <div className="flex items-center gap-1.5 mt-1">
            {latihanBadge}
            {quizBadge}
          </div>
        )}
        {!hideDescription && subtitleNode && <p className="text-xs mt-1">{subtitleNode}</p>}
      </div>
      {href && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#CBD5E1] group-hover:text-[#023DFF] transition-colors flex-shrink-0">
            <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </>
  )

  return href
    ? <Link to={href} className={`${cardBase} hover:border-[#023DFF]/30 hover:bg-[#F8FAFC] transition-all group`}>{inner}</Link>
    : <div className={cardBase}>{inner}</div>
}

function StatCard({ label, value, unit, note, colorClass }: {
  label: string; value: string; unit: string; note: string; colorClass: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
      <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-sm text-[#94A3B8]">{unit}</p>
      </div>
      <p className="text-xs text-[#65758B] mt-1">{note}</p>
    </div>
  )
}

function StatusBadge({ status, label, small }: { status: 'success' | 'warning' | 'error' | 'neutral'; label: string; small?: boolean }) {
  const map = {
    success: 'bg-[#F0FDF4] text-[#15803D]',
    warning: 'bg-[#FEFDEA] text-[#B27202]',
    error: 'bg-[#FEF2F2] text-[#B91C1C]',
    neutral: 'bg-[#F1F5F9] text-[#65758B]',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${small ? 'text-[10px]' : 'text-xs'} ${map[status]}`}>
      {label}
    </span>
  )
}

