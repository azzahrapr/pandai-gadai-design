import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES, DAILY_TASKS } from '../../data/mockData'
import type { FLProfile, TaskConfirmation, DailyChecklist } from '../../types'

const BASE_SCHEDULE: Record<string, { fromDay: number; toDay: number }> = {
  'closing-cabang':     { fromDay: 1,  toDay: 3  },
  'opening-cabang':     { fromDay: 4,  toDay: 7  },
  'personal-grooming':  { fromDay: 1,  toDay: 14 },
  'pelayanan-nasabah':  { fromDay: 8,  toDay: 13 },
  'customer-service-wa':{ fromDay: 8,  toDay: 13 },
}

export default function FLSubmitTask() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    currentUser,
    getItemConfirmations,
    submitTaskConfirmation,
    submitChecklist,
    getFlChecklists,
    extensionRequests,
  } = useApp()
  const profile = currentUser!.profile as FLProfile

  const milestone = MILESTONES.find(m => m.id === id)
  const dailyTask  = DAILY_TASKS.find(t => t.id === id)
  const isIndividual = milestone?.submissionType === 'individual'
  const baseSchedule = id ? BASE_SCHEDULE[id] : null

  // ── Single-submission state ─────────────────────────────────
  const draftKey = `checklist-draft-${currentUser!.id}-${id ?? 'unknown'}-d${profile.currentDay}`
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    if (isIndividual) return new Set()
    try {
      const saved = localStorage.getItem(draftKey)
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>()
    } catch { return new Set<string>() }
  })
  const [justSubmittedSingle, setJustSubmittedSingle] = useState(false)
  const [justSubmittedPassed, setJustSubmittedPassed] = useState(false)
  const [singleDraftSaved, setSingleDraftSaved] = useState(false)

  // ── Multiple-submission state ───────────────────────────────
  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const [refleksi,     setRefleksi]     = useState<Record<string, string>>({})
  const [justSubmitted,setJustSubmitted]= useState<Record<string, number>>({})
  const [showFormFor,  setShowFormFor]  = useState<Record<string, boolean>>({})

  // ── Guard ───────────────────────────────────────────────────
  if (!milestone) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-sm text-[#65758B]">Modul tidak ditemukan.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#023DFF] hover:underline mt-2 inline-block">← Kembali</button>
      </div>
    )
  }

  // ── Daily-schedule logic (single only) ─────────────────────
  const approvedRedoCount = id
    ? extensionRequests.filter(
        r => r.flId === currentUser!.id && r.milestoneId === id
          && r.type === 'daily-redo' && r.status === 'approved'
      ).length
    : 0
  const effectiveToDay = (baseSchedule?.toDay ?? 0) + approvedRedoCount
  const isActiveToday  = !baseSchedule
    || (profile.currentDay >= baseSchedule.fromDay && profile.currentDay <= effectiveToDay)

  const allChecklists  = getFlChecklists(currentUser!.id)
  const todayChecklist = allChecklists.find(c =>
    c.day === profile.currentDay &&
    (c.status === 'submitted' || c.status === 'scored') &&
    c.tasks?.some(t => t.taskId === id)
  )
  const submittedToday = !!todayChecklist

  const isAlreadyDone = submittedToday || justSubmittedSingle
  const submittedCheckedIds: Set<string> = justSubmittedSingle
    ? new Set(checkedIds)
    : new Set(todayChecklist?.tasks?.find(t => t.taskId === id)?.completedItemIds ?? [])
  const passedResult = justSubmittedSingle
    ? justSubmittedPassed
    : dailyTask ? submittedCheckedIds.size >= dailyTask.items.length : false

  // ── Single-submission handlers ──────────────────────────────
  function toggleItem(itemId: string) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  function saveSingleDraft() {
    localStorage.setItem(draftKey, JSON.stringify([...checkedIds]))
    setSingleDraftSaved(true)
    setTimeout(() => setSingleDraftSaved(false), 2000)
  }

  function handleSingleSubmit() {
    if (!dailyTask || !id) return
    const passed = checkedIds.size === dailyTask.items.length
    const now    = new Date().toISOString()
    const checklist: DailyChecklist = {
      id: `cl-daily-${currentUser!.id}-d${profile.currentDay}-${id}`,
      day: profile.currentDay,
      date: now.slice(0, 10),
      flId: currentUser!.id,
      milestoneId: id,
      passed,
      tasks: [{
        taskId: id,
        taskName: dailyTask.name,
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
    setJustSubmittedSingle(true)
  }

  // ── Multiple-submission logic ───────────────────────────────
  const itemConfirmationCounts = isIndividual
    ? Object.fromEntries(
        milestone.checklistItems.map(item => [
          item.id,
          getItemConfirmations(currentUser!.id, milestone.id, item.id).length,
        ])
      )
    : {}

  const confirmedCount = isIndividual
    ? milestone.checklistItems.filter(item => {
        const target = item.target ?? 1
        return (itemConfirmationCounts[item.id] ?? 0) >= target
      }).length
    : 0
  const isAllDone = confirmedCount === milestone.checklistItems.length

  function handleMultiSubmit(itemId: string) {
    const item = milestone.checklistItems.find(i => i.id === itemId)
    if (!item) return
    const now = new Date().toISOString()
    const confirmation: TaskConfirmation = {
      id: `confirm-${currentUser!.id}-${milestone.id}-${itemId}-${now}`,
      flId: currentUser!.id,
      milestoneId: milestone.id,
      itemId,
      itemText: item.text,
      catatan: refleksi[itemId]?.trim() || undefined,
      submittedAt: now,
      day: profile.currentDay,
    }
    submitTaskConfirmation(confirmation)
    const newCount = (itemConfirmationCounts[itemId] ?? 0) + 1
    setJustSubmitted(prev => ({ ...prev, [itemId]: newCount }))
    setRefleksi(prev => ({ ...prev, [itemId]: '' }))
    setShowFormFor(prev => ({ ...prev, [itemId]: false }))
  }

  // ── Shared header ───────────────────────────────────────────
  const header = (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => navigate(-1)}
        className="w-8 h-8 rounded-full bg-white border border-[#E1E7EF] flex items-center justify-center hover:border-[#023DFF] hover:text-[#023DFF] transition-colors flex-shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2.5L5 7l4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-[#0F1729] leading-tight">Submit Latihan</h1>
        <p className="text-sm text-[#65758B] mt-0.5 truncate">{milestone.name}</p>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════
  // SINGLE SUBMISSION
  // ════════════════════════════════════════════════════════════
  if (!isIndividual) {
    if (!dailyTask) {
      return (
        <div className="p-4 md:p-8 max-w-xl">
          {header}
          <div className="bg-[#F8FAFC] rounded-xl border border-[#E1E7EF] p-6 text-center">
            <p className="text-sm text-[#65758B]">Halaman submission untuk modul ini belum tersedia.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="p-4 md:p-8 max-w-xl">
        {header}

        {!isActiveToday ? (
          <div className="bg-[#F8FAFC] rounded-xl border border-[#E1E7EF] p-6 text-center">
            <p className="text-2xl mb-2">📅</p>
            <p className="text-sm font-semibold text-[#0F1729]">Checklist ini tidak aktif hari ini</p>
            <p className="text-xs text-[#65758B] mt-1">
              Aktif dari hari ke-{baseSchedule?.fromDay} sampai hari ke-{effectiveToDay}
            </p>
            <button onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-[#023DFF] hover:underline">← Kembali</button>
          </div>
        ) : isAlreadyDone ? (
          /* Result screen */
          <div className="space-y-4">
            <div className={`rounded-xl border p-5 ${passedResult ? 'bg-[#F0FDF4] border-[#16A34A]/20' : 'bg-[#FEF2F2] border-[#DC2626]/20'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${passedResult ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}>
                  {passedResult ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8l3 3 6-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3L3 11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${passedResult ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                    {passedResult ? 'Lulus — semua item selesai' : 'Tidak lulus — ada item yang belum dicentang'}
                  </p>
                  <p className={`text-xs mt-1 ${passedResult ? 'text-[#15803D]/70' : 'text-[#B91C1C]/70'}`}>
                    {passedResult ? 'Checklist hari ini berhasil kamu selesaikan.' : 'Checklist ini akan dinilai berdasarkan item yang sudah dicentang.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
              <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0F1729]">{dailyTask.name}</p>
                  <p className="text-xs text-[#65758B] mt-0.5">{submittedCheckedIds.size}/{dailyTask.items.length} item dikerjakan</p>
                </div>
                <Link
                  to={`/fl/milestones/${id}`}
                  className="flex-shrink-0 h-[30px] px-2 rounded-lg inline-flex items-center gap-1 text-sm font-semibold text-[#023DFF] hover:bg-[#E5F2FF] transition-colors"
                >
                  Baca Materi
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
              <div className="px-5 py-4 space-y-3">
                {dailyTask.items.map(item => {
                  const isChecked = submittedCheckedIds.has(item.id)
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${isChecked ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1]'}`}>
                        {isChecked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <p className="text-sm leading-snug text-[#0F1729]">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Checklist form */
          <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0F1729]">{dailyTask.name}</p>
                <p className="text-xs text-[#65758B] mt-0.5">{checkedIds.size}/{dailyTask.items.length} item dikerjakan</p>
              </div>
              <Link
                to={`/fl/milestones/${id}`}
                className="flex-shrink-0 h-[30px] px-2 rounded-lg inline-flex items-center gap-1 text-sm font-semibold text-[#023DFF] hover:bg-[#E5F2FF] transition-colors"
              >
                Baca Materi
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            <div className="px-5 py-4 space-y-3">
              {dailyTask.items.map(item => {
                const isChecked = checkedIds.has(item.id)
                return (
                  <button key={item.id} onClick={() => toggleItem(item.id)} className="w-full flex items-start gap-3 text-left cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${isChecked ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1] group-hover:border-[#023DFF]'}`}>
                      {isChecked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <p className="text-sm leading-snug text-[#0F1729]">{item.text}</p>
                  </button>
                )
              })}
            </div>

            <div className="px-5 pb-5 border-t border-[#E1E7EF] pt-4">
              <div className="flex gap-2">
                <button
                  onClick={saveSingleDraft}
                  className={`flex-1 h-10 rounded-lg font-semibold text-sm border transition-colors ${
                    singleDraftSaved
                      ? 'border-[#16A34A] text-[#15803D] bg-[#F0FDF4]'
                      : 'border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF] hover:text-[#023DFF]'
                  }`}
                >
                  {singleDraftSaved ? 'Tersimpan ✓' : 'Simpan Draft'}
                </button>
                <button
                  onClick={handleSingleSubmit}
                  className="flex-1 h-10 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // MULTIPLE SUBMISSION
  // ════════════════════════════════════════════════════════════
  return (
    <div className="p-4 md:p-8 max-w-2xl">
      {header}

      {isAllDone && (
        <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2L8 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#15803D]">Semua latihan sudah selesai</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#65758B]">Daftar Latihan</p>
        <span className="text-sm tabular-nums text-[#65758B]">{confirmedCount}/{milestone.checklistItems.length}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
        {milestone.checklistItems.map((item, idx) => {
          const target      = item.target ?? 1
          const baseCount   = itemConfirmationCounts[item.id] ?? 0
          const currentCount= justSubmitted[item.id] ?? baseCount
          const done        = currentCount >= target
          const inProgress  = currentCount > 0 && !done
          const isExpanded  = expandedId === item.id

          return (
            <div key={item.id} className={idx < milestone.checklistItems.length - 1 ? 'border-b border-[#F1F5F9]' : ''}>
              <button
                onClick={() => {
                  if (isExpanded) setShowFormFor(prev => ({ ...prev, [item.id]: false }))
                  setExpandedId(isExpanded ? null : item.id)
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors text-left"
              >
                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${done ? 'bg-[#16A34A] border-[#16A34A]' : 'border-[#CBD5E1]'}`}>
                  {done && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center h-4 px-2 mb-0.5 rounded-full text-[10px] font-bold border ${
                    done       ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]'
                    : inProgress? 'bg-[#FEFDEA] border-[#E0A200] text-[#B27202]'
                    : 'bg-[#F8FAFC] border-[#E1E7EF] text-[#94A3B8]'
                  }`}>
                    Target: {currentCount}/{target} latihan
                  </span>
                  <p className={`text-sm font-semibold leading-snug ${done ? 'text-[#65758B]' : 'text-[#0F1729]'}`}>{item.text}</p>
                </div>
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  className={`flex-shrink-0 text-[#CBD5E1] transition-transform duration-200 ${isExpanded ? '-rotate-90' : 'rotate-90'}`}
                >
                  <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#F1F5F9]">
                  {item.description && (
                    <p className="text-sm text-[#65758B] leading-relaxed pt-3">{item.description}</p>
                  )}

                  {currentCount > 0 && (
                    <div className={`rounded-xl px-4 py-3 flex items-start gap-3 border ${
                      done ? 'bg-[#F0FDF4] border-[#16A34A]/20' : 'bg-[#EFF6FF] border-[#023DFF]/20'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2.5L8 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${done ? 'text-[#15803D]' : 'text-[#1E40AF]'}`}>
                          {`Latihan ${currentCount} dari ${target} berhasil disubmit.`}
                        </p>
                        {!done && (
                          <Link
                            to={`/fl/checklist/module/${milestone.id}`}
                            className="text-xs text-[#023DFF] font-medium hover:underline mt-0.5 inline-block"
                          >
                            Lihat Riwayat →
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {done ? (
                    <Link
                      to={`/fl/checklist/module/${milestone.id}`}
                      className="w-full h-10 flex items-center justify-center bg-white border border-[#E1E7EF] hover:bg-[#F8FAFC] text-[#0F1729] font-semibold text-sm rounded-lg transition-colors"
                    >
                      Lihat Riwayat →
                    </Link>
                  ) : inProgress && !showFormFor[item.id] ? (
                    <button
                      onClick={() => setShowFormFor(prev => ({ ...prev, [item.id]: true }))}
                      className="w-full h-10 flex items-center justify-center gap-1.5 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
                    >
                      Submit Lagi
                    </button>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                          Refleksi <span className="text-[#DC2626]">*</span>
                        </label>
                        <p className="text-xs text-[#65758B] mb-2">Apa yang sudah kamu lakukan dengan baik, atau yang perlu kamu perbaiki dari task ini?</p>
                        <textarea
                          value={refleksi[item.id] ?? ''}
                          onChange={e => setRefleksi(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Tulis refleksimu di sini..."
                          rows={3}
                          className="w-full border border-[#CBD5E1] rounded-lg px-4 py-3 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none focus:border-[#023DFF] transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      <button
                        onClick={() => handleMultiSubmit(item.id)}
                        disabled={!refleksi[item.id]?.trim()}
                        className={`w-full h-10 font-bold text-sm rounded-lg transition-colors ${
                          refleksi[item.id]?.trim()
                            ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
                            : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
                        }`}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
