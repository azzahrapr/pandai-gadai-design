import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { DAILY_TASKS, MILESTONES } from '../../data/mockData'
import type { FLProfile, DailyChecklist } from '../../types'

const BASE_SCHEDULE: Record<string, { fromDay: number; toDay: number }> = {
  'closing-cabang':     { fromDay: 1,  toDay: 3  },
  'opening-cabang':    { fromDay: 4,  toDay: 7  },
  'personal-grooming': { fromDay: 1,  toDay: 14 },
  'pelayanan-nasabah': { fromDay: 8,  toDay: 13 },
  'customer-service-wa': { fromDay: 8, toDay: 13 },
}

// Opening & Closing can request a redo from Kanit on fail

export default function FLDailyChecklist() {
  const { milestoneId } = useParams<{ milestoneId: string }>()
  const { currentUser, submitChecklist, getFlChecklists, extensionRequests } = useApp()
  const profile = currentUser!.profile as FLProfile
  const currentDay = profile.currentDay

  const task = DAILY_TASKS.find(t => t.id === milestoneId)
  const milestone = MILESTONES.find(m => m.id === milestoneId)
  const baseSchedule = milestoneId ? BASE_SCHEDULE[milestoneId] : null
  const allChecklists = getFlChecklists(currentUser!.id)

  // Effective toDay: base + approved Kanit redos + missed days (OC only, auto-extended)
  const approvedRedoCount = milestoneId
    ? extensionRequests.filter(
        r => r.flId === currentUser!.id && r.milestoneId === milestoneId
          && r.type === 'daily-redo' && r.status === 'approved'
      ).length
    : 0

  const effectiveToDay = (baseSchedule?.toDay ?? 0) + approvedRedoCount
  const isActiveToday = !!(baseSchedule && currentDay >= baseSchedule.fromDay && currentDay <= effectiveToDay)
  const todayChecklist = allChecklists.find(c =>
    c.day === currentDay &&
    (c.status === 'submitted' || c.status === 'scored') &&
    c.tasks?.some(t => t.taskId === milestoneId)
  )
  const submittedToday = !!todayChecklist

  const navigate = useNavigate()

  const draftKey = `checklist-draft-${currentUser!.id}-${milestoneId ?? 'unknown'}-d${currentDay}`

  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`checklist-draft-${currentUser!.id}-${milestoneId ?? 'unknown'}-d${currentDay}`)
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>()
    } catch {
      return new Set<string>()
    }
  })
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [justSubmittedPassed, setJustSubmittedPassed] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)


  function saveDraft() {
    localStorage.setItem(draftKey, JSON.stringify([...checkedIds]))
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2000)
  }

  function toggleItem(itemId: string) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  function handleSubmit() {
    if (!milestoneId || !task) return
    const passed = checkedIds.size === task.items.length
    const now = new Date().toISOString()
    const checklist: DailyChecklist = {
      id: `cl-daily-${currentUser!.id}-d${currentDay}-${milestoneId}`,
      day: currentDay,
      date: now.slice(0, 10),
      flId: currentUser!.id,
      milestoneId,
      passed,
      tasks: [{
        taskId: milestoneId,
        taskName: task.name,
        completedItemIds: [...checkedIds],
        reflection: '',
        submittedAt: now,
      }],
      status: 'submitted',
      submittedAt: now,
    }
    submitChecklist(checklist)
    localStorage.removeItem(draftKey)
    setJustSubmittedPassed(passed)
    setJustSubmitted(true)
  }

  if (!task || !milestone) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-sm text-[#65758B]">Module tidak ditemukan.</p>
        <Link to="/fl/checklist" className="text-sm text-[#023DFF] hover:underline mt-2 inline-block">← Kembali ke Checklist</Link>
      </div>
    )
  }

  // Determine pass/fail for already-submitted state
  const passedResult = justSubmitted
    ? justSubmittedPassed
    : todayChecklist?.passed

  const isAlreadyDone = submittedToday || justSubmitted

  const submittedCheckedIds: Set<string> = justSubmitted
    ? new Set(checkedIds)
    : new Set(todayChecklist?.tasks?.find(t => t.taskId === milestoneId)?.completedItemIds ?? [])

  return (
    <div className="p-4 md:p-8 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white border border-[#E1E7EF] flex items-center justify-center hover:border-[#023DFF] hover:text-[#023DFF] transition-colors flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2.5L5 7l4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#0F1729]">Submit Tugas</h1>
      </div>

      {!isActiveToday ? (
        <div className="bg-[#F8FAFC] rounded-xl border border-[#E1E7EF] p-6 text-center">
          <p className="text-2xl mb-2">📅</p>
          <p className="text-sm font-semibold text-[#0F1729]">Checklist ini tidak aktif hari ini</p>
          <p className="text-xs text-[#65758B] mt-1">
            Aktif dari hari ke-{baseSchedule?.fromDay} sampai hari ke-{effectiveToDay}
          </p>
          <Link to="/fl/checklist" className="mt-4 inline-block text-sm font-semibold text-[#023DFF] hover:underline">← Kembali ke Checklist</Link>
        </div>
      ) : isAlreadyDone ? (
        /* ── Result screen ── */
        <div className="space-y-4">
          <div className={`rounded-xl border p-5 ${
            passedResult
              ? 'bg-[#F0FDF4] border-[#16A34A]/20'
              : 'bg-[#FEF2F2] border-[#DC2626]/20'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                passedResult ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}>
                {passedResult ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8l3 3 6-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3l8 8M11 3L3 11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${passedResult ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                  {passedResult ? 'Lulus — semua item selesai' : 'Tidak lulus — ada item yang belum dicentang'}
                </p>
                <p className={`text-xs mt-1 ${passedResult ? 'text-[#15803D]/70' : 'text-[#B91C1C]/70'}`}>
                  {passedResult
                    ? 'Checklist hari ini berhasil kamu selesaikan.'
                    : 'Checklist ini akan dinilai berdasarkan item yang sudah dicentang.'}
                </p>
              </div>
            </div>
          </div>

          {/* Submitted items */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E1E7EF]">
              <p className="font-bold text-[#0F1729]">{task.name}</p>
              <p className="text-[11px] font-semibold text-[#65758B] uppercase tracking-wide mt-1">
                Item diselesaikan ({submittedCheckedIds.size}/{task.items.length})
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {task.items.map(item => {
                const isChecked = submittedCheckedIds.has(item.id)
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                      isChecked ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1]'
                    }`}>
                      {isChecked && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <p className="text-sm leading-snug text-[#0F1729]">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── Checklist form ── */
        <><div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#0F1729]">{task.name}</p>
              <p className="text-xs text-[#65758B] mt-0.5">{checkedIds.size}/{task.items.length} item dikerjakan</p>
            </div>
            <Link
              to={`/fl/milestones/${milestoneId}`}
              className="flex-shrink-0 h-[30px] px-2 rounded-lg inline-flex items-center gap-1 text-sm font-semibold text-[#023DFF] hover:bg-[#E5F2FF] transition-colors"
            >
              Baca Materi
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Checklist items */}
          <div className="px-5 py-4 space-y-3">
            {task.items.map(item => {
              const isChecked = checkedIds.has(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-start gap-3 text-left cursor-pointer group"
                >
                  <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    isChecked ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1] group-hover:border-[#023DFF]'
                  }`}>
                    {isChecked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm leading-snug text-[#0F1729]">
                    {item.text}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Footer: warning + submit */}
          <div className="px-5 pb-5 border-t border-[#E1E7EF] pt-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={saveDraft}
                className={`flex-1 h-10 rounded-lg font-semibold text-sm border transition-colors ${
                  draftSaved
                    ? 'border-[#16A34A] text-[#15803D] bg-[#F0FDF4]'
                    : 'border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF] hover:text-[#023DFF]'
                }`}
              >
                {draftSaved ? 'Tersimpan ✓' : 'Simpan Draft'}
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 h-10 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/fl/checklist')}
            className="h-9 px-6 text-sm font-semibold text-[#94A3B8] hover:text-[#DC2626] transition-colors"
          >
            Batalkan sesi
          </button>
        </div></>
      )}
    </div>
  )
}
