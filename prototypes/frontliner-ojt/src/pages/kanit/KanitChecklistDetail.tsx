import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'

export default function KanitChecklistDetail() {
  const { checklistId } = useParams<{ checklistId: string }>()
  const navigate = useNavigate()
  const { checklists, getUserById } = useApp()
  const cl = checklists.find(c => c.id === checklistId)
  const flUser = cl ? getUserById(cl.flId) : undefined

  if (!cl) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#65758B]">Checklist tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 text-sm text-[#023DFF] hover:underline">
            ← Kembali
          </button>
        </div>
      </div>
    )
  }

  const allItems = MILESTONES.flatMap(m => m.checklistItems)

  const overallScore = cl.kanitScore
  const scoreColor = (s: number) => s >= 85 ? 'text-[#16A34A]' : s >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'
  const scoreBg = (s: number) => s >= 85
    ? 'bg-[#F0FDF4] border-[#16A34A]/20'
    : s >= 75
    ? 'bg-[#FEFDEA] border-[#E0A200]/30'
    : 'bg-[#FEF2F2] border-[#DC2626]/20'
  const scoreLabelColor = (s: number) => s >= 85 ? 'text-[#15803D]' : s >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
  const scoreNoteColor = (s: number) => s >= 85 ? 'text-[#15803D]' : s >= 75 ? 'text-[#92400E]' : 'text-[#B91C1C]'

  const taskScored = cl.tasks?.some(t => t.kanitScore !== undefined)

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#65758B] mb-6">
        <button onClick={() => navigate(-1)} className="hover:text-[#023DFF] transition-colors flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Kembali
        </button>
        <span>/</span>
        <span className="text-[#0F1729]">{flUser?.name ?? cl.flId} — Hari {cl.day}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${
          overallScore !== undefined
            ? overallScore >= 85 ? 'bg-[#F0FDF4] text-[#15803D]'
              : overallScore >= 75 ? 'bg-[#FEFDEA] text-[#B27202]'
              : 'bg-[#FEF2F2] text-[#B91C1C]'
            : 'bg-[#F1F5F9] text-[#65758B]'
        }`}>{cl.day}</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#0F1729]">Hari {cl.day}</h1>
          <p className="text-sm text-[#65758B] mt-0.5">{flUser?.name} · {cl.date}</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#15803D] flex-shrink-0">
          Sudah Dinilai
        </span>
      </div>

      {/* Overall score summary */}
      {overallScore !== undefined && (
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-4 border ${scoreBg(overallScore)}`}>
          <div className="flex-1">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${scoreLabelColor(overallScore)}`}>
              Nilai Keseluruhan
            </p>
            {cl.kanitNote
              ? <p className={`text-sm leading-relaxed ${scoreNoteColor(overallScore)}`}>"{cl.kanitNote}"</p>
              : <p className="text-sm text-[#94A3B8] italic">Tidak ada catatan keseluruhan</p>
            }
          </div>
          <p className={`text-4xl font-black flex-shrink-0 ${scoreColor(overallScore)}`}>{overallScore}</p>
        </div>
      )}

      {/* Tasks (new format) */}
      {cl.tasks && (
        <div className="space-y-4">
          {!taskScored && (
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E1E7EF] px-4 py-3 text-sm text-[#65758B]">
              Penilaian per-task tidak tersedia untuk checklist ini.
            </div>
          )}
          {cl.tasks.map(task => {
            const ts = task.kanitScore
            return (
              <div key={task.taskId} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                {/* Task header */}
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-bold text-sm text-[#0F1729] flex-1">{task.taskName}</p>
                  {ts !== undefined && (
                    <span className={`text-sm font-black flex-shrink-0 ${scoreColor(ts)}`}>{ts}</span>
                  )}
                </div>

                {/* FL's completed items */}
                <div className="p-5 space-y-3">
                  <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Dikerjakan OJT</p>
                  {task.completedItemIds.map(itemId => {
                    const item = allItems.find(ci => ci.id === itemId)
                    return (
                      <div key={itemId} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded bg-[#023DFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <p className="text-sm text-[#0F1729]">{item?.text ?? itemId}</p>
                      </div>
                    )
                  })}

                  {/* FL reflection */}
                  <div className="pt-3 border-t border-[#E1E7EF] flex items-start gap-2">
                    <span className="text-[#65758B] flex-shrink-0 mt-0.5">💬</span>
                    <p className="text-sm text-[#0F1729] italic leading-relaxed">"{task.reflection}"</p>
                  </div>
                </div>

                {/* Kanit feedback */}
                {(ts !== undefined || task.kanitNote) && (
                  <div className={`mx-5 mb-5 rounded-lg p-3.5 border ${ts !== undefined ? scoreBg(ts) : 'bg-[#F8FAFC] border-[#E1E7EF]'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${ts !== undefined ? scoreLabelColor(ts) : 'text-[#65758B]'}`}>
                          Feedback Kanit
                        </p>
                        {task.kanitNote
                          ? <p className={`text-sm leading-relaxed ${ts !== undefined ? scoreNoteColor(ts) : 'text-[#0F1729]'}`}>
                              "{task.kanitNote}"
                            </p>
                          : <p className="text-sm text-[#94A3B8] italic">Tidak ada catatan untuk task ini</p>
                        }
                      </div>
                      {ts !== undefined && (
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-base ${
                          ts >= 85 ? 'bg-[#dcfce7] text-[#16A34A]'
                          : ts >= 75 ? 'bg-[#fef9c3] text-[#B27202]'
                          : 'bg-[#fee2e2] text-[#DC2626]'
                        }`}>
                          {ts}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Items (legacy format) */}
      {cl.items && !cl.tasks && (
        <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
          <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E1E7EF]">
            <p className="font-bold text-sm text-[#0F1729]">{cl.milestoneName}</p>
          </div>
          <div className="p-5 space-y-3">
            {cl.items.map(it => {
              const item = allItems.find(ci => ci.id === it.itemId)
              return (
                <div key={it.itemId} className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${it.completed ? 'bg-[#023DFF]' : 'bg-[#F1F5F9] border border-[#CBD5E1]'}`}>
                    {it.completed && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div>
                    <p className={`text-sm ${it.completed ? 'text-[#0F1729]' : 'text-[#94A3B8]'}`}>{item?.text ?? it.itemId}</p>
                    {it.note && <p className="text-xs text-[#65758B] italic mt-0.5">"{it.note}"</p>}
                  </div>
                </div>
              )
            })}
            {overallScore !== undefined && cl.kanitNote && (
              <div className={`mt-4 pt-4 border-t border-[#E1E7EF] rounded-lg p-3 ${scoreBg(overallScore)}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${scoreLabelColor(overallScore)}`}>Feedback Kanit</p>
                <p className={`text-sm leading-relaxed ${scoreNoteColor(overallScore)}`}>"{cl.kanitNote}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
