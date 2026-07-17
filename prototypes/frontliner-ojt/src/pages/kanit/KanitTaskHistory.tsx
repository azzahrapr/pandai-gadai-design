import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { DAILY_TASKS } from '../../data/mockData'
import type { FLProfile } from '../../types'

function scoreColor(s: number | null) {
  if (s === null) return { text: 'text-[#CBD5E1]', bg: 'bg-[#F8FAFC] border border-[#E1E7EF]', accent: 'text-[#94A3B8]' }
  if (s >= 85) return { text: 'text-[#15803D]', bg: 'bg-[#F0FDF4] border border-[#16A34A]/20', accent: 'text-[#16A34A]' }
  if (s >= 75) return { text: 'text-[#B27202]', bg: 'bg-[#FEFDEA] border border-[#E0A200]/20', accent: 'text-[#B27202]' }
  return { text: 'text-[#B91C1C]', bg: 'bg-[#FEF2F2] border border-[#DC2626]/20', accent: 'text-[#DC2626]' }
}

export default function KanitTaskHistory() {
  const { flId, taskKey } = useParams<{ flId: string; taskKey: string }>()
  const navigate = useNavigate()
  const { getFlChecklists, getUserById } = useApp()

  const decodedKey = decodeURIComponent(taskKey ?? '')
  const flUser = flId ? getUserById(flId) : undefined
  const flProfile = flUser?.profile as FLProfile | undefined

  const allChecklists = flId ? getFlChecklists(flId) : []
  const taskHistory = allChecklists
    .filter(cl => {
      if (cl.status !== 'scored') return false
      if (cl.tasks) return cl.tasks.some(t => t.taskId === decodedKey)
      return cl.milestoneName === decodedKey
    })
    .sort((a, b) => a.day - b.day)

  const taskDef = DAILY_TASKS.find(t => t.id === decodedKey)

  const taskName = taskDef?.name
    ?? (taskHistory[0]?.tasks?.find(t => t.taskId === decodedKey)?.taskName)
    ?? (taskHistory[0]?.milestoneName)
    ?? decodedKey

  const sessionScores = taskHistory.map(cl => {
    if (cl.tasks) return cl.tasks.find(t => t.taskId === decodedKey)?.kanitScore ?? cl.kanitScore ?? null
    return cl.kanitScore ?? null
  })
  const scoredList = sessionScores.filter((s): s is number => s !== null)
  const avg = scoredList.length > 0 ? Math.round(scoredList.reduce((a, b) => a + b, 0) / scoredList.length) : null
  const avgC = scoreColor(avg)

  const latest = sessionScores[sessionScores.length - 1] ?? null
  const prev = sessionScores[sessionScores.length - 2] ?? null
  const trend = latest !== null && prev !== null ? latest - prev : null

  if (!flUser) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#65758B]">OJT tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 text-sm text-[#023DFF] hover:underline">← Kembali</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#65758B] mb-6">
        <button onClick={() => navigate(-1)} className="hover:text-[#023DFF] transition-colors flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Kembali
        </button>
        <span>/</span>
        <span className="text-[#0F1729]">{taskName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">{taskName}</h1>
          <p className="text-sm text-[#65758B] mt-1">
            {flUser.name}
            {taskDef && <> · {taskDef.items.length} item per sesi</>}
            {flProfile && <> · Hari ke-{flProfile.currentDay} dari 14</>}
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
      {taskHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Tren Nilai</p>
            {trend !== null && (
              <span className={`text-xs font-bold flex items-center gap-1 ${trend > 0 ? 'text-[#15803D]' : trend < 0 ? 'text-[#B91C1C]' : 'text-[#65758B]'}`}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)} dari hari sebelumnya
              </span>
            )}
          </div>
          <div className="flex items-end gap-2">
            {taskHistory.map((cl, idx) => {
              const s = sessionScores[idx]
              const c = scoreColor(s)
              const barH = s !== null ? Math.max(16, Math.round((s / 100) * 64)) : 8
              return (
                <div key={cl.id} className="flex flex-col items-center gap-1 flex-1">
                  <span className={`text-[10px] font-bold ${c.text}`}>{s ?? '—'}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                    <div
                      className={`w-full rounded-t ${s !== null ? c.bg.split(' ')[0] : 'bg-[#F1F5F9]'}`}
                      style={{ height: barH }}
                    />
                  </div>
                  <span className="text-[9px] text-[#94A3B8]">H{cl.day}</span>
                </div>
              )
            })}
            {taskHistory.length < 14 && Array.from({ length: 14 - taskHistory.length }, (_, i) => (
              <div key={`empty-${i}`} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] text-[#CBD5E1]">—</span>
                <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                  <div className="w-full rounded-t bg-[#F1F5F9]" style={{ height: 8 }} />
                </div>
                <span className="text-[9px] text-[#CBD5E1]">H{taskHistory.length + i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-session cards */}
      {taskHistory.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-12 text-center">
          <p className="text-[#94A3B8] text-sm">Belum ada riwayat untuk task ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...taskHistory].reverse().map((cl, revIdx) => {
            const origIdx = taskHistory.length - 1 - revIdx
            const taskRecord = cl.tasks?.find(t => t.taskId === decodedKey)
            const s = sessionScores[origIdx]
            const c = scoreColor(s)
            const kanitNote = taskRecord?.kanitNote ?? cl.kanitNote
            const completedIds = taskRecord?.completedItemIds ?? []
            const reflection = taskRecord?.reflection

            return (
              <div key={cl.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                {/* Day header */}
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.bg} ${c.text}`}>
                    {cl.day}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0F1729]">Hari ke-{cl.day}</p>
                    <p className="text-xs text-[#65758B]">{cl.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s !== null && <span className={`text-xl font-black ${c.text}`}>{s}</span>}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D]">Dinilai</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Kanit feedback */}
                  <div className={`rounded-lg px-4 py-3 ${s !== null ? c.bg : 'bg-[#F8FAFC] border border-[#E1E7EF]'}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#65758B] mb-1">Feedback Kanit</p>
                    {kanitNote
                      ? <p className={`text-sm leading-relaxed italic ${c.text}`}>"{kanitNote}"</p>
                      : <p className="text-sm text-[#94A3B8] italic">Tidak ada catatan</p>
                    }
                  </div>

                  {/* Completed items */}
                  <div>
                    <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">
                      Item Diselesaikan ({completedIds.length}{taskDef ? `/${taskDef.items.length}` : ''})
                    </p>
                    <div className="space-y-2">
                      {taskDef
                        ? taskDef.items.map(item => {
                            const done = completedIds.includes(item.id)
                            return (
                              <div key={item.id} className="flex items-start gap-2.5">
                                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? 'bg-[#023DFF]' : 'bg-[#F1F5F9] border border-[#CBD5E1]'}`}>
                                  {done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <p className={`text-sm leading-snug ${done ? 'text-[#0F1729]' : 'text-[#94A3B8]'}`}>{item.text}</p>
                              </div>
                            )
                          })
                        : completedIds.map(itemId => (
                            <div key={itemId} className="flex items-start gap-2.5">
                              <div className="w-4 h-4 rounded bg-[#023DFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                              <p className="text-sm text-[#0F1729]">{itemId}</p>
                            </div>
                          ))
                      }
                    </div>
                  </div>

                  {/* Reflection */}
                  {reflection && (
                    <div className="pt-3 border-t border-[#E1E7EF]">
                      <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-1.5">Refleksi</p>
                      <p className="text-sm text-[#0F1729] italic leading-relaxed">"{reflection}"</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
