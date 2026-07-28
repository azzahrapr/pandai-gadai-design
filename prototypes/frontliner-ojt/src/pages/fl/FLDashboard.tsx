import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ASSESSMENT_QUESTIONS, MILESTONES } from '../../data/mockData'
import type { FLProfile } from '../../types'

const DAILY_SCHEDULE: Record<string, { fromDay: number; toDay: number }> = {
  'closing-cabang':    { fromDay: 1,  toDay: 3  },
  'opening-cabang':   { fromDay: 4,  toDay: 7  },
  'personal-grooming':{ fromDay: 1,  toDay: 14 },
  'pelayanan-nasabah':{ fromDay: 8,  toDay: 13 },
  'customer-service-wa': { fromDay: 8, toDay: 13 },
}

const MILESTONE_EXPECTED_COUNT: Record<string, number> = {
  'closing-cabang': 3, 'opening-cabang': 3, 'personal-grooming': 12,
  'pengenalan-produk': 3, 'canvassing': 3, 'cash-management': 1,
  'sop-administrasi': 5, 'packing-sealing': 3, 'offloading': 1,
  'pelayanan-nasabah': 6, 'customer-service-wa': 3,
  'penaksiran-elektronik': 2, 'penaksiran-emas': 1, 'penaksiran-bpkb': 2,
}

const PENAKSIRAN_IDS = new Set(['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb'])

export default function FLDashboard() {
  const { currentUser, level2Unlocks, getFlChecklists, getFlAssessment, getItemConfirmations } = useApp()
  const profile = currentUser!.profile as FLProfile
  const day = profile.currentDay
  const allChecklists = getFlChecklists(currentUser!.id)

  function hasDraft(milestoneId: string) {
    try {
      const key = `checklist-draft-${currentUser!.id}-${milestoneId}-d${day}`
      const raw = localStorage.getItem(key)
      if (!raw) return false
      const parsed = JSON.parse(raw) as string[]
      return Array.isArray(parsed) && parsed.length > 0
    } catch { return false }
  }
  const dayProgress = Math.round((day / 14) * 100)
  const existingAssessment = getFlAssessment(currentUser!.id)


  const todayDailyMilestoneIds = Object.entries(DAILY_SCHEDULE)
    .filter(([, { fromDay, toDay }]) => day >= fromDay && day <= toDay)
    .map(([id]) => id)
  const todayDailyMilestones = MILESTONES.filter(m => todayDailyMilestoneIds.includes(m.id))

  const dailyMilestoneIds = Object.keys(DAILY_SCHEDULE)
  const currentLevelType = day <= 7 ? 'minggu1' : 'minggu2'
  const weeklyModules = day < 14
    ? MILESTONES.filter(m => m.type === currentLevelType && !dailyMilestoneIds.includes(m.id))
    : []

  const submittedAllChecklists = allChecklists.filter(c => c.status === 'submitted' || c.status === 'scored')
  const weeklyProgress: Record<string, { actual: number; expected: number }> = Object.fromEntries(
    weeklyModules.map(m => {
      if (m.submissionType === 'individual') {
        const actual = m.checklistItems.reduce((sum, item) =>
          sum + getItemConfirmations(currentUser!.id, m.id, item.id).length, 0
        )
        const expected = m.checklistItems.reduce((sum, item) => sum + (item.target ?? 1), 0)
        return [m.id, { actual, expected }]
      }
      const count = PENAKSIRAN_IDS.has(m.id)
        ? submittedAllChecklists.filter(cl => cl.milestoneId === m.id).length
        : submittedAllChecklists.filter(cl =>
            cl.tasks?.some(t => {
              if (t.taskId !== m.id) return false
              if (t.reflection?.startsWith('Kode SBG:')) return true
              const total = m.checklistItems?.length ?? 0
              return total === 0 || t.completedItemIds.length >= total
            })
          ).length
      return [m.id, { actual: count, expected: MILESTONE_EXPECTED_COUNT[m.id] ?? 2 }]
    })
  )

  const submittedTodayTasks = allChecklists
    .filter(c => c.day === day && (c.status === 'submitted' || c.status === 'scored'))
    .flatMap(c => c.tasks ?? [])
    .filter(t => todayDailyMilestoneIds.includes(t.taskId))

  const dailyDoneIds = new Set(
    submittedTodayTasks
      .filter(t => {
        if (t.reflection?.startsWith('Kode SBG:')) return true
        const ms = MILESTONES.find(m => m.id === t.taskId)
        const total = ms?.checklistItems?.length ?? 0
        return total === 0 || t.completedItemIds.length >= total
      })
      .map(t => t.taskId)
  )

  const dailyIncompleteIds = new Set(
    submittedTodayTasks
      .filter(t => !dailyDoneIds.has(t.taskId))
      .map(t => t.taskId)
  )

  const allDailyDoneToday = todayDailyMilestoneIds.length > 0
    && todayDailyMilestoneIds.every(id => dailyDoneIds.has(id))

  const tomorrowDay = day + 1
  const tomorrowDailyMilestones = (allDailyDoneToday && tomorrowDay <= 14)
    ? Object.entries(DAILY_SCHEDULE)
        .filter(([, { fromDay, toDay }]) => tomorrowDay >= fromDay && tomorrowDay <= toDay)
        .map(([id]) => MILESTONES.find(m => m.id === id))
        .filter((m): m is typeof MILESTONES[number] => !!m)
    : []

  const isWeeklyDone = (m: typeof MILESTONES[0]) =>
    (profile.completedMilestoneIds?.includes(m.id) ?? false) ||
    ((weeklyProgress[m.id]?.actual ?? 0) >= (weeklyProgress[m.id]?.expected ?? 1))
  const pendingWeeklyItems = weeklyModules.filter(m => !isWeeklyDone(m))

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
  const weeklyDaysLeft = day <= 7 ? 7 - day : 13 - day
  const remainingDailyItems = todayDailyMilestones.filter(m => !dailyDoneIds.has(m.id))
  const checklistHasMore = (allDailyDoneToday ? tomorrowDailyMilestones.length : remainingDailyItems.length) + pendingWeeklyItems.length > 5
  const l1Milestones = MILESTONES.filter(m => m.type === 'minggu1')
  const l2Milestones = MILESTONES.filter(m => m.type === 'minggu2')
  const completedL1 = l1Milestones.filter(m => profile.completedMilestoneIds?.includes(m.id) ?? false).length
  const completedL2 = l2Milestones.filter(m => profile.completedMilestoneIds?.includes(m.id) ?? false).length
  const l1Pct = Math.round((completedL1 / l1Milestones.length) * 100)
  const l2Pct = Math.round((completedL2 / l2Milestones.length) * 100)
  const l2Available = day >= 8 || !!(level2Unlocks[currentUser!.id])

  const completedDailyItems = todayDailyMilestones.filter(m => dailyDoneIds.has(m.id))
  const doneWeeklyItems = weeklyModules.filter(m => isWeeklyDone(m))

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'done'>('all')
  const [activeCard, setActiveCard] = useState<'level1' | 'level2'>(l2Available ? 'level2' : 'level1')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const l2CardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (l2Available && scrollContainerRef.current && l2CardRef.current) {
      scrollContainerRef.current.scrollLeft = l2CardRef.current.offsetLeft - 16
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
  const l1DaysLeft = Math.max(0, 7 - day)
  const l2DaysLeft = Math.max(0, 13 - day)
  const l1Deadline = fmtDeadline(profile.startDate, 6)
  const l2Deadline = fmtDeadline(profile.startDate, 12)

  return (
    <div className="p-4 md:p-8">
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Halo, {profile.name.split(' ')[0]}</h1>
        <p className="text-[#65758B] text-sm mt-1">
          {day === 14
            ? 'Hari ini adalah hari assessment — selesaikan penilaian akhir OJT kamu.'
            : day === 1
              ? 'Mulai pelajari materi dan kerjakan tugas sekarang!'
              : completedL1 === l1Milestones.length && completedL2 === l2Milestones.length
                ? 'Semua modul selesai! Siapkan diri untuk assessment.'
                : l2Available
                  ? 'Level 2 terbuka — lanjutkan perjalanan belajarmu.'
                  : `${completedL1} dari ${l1Milestones.length} modul Level 1 selesai.`}
        </p>
      </div>

      {/* Assessment alert */}
      {day === 14 && !existingAssessment && (
        <div className="bg-[#FEFDEA] border border-[#E0A200] rounded-xl p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <p className="font-semibold text-[#B27202]">Ini adalah Hari ke-14 — Hari Assessment kamu!</p>
              <p className="text-sm text-[#B27202]/80 mt-0.5">Selesaikan assessment hari ini untuk mendapatkan nilai akhir OJT.</p>
            </div>
          </div>
          <Link to="/fl/assessment" className="flex-shrink-0 h-[38px] px-4 bg-[#E0A200] hover:bg-[#B27202] text-white font-semibold text-sm rounded-lg flex items-center transition-colors">
            Mulai Assessment →
          </Link>
        </div>
      )}
      {day === 14 && existingAssessment && (() => {
        const mcqCorrect = ASSESSMENT_QUESTIONS.reduce((count, q) => {
          const ans = existingAssessment.answers.find(a => a.questionId === q.id)
          return count + (ans?.answer === q.options[q.correctIndex] ? 1 : 0)
        }, 0)
        return (
          <div className="rounded-xl p-4 flex items-center gap-3 mb-6 bg-[#F0FDF4] border border-[#16A34A]/20">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#15803D]">Assessment Akhir OJT selesai!</p>
              <p className="text-xs mt-0.5 text-[#15803D]/80">{mcqCorrect}/{ASSESSMENT_QUESTIONS.length} soal benar · Nilai: {existingAssessment.mcqScore ?? Math.round((mcqCorrect / ASSESSMENT_QUESTIONS.length) * 100)}/100</p>
            </div>
            <Link to="/fl/assessment" className="flex-shrink-0 h-[34px] px-3 bg-white border border-[#CBD5E1] text-[#0F1729] text-xs font-semibold rounded-lg flex items-center hover:bg-[#F1F5F9] transition-colors">
              Lihat Detail →
            </Link>
          </div>
        )
      })()}


      {/* Progress Belajar carousel */}
      <div className="mb-6">
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
              className="mt-4 flex items-center justify-center h-9 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold transition-colors"
            >
              {l1Pct === 100 ? 'Lihat Level 1' : day === 1 ? 'Mulai Belajar' : 'Lanjut Belajar'}
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
                className="mt-4 flex items-center justify-center h-9 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white text-sm font-semibold transition-colors"
              >
                Lanjut Belajar
              </Link>
            </div>
          ) : (
            <div
              className="flex-shrink-0 rounded-2xl p-5 bg-[#F8FAFC] border border-[#E1E7EF]"
              style={{ width: '82%', scrollSnapAlign: 'start', transform: activeCard === 'level2' ? 'scale(1)' : 'scale(0.93)', transition: 'transform 0.3s ease', transformOrigin: 'center' }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-base font-bold text-[#CBD5E1] leading-tight">Level 2</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-[#CBD5E1]">
                  <rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-xs text-[#E1E7EF] mt-1">Tersedia setelah Level 1 selesai</p>
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

      {/* Task / Module list — switches based on which level card is visible */}
      {day < 14 && (
        <div>
          {activeCard === 'level1' ? (() => {
            // Build unified item list
            type S = 'pending' | 'incomplete' | 'done' | 'tomorrow'
            const items: { m: (typeof MILESTONES)[0]; s: S; isDaily: boolean }[] = [
              ...(!allDailyDoneToday
                ? remainingDailyItems.map(m => ({ m, s: (dailyIncompleteIds.has(m.id) ? 'incomplete' : 'pending') as S, isDaily: true }))
                : []),
              ...completedDailyItems.map(m => ({ m, s: 'done' as S, isDaily: true })),
              ...pendingWeeklyItems.map(m => ({ m, s: 'pending' as S, isDaily: false })),
              ...doneWeeklyItems.map(m => ({ m, s: 'done' as S, isDaily: false })),
              ...(allDailyDoneToday ? tomorrowDailyMilestones.map(m => ({ m, s: 'tomorrow' as S, isDaily: true })) : []),
            ]
            if (items.length === 0) return null

            const pendingCount = items.filter(i => i.s === 'pending').length
            const doneCount = items.filter(i => i.s === 'done' || i.s === 'incomplete').length
            const visible = taskFilter === 'all' ? items
              : taskFilter === 'pending' ? items.filter(i => i.s === 'pending')
              : items.filter(i => i.s === 'done' || i.s === 'incomplete')

            return (
              <>
                {/* Filter chips */}
                <div className="flex gap-2 mb-3">
                  {([
                    { key: 'all' as const, label: 'Semua', count: items.length },
                    { key: 'pending' as const, label: 'Belum Dikerjakan', count: pendingCount },
                    { key: 'done' as const, label: 'Selesai', count: doneCount },
                  ]).map(chip => (
                    <button key={chip.key} onClick={() => setTaskFilter(chip.key)}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-3xl text-sm font-semibold border transition-colors ${
                        taskFilter === chip.key
                          ? 'bg-[#E5F2FF] border-[#023DFF] text-[#023DFF]'
                          : 'bg-white border-[#E1E7EF] text-[#0F1729] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {chip.label}
                      <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold ${
                        taskFilter === chip.key ? 'bg-[#023DFF] text-white' : 'bg-[#E1E7EF] text-[#65758B]'
                      }`}>{chip.count}</span>
                    </button>
                  ))}
                </div>

                {/* Unified task cards */}
                <div className="space-y-2">
                  {visible.map(({ m, s, isDaily }) => {
                    const href = s === 'incomplete' ? `/fl/milestones/${m.id}`
                      : s === 'done' ? (isDaily ? `/fl/milestones/${m.id}/tasks` : `/fl/milestones/${m.id}`)
                      : s === 'pending' ? `/fl/milestones/${m.id}/tasks` : null

                    const checkbox = s === 'done'
                      ? <div className="w-5 h-5 rounded border-2 bg-[#16A34A] border-[#16A34A] flex-shrink-0 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      : s === 'incomplete'
                        ? <div className="w-5 h-5 rounded border-2 bg-[#FEE2E2] border-[#FCA5A5] flex-shrink-0 flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M6.5 1.5l-5 5M1.5 1.5l5 5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </div>
                        : s === 'tomorrow'
                          ? <div className="w-5 h-5 rounded border-2 border-[#E1E7EF] flex-shrink-0 flex items-center justify-center bg-[#F8FAFC]">
                              <svg width="9" height="11" viewBox="0 0 9 11" fill="none"><rect x="0.7" y="4" width="7.6" height="6.3" rx="1.3" stroke="#CBD5E1" strokeWidth="1.4"/><path d="M2.5 4V2.8a2 2 0 1 1 4 0V4" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round"/></svg>
                            </div>
                          : <div className="w-5 h-5 rounded border-2 border-[#CBD5E1] flex-shrink-0" />

                    const subtitleNode = s === 'done'
                      ? <span className="text-[#15803D]">{isDaily ? 'Latihan hari ini berhasil dikerjakan.' : 'Semua sesi latihan berhasil dikerjakan.'}</span>
                      : s === 'incomplete'
                        ? <span className="text-[#94A3B8]">Belum berhasil · Coba lagi besok</span>
                        : s === 'tomorrow'
                          ? <span className="text-[#CBD5E1]">Tersedia mulai besok</span>
                          : isDaily
                            ? <span className="text-[#94A3B8]">
                                Batas pengerjaan{' '}
                                <span className="whitespace-nowrap">
                                  hari ini{' '}
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#FEF9C3] text-[#B27202] font-mono text-[10px] font-semibold leading-none align-middle">
                                    {formatCountdown(timeLeft)}
                                  </span>
                                </span>
                              </span>
                            : <span className="text-[#94A3B8]">
                                {weeklyDaysLeft <= 0 ? 'Batas pengerjaan hari ini' : `Batas pengerjaan ${weeklyDaysLeft} hari lagi`}
                              </span>

                    const titleColor = (s === 'incomplete' || s === 'tomorrow') ? 'text-[#94A3B8]' : 'text-[#0F1729]'
                    const cardBase = `bg-white rounded-xl border border-[#E1E7EF] px-4 py-3 flex items-center gap-3 ${s === 'tomorrow' ? 'opacity-60' : ''}`

                    const inner = (
                      <>
                        {checkbox}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className={`text-sm font-semibold truncate ${titleColor}`}>{m.name}</p>
                            {!isDaily && weeklyProgress[m.id] && (
                              <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#E1E7EF] text-[#65758B] leading-none tabular-nums">
                                {weeklyProgress[m.id].actual}/{weeklyProgress[m.id].expected} latihan
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5">{subtitleNode}</p>
                        </div>
                        {href && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {s === 'pending' && hasDraft(m.id) && <span className="text-xs text-[#023DFF] font-medium">Lanjutkan</span>}
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#CBD5E1] group-hover:text-[#023DFF] transition-colors flex-shrink-0">
                              <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </>
                    )

                    return href
                      ? <Link key={`${m.id}-${s}`} to={href} className={`${cardBase} hover:border-[#023DFF]/30 hover:bg-[#F8FAFC] transition-all group`}>{inner}</Link>
                      : <div key={`${m.id}-${s}`} className={cardBase}>{inner}</div>
                  })}

                  {visible.length === 0 && taskFilter === 'done' && (
                    <p className="text-sm text-[#94A3B8] text-center py-4">Belum ada tugas yang selesai.</p>
                  )}
                  {visible.length === 0 && taskFilter === 'pending' && (
                    <p className="text-sm text-[#94A3B8] text-center py-4">Semua tugas sudah dikerjakan 🎉</p>
                  )}
                </div>
              </>
            )
          })() : (
            // ── Level 2: module list ───────────────────────────────────────────
            <div className="space-y-2">
              {l2Milestones.map(m => {
                const isCompleted = profile.completedMilestoneIds?.includes(m.id) ?? false
                const isLocked = !l2Available
                if (isLocked) {
                  return (
                    <div key={m.id} className="bg-white rounded-xl border border-[#E1E7EF] px-4 py-3 flex items-center gap-3 opacity-50">
                      <div className="w-5 h-5 rounded border-2 border-[#CBD5E1] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-[#94A3B8]">{m.name}</p>
                        <p className="text-xs mt-0.5 text-[#CBD5E1]">Tersedia setelah Level 1 selesai</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#CBD5E1] flex-shrink-0">
                        <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )
                }
                return (
                  <Link key={m.id} to={`/fl/milestones/${m.id}`}
                    className="bg-white rounded-xl border border-[#E1E7EF] px-4 py-3 flex items-center gap-3 hover:border-[#023DFF]/30 hover:bg-[#F8FAFC] transition-all group"
                  >
                    {isCompleted
                      ? <div className="w-5 h-5 rounded border-2 bg-[#16A34A] border-[#16A34A] flex-shrink-0 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      : <div className="w-5 h-5 rounded border-2 border-[#CBD5E1] flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-[#0F1729]">{m.name}</p>
                      <p className={`text-xs mt-0.5 ${isCompleted ? 'text-[#15803D]' : 'text-[#94A3B8]'}`}>
                        {isCompleted ? 'Modul selesai' : `Batas pengerjaan ${Math.max(0, 13 - day)} hari lagi`}
                      </p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#CBD5E1] group-hover:text-[#023DFF] flex-shrink-0 transition-colors">
                      <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
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

