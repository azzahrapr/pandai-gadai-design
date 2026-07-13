import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { KanitProfile, FLProfile, DailyTaskRecord } from '../../types'

export default function KanitReview() {
  const { currentUser, getFlUsers, getFlChecklists, scoreChecklist } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  const [selectedFlId, setSelectedFlId] = useState<string>(() => {
    const withPending = flUsers.find(u => getFlChecklists(u.id).some(c => c.status === 'submitted'))
    return withPending?.id ?? flUsers[0]?.id ?? ''
  })
  const [justScored, setJustScored] = useState<string | null>(null)
  const [clItemYesNo, setClItemYesNo] = useState<Record<string, Record<string, boolean>>>({})
  const [clNotes, setClNotes] = useState<Record<string, string>>({})
  const [historyOpen, setHistoryOpen] = useState(false)
  // Legacy (items) scoring
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [score, setScore] = useState<string>('')
  const [note, setNote] = useState<string>('')

  const selectedFl = flUsers.find(u => u.id === selectedFlId)
  const checklists = getFlChecklists(selectedFlId)
  const pending = checklists.filter(c => c.status === 'submitted')
  const scored = checklists.filter(c => c.status === 'scored')

  // Legacy items-format scoring
  function handleScore(checklistId: string) {
    const s = parseInt(score)
    if (isNaN(s) || s < 0 || s > 100) return
    scoreChecklist(checklistId, s, note)
    setJustScored(checklistId)
    setReviewingId(null)
    setScore('')
    setNote('')
  }

  function setItemMark(clId: string, itemId: string, val: boolean) {
    setClItemYesNo(prev => ({ ...prev, [clId]: { ...(prev[clId] ?? {}), [itemId]: val } }))
  }

  function calcAutoScore(clId: string, tasks: DailyTaskRecord[]): number | null {
    const marks = clItemYesNo[clId] ?? {}
    const allIds = tasks.flatMap(t => t.completedItemIds)
    if (allIds.length === 0) return null
    if (!allIds.every(id => id in marks)) return null
    const yesCount = allIds.filter(id => marks[id] === true).length
    const noCount = allIds.length - yesCount
    return noCount > allIds.length / 2 ? 50 : Math.max(75, Math.round((yesCount / allIds.length) * 100))
  }

  function handleAutoScore(clId: string, autoScore: number) {
    scoreChecklist(clId, autoScore, clNotes[clId] ?? '')
    setJustScored(clId)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Review Checklist Harian</h1>
        <p className="text-[#65758B] text-sm mt-1">Tinjau dan beri penilaian checklist OJT peserta.</p>
      </div>

      {/* FL tab selector */}
      <div className="border-b border-[#E1E7EF] mb-6">
        <div className="flex gap-1">
          {flUsers.map(fl => {
            const flProfile = fl.profile as FLProfile
            const pend = getFlChecklists(fl.id).filter(c => c.status === 'submitted').length
            const isActive = selectedFlId === fl.id
            return (
              <button
                key={fl.id}
                onClick={() => { setSelectedFlId(fl.id); setReviewingId(null) }}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${
                  isActive ? 'border-[#023DFF] text-[#023DFF]' : 'border-transparent text-[#65758B] hover:text-[#0F1729]'
                }`}
              >
                {fl.name.split(' ')[0]}
                <span className="text-xs opacity-70">Hari {flProfile.currentDay}</span>
                {pend > 0 && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 bg-[#DC2626] text-white rounded-full text-[9px] font-bold flex items-center justify-center">{pend}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedFl && (
        <div className="grid grid-cols-3 gap-6">
          {/* Left 2/3: checklists */}
          <div className="col-span-2 space-y-4">
            {/* Pending */}
            {pending.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <p className="text-sm font-semibold text-[#0F1729]">Menunggu Review ({pending.length})</p>
                </div>
                <div className="space-y-4">
                  {pending.map(cl => (
                    <div key={cl.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                      {/* Header */}
                      <div className="p-5 border-b border-[#E1E7EF] flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#FEF2F2] text-[#B91C1C] text-xs font-bold px-2.5 py-0.5 rounded-full">Hari {cl.day}</span>
                            <span className="text-xs text-[#65758B]">{cl.date}</span>
                          </div>
                          <p className="font-semibold text-[#0F1729]">
                            {cl.tasks ? 'Daily Checklist' : cl.milestoneName}
                          </p>
                        </div>
                        {cl.tasks ? (
                          <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-1 rounded-lg">
                            {cl.tasks.length} task selesai
                          </span>
                        ) : cl.items && (
                          <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-1 rounded-lg">
                            {cl.items.filter(i => i.completed).length}/{cl.items.length} selesai
                          </span>
                        )}
                      </div>

                      {/* Checklist content */}
                      {cl.tasks ? (
                        <div className="p-5 space-y-3">
                          {cl.tasks.map(task => (
                            <div key={task.taskId} className="border border-[#E1E7EF] rounded-lg overflow-hidden">
                              <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E1E7EF]">
                                <p className="text-xs font-bold text-[#0F1729] uppercase tracking-wide">{task.taskName}</p>
                              </div>
                              <div className="p-4 space-y-2">
                                <div className="flex justify-end mb-1">
                                  <p className="text-[11px] font-semibold text-[#65758B] uppercase tracking-wide">Memenuhi Standar</p>
                                </div>
                                {task.completedItemIds.map(itemId => {
                                  const itemMark = clItemYesNo[cl.id]?.[itemId]
                                  const itemText = MILESTONES.flatMap(m => m.checklistItems).find(ci => ci.id === itemId)?.text ?? itemId
                                  return (
                                    <div key={itemId} className="flex items-center gap-2.5">
                                      <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center bg-[#023DFF]">
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                      </div>
                                      <p className="text-sm text-[#0F1729] flex-1">{itemText}</p>
                                      <div className="flex gap-1 flex-shrink-0">
                                        <button
                                          onClick={() => setItemMark(cl.id, itemId, true)}
                                          className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-all ${
                                            itemMark === true ? 'bg-[#16A34A] text-white' : 'bg-[#F1F5F9] text-[#65758B] hover:bg-[#DCFCE7] hover:text-[#16A34A]'
                                          }`}
                                        >Yes</button>
                                        <button
                                          onClick={() => setItemMark(cl.id, itemId, false)}
                                          className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-all ${
                                            itemMark === false ? 'bg-[#DC2626] text-white' : 'bg-[#F1F5F9] text-[#65758B] hover:bg-[#FEE2E2] hover:text-[#DC2626]'
                                          }`}
                                        >No</button>
                                      </div>
                                    </div>
                                  )
                                })}
                                <div className="mt-3 pt-3 border-t border-[#E1E7EF]">
                                  <p className="text-xs font-semibold text-[#65758B] mb-1">Refleksi</p>
                                  <p className="text-sm text-[#0F1729] italic">"{task.reflection}"</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : cl.items && (
                        <div className="p-5 space-y-2">
                          {cl.items.map(it => {
                            const checkItem = MILESTONES.flatMap(m => m.checklistItems).find(ci => ci.id === it.itemId)
                            return (
                              <div key={it.itemId} className="flex items-start gap-2.5">
                                <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center ${it.completed ? 'bg-[#023DFF]' : 'bg-[#F1F5F9] border border-[#CBD5E1]'}`}>
                                  {it.completed && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <div>
                                  <p className={`text-sm ${it.completed ? 'text-[#0F1729]' : 'text-[#94A3B8]'}`}>
                                    {checkItem?.text ?? it.itemId}
                                  </p>
                                  {it.note && <p className="text-xs text-[#65758B] italic mt-0.5">"{it.note}"</p>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Scoring area */}
                      <div className="px-5 pb-5">
                        {justScored === cl.id ? (
                          <div className="bg-[#F0FDF4] text-[#15803D] text-sm font-semibold rounded-xl px-4 py-3 text-center">
                            ✅ Penilaian berhasil disimpan!
                          </div>
                        ) : cl.tasks ? (() => {
                          const autoScore = calcAutoScore(cl.id, cl.tasks)
                          const totalItems = cl.tasks.flatMap(t => t.completedItemIds).length
                          const markedCount = Object.keys(clItemYesNo[cl.id] ?? {}).length
                          return (
                            <div className="border-t border-[#E1E7EF] pt-5 space-y-3">
                              <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                                autoScore === null ? 'bg-[#F8FAFC]' : autoScore >= 75 ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'
                              }`}>
                                <div>
                                  <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Nilai Otomatis</p>
                                  <p className={`text-xs mt-0.5 font-medium ${
                                    autoScore === null ? 'text-[#94A3B8]' : autoScore >= 75 ? 'text-[#15803D]' : 'text-[#B91C1C]'
                                  }`}>
                                    {autoScore === null
                                      ? `${markedCount}/${totalItems} checklist ditandai`
                                      : autoScore >= 75 ? '✓ Lolos standar' : '✗ >50% checklist tidak memenuhi standar'}
                                  </p>
                                </div>
                                <span className={`text-3xl font-black ${
                                  autoScore === null ? 'text-[#CBD5E1]' : autoScore >= 75 ? 'text-[#15803D]' : 'text-[#DC2626]'
                                }`}>{autoScore ?? '—'}</span>
                              </div>
                              <textarea
                                value={clNotes[cl.id] ?? ''}
                                onChange={e => setClNotes(prev => ({ ...prev, [cl.id]: e.target.value }))}
                                placeholder="Catatan untuk peserta (opsional)..."
                                className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                                rows={2}
                              />
                              <button
                                onClick={() => autoScore !== null && handleAutoScore(cl.id, autoScore)}
                                disabled={autoScore === null}
                                className={`w-full h-9 rounded-lg font-semibold text-sm transition-all ${
                                  autoScore !== null ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
                                }`}
                              >
                                Simpan Nilai
                              </button>
                            </div>
                          )
                        })() : reviewingId === cl.id ? (
                          <div className="border border-[#E1E7EF] rounded-xl p-4 space-y-3 bg-[#F8FAFC]">
                            <div>
                              <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Nilai (0–100)*</label>
                              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                {[70, 75, 80, 85, 90, 95].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => setScore(String(s))}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${score === String(s) ? 'bg-[#023DFF] text-white' : 'bg-white text-[#65758B] border border-[#CBD5E1] hover:border-[#023DFF]'}`}
                                  >
                                    {s}
                                  </button>
                                ))}
                                <input
                                  type="number" min="0" max="100" value={score}
                                  onChange={e => setScore(e.target.value)}
                                  placeholder="Nilai lain"
                                  className="w-24 border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Catatan untuk Peserta</label>
                              <textarea
                                value={note} onChange={e => setNote(e.target.value)}
                                placeholder="Berikan feedback yang membangun..."
                                className="mt-2 w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-3">
                              <button onClick={() => setReviewingId(null)} className="flex-1 h-9 rounded-lg border border-[#CBD5E1] text-sm font-semibold text-[#65758B] hover:border-[#94A3B8]">Batal</button>
                              <button
                                onClick={() => handleScore(cl.id)}
                                disabled={!score || parseInt(score) < 0 || parseInt(score) > 100}
                                className={`flex-1 h-9 rounded-lg text-sm font-semibold text-white transition-all ${score ? 'bg-[#023DFF] hover:bg-[#001CDB]' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}
                              >Simpan Nilai</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReviewingId(cl.id); setScore(''); setNote('') }}
                            className="w-full h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
                          >
                            Beri Nilai →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-6 text-center">
                <span className="text-2xl">✅</span>
                <p className="font-semibold text-[#15803D] mt-2 text-sm">Tidak ada checklist pending untuk {selectedFl.name.split(' ')[0]}</p>
              </div>
            )}

          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              {/* Profile header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#E5F2FF] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="#023DFF" strokeWidth="1.5"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#023DFF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F1729]">{selectedFl.name}</p>
                  <p className="text-xs text-[#65758B]">{selectedFl.id.toUpperCase()}</p>
                </div>
              </div>
              <div className="border-t border-[#E1E7EF] pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Hari OJT</span>
                  <span className="font-semibold text-[#0F1729]">{(selectedFl.profile as FLProfile).currentDay}/14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Pending review</span>
                  {pending.length > 0
                    ? <span className="font-semibold text-[#B91C1C]">{pending.length}</span>
                    : <span className="font-semibold text-[#94A3B8]">—</span>
                  }
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#65758B]">Rata-rata nilai</span>
                  {scored.length > 0 ? (() => {
                    const avg = Math.round(scored.reduce((sum, c) => sum + (c.kanitScore ?? 0), 0) / scored.length)
                    const color = avg >= 85 ? 'text-[#15803D]' : avg >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
                    return <span className={`font-bold text-base ${color}`}>{avg}</span>
                  })() : <span className="text-[#94A3B8] text-xs">Belum ada</span>}
                </div>
              </div>
            </div>

            {/* Riwayat checklist */}
            {scored.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                <button
                  onClick={() => setHistoryOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <p className="text-sm font-semibold text-[#0F1729]">Riwayat Checklist</p>
                    <span className="text-xs text-[#65758B] font-normal">({scored.length})</span>
                  </div>
                  <svg
                    className={`text-[#94A3B8] transition-transform ${historyOpen ? 'rotate-180' : ''}`}
                    width="14" height="14" viewBox="0 0 16 16" fill="none"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {historyOpen && (
                  <div className="border-t border-[#E1E7EF] max-h-[420px] overflow-y-auto">
                    {scored.slice().reverse().map((cl, idx) => {
                      const clScore = cl.kanitScore ?? 0
                      const scoreColor = clScore >= 85 ? 'text-[#15803D]' : clScore >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
                      const scoreBg = clScore >= 85 ? 'bg-[#F0FDF4] text-[#15803D]' : clScore >= 75 ? 'bg-[#FEFDEA] text-[#B27202]' : 'bg-[#FEF2F2] text-[#B91C1C]'
                      return (
                        <Link
                          key={cl.id}
                          to={`/kanit/review/${cl.id}`}
                          className={`flex items-center gap-2.5 px-4 py-3 hover:bg-[#F8FAFC] transition-colors ${idx < scored.length - 1 ? 'border-b border-[#E1E7EF]' : ''}`}
                        >
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${scoreBg}`}>{cl.day}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#0F1729] truncate">{cl.tasks ? 'Daily Checklist' : cl.milestoneName}</p>
                            <p className="text-[11px] text-[#94A3B8]">{cl.date}</p>
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ${scoreColor}`}>{cl.kanitScore}</span>
                          <svg className="text-[#CBD5E1] flex-shrink-0" width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#FEFDEA] rounded-xl border border-[#E0A200]/30 p-4">
              <p className="text-xs font-semibold text-[#B27202] mb-2">Panduan Penilaian</p>
              <div className="space-y-1.5 text-xs text-[#B27202]">
                <p>• ≥85: Sangat baik</p>
                <p>• 75–84: Baik / Lulus</p>
                <p>• &lt;75: Perlu perbaikan</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
