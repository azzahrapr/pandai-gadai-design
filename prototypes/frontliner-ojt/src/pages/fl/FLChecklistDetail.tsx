import { useParams, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'

export default function FLChecklistDetail() {
  const { checklistId } = useParams<{ checklistId: string }>()
  const { checklists } = useApp()
  const cl = checklists.find(c => c.id === checklistId)

  if (!cl) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#65758B]">Checklist tidak ditemukan</p>
          <Link to="/fl/checklist" className="mt-4 inline-flex items-center gap-2 text-sm text-[#023DFF] hover:underline">← Kembali</Link>
        </div>
      </div>
    )
  }

  const allItems = MILESTONES.flatMap(m => m.checklistItems)

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#65758B] mb-6">
        <Link to="/fl/checklist" className="hover:text-[#023DFF] transition-colors">Checklist</Link>
        <span>/</span>
        <span className="text-[#0F1729]">Hari {cl.day}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${
          cl.status === 'scored'
            ? (cl.kanitScore ?? 0) >= 85 ? 'bg-[#F0FDF4] text-[#15803D]'
              : (cl.kanitScore ?? 0) >= 75 ? 'bg-[#FEFDEA] text-[#B27202]'
              : 'bg-[#FEF2F2] text-[#B91C1C]'
            : 'bg-[#F1F5F9] text-[#65758B]'
        }`}>
          {cl.day}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Hari {cl.day}</h1>
          <p className="text-sm text-[#65758B] mt-0.5">{cl.date}</p>
        </div>
        <div className="ml-auto">
          {cl.status === 'scored' ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#15803D]">Dinilai</span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEFDEA] text-[#B27202]">Menunggu penilaian</span>
          )}
        </div>
      </div>

      {/* Kanit score card */}
      {cl.status === 'scored' && cl.kanitScore !== undefined && (
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-4 ${
          cl.kanitScore >= 85 ? 'bg-[#F0FDF4] border border-[#16A34A]/20'
          : cl.kanitScore >= 75 ? 'bg-[#FEFDEA] border border-[#E0A200]/30'
          : 'bg-[#FEF2F2] border border-[#DC2626]/20'
        }`}>
          <div className="flex-1">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
              cl.kanitScore >= 85 ? 'text-[#15803D]' : cl.kanitScore >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
            }`}>Nilai dari Kanit</p>
            {cl.kanitNote && <p className={`text-sm leading-relaxed ${
              cl.kanitScore >= 85 ? 'text-[#15803D]' : cl.kanitScore >= 75 ? 'text-[#92400E]' : 'text-[#B91C1C]'
            }`}>"{cl.kanitNote}"</p>}
          </div>
          <p className={`text-4xl font-black flex-shrink-0 ${
            cl.kanitScore >= 85 ? 'text-[#16A34A]' : cl.kanitScore >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'
          }`}>{cl.kanitScore}</p>
        </div>
      )}

      {/* Tasks (new format) */}
      {cl.tasks && (
        <div className="grid grid-cols-2 gap-4">
          {cl.tasks.map((task, idx) => (
            <div key={task.taskId} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
              <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="font-bold text-sm text-[#0F1729]">{task.taskName}</p>
                <span className="ml-auto text-xs text-[#65758B]">{task.completedItemIds.length} item selesai</span>
              </div>
              <div className="p-5 space-y-3">
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
                <div className="pt-3 border-t border-[#E1E7EF] flex items-start gap-2">
                  <span className="text-[#65758B] flex-shrink-0 mt-0.5">💬</span>
                  <p className="text-sm text-[#0F1729] italic leading-relaxed">"{task.reflection}"</p>
                </div>
              </div>
            </div>
          ))}
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
          </div>
        </div>
      )}
    </div>
  )
}
