import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { ModuleDecision } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { KanitProfile, FLProfile, DailyTaskRecord } from '../../types'

const MILESTONE_TASK_MAP: Record<string, string[]> = {
  'opening-closing': ['opening', 'closing'],
  'canvassing': ['canvassing'],
  'pelayanan-dasar': ['pelayanan-dasar'],
  'pelayanan-transaksi': ['pelayanan-transaksi'],
  'penaksiran': ['penaksiran-elektronik'],
  'packing-sealing': ['packing-sealing'],
}

const MILESTONE_EXPECTED_COUNT: Record<string, number> = {
  'opening-closing': 13,
  'packing-sealing': 4,
  'canvassing': 2,
  'pelayanan-dasar': 6,
  'pelayanan-transaksi': 6,
  'penaksiran': 6,
}

const CARRY_OVER_REASONS = [
  { id: 'cuti', label: 'Cuti' },
  { id: 'sakit', label: 'Sakit' },
  { id: 'darurat', label: 'Kondisi Darurat' },
  { id: 'lainnya', label: 'Lainnya' },
]

export default function KanitReviewProgress() {
  const navigate = useNavigate()
  const {
    currentUser, getFlUsers, getFlChecklists,
    scoreChecklist, scoreChecklistTasks,
    level2Unlocks, unlockLevel2,
  } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  const [selectedFlId, setSelectedFlId] = useState<string>(() => {
    const withPending = flUsers.find(u => getFlChecklists(u.id).some(c => c.status === 'submitted'))
    return withPending?.id ?? flUsers[0]?.id ?? ''
  })
  const [contentTab, setContentTab] = useState<'review' | 'progress'>('review')

  // Review Checklist state
  const [justScored, setJustScored] = useState<string | null>(null)
  const [clItemYesNo, setClItemYesNo] = useState<Record<string, Record<string, boolean>>>({})
  const [clTaskNotes, setClTaskNotes] = useState<Record<string, Record<string, string>>>({})
  const [clOverallNotes, setClOverallNotes] = useState<Record<string, string>>({})
  const [historyOpen, setHistoryOpen] = useState(false)
  const [expandedPendingIds, setExpandedPendingIds] = useState<Set<string>>(new Set())
  const [submitAttempted, setSubmitAttempted] = useState<Record<string, boolean>>({})
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [score, setScore] = useState('')
  const [note, setNote] = useState('')

  // Progress Belajar state
  const [showUnlockForm, setShowUnlockForm] = useState(false)
  const [moduleDecisions, setModuleDecisions] = useState<Record<string, { action: 'carry-over' | 'close' | null; reason?: string; note?: string }>>({})

  const selectedFl = flUsers.find(u => u.id === selectedFlId)
  const flProfile = selectedFl?.profile as FLProfile | undefined

  // --- Review helpers ---
  const checklists = getFlChecklists(selectedFlId)
  const pending = checklists.filter(c => c.status === 'submitted')
  const scored = checklists.filter(c => c.status === 'scored')
  function togglePending(id: string) {
    setExpandedPendingIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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

  function handleScore(checklistId: string) {
    const s = parseInt(score)
    if (isNaN(s) || s < 0 || s > 100) return
    scoreChecklist(checklistId, s, note)
    setJustScored(checklistId)
    setReviewingId(null)
    setScore('')
    setNote('')
  }

  // --- Progress helpers ---
  function getMilestoneProgress(flId: string, milestoneId: string) {
    const submitted = getFlChecklists(flId).filter(c => c.status === 'submitted' || c.status === 'scored')
    const taskIds = MILESTONE_TASK_MAP[milestoneId] ?? []
    const expected = MILESTONE_EXPECTED_COUNT[milestoneId] ?? 14
    const actual = taskIds.length > 0
      ? submitted.filter(cl => cl.tasks?.some(t => taskIds.includes(t.taskId))).length
      : 0
    return { actual, expected, isStarted: actual > 0, isComplete: actual >= expected }
  }

  function isMilestoneCompleted(flId: string, milestoneId: string): boolean {
    const fp = flUsers.find(u => u.id === flId)?.profile as FLProfile | undefined
    if (fp?.completedMilestoneIds?.includes(milestoneId)) return true
    const { isComplete } = getMilestoneProgress(flId, milestoneId)
    if (!isComplete) return false
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (milestone?.quiz?.length) return fp?.quizScores?.[milestoneId] !== undefined
    return true
  }

  function needsLevel2Unlock(flId: string): boolean {
    const fp = flUsers.find(u => u.id === flId)?.profile as FLProfile | undefined
    if (!fp || fp.currentDay < 8 || level2Unlocks[flId]) return false
    const level1 = MILESTONES.filter(m => m.type === 'minggu1' && fp.activeMilestoneIds.includes(m.id))
    return !level1.every(m => isMilestoneCompleted(flId, m.id))
  }

  function handleUnlock() {
    if (!selectedFlId) return
    unlockLevel2(selectedFlId, moduleDecisions as Record<string, ModuleDecision>)
    setShowUnlockForm(false)
    setModuleDecisions({})
  }

  // Derived progress state for selected FL
  const unlock = level2Unlocks[selectedFlId]
  const level1Milestones = flProfile ? MILESTONES.filter(m => m.type === 'minggu1' && flProfile.activeMilestoneIds.includes(m.id)) : []
  const allLevel1Done = level1Milestones.every(m => isMilestoneCompleted(selectedFlId, m.id))
  const level2NeedsUnlock = (flProfile?.currentDay ?? 0) >= 8 && !allLevel1Done && !unlock
  const level2Unlocked = !!unlock

  function switchFl(flId: string) {
    setSelectedFlId(flId)
    setExpandedPendingIds(new Set())
    setReviewingId(null)
    setShowUnlockForm(false)
    setModuleDecisions({})
    setJustScored(null)
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1729]">Review Progress OJT</h1>
        <p className="text-[#65758B] text-sm mt-1">Pantau dan nilai checklist serta progres materi belajar peserta OJT.</p>
      </div>

      {/* Pilih peserta — dropdown */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs font-semibold text-[#65758B] flex-shrink-0">Pilih peserta</span>
        <div className="relative">
          <select
            value={selectedFlId}
            onChange={e => switchFl(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7EF] rounded-lg pl-3 pr-8 py-1.5 text-sm font-semibold text-[#0F1729] outline-none focus:border-[#023DFF] cursor-pointer"
          >
            {flUsers.map(fl => {
              const fp = fl.profile as FLProfile
              const pend = getFlChecklists(fl.id).filter(c => c.status === 'submitted').length
              return (
                <option key={fl.id} value={fl.id}>
                  {fl.name} — Hari {fp.currentDay}{pend > 0 ? ` (${pend} pending)` : ''}
                </option>
              )
            })}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {selectedFl && (
        <div className="grid grid-cols-3 gap-6 items-start">
          <div className="col-span-2">
            {/* Content tabs */}
            <div className="flex border-b border-[#E1E7EF] mb-6">
              <button
                onClick={() => setContentTab('review')}
                className={`flex-1 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${
                  contentTab === 'review'
                    ? 'border-[#0F1729] text-[#0F1729]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#65758B]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  Review Checklist
                  {pending.length > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-[#DC2626] text-white">
                      {pending.length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setContentTab('progress')}
                className={`flex-1 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${
                  contentTab === 'progress'
                    ? 'border-[#0F1729] text-[#0F1729]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#65758B]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  Progress Belajar
                  {needsLevel2Unlock(selectedFlId) && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-[#DC2626] text-white">
                      1
                    </span>
                  )}
                </span>
              </button>
            </div>
            {contentTab === 'review' && (
            <div className="space-y-4">
            {pending.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <p className="text-sm font-semibold text-[#0F1729]">Menunggu Review ({pending.length})</p>
                </div>
                <div className="space-y-3">
                  {pending.map(cl => {
                    const isExpanded = pending.length === 1 || expandedPendingIds.has(cl.id)
                    const canToggle = pending.length > 1
                    const Header = canToggle ? 'button' : 'div'
                    return (
                      <div key={cl.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${isExpanded ? 'border-[#023DFF]/30' : 'border-[#E1E7EF]'}`}>
                        <Header
                          {...(canToggle ? { onClick: () => togglePending(cl.id) } : {})}
                          className={`w-full p-5 flex items-start justify-between text-left ${canToggle ? 'hover:bg-[#F8FAFC] transition-colors cursor-pointer' : ''}`}
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
                              <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-1 rounded-lg">{cl.tasks.length} task</span>
                            ) : cl.items && (
                              <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-1 rounded-lg">
                                {cl.items.filter(i => i.completed).length}/{cl.items.length} selesai
                              </span>
                            )}
                            {canToggle && (
                              <span className={`text-[#94A3B8] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </span>
                            )}
                          </div>
                        </Header>

                        {isExpanded && (
                          <div className="border-t border-[#E1E7EF]">
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
                                          const isUnmarked = submitAttempted[cl.id] && itemMark === undefined
                                          return (
                                            <div key={itemId} className={`flex items-center gap-2.5 rounded-lg transition-colors ${isUnmarked ? 'bg-[#FEF2F2] -mx-2 px-2 py-1' : ''}`}>
                                              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center bg-[#BFDBFE] pointer-events-none">
                                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                              </div>
                                              <p className="text-sm text-[#65758B] flex-1">{itemText}</p>
                                              <div className="flex gap-1 flex-shrink-0">
                                                <button onClick={() => setItemMark(cl.id, itemId, true)} className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-all ${itemMark === true ? 'bg-[#16A34A] text-white' : 'bg-[#F1F5F9] text-[#65758B] hover:bg-[#DCFCE7] hover:text-[#16A34A]'}`}>Ya</button>
                                                <button onClick={() => setItemMark(cl.id, itemId, false)} className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-all ${itemMark === false ? 'bg-[#DC2626] text-white' : 'bg-[#F1F5F9] text-[#65758B] hover:bg-[#FEE2E2] hover:text-[#DC2626]'}`}>Tidak</button>
                                              </div>
                                            </div>
                                          )
                                        })}
                                        <div className="mt-3 pt-3 border-t border-[#E1E7EF]">
                                          <p className="text-xs font-semibold text-[#65758B] mb-1">Refleksi peserta</p>
                                          <p className="text-sm text-[#0F1729] italic">"{task.reflection}"</p>
                                        </div>
                                        <textarea
                                          value={clTaskNotes[cl.id]?.[task.taskId] ?? ''}
                                          onChange={e => setClTaskNotes(prev => ({ ...prev, [cl.id]: { ...(prev[cl.id] ?? {}), [task.taskId]: e.target.value } }))}
                                          placeholder={`Catatan untuk task ${task.taskName} (opsional)`}
                                          className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2 text-xs outline-none transition-colors resize-none text-[#0F1729] placeholder:text-[#94A3B8]"
                                          rows={2}
                                        />
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
                                        <p className={`text-sm ${it.completed ? 'text-[#0F1729]' : 'text-[#94A3B8]'}`}>{checkItem?.text ?? it.itemId}</p>
                                        {it.note && <p className="text-xs text-[#65758B] italic mt-0.5">"{it.note}"</p>}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            <div className="px-5 pb-5">
                              {justScored === cl.id ? (
                                <div className="bg-[#F0FDF4] text-[#15803D] text-sm font-semibold rounded-xl px-4 py-3 text-center">✅ Penilaian berhasil disimpan!</div>
                              ) : cl.tasks ? (() => {
                                const canSubmit = allTasksScored(cl.id, cl.tasks)
                                const attempted = submitAttempted[cl.id]
                                return (
                                  <div className="space-y-2">
                                    <button
                                      onClick={() => {
                                        if (canSubmit) {
                                          handleSubmitTasks(cl.id, cl.tasks!)
                                        } else {
                                          setSubmitAttempted(prev => ({ ...prev, [cl.id]: true }))
                                        }
                                      }}
                                      className="w-full h-9 rounded-lg font-semibold text-sm bg-[#023DFF] hover:bg-[#001CDB] text-white transition-all"
                                    >
                                      Submit Penilaian
                                    </button>
                                    {attempted && !canSubmit && (
                                      <p className="text-xs text-[#DC2626]">Semua item harus ditandai Ya atau Tidak sebelum submit</p>
                                    )}
                                  </div>
                                )
                              })() : reviewingId === cl.id ? (
                                <div className="border border-[#E1E7EF] rounded-xl p-4 space-y-3 bg-[#F8FAFC]">
                                  <div>
                                    <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Nilai (0–100)*</label>
                                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                      {[70, 75, 80, 85, 90, 95].map(s => (
                                        <button key={s} onClick={() => setScore(String(s))} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${score === String(s) ? 'bg-[#023DFF] text-white' : 'bg-white text-[#65758B] border border-[#CBD5E1] hover:border-[#023DFF]'}`}>{s}</button>
                                      ))}
                                      <input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} placeholder="Nilai lain" className="w-24 border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2 text-sm outline-none transition-colors" />
                                    </div>
                                  </div>
                                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Catatan untuk peserta..." className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none" rows={2} />
                                  <div className="flex gap-3">
                                    <button onClick={() => setReviewingId(null)} className="flex-1 h-9 rounded-lg border border-[#CBD5E1] text-sm font-semibold text-[#65758B]">Batal</button>
                                    <button onClick={() => handleScore(cl.id)} disabled={!score} className={`flex-1 h-9 rounded-lg text-sm font-semibold text-white transition-all ${score ? 'bg-[#023DFF] hover:bg-[#001CDB]' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}>Simpan Nilai</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => { setReviewingId(cl.id); setScore(''); setNote('') }} className="w-full h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors">Beri Nilai →</button>
                              )}
                            </div>
                          </div>
                        )}
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
            )}
            {contentTab === 'progress' && flProfile && (
              <div className="space-y-8 mt-6">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-5 w-1 rounded-full bg-[#65758B] flex-shrink-0" />
                    <h2 className="text-base font-bold text-[#0F1729]">Level 1</h2>
                    <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Hari 1–7</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {MILESTONES.filter(m => m.type === 'minggu1' && flProfile.activeMilestoneIds.includes(m.id)).map(m => {
                      const progress = getMilestoneProgress(selectedFlId, m.id)
                      const completed = isMilestoneCompleted(selectedFlId, m.id)
                      return (
                        <MilestoneProgressCard key={m.id} name={m.name} progress={progress} isCompleted={completed} hasQuiz={!!m.quiz?.length} quizDone={flProfile.completedMilestoneIds?.includes(m.id) || flProfile.quizScores?.[m.id] !== undefined} />
                      )
                    })}
                  </div>
                </section>
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-5 w-1 rounded-full bg-[#023DFF] flex-shrink-0" />
                    <h2 className="text-base font-bold text-[#0F1729]">Level 2</h2>
                    <span className="text-xs text-[#023DFF] bg-[#E5F2FF] px-2 py-0.5 rounded-full">Hari 8–13</span>
                  </div>
                  {unlock ? (
                    <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-5 mb-4 flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">🔓</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#15803D]">Akses Level 2 sudah dibuka</p>
                        <div className="mt-1.5 space-y-1">
                          {Object.entries(unlock.moduleDecisions).map(([milId, dec]) => {
                            const mil = MILESTONES.find(m => m.id === milId)
                            const reasonLabel = CARRY_OVER_REASONS.find(r => r.id === dec.reason)?.label
                            return (
                              <p key={milId} className="text-xs text-[#15803D]/80">
                                <strong>{mil?.name ?? milId}</strong>: {dec.action === 'close' ? 'Closed' : `Carry Over${reasonLabel ? ` — ${reasonLabel}` : ''}`}
                              </p>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : level2NeedsUnlock ? (
                    <div className="bg-[#FEFDEA] border border-[#E0A200] rounded-xl p-5 mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">⚠️</span>
                        <div>
                          <p className="text-sm font-bold text-[#B27202]">Ada modul Level 1 yang belum selesai</p>
                          <p className="text-xs text-[#B27202]/80 mt-0.5">OJT ini sudah hari ke-{flProfile.currentDay}. Tentukan tindakan untuk setiap modul yang belum tuntas.</p>
                        </div>
                      </div>
                      <button onClick={() => setShowUnlockForm(true)} className="flex-shrink-0 h-9 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors">Buka Akses →</button>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-4">
                    {MILESTONES.filter(m => m.type === 'minggu2').map(m => {
                      const isLocked = !level2Unlocked && (flProfile.currentDay < 8 || !allLevel1Done)
                      const progress = getMilestoneProgress(selectedFlId, m.id)
                      const completed = isMilestoneCompleted(selectedFlId, m.id)
                      const isActive = flProfile.activeMilestoneIds.includes(m.id)
                      return (
                        <MilestoneProgressCard key={m.id} name={m.name} progress={progress} isCompleted={completed} hasQuiz={!!m.quiz?.length} quizDone={flProfile.completedMilestoneIds?.includes(m.id) || flProfile.quizScores?.[m.id] !== undefined} isLocked={isLocked} isActive={isActive} />
                      )
                    })}
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Right sidebar — always visible */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#E5F2FF] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="#023DFF" strokeWidth="1.5"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#023DFF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F1729]">{selectedFl.name}</p>
                  <p className="text-xs text-[#65758B]">{selectedFl.id.toUpperCase()} · Hari {flProfile?.currentDay}/14</p>
                </div>
              </div>
              <div className="border-t border-[#E1E7EF] pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Pending review</span>
                  {pending.length > 0 ? <span className="font-semibold text-[#B91C1C]">{pending.length}</span> : <span className="font-semibold text-[#94A3B8]">—</span>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#65758B]">Rata-rata nilai</span>
                  {scored.length > 0 ? (() => {
                    const allTaskScores = scored.flatMap(c => c.tasks ? c.tasks.filter(t => t.kanitScore !== undefined).map(t => t.kanitScore!) : (c.kanitScore !== undefined ? [c.kanitScore] : []))
                    if (allTaskScores.length === 0) return <span className="text-[#94A3B8] text-xs">Belum ada</span>
                    const avg = Math.round(allTaskScores.reduce((a, b) => a + b, 0) / allTaskScores.length)
                    const color = avg >= 85 ? 'text-[#15803D]' : avg >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
                    return <span className={`font-bold text-base ${color}`}>{avg}</span>
                  })() : <span className="text-[#94A3B8] text-xs">Belum ada</span>}
                </div>
              </div>
            </div>

            {scored.length > 0 && (() => {
              type TaskEntry = { taskName: string; sessions: number; scores: number[]; checklists: { id: string; day: number; date: string }[] }
              const taskMap = new Map<string, TaskEntry>()
              scored.forEach(cl => {
                if (cl.tasks) {
                  cl.tasks.forEach(t => {
                    if (!taskMap.has(t.taskId)) taskMap.set(t.taskId, { taskName: t.taskName, sessions: 0, scores: [], checklists: [] })
                    const entry = taskMap.get(t.taskId)!
                    if (!entry.checklists.find(c => c.id === cl.id)) {
                      entry.sessions++
                      entry.checklists.push({ id: cl.id, day: cl.day, date: cl.date })
                    }
                    if (t.kanitScore !== undefined) entry.scores.push(t.kanitScore)
                  })
                } else if (cl.milestoneName) {
                  if (!taskMap.has(cl.milestoneName)) taskMap.set(cl.milestoneName, { taskName: cl.milestoneName, sessions: 0, scores: [], checklists: [] })
                  const entry = taskMap.get(cl.milestoneName)!
                  entry.sessions++
                  entry.checklists.push({ id: cl.id, day: cl.day, date: cl.date })
                  if (cl.kanitScore !== undefined) entry.scores.push(cl.kanitScore)
                }
              })
              const taskRows = Array.from(taskMap.entries()).map(([key, val]) => ({ key, ...val }))
              return (
                <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                  <button onClick={() => setHistoryOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      <p className="text-sm font-semibold text-[#0F1729]">Riwayat Checklist</p>
                      <span className="text-xs text-[#65758B] font-normal">({scored.length} sesi)</span>
                    </div>
                    <svg className={`text-[#94A3B8] transition-transform ${historyOpen ? 'rotate-180' : ''}`} width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  {historyOpen && (
                    <div className="border-t border-[#E1E7EF]">
                      {taskRows.map((row, idx) => {
                        const avg = row.scores.length > 0 ? Math.round(row.scores.reduce((a, b) => a + b, 0) / row.scores.length) : null
                        const scoreColor = avg === null ? 'text-[#94A3B8]' : avg >= 85 ? 'text-[#15803D]' : avg >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
                        const isLast = idx === taskRows.length - 1
                        return (
                          <div key={row.key} className={!isLast ? 'border-b border-[#E1E7EF]' : ''}>
                            <button
                              onClick={() => navigate(`/kanit/task-history/${selectedFlId}/${encodeURIComponent(row.key)}`)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors text-left group"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#0F1729] group-hover:text-[#023DFF] transition-colors">{row.taskName}</p>
                                <p className="text-[11px] text-[#94A3B8] mt-0.5">{row.sessions} sesi</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {avg !== null && <span className={`text-sm font-bold ${scoreColor}`}>{avg}</span>}
                                <svg className="text-[#CBD5E1] group-hover:text-[#023DFF] transition-colors" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

            {contentTab === 'review' && (
              <div className="bg-[#FEFDEA] rounded-xl border border-[#E0A200]/30 p-4">
                <p className="text-xs font-semibold text-[#B27202] mb-2">Panduan Penilaian</p>
                <div className="space-y-1.5 text-xs text-[#B27202]">
                  <p>• ≥85: Sangat baik</p>
                  <p>• 75–84: Baik / Lulus</p>
                  <p>• &lt;75: Perlu perbaikan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buka Akses modal */}
      {showUnlockForm && flProfile && (() => {
        const incompleteMods = MILESTONES.filter(m =>
          m.type === 'minggu1' &&
          flProfile.activeMilestoneIds.includes(m.id) &&
          !isMilestoneCompleted(selectedFlId, m.id)
        )
        const canConfirm = incompleteMods.every(m => {
          const d = moduleDecisions[m.id]
          if (!d || !d.action) return false
          if (d.action === 'carry-over' && !d.reason) return false
          if (d.action === 'carry-over' && d.reason === 'lainnya' && !d.note?.trim()) return false
          return true
        })
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) { setShowUnlockForm(false); setModuleDecisions({}) } }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E1E7EF]">
                <p className="text-base font-bold text-[#0F1729]">Buka Akses Level 2 — {selectedFl?.name.split(' ')[0]}</p>
                <p className="text-xs text-[#65758B] mt-0.5">Tentukan tindakan untuk setiap modul Level 1 yang belum selesai.</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[#E1E7EF]">
                {incompleteMods.map(m => {
                  const d = moduleDecisions[m.id] ?? { action: null }
                  return (
                    <div key={m.id} className="px-6 py-5 flex gap-6">
                      {/* Left: module name */}
                      <div className="w-36 flex-shrink-0 pt-0.5">
                        <p className="text-sm font-semibold text-[#0F1729] leading-snug">{m.name}</p>
                      </div>
                      {/* Right: radio + conditional content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-6 mb-3">
                          {([
                            { action: 'carry-over' as const, label: 'Lanjutkan' },
                            { action: 'close' as const, label: 'Tutup' },
                          ]).map(opt => {
                            const isSelected = d.action === opt.action
                            return (
                              <button
                                key={opt.action}
                                onClick={() => setModuleDecisions(prev => ({
                                  ...prev,
                                  [m.id]: opt.action === 'carry-over'
                                    ? { action: 'carry-over', reason: prev[m.id]?.reason, note: prev[m.id]?.note }
                                    : { action: 'close' },
                                }))}
                                className="flex items-center gap-2 group"
                              >
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-[#023DFF]' : 'border-[#CBD5E1] group-hover:border-[#023DFF]'}`}>
                                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#023DFF]" />}
                                </span>
                                <span className={`text-sm transition-colors ${isSelected ? 'text-[#0F1729] font-medium' : 'text-[#0F1729] group-hover:text-[#023DFF]'}`}>{opt.label}</span>
                              </button>
                            )
                          })}
                        </div>
                        {d.action === 'close' && (
                          <div className="bg-[#FEFDEA] border border-[#E0A200]/40 rounded-lg px-3 py-2.5 flex items-start gap-2">
                            <span className="text-sm flex-shrink-0 mt-px">⚠</span>
                            <p className="text-xs text-[#B27202]">Pilih Tutup hanya jika OJT sudah cukup menguasai materi ini meski checklist belum terpenuhi sepenuhnya.</p>
                          </div>
                        )}
                        {d.action === 'carry-over' && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-[#65758B]">Alasan modul belum selesai*</p>
                            <div className="flex flex-wrap gap-2">
                              {CARRY_OVER_REASONS.map(r => (
                                <button
                                  key={r.id}
                                  onClick={() => setModuleDecisions(prev => ({ ...prev, [m.id]: { ...prev[m.id], action: 'carry-over', reason: r.id, note: r.id !== 'lainnya' ? undefined : prev[m.id]?.note } }))}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${d.reason === r.id ? 'bg-[#023DFF] text-white border-[#023DFF]' : 'bg-white text-[#65758B] border-[#E1E7EF] hover:border-[#023DFF] hover:text-[#023DFF]'}`}
                                >
                                  {r.label}
                                </button>
                              ))}
                            </div>
                            {d.reason === 'lainnya' && (
                              <textarea
                                value={d.note ?? ''}
                                onChange={e => setModuleDecisions(prev => ({ ...prev, [m.id]: { ...prev[m.id], action: 'carry-over', reason: 'lainnya', note: e.target.value } }))}
                                placeholder="Jelaskan alasannya..."
                                rows={2}
                                className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none resize-none transition-colors"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="px-6 py-4 border-t border-[#E1E7EF] flex items-center justify-end gap-3 bg-[#F8FAFC]">
                <button onClick={() => { setShowUnlockForm(false); setModuleDecisions({}) }} className="h-[38px] px-4 rounded-lg text-sm font-semibold text-[#023DFF] hover:bg-[#E5F2FF] transition-colors">Batal</button>
                <button
                  disabled={!canConfirm}
                  onClick={handleUnlock}
                  className={`h-[38px] px-4 rounded-lg text-sm font-semibold transition-all ${canConfirm ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function MilestoneProgressCard({ name, progress, isCompleted, hasQuiz, quizDone, isLocked, isActive }: {
  name: string
  progress: { actual: number; expected: number; isStarted: boolean; isComplete: boolean }
  isCompleted: boolean
  hasQuiz: boolean
  quizDone: boolean
  isLocked?: boolean
  isActive?: boolean
}) {
  const displayActual = isLocked ? 0 : isCompleted ? progress.expected : Math.min(progress.actual, progress.expected)
  const pct = isLocked ? 0 : isCompleted ? 100 : Math.min(100, progress.expected > 0 ? (progress.actual / progress.expected) * 100 : 0)
  const statusLabel = isLocked ? 'Terkunci' : isCompleted ? 'Selesai' : progress.isStarted ? 'Aktif' : 'Belum dimulai'
  const statusColor = isLocked ? 'bg-[#F1F5F9] text-[#94A3B8]' : isCompleted ? 'bg-[#F0FDF4] text-[#15803D]' : progress.isStarted ? 'bg-[#E5F2FF] text-[#023DFF]' : 'bg-[#F1F5F9] text-[#65758B]'
  return (
    <div className={`bg-white rounded-xl border border-[#E1E7EF] p-4 space-y-3 ${isLocked ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#0F1729] leading-snug">{name}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor}`}>{statusLabel}</span>
      </div>
      <div>
        <div className="flex justify-between text-xs text-[#65758B] mb-1.5">
          <span>Checklist</span>
          <span className="font-semibold text-[#0F1729] tabular-nums">{displayActual}/{progress.expected}</span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {hasQuiz && (
        <div className="flex items-center gap-2 text-xs">
          <span>{quizDone ? '✅' : '🔒'}</span>
          <span className={quizDone ? 'text-[#15803D]' : 'text-[#94A3B8]'}>{quizDone ? 'Mini Quiz selesai' : 'Mini Quiz belum dikerjakan'}</span>
        </div>
      )}
    </div>
  )
}
