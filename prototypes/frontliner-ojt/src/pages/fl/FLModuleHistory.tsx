import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES, DAILY_TASKS } from '../../data/mockData'
import type { FLProfile } from '../../types'

const DAILY_SCHEDULE: Record<string, { fromDay: number; toDay: number }> = {
  'closing-cabang': { fromDay: 1, toDay: 3 },
  'opening-cabang': { fromDay: 4, toDay: 6 },
}
const OC_IDS = new Set(Object.keys(DAILY_SCHEDULE))

const PENAKSIRAN_MILESTONE_IDS = ['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb']

const MILESTONE_TASK_MAP: Record<string, string[]> = {
  'closing-cabang': ['closing-cabang'],
  'opening-cabang': ['opening-cabang'],
  'personal-grooming': ['personal-grooming'],
  'personal-grooming-l2': ['personal-grooming-l2'],
  'pengenalan-produk': ['pengenalan-produk'],
  'canvassing': ['canvassing'],
  'cash-management': ['cash-management'],
  'sop-administrasi': ['sop-administrasi'],
  'packing-sealing': ['packing-sealing'],
  'offloading': ['offloading'],
  'pelayanan-nasabah': ['pelayanan-nasabah'],
  'customer-service-wa': ['customer-service-wa'],
  'penaksiran-elektronik': ['penaksiran-elektronik'],
  'penaksiran-emas': ['penaksiran-emas'],
  'penaksiran-bpkb': ['penaksiran-bpkb'],
}

function scoreColor(s: number | null) {
  if (s === null) return { text: 'text-[#CBD5E1]', bg: 'bg-[#F8FAFC] border border-[#E1E7EF]', bar: 'bg-[#E1E7EF]' }
  if (s >= 85) return { text: 'text-[#15803D]', bg: 'bg-[#F0FDF4] border border-[#16A34A]/20', bar: 'bg-[#16A34A]' }
  if (s >= 75) return { text: 'text-[#B27202]', bg: 'bg-[#FEFDEA] border border-[#E0A200]/20', bar: 'bg-[#D97706]' }
  return { text: 'text-[#B91C1C]', bg: 'bg-[#FEF2F2] border border-[#DC2626]/20', bar: 'bg-[#DC2626]' }
}

export default function FLModuleHistory() {
  const { milestoneId } = useParams<{ milestoneId: string }>()
  const { currentUser, getFlChecklists, extensionRequests } = useApp()
  const navigate = useNavigate()
  const profile = currentUser!.profile as FLProfile
  const flId = currentUser!.id

  const milestone = MILESTONES.find(m => m.id === milestoneId)
  const taskIds = milestoneId ? (MILESTONE_TASK_MAP[milestoneId] ?? []) : []
  const taskDefs = DAILY_TASKS.filter(t => taskIds.includes(t.id))

  const isPenaksiran = milestoneId ? PENAKSIRAN_MILESTONE_IDS.includes(milestoneId) : false
  const sessions = getFlChecklists(currentUser!.id)
    .filter(cl =>
      (cl.status === 'submitted' || cl.status === 'scored') &&
      (isPenaksiran
        ? cl.milestoneId === milestoneId
        : cl.tasks?.some(t => taskIds.includes(t.taskId)))
    )
    .sort((a, b) => a.day !== b.day ? a.day - b.day : (a.submittedAt ?? '').localeCompare(b.submittedAt ?? ''))

  if (!milestone) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#65758B]">Modul tidak ditemukan</p>
          <Link to="/fl/checklist" className="mt-4 inline-flex items-center gap-2 text-sm text-[#023DFF] hover:underline">← Kembali</Link>
        </div>
      </div>
    )
  }

  // Score per session = avg of task-level kanitScores in that session
  const sessionScores = sessions.map(cl => {
    const relevant = cl.tasks?.filter(t => taskIds.includes(t.taskId)) ?? []
    const scored = relevant.filter(t => t.kanitScore !== undefined)
    if (scored.length === 0) return null
    return Math.round(scored.reduce((sum, t) => sum + t.kanitScore!, 0) / scored.length)
  })

  const scoredList = sessionScores.filter((s): s is number => s !== null)
  const avg = scoredList.length > 0 ? Math.round(scoredList.reduce((a, b) => a + b, 0) / scoredList.length) : null
  const avgC = scoreColor(avg)

  const lastScored = [...sessionScores].reverse().find(s => s !== null) ?? null
  const prevScored = [...sessionScores].reverse().slice(1).find(s => s !== null) ?? null
  const trend = lastScored !== null && prevScored !== null ? lastScored - prevScored : null

  // Missed days (OC only): past days within active range with no submission
  const missedDays: number[] = []
  if (milestoneId && OC_IDS.has(milestoneId)) {
    const sched = DAILY_SCHEDULE[milestoneId]
    const allChecklists = getFlChecklists(flId)
    const approvedCount = extensionRequests.filter(
      r => r.flId === flId && r.milestoneId === milestoneId && r.type === 'daily-redo' && r.status === 'approved'
    ).length
    const effectiveTo = sched.toDay + approvedCount
    for (let day = sched.fromDay; day < profile.currentDay && day <= effectiveTo; day++) {
      const submitted = allChecklists.some(c =>
        c.day === day &&
        (c.status === 'submitted' || c.status === 'scored') &&
        c.tasks?.some(t => t.taskId === milestoneId)
      )
      if (!submitted) missedDays.push(day)
    }
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#65758B] hover:text-[#023DFF] transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Kembali
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Riwayat Tugas</h1>
          <p className="text-sm text-[#65758B] mt-0.5">{milestone.name}</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {sessions.length} sesi · Hari ke-{profile.currentDay} dari 14
          </p>
        </div>
        {avg !== null && (
          <div className={`rounded-xl px-4 py-3 text-right ${avgC.bg}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#65758B] mb-0.5">Rata-rata</p>
            <p className={`text-3xl font-black ${avgC.text}`}>{avg}</p>
          </div>
        )}
      </div>

      {/* Trend chart */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Tren Nilai</p>
            {trend !== null && (
              <span className={`text-xs font-bold flex items-center gap-1 ${
                trend > 0 ? 'text-[#15803D]' : trend < 0 ? 'text-[#B91C1C]' : 'text-[#65758B]'
              }`}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)} dari sesi sebelumnya
              </span>
            )}
          </div>
          <div className="flex items-end gap-1.5">
            {sessions.map((cl, idx) => {
              const s = sessionScores[idx]
              const c = scoreColor(s)
              const barH = s !== null ? Math.max(12, Math.round((s / 100) * 64)) : 6
              return (
                <div key={cl.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <span className={`text-[10px] font-bold tabular-nums ${c.text}`}>{s ?? '—'}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                    <div
                      className={`w-full rounded-t transition-all ${s !== null ? c.bar : 'bg-[#F1F5F9]'} ${s === null ? 'opacity-50' : ''}`}
                      style={{ height: barH }}
                    />
                  </div>
                  <span className="text-[9px] text-[#94A3B8] tabular-nums">S{idx + 1}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Session records */}
      {sessions.length === 0 && missedDays.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-12 text-center">
          <p className="text-[#94A3B8] text-sm">Belum ada riwayat untuk modul ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Missed days */}
          {missedDays.map(day => (
            <div key={`missed-${day}`} className="bg-white rounded-xl border border-[#DC2626]/25 overflow-hidden">
              <div className="px-5 py-3.5 bg-[#FEF2F2] border-b border-[#DC2626]/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2l6 6M8 2L2 8" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#B91C1C]">Hari ke-{day} — Tidak ada submission</p>
                  <p className="text-xs text-[#B91C1C]/60 mt-0.5">Kamu melewatkan checklist hari ini</p>
                </div>
                <span className="text-xs text-[#B27202] bg-[#FEFDEA] border border-[#E0A200]/20 rounded-lg px-2.5 py-1 flex-shrink-0">
                  ⏳ Menunggu Kanit
                </span>
              </div>
            </div>
          ))}

          {[...sessions].reverse().map((cl, revIdx) => {
            const sessionIdx = sessions.length - 1 - revIdx
            const sessionScore = sessionScores[sessionIdx]
            const c = scoreColor(sessionScore)
            const isScored = sessionScore !== null
            const relevantTasks = cl.tasks?.filter(t => taskIds.includes(t.taskId)) ?? []

            return (
              <div key={cl.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                {/* Session header */}
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.bg} ${c.text}`}>
                    {sessionIdx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0F1729]">Sesi {sessionIdx + 1}</p>
                    <p className="text-xs text-[#65758B]">Hari {cl.day} · {cl.date}</p>
                  </div>
                  {isScored ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-black ${c.text}`}>{sessionScore}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D]">Dinilai</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FEFDEA] text-[#B27202]">Menunggu nilai</span>
                  )}
                </div>

                {/* Tasks in this session */}
                <div className="divide-y divide-[#E1E7EF]">
                  {relevantTasks.map(taskRecord => {
                    const taskDef = taskDefs.find(t => t.id === taskRecord.taskId)
                    if (!taskDef) return null
                    const tc = scoreColor(taskRecord.kanitScore ?? null)
                    return (
                      <div key={taskRecord.taskId} className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#0F1729]">{taskDef.name}</p>
                          {taskRecord.kanitScore !== undefined && (
                            <span className={`text-sm font-bold ${tc.text}`}>{taskRecord.kanitScore}</span>
                          )}
                        </div>

                        {taskRecord.kanitNote && (
                          <div className={`rounded-lg px-4 py-3 ${tc.bg}`}>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#65758B] mb-1">Catatan Kanit</p>
                            <p className={`text-sm leading-relaxed italic ${tc.text}`}>"{taskRecord.kanitNote}"</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">
                            Item Diselesaikan ({taskRecord.completedItemIds.length}/{taskDef.items.length})
                          </p>
                          <div className="space-y-2">
                            {taskDef.items.map(item => {
                              const done = taskRecord.completedItemIds.includes(item.id)
                              return (
                                <div key={item.id} className="flex items-start gap-2.5">
                                  <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    done ? 'bg-[#023DFF]' : 'bg-[#F1F5F9] border border-[#CBD5E1]'
                                  }`}>
                                    {done && (
                                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                        <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>
                                  <p className={`text-sm leading-snug ${done ? 'text-[#0F1729]' : 'text-[#94A3B8]'}`}>{item.text}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {taskRecord.reflection && (
                          <div className="pt-3 border-t border-[#E1E7EF]">
                            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-1.5">Refleksi</p>
                            <p className="text-sm text-[#0F1729] italic leading-relaxed">"{taskRecord.reflection}"</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
