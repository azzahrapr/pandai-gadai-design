import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { FLProfile, DailyChecklist } from '../../types'

// personal-grooming (L1) clamped to days 1-6 and personal-grooming-l2 added at days
// 8-13 (2026-08-12) — was one entry spanning 1-13, now split into 2 independent
// milestones (see MILESTONES in mockData.ts for the full rationale).
const DAILY_SCHEDULE: Record<string, { fromDay: number; toDay: number }> = {
  'closing-cabang':      { fromDay: 1,  toDay: 3  },
  'opening-cabang':     { fromDay: 4,  toDay: 6  },
  'personal-grooming':  { fromDay: 1,  toDay: 6  },
  'personal-grooming-l2': { fromDay: 8, toDay: 13 },
  'pelayanan-nasabah':  { fromDay: 8,  toDay: 13 },
  'customer-service-wa':{ fromDay: 8,  toDay: 13 },
}


const TASK_TO_MILESTONE: Record<string, string> = {
  'closing-cabang': 'closing-cabang',
  'opening-cabang': 'opening-cabang',
  'personal-grooming': 'personal-grooming',
  'personal-grooming-l2': 'personal-grooming-l2',
  'pengenalan-produk': 'pengenalan-produk',
  'canvassing': 'canvassing',
  'cash-management': 'cash-management',
  'sop-administrasi': 'sop-administrasi',
  'packing-sealing': 'packing-sealing',
  'offloading': 'offloading',
  'pelayanan-nasabah': 'pelayanan-nasabah',
  'customer-service-wa': 'customer-service-wa',
  'penaksiran-elektronik': 'penaksiran-elektronik',
  'penaksiran-emas': 'penaksiran-emas',
  'penaksiran-bpkb': 'penaksiran-bpkb',
}

function avgColor(s: number | null) {
  if (s === null) return 'text-[#CBD5E1]'
  if (s >= 85) return 'text-[#15803D]'
  if (s >= 75) return 'text-[#B27202]'
  return 'text-[#B91C1C]'
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function FLChecklist() {
  const { currentUser, getFlChecklists, extensionRequests, requestExtension } = useApp()
  const profile = currentUser!.profile as FLProfile
  const currentDay = profile.currentDay
  const allChecklists = getFlChecklists(currentUser!.id)
  const flId = currentUser!.id

  const [tab, setTab] = useState<'aktif' | 'mendatang'>('aktif')
  const [showHistory, setShowHistory] = useState(false)

  // ── Helpers ─────────────────────────────────────────────

  function getEffectiveToDay(milestoneId: string) {
    const base = DAILY_SCHEDULE[milestoneId]?.toDay ?? 0
    const approved = extensionRequests.filter(
      r => r.flId === flId && r.milestoneId === milestoneId && r.type === 'daily-redo' && r.status === 'approved'
    ).length
    return base + approved
  }

  function getTodayChecklist(milestoneId: string) {
    return allChecklists.find(c =>
      c.day === currentDay &&
      (c.status === 'submitted' || c.status === 'scored') &&
      c.tasks?.some(t => t.taskId === milestoneId)
    )
  }

  // ── Daily section ────────────────────────────────────────

  const todayDailyMilestoneIds = Object.entries(DAILY_SCHEDULE)
    .filter(([id, { fromDay }]) => {
      const toDay = getEffectiveToDay(id)
      return currentDay >= fromDay && currentDay <= toDay
    })
    .map(([id]) => id)

  const todayDailyMilestones = MILESTONES.filter(m => todayDailyMilestoneIds.includes(m.id))

  // ── Weekly section ───────────────────────────────────────

  const dailyMilestoneIds = Object.keys(DAILY_SCHEDULE)
  const isWeek1 = currentDay <= 7
  const isWeek2 = currentDay >= 8 && currentDay <= 13
  const isAssessmentDay = currentDay === 13

  const week1Modules = MILESTONES.filter(m => m.type === 'minggu1' && !dailyMilestoneIds.includes(m.id))
  const week2Modules = MILESTONES.filter(m => m.type === 'minggu2' && !dailyMilestoneIds.includes(m.id))

  // Week 1 modules that failed (not completed by end of week 1) — visible in week 2+
  const failedWeek1 = isWeek2
    ? week1Modules.filter(m => !(profile.completedMilestoneIds?.includes(m.id) ?? false))
    : []

  // Week 2 modules that failed — visible on assessment day
  const failedWeek2 = isAssessmentDay
    ? week2Modules.filter(m => !(profile.completedMilestoneIds?.includes(m.id) ?? false))
    : []

  // Current weekly modules to show normally
  const currentWeeklyModules = isWeek1
    ? week1Modules
    : isWeek2
      ? [
          // Approved week 1 carry-overs appear as regular items in week 2
          ...failedWeek1.filter(m =>
            extensionRequests.some(r => r.flId === flId && r.milestoneId === m.id && r.type === 'weekly-carryover' && r.status === 'approved')
          ),
          ...week2Modules,
        ]
      : []

  const weeklyDeadline = isWeek1
    ? addDays(profile.startDate, 6)
    : isWeek2
      ? addDays(profile.startDate, 12)
      : null
  const weeklyDaysLeft = isWeek1 ? 7 - currentDay : isWeek2 ? 13 - currentDay : 0

  // ── Upcoming (inactive) items ────────────────────────────

  const upcomingDailyItems = Object.entries(DAILY_SCHEDULE)
    .filter(([, { fromDay }]) => fromDay > currentDay)
    .map(([id, { fromDay }]) => ({
      milestone: MILESTONES.find(m => m.id === id),
      lockReason: `Tersedia mulai Hari ${fromDay}`,
    }))
    .filter((x): x is { milestone: typeof MILESTONES[number]; lockReason: string } => !!x.milestone)
    .sort((a, b) => (DAILY_SCHEDULE[a.milestone.id]?.fromDay ?? 0) - (DAILY_SCHEDULE[b.milestone.id]?.fromDay ?? 0))

  const upcomingWeeklyItems = isWeek1
    ? week2Modules.map(m => ({ milestone: m, lockReason: 'Tersedia di Hari 8 setelah akses Level 2 dibuka' }))
    : []

  const upcomingItems = [...upcomingDailyItems, ...upcomingWeeklyItems]

  const activeCount =
    todayDailyMilestones.filter(m => !getTodayChecklist(m.id)).length +
    currentWeeklyModules.filter(m => !(profile.completedMilestoneIds?.includes(m.id) ?? false)).length

  // ── History ──────────────────────────────────────────────

  const history = allChecklists
    .filter(c => c.status === 'submitted' || c.status === 'scored')
    .sort((a, b) => b.day !== a.day ? b.day - a.day : (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))

  // ── Sub-components ───────────────────────────────────────

  function DailyCard({ milestoneId, name }: { milestoneId: string; name: string }) {
    const cl = getTodayChecklist(milestoneId)
    const isDone = !!cl
    const passed = cl?.passed
    const hasDraftSaved = !isDone && (() => {
      try {
        const key = `checklist-draft-${currentUser!.id}-${milestoneId}-d${profile.currentDay}`
        const raw = localStorage.getItem(key)
        if (!raw) return false
        const parsed = JSON.parse(raw) as string[]
        return Array.isArray(parsed) && parsed.length > 0
      } catch { return false }
    })()

    const [timeLeft, setTimeLeft] = useState(() => {
      const now = new Date()
      const end = new Date(); end.setHours(23, 59, 59, 999)
      return Math.max(0, end.getTime() - now.getTime())
    })
    useEffect(() => {
      if (isDone) return
      const id = setInterval(() => {
        const now = new Date()
        const end = new Date(); end.setHours(23, 59, 59, 999)
        setTimeLeft(Math.max(0, end.getTime() - now.getTime()))
      }, 1000)
      return () => clearInterval(id)
    }, [isDone])
    function formatTime(ms: number) {
      const totalSec = Math.floor(ms / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    let statusDot: React.ReactNode
    if (!isDone) {
      statusDot = <div className="w-5 h-5 rounded border-2 border-[#CBD5E1] flex-shrink-0" />
    } else if (passed) {
      statusDot = (
        <div className="w-5 h-5 rounded border-2 bg-[#16A34A] border-[#16A34A] flex-shrink-0 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )
    } else {
      statusDot = (
        <div className="w-5 h-5 rounded border-2 bg-[#DC2626] border-[#DC2626] flex-shrink-0 flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
      )
    }

    let subText: string
    if (!isDone) {
      subText = 'Batas pengerjaan 23:59:59'
    } else if (passed) {
      subText = 'Semua task berhasil dikerjakan'
    } else {
      subText = 'Belum lulus — coba lagi besok'
    }

    const borderClass = !isDone
      ? 'border-[#E1E7EF]'
      : passed
        ? 'border-[#16A34A]/30'
        : 'border-[#DC2626]/20'

    return (
      <Link
        to={`/fl/milestones/${milestoneId}/tasks`}
        className={`bg-white rounded-xl border px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] transition-all group ${borderClass}`}
      >
        {statusDot}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-[#0F1729]">{name}</p>
          {!isDone ? (
            <p className="text-xs mt-0.5 text-[#94A3B8] flex items-center gap-1.5">
              Batas pengerjaan hari ini
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#FEF9C3] text-[#B27202] font-mono text-[10px] font-semibold leading-none">
                {formatTime(timeLeft)}
              </span>
            </p>
          ) : (
            <p className="text-xs mt-0.5 text-[#94A3B8]">{subText}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasDraftSaved && <span className="text-xs text-[#023DFF] font-medium">Lanjutkan</span>}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#CBD5E1] group-hover:text-[#023DFF] transition-colors">
            <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>
    )
  }

  function WeeklyCard({ m, isCarryOver = false }: { m: typeof MILESTONES[0]; isCarryOver?: boolean }) {
    const completed = profile.completedMilestoneIds?.includes(m.id) ?? false
    const hasDraftSaved = !completed && (() => {
      try {
        const key = `checklist-draft-${currentUser!.id}-${m.id}-d${profile.currentDay}`
        const raw = localStorage.getItem(key)
        if (!raw) return false
        const parsed = JSON.parse(raw) as string[]
        return Array.isArray(parsed) && parsed.length > 0
      } catch { return false }
    })()

    return (
      <Link
        key={m.id}
        to={completed ? `/fl/milestones/${m.id}` : `/fl/milestones/${m.id}/tasks`}
        className={`bg-white rounded-xl border px-4 py-3 flex items-center gap-3 hover:border-[#023DFF]/30 hover:bg-[#F8FAFC] transition-all group ${
          completed ? 'border-[#16A34A]/40' : isCarryOver ? 'border-[#023DFF]/20' : 'border-[#E1E7EF]'
        }`}
      >
        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
          completed ? 'bg-[#16A34A] border-[#16A34A]' : 'border-[#CBD5E1]'
        }`}>
          {completed && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${completed ? 'text-[#94A3B8] line-through' : 'text-[#0F1729]'}`}>{m.name}</p>
          <p className={`text-xs mt-0.5 flex items-center gap-1.5 flex-wrap ${
            completed
              ? 'text-[#94A3B8]'
              : isCarryOver
                ? 'text-[#B27202]'
                : weeklyDaysLeft <= 0
                  ? 'text-[#DC2626]'
                  : weeklyDaysLeft <= 2
                    ? 'text-[#E0A200]'
                    : 'text-[#94A3B8]'
          }`}>
            {completed
              ? 'Selesai'
              : isCarryOver
                ? 'Carry-over dari Minggu 1 · Selesaikan minggu ini'
                : weeklyDaysLeft <= 0
                  ? 'Batas pengerjaan hari ini'
                  : `Batas pengerjaan ${weeklyDaysLeft} hari lagi`}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasDraftSaved && <span className="text-xs text-[#023DFF] font-medium">Lanjutkan</span>}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#CBD5E1] group-hover:text-[#023DFF] transition-colors">
            <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>
    )
  }

  function FailedWeeklyCard({ m }: { m: typeof MILESTONES[0] }) {
    const carryOverReq = extensionRequests.find(
      r => r.flId === flId && r.milestoneId === m.id && r.type === 'weekly-carryover'
    )
    if (carryOverReq?.status === 'approved') return null

    return (
      <div className="bg-[#F8FAFC] rounded-xl border border-[#E1E7EF] px-4 py-3 flex items-start gap-3 opacity-60">
        <div className="w-5 h-5 rounded border-2 bg-[#CBD5E1] border-[#CBD5E1] flex-shrink-0 flex items-center justify-center mt-0.5">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#65758B]">{m.name}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-0">
        <h1 className="text-2xl font-bold text-[#0F1729]">Daftar Tugas</h1>
        <button
          onClick={() => setShowHistory(h => !h)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-semibold transition-colors ${
            showHistory
              ? 'bg-[#E5F2FF] text-[#023DFF]'
              : 'text-[#65758B] hover:text-[#0F1729] hover:bg-[#F1F5F9]'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 2a5.5 5.5 0 1 0 0 11A5.5 5.5 0 0 0 7.5 2z" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7.5 4.5V7.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.5 2.5 1 1M12.5 2.5 14 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Riwayat
        </button>
      </div>

      {showHistory ? (
        <div className="mt-5">
          <HistoryList history={history} />
        </div>
      ) : (
      <>
      {/* Tabs */}
      <div className="flex border-b border-[#E1E7EF] -mx-4 md:-mx-8 px-4 md:px-8 mt-5 mb-6">
        {([
          { key: 'aktif', label: 'Aktif', badge: activeCount > 0 ? activeCount : null },
          { key: 'mendatang', label: 'Akan Datang', badge: upcomingItems.length > 0 ? upcomingItems.length : null },
        ] as const).map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 h-[54px] px-2 text-sm font-semibold border-b-[3px] -mb-px transition-colors ${
              tab === key
                ? 'text-[#023DFF] border-[#023DFF]'
                : 'text-[#65758B] border-transparent hover:text-[#0F1729] hover:border-[#CBD5E1]'
            }`}
          >
            {label}
            {badge !== null && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#65758B]">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Aktif ── */}
      {tab === 'aktif' && (
        <>
          {/* Checklist Harian */}
          {todayDailyMilestones.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-5 w-1 rounded-full bg-[#0F1729] flex-shrink-0" />
                <h2 className="text-base font-bold text-[#0F1729]">Tugas Harian</h2>
              </div>
              <div className="space-y-2">
                {todayDailyMilestones.map(m => (
                  <DailyCard key={m.id} milestoneId={m.id} name={m.name} />
                ))}
              </div>
            </div>
          )}

          {/* Checklist Mingguan */}
          {currentWeeklyModules.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <span className="h-5 w-1 rounded-full bg-[#023DFF] flex-shrink-0" />
                <h2 className="text-base font-bold text-[#0F1729]">Tugas Mingguan</h2>
              </div>
              {weeklyDeadline && (
                <p className="text-sm text-[#65758B] mb-3">
                  Selesaikan sebelum <span className="font-semibold text-[#0F1729]">{weeklyDeadline}</span>
                </p>
              )}
              <div className="space-y-2">
                {currentWeeklyModules.map(m => {
                  const isCarryOver = isWeek2 && failedWeek1.some(f => f.id === m.id)
                  return <WeeklyCard key={m.id} m={m} isCarryOver={isCarryOver} />
                })}
              </div>
            </div>
          )}

          {/* Divider before failed modules */}
          {failedWeek1.some(m =>
            !extensionRequests.some(r => r.flId === flId && r.milestoneId === m.id && r.type === 'weekly-carryover' && r.status === 'approved')
          ) && <hr className="border-[#E1E7EF] mb-6" />}

          {/* Failed week 1 modules (pending / rejected carry-over) */}
          {failedWeek1.some(m =>
            !extensionRequests.some(r => r.flId === flId && r.milestoneId === m.id && r.type === 'weekly-carryover' && r.status === 'approved')
          ) && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-5 w-1 rounded-full bg-[#DC2626] flex-shrink-0" />
                <h2 className="text-base font-bold text-[#0F1729]">Modul Tidak Selesai — Level 1</h2>
              </div>
              <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg px-4 py-2.5 mb-3">
                <p className="text-xs text-[#B91C1C]">Kamu belum menyelesaikan modul berikut tepat waktu. Menunggu keputusan Kanit untuk langkah selanjutnya.</p>
              </div>
              <div className="space-y-2">
                {failedWeek1.map(m => (
                  <FailedWeeklyCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          )}

          {/* Failed week 2 modules (assessment day) */}
          {failedWeek2.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-5 w-1 rounded-full bg-[#DC2626] flex-shrink-0" />
                <h2 className="text-base font-bold text-[#0F1729]">Modul Tidak Selesai — Level 2</h2>
              </div>
              <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg px-4 py-2.5 mb-3">
                <p className="text-xs text-[#B91C1C]">Kamu belum menyelesaikan modul berikut tepat waktu. Menunggu keputusan Kanit untuk langkah selanjutnya.</p>
              </div>
              <div className="space-y-2">
                {failedWeek2.map(m => (
                  <FailedWeeklyCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          )}

          {/* Assessment day */}
          {isAssessmentDay && failedWeek2.length === 0 && (
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-10 mb-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center text-xl">🎓</div>
              <div>
                <p className="font-semibold text-[#0F1729]">Hari Ujian Akhir</p>
                <p className="text-sm text-[#65758B] mt-1 max-w-xs">Semua checklist sudah selesai. Kerjakan ujian akhir OJT.</p>
              </div>
              <Link to="/fl/assessment" className="h-9 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg flex items-center transition-colors">
                Mulai Ujian Akhir →
              </Link>
            </div>
          )}

        </>
      )}

      {/* ── Tab: Mendatang ── */}
      {tab === 'mendatang' && (
        <div className="space-y-2">
          {upcomingItems.length > 0 ? upcomingItems.map(({ milestone: m, lockReason }) => (
            <div key={m.id} className="bg-white rounded-xl border border-[#E1E7EF] px-4 py-3 flex items-center gap-3">
              <div className="w-5 h-5 rounded border-2 border-[#E1E7EF] flex-shrink-0 flex items-center justify-center bg-[#F8FAFC]">
                <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
                  <rect x="0.7" y="4" width="7.6" height="6.3" rx="1.3" stroke="#CBD5E1" strokeWidth="1.4"/>
                  <path d="M2.5 4V2.8a2 2 0 1 1 4 0V4" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#94A3B8]">{m.name}</p>
                <p className="text-xs text-[#CBD5E1] mt-0.5">{lockReason}</p>
              </div>
            </div>
          )) : (
            <div className="bg-[#F8FAFC] rounded-xl p-8 text-center">
              <p className="text-sm text-[#94A3B8]">Tidak ada checklist mendatang.</p>
            </div>
          )}
        </div>
      )}
      </>
    )}
    </div>
  )
}

function HistoryList({ history }: { history: DailyChecklist[] }) {
  const groups: Record<string, DailyChecklist[]> = {}
  for (const cl of history) {
    const milId = cl.milestoneId ?? (cl.tasks?.[0] ? TASK_TO_MILESTONE[cl.tasks[0].taskId] : null) ?? '__other'
    if (!groups[milId]) groups[milId] = []
    groups[milId].push(cl)
  }
  const entries = Object.entries(groups).map(([milId, cls]) => {
    const name = milId !== '__other'
      ? MILESTONES.find(m => m.id === milId)?.shortName ?? milId
      : cls[0]?.tasks?.map(t => t.taskName).join(', ') ?? 'Checklist'
    const scores: number[] = cls.flatMap(cl =>
      cl.tasks?.flatMap(t => t.kanitScore !== undefined ? [t.kanitScore] : []) ??
      (cl.kanitScore !== undefined ? [cl.kanitScore] : [])
    )
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    const submittedCount = cls.filter(cl => cl.status === 'submitted').length
    const passedCount = cls.filter(cl => cl.status === 'scored' && cl.passed === true).length
    const failedCount = cls.filter(cl => cl.status === 'scored' && cl.passed === false).length
    const latestSubmit = cls.reduce((latest, cl) => (cl.submittedAt ?? '') > latest ? (cl.submittedAt ?? '') : latest, '')
    return { milId, name, avgScore, submittedCount, passedCount, failedCount, latestSubmit }
  }).sort((a, b) => b.latestSubmit.localeCompare(a.latestSubmit))

  if (entries.length === 0) {
    return (
      <div className="bg-[#F8FAFC] rounded-xl border border-[#E1E7EF] px-5 py-12 text-center">
        <p className="text-sm text-[#94A3B8]">Belum ada tugas yang diselesaikan.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
      {entries.map((g, idx) => (
        <Link
          key={g.milId}
          to={g.milId !== '__other' ? `/fl/checklist/module/${g.milId}` : '#'}
          className={`flex items-center gap-4 px-5 py-4 transition-colors ${
            g.milId !== '__other' ? 'hover:bg-[#F8FAFC] cursor-pointer' : 'cursor-default'
          } ${idx < entries.length - 1 ? 'border-b border-[#E1E7EF]' : ''}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F1729]">{g.name}</p>
            <p className="text-xs text-[#65758B] mt-0.5">
              {[
                g.submittedCount > 0 ? `${g.submittedCount} sesi disubmit` : '',
                g.passedCount > 0 ? `${g.passedCount} sesi lulus` : '',
                g.failedCount > 0 ? `${g.failedCount} sesi gagal` : '',
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {g.avgScore !== null && (
              <span className={`text-base font-black ${avgColor(g.avgScore)}`}>{g.avgScore}</span>
            )}
            {g.milId !== '__other' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#CBD5E1] flex-shrink-0">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
