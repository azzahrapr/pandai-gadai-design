import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { DAILY_TASKS } from '../../data/mockData'
import type { FLProfile, DailyChecklist, DailyTaskRecord } from '../../types'

type TaskState = {
  checkedIds: Set<string>
  reflection: string
  submitted: boolean
  submittedAt?: string
}

export default function FLChecklist() {
  const { currentUser, submitChecklist, getTodayChecklist, getFlChecklists } = useApp()
  const profile = currentUser!.profile as FLProfile
  const currentDay = profile.currentDay
  const existing = getTodayChecklist(currentUser!.id)

  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>(() => {
    if (existing?.tasks) {
      return Object.fromEntries(
        DAILY_TASKS.map(t => {
          const saved = existing.tasks!.find(r => r.taskId === t.id)
          return [t.id, {
            checkedIds: new Set(saved?.completedItemIds ?? []),
            reflection: saved?.reflection ?? '',
            submitted: !!saved,
            submittedAt: saved?.submittedAt,
          }]
        })
      )
    }
    return Object.fromEntries(
      DAILY_TASKS.map(t => [t.id, { checkedIds: new Set<string>(), reflection: '', submitted: false }])
    )
  })

  const [overallSubmitted, setOverallSubmitted] = useState(
    !!(existing?.tasks && DAILY_TASKS.every(t => existing.tasks!.find(r => r.taskId === t.id)))
  )

  const allTasksDone = DAILY_TASKS.every(t => taskStates[t.id]?.submitted)

  useEffect(() => {
    if (allTasksDone && !overallSubmitted) {
      const tasks: DailyTaskRecord[] = DAILY_TASKS.map(t => ({
        taskId: t.id,
        taskName: t.name,
        completedItemIds: [...taskStates[t.id].checkedIds],
        reflection: taskStates[t.id].reflection,
        submittedAt: taskStates[t.id].submittedAt ?? new Date().toISOString(),
      }))
      const checklist: DailyChecklist = {
        id: `cl-${currentUser!.id}-${currentDay}`,
        day: currentDay,
        date: '2026-07-13',
        flId: currentUser!.id,
        tasks,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      }
      submitChecklist(checklist)
      setOverallSubmitted(true)
    }
  }, [allTasksDone])

  function toggleItem(taskId: string, itemId: string) {
    setTaskStates(prev => {
      const ts = prev[taskId]
      const next = new Set(ts.checkedIds)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return { ...prev, [taskId]: { ...ts, checkedIds: next } }
    })
  }

  function setReflection(taskId: string, value: string) {
    setTaskStates(prev => ({ ...prev, [taskId]: { ...prev[taskId], reflection: value } }))
  }

  function submitTask(taskId: string) {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], submitted: true, submittedAt: new Date().toISOString() },
    }))
  }

  const doneCount = DAILY_TASKS.filter(t => taskStates[t.id]?.submitted).length
  const history = getFlChecklists(currentUser!.id).filter(c => c.day !== currentDay).sort((a, b) => b.day - a.day)
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1729]">Daily Checklist</h1>
        <p className="text-[#65758B] text-sm mt-1">Hari ke-{currentDay} dari 14</p>
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] p-4 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#0F1729]">Progress hari ini</span>
            <span className="text-sm font-bold text-[#023DFF]">{doneCount}/{DAILY_TASKS.length} task selesai</span>
          </div>
          <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#023DFF] rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / DAILY_TASKS.length) * 100}%` }}
            />
          </div>
        </div>
        {allTasksDone && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#F0FDF4] text-[#15803D] flex-shrink-0">
            ✓ Semua selesai
          </span>
        )}
      </div>

      {allTasksDone && (
        <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-bold text-[#15803D] text-sm">Checklist hari ini sudah dikirim!</p>
            <p className="text-xs text-[#15803D]/80 mt-0.5">Menunggu penilaian dari Kanit.</p>
          </div>
        </div>
      )}

      {/* Task cards */}
      <div className="grid grid-cols-2 gap-4">
        {DAILY_TASKS.map((task, tIdx) => {
          const ts = taskStates[task.id]
          const isSubmitted = ts?.submitted ?? false
          const canSubmit = (ts?.reflection.trim().length ?? 0) > 0
          const checkedCount = ts?.checkedIds.size ?? 0

          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                isSubmitted ? 'border-[#16A34A]' : 'border-[#E1E7EF]'
              }`}
            >
              {/* Task header */}
              <div className={`px-5 py-4 flex items-center justify-between ${isSubmitted ? 'bg-[#F0FDF4]' : 'bg-[#F8FAFC]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isSubmitted ? 'bg-[#16A34A] text-white' : 'bg-[#E1E7EF] text-[#65758B]'
                  }`}>
                    {isSubmitted ? '✓' : tIdx + 1}
                  </div>
                  <p className="font-bold text-[#0F1729]">{task.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#65758B]">{checkedCount}/{task.items.length} item</span>
                  {isSubmitted && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#15803D]">Selesai</span>
                  )}
                </div>
              </div>

              {/* Subtask items */}
              <div className="px-5 py-4 space-y-3 border-t border-[#E1E7EF]">
                {task.items.map(item => {
                  const checked = ts?.checkedIds.has(item.id) ?? false
                  return (
                    <button
                      key={item.id}
                      disabled={isSubmitted}
                      onClick={() => toggleItem(task.id, item.id)}
                      className={`w-full flex items-start gap-3 text-left transition-opacity ${isSubmitted ? 'opacity-60 cursor-default' : 'cursor-pointer group'}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                        checked
                          ? 'bg-[#023DFF] border-[#023DFF]'
                          : 'border-[#CBD5E1] group-hover:border-[#023DFF]'
                      }`}>
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <p className={`text-sm leading-snug transition-colors ${
                        checked ? 'text-[#94A3B8] line-through' : 'text-[#0F1729]'
                      }`}>
                        {item.text}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Reflection + submit */}
              <div className="px-5 pb-5 border-t border-[#E1E7EF] pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Refleksi <span className="text-[#DC2626]">*</span>
                  </label>
                  <p className="text-xs text-[#65758B] mb-2">Apa yang sudah kamu lakukan dengan baik, atau yang perlu kamu perbaiki dari task ini?</p>
                  {isSubmitted ? (
                    <div className="bg-[#F8FAFC] rounded-lg border border-[#E1E7EF] px-4 py-3">
                      <p className="text-sm text-[#0F1729] leading-relaxed italic">"{ts.reflection}"</p>
                    </div>
                  ) : (
                    <textarea
                      value={ts?.reflection ?? ''}
                      onChange={e => setReflection(task.id, e.target.value)}
                      placeholder="Tulis refleksimu di sini..."
                      rows={3}
                      className={`w-full border rounded-lg px-4 py-3 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none transition-colors resize-none leading-relaxed ${
                        (ts?.reflection.trim().length ?? 0) === 0 && ts?.submitted === false
                          ? 'border-[#CBD5E1] focus:border-[#023DFF]'
                          : 'border-[#CBD5E1] focus:border-[#023DFF]'
                      }`}
                    />
                  )}
                </div>

                {!isSubmitted && (
                  <div className="flex items-center justify-between">
                    {!canSubmit && (
                      <p className="text-xs text-[#94A3B8]">Isi refleksi dulu sebelum submit.</p>
                    )}
                    <button
                      disabled={!canSubmit}
                      onClick={() => submitTask(task.id)}
                      className={`ml-auto h-9 px-5 rounded-lg font-semibold text-sm transition-all ${
                        canSubmit
                          ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
                          : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
                      }`}
                    >
                      Submit Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-5 w-1 rounded-full bg-[#65758B] flex-shrink-0" />
            <h2 className="text-base font-bold text-[#0F1729]">Riwayat Checklist</h2>
          </div>
          <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
            {history.map((cl, idx) => {
              const isExpanded = expandedHistory === cl.id
              const taskCount = cl.tasks ? cl.tasks.length : 1

              return (
                <div key={cl.id} className={idx < history.length - 1 ? 'border-b border-[#E1E7EF]' : ''}>
                  {/* Row */}
                  <button
                    onClick={() => setExpandedHistory(isExpanded ? null : cl.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      cl.status === 'scored'
                        ? (cl.kanitScore ?? 0) >= 85 ? 'bg-[#F0FDF4] text-[#15803D]'
                          : (cl.kanitScore ?? 0) >= 75 ? 'bg-[#FEFDEA] text-[#B27202]'
                          : 'bg-[#FEF2F2] text-[#B91C1C]'
                        : 'bg-[#F1F5F9] text-[#65758B]'
                    }`}>
                      {cl.day}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F1729]">Hari {cl.day}</p>
                      <p className="text-xs text-[#65758B] mt-0.5">
                        {cl.date} · {taskCount} task
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {cl.status === 'scored' ? (
                        <>
                          <span className={`text-sm font-bold ${
                            (cl.kanitScore ?? 0) >= 85 ? 'text-[#15803D]'
                            : (cl.kanitScore ?? 0) >= 75 ? 'text-[#B27202]'
                            : 'text-[#B91C1C]'
                          }`}>{cl.kanitScore}/100</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D]">Dinilai</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FEFDEA] text-[#B27202]">Menunggu</span>
                      )}
                      <svg
                        className={`text-[#94A3B8] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                        width="16" height="16" viewBox="0 0 16 16" fill="none"
                      >
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-[#E1E7EF] pt-4 bg-[#F8FAFC] space-y-3">
                      {cl.tasks ? (
                        <div className="space-y-2">
                          {cl.tasks.map((task, tIdx) => (
                            <div key={task.taskId} className="bg-white rounded-lg border border-[#E1E7EF] px-4 py-3 flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-[#F1F5F9] flex items-center justify-center text-xs font-bold text-[#65758B] flex-shrink-0">
                                {tIdx + 1}
                              </div>
                              <p className="text-sm font-semibold text-[#0F1729] flex-1">{task.taskName}</p>
                              <span className="text-xs text-[#65758B]">{task.completedItemIds.length} item selesai</span>
                            </div>
                          ))}
                        </div>
                      ) : cl.items ? (
                        <div className="bg-white rounded-lg border border-[#E1E7EF] px-4 py-3 flex items-center justify-between">
                          <span className="text-sm text-[#0F1729] font-semibold">{cl.milestoneName}</span>
                          <span className="text-xs text-[#65758B]">{cl.items.filter(i => i.completed).length}/{cl.items.length} item selesai</span>
                        </div>
                      ) : null}
                      {cl.kanitNote && (
                        <div className="bg-[#E5F2FF] rounded-lg border border-[#023DFF]/20 px-4 py-3">
                          <p className="text-xs font-semibold text-[#023DFF] mb-1">Catatan Kanit</p>
                          <p className="text-sm text-[#001CDB]">"{cl.kanitNote}"</p>
                        </div>
                      )}
                      <Link
                        to={`/fl/checklist/${cl.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#023DFF] hover:underline"
                      >
                        Lihat Detail →
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
