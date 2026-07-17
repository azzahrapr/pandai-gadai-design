import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { KanitProfile, FLProfile, DailyTaskRecord } from '../../types'

export default function KanitReview() {
  const { currentUser, getFlUsers, getFlChecklists, scoreChecklist, scoreChecklistTasks } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  const [selectedFlId, setSelectedFlId] = useState<string>(() => {
    const withPending = flUsers.find(u => getFlChecklists(u.id).some(c => c.status === 'submitted'))
    return withPending?.id ?? flUsers[0]?.id ?? ''
  })
  const [justScored, setJustScored] = useState<string | null>(null)
  const [clItemYesNo, setClItemYesNo] = useState<Record<string, Record<string, boolean>>>({})
  // clTaskNotes: {checklistId: {taskId: note}}
  const [clTaskNotes, setClTaskNotes] = useState<Record<string, Record<string, string>>>({})
  const [clOverallNotes, setClOverallNotes] = useState<Record<string, string>>({})
  const [historyOpen, setHistoryOpen] = useState(false)
  const [expandedPendingId, setExpandedPendingId] = useState<string | null>(() => null)
  // Legacy (items) scoring
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [score, setScore] = useState<string>('')
  const [note, setNote] = useState<string>('')

  const selectedFl = flUsers.find(u => u.id === selectedFlId)
  const checklists = getFlChecklists(selectedFlId)
  const pending = checklists.filter(c => c.status === 'submitted')
  const scored = checklists.filter(c => c.status === 'scored')
  // Auto-expand when only 1 pending; otherwise use accordion state
  const activeExpandedId = pending.length === 1 ? (pending[0]?.id ?? null) : expandedPendingId

  function setItemMark(clId: string, itemId: string, val: boolean) {
    setClItemYesNo(prev => ({ ...prev, [clId]: { ...(prev[clId] ?? {}), [itemId]: val } }))
  }

  function calcTaskScore(clId: string, itemIds: string[]): number | null {
    const marks = clItemYesNo[clId] ?? {}
    if (itemIds.length === 0) return null
    if (!itemIds.every(id => id in marks)) return null
    const yesCount = itemIds.filter(id => marks[id] === true).length
    const noCount = itemIds.length - yesCount
    return noCount > itemIds.length / 2 ? 50 : Math.max(75, Math.round((yesCount / itemIds.length) * 100))
  }

  function allTasksScored(clId: string, tasks: DailyTaskRecord[]): boolean {
    return tasks.every(t => calcTaskScore(clId, t.completedItemIds) !== null)
  }

  function handleSubmitTasks(clId: string, tasks: DailyTaskRecord[]) {
    const taskScores = tasks.map(t => ({
      taskId: t.taskId,
      score: calcTaskScore(clId, t.completedItemIds)!,
      note: clTaskNotes[clId]?.[t.taskId],
    }))
    scoreChecklistTasks(clId, taskScores, clOverallNotes[clId])
    setJustScored(clId)
  }

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Review Checklist</h1>
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
                onClick={() => { setSelectedFlId(fl.id); setReviewingId(null); setExpandedPendingId(null) }}
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
                <div className="space-y-3">
                  {pending.map(cl => {
                    const isExpanded = activeExpandedId === cl.id
                    return (
                    <div key={cl.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${isExpanded ? 'border-[#023DFF]/30' : 'border-[#E1E7EF]'}`}>
                      {/* Accordion header — always visible */}
                      <button
                        onClick={() => setExpandedPendingId(isExpanded ? null : cl.id)}
                        className="w-full p-5 flex items-start justify-between text-left hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#E5F2FF] text-[#023DFF] text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">Hari {cl.day}</span>
                            <span className="text-xs text-[#65758B]">{cl.date}</span>
                          </div>
                          <p className="font-semibold text-[#0F1729]">
                            {cl.tasks ? `Checklist Hari ke-${cl.day}` : cl.milestoneName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          {cl.tasks ? (
                            <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-1 rounded-lg">
                              {cl.tasks.length} task
                            </span>
                          ) : cl.items && (
                            <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-1 rounded-lg">
                              {cl.items.filter(i => i.completed).length}/{cl.items.length} selesai
                            </span>
                          )}
                          <span className={`text-[#94A3B8] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                        </div>
                      </button>

                      {/* Collapsible content */}
                      {isExpanded && <div className="border-t border-[#E1E7EF]">

                      {/* Checklist content */}
                      {cl.tasks ? (
                        <div className="p-5 space-y-3">
                          {cl.tasks.map(task => {
                            const taskScore = calcTaskScore(cl.id, task.completedItemIds)
                            const markedCount = task.completedItemIds.filter(id => id in (clItemYesNo[cl.id] ?? {})).length
                            return (
                              <div key={task.taskId} className="border border-[#E1E7EF] rounded-lg overflow-hidden">
                                <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-center justify-between">
                                  <p className="text-xs font-bold text-[#0F1729] uppercase tracking-wide">{task.taskName}</p>
                                  {taskScore !== null ? (
                                    <span className={`text-xs font-bold ${taskScore >= 85 ? 'text-[#15803D]' : taskScore >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'}`}>{taskScore}/100</span>
                                  ) : (
                                    <span className="text-[11px] text-[#94A3B8]">{markedCount}/{task.completedItemIds.length} ditandai</span>
                                  )}
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
                                        <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center bg-[#BFDBFE] pointer-events-none">
                                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </div>
                                        <p className="text-sm text-[#65758B] flex-1">{itemText}</p>
                                        <div className="flex gap-1 flex-shrink-0">
                                          <button
                                            onClick={() => setItemMark(cl.id, itemId, true)}
                                            className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-all ${
                                              itemMark === true ? 'bg-[#16A34A] text-white' : 'bg-[#F1F5F9] text-[#65758B] hover:bg-[#DCFCE7] hover:text-[#16A34A]'
                                            }`}
                                          >Ya</button>
                                          <button
                                            onClick={() => setItemMark(cl.id, itemId, false)}
                                            className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-all ${
                                              itemMark === false ? 'bg-[#DC2626] text-white' : 'bg-[#F1F5F9] text-[#65758B] hover:bg-[#FEE2E2] hover:text-[#DC2626]'
                                            }`}
                                          >Tidak</button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                  <div className="mt-3 pt-3 border-t border-[#E1E7EF]">
                                    <p className="text-xs font-semibold text-[#65758B] mb-1">Refleksi peserta</p>
                                    <p className="text-sm text-[#0F1729] italic">"{task.reflection}"</p>
                                  </div>
                                  <div className="mt-2">
                                    <textarea
                                      value={clTaskNotes[cl.id]?.[task.taskId] ?? ''}
                                      onChange={e => setClTaskNotes(prev => ({
                                        ...prev,
                                        [cl.id]: { ...(prev[cl.id] ?? {}), [task.taskId]: e.target.value }
                                      }))}
                                      placeholder={`Catatan untuk task ${task.taskName} (opsional)`}
                                      className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2 text-xs outline-none transition-colors resize-none text-[#0F1729] placeholder:text-[#94A3B8]"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
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
                          const canSubmit = allTasksScored(cl.id, cl.tasks)
                          const taskSummary = cl.tasks.map(t => ({
                            name: t.taskName,
                            score: calcTaskScore(cl.id, t.completedItemIds),
                          }))
                          const avgScore = canSubmit
                            ? Math.round(taskSummary.reduce((s, t) => s + (t.score ?? 0), 0) / taskSummary.length)
                            : null
                          return (
                            <div className="border-t border-[#E1E7EF] pt-5 space-y-3">
                              {/* Per-task score summary */}
                              <div className="bg-[#F8FAFC] rounded-xl px-4 py-3 space-y-2">
                                <p className="text-[11px] font-semibold text-[#65758B] uppercase tracking-wide mb-1">Ringkasan Nilai Per Task</p>
                                {taskSummary.map(t => (
                                  <div key={t.name} className="flex items-center justify-between">
                                    <span className="text-xs text-[#0F1729]">{t.name}</span>
                                    <span className={`text-xs font-bold ${
                                      t.score === null ? 'text-[#CBD5E1]'
                                      : t.score >= 85 ? 'text-[#15803D]'
                                      : t.score >= 75 ? 'text-[#B27202]'
                                      : 'text-[#DC2626]'
                                    }`}>{t.score ?? '—'}</span>
                                  </div>
                                ))}
                                {avgScore !== null && (
                                  <div className="flex items-center justify-between pt-2 border-t border-[#E1E7EF]">
                                    <span className="text-xs font-semibold text-[#0F1729]">Rata-rata hari ini</span>
                                    <span className={`text-sm font-black ${avgScore >= 85 ? 'text-[#15803D]' : avgScore >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'}`}>{avgScore}</span>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => canSubmit && handleSubmitTasks(cl.id, cl.tasks!)}
                                disabled={!canSubmit}
                                className={`w-full h-9 rounded-lg font-semibold text-sm transition-all ${
                                  canSubmit ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
                                }`}
                              >
                                {canSubmit ? 'Simpan Semua Nilai →' : `Tandai semua item terlebih dahulu`}
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
                      </div>}
                    </div>
                    )
                  })}
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
                  <p className="text-xs text-[#65758B]">{selectedFl.id.toUpperCase()} · Hari {(selectedFl.profile as FLProfile).currentDay}/14</p>
                </div>
              </div>
              <div className="border-t border-[#E1E7EF] pt-4 space-y-3 text-sm">
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
                    const allTaskScores = scored.flatMap(c =>
                      c.tasks ? c.tasks.filter(t => t.kanitScore !== undefined).map(t => t.kanitScore!) : (c.kanitScore !== undefined ? [c.kanitScore] : [])
                    )
                    if (allTaskScores.length === 0) return <span className="text-[#94A3B8] text-xs">Belum ada</span>
                    const avg = Math.round(allTaskScores.reduce((a, b) => a + b, 0) / allTaskScores.length)
                    const color = avg >= 85 ? 'text-[#15803D]' : avg >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
                    return <span className={`font-bold text-base ${color}`}>{avg}</span>
                  })() : <span className="text-[#94A3B8] text-xs">Belum ada</span>}
                </div>
              </div>
            </div>

            {/* Riwayat checklist — grouped by task/modul */}
            {scored.length > 0 && (() => {
              const taskMap = new Map<string, { taskName: string; sessions: number; scores: number[] }>()
              scored.forEach(cl => {
                if (cl.tasks) {
                  cl.tasks.forEach(t => {
                    if (!taskMap.has(t.taskId)) taskMap.set(t.taskId, { taskName: t.taskName, sessions: 0, scores: [] })
                    const entry = taskMap.get(t.taskId)!
                    entry.sessions++
                    if (t.kanitScore !== undefined) entry.scores.push(t.kanitScore)
                  })
                } else if (cl.milestoneName) {
                  const key = cl.milestoneName
                  if (!taskMap.has(key)) taskMap.set(key, { taskName: cl.milestoneName, sessions: 0, scores: [] })
                  const entry = taskMap.get(key)!
                  entry.sessions++
                  if (cl.kanitScore !== undefined) entry.scores.push(cl.kanitScore)
                }
              })
              const taskRows = Array.from(taskMap.values())
              return (
                <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                  <button
                    onClick={() => setHistoryOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      <p className="text-sm font-semibold text-[#0F1729]">Riwayat Checklist</p>
                      <span className="text-xs text-[#65758B] font-normal">({scored.length} sesi)</span>
                    </div>
                    <svg
                      className={`text-[#94A3B8] transition-transform ${historyOpen ? 'rotate-180' : ''}`}
                      width="14" height="14" viewBox="0 0 16 16" fill="none"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {historyOpen && (
                    <div className="border-t border-[#E1E7EF]">
                      {taskRows.map((row, idx) => {
                        const avg = row.scores.length > 0 ? Math.round(row.scores.reduce((a, b) => a + b, 0) / row.scores.length) : null
                        const scoreColor = avg === null ? 'text-[#94A3B8]' : avg >= 85 ? 'text-[#15803D]' : avg >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
                        return (
                          <div
                            key={row.taskName}
                            className={`flex items-center gap-3 px-4 py-3 ${idx < taskRows.length - 1 ? 'border-b border-[#E1E7EF]' : ''}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#0F1729]">{row.taskName}</p>
                              <p className="text-[11px] text-[#94A3B8] mt-0.5">{row.sessions} sesi</p>
                            </div>
                            {avg !== null && (
                              <span className={`text-sm font-bold flex-shrink-0 ${scoreColor}`}>{avg}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

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
