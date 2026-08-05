import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MILESTONES, DAILY_TASKS } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import type { FLProfile, DailyChecklist, DailyTaskRecord } from '../../types'

const PENAKSIRAN_MILESTONE_IDS = ['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb']

const MILESTONE_TASK_MAP: Record<string, string[]> = {
  'closing-cabang': ['closing-cabang'],
  'opening-cabang': ['opening-cabang'],
  'personal-grooming': ['personal-grooming'],
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

type TaskState = {
  checkedIds: Set<string>
  reflection: string
  submitted: boolean
  submittedAt?: string
}

export default function FLChecklistSession() {
  const { milestoneId } = useParams<{ milestoneId: string }>()
  const navigate = useNavigate()
  const { currentUser, activeSession, submitChecklist, clearSession, startSession, getFlChecklists } = useApp()
  const profile = currentUser!.profile as FLProfile

  const milestone = MILESTONES.find(m => m.id === milestoneId)
  const sessionTaskIds = milestoneId ? (MILESTONE_TASK_MAP[milestoneId] ?? []) : []
  const sessionTasks = DAILY_TASKS.filter(t => sessionTaskIds.includes(t.id))
  const isPenaksiran = milestoneId ? PENAKSIRAN_MILESTONE_IDS.includes(milestoneId) : false
  const hasActiveSession = activeSession?.milestoneId === milestoneId

  useEffect(() => {
    if (!hasActiveSession && milestoneId && milestone) {
      startSession(milestoneId)
    }
  }, [milestoneId]) // eslint-disable-line react-hooks/exhaustive-deps

  function loadDraft(checklistId: string | undefined): Record<string, TaskState> {
    try {
      const saved = localStorage.getItem(`session-draft-${currentUser!.id}-${checklistId ?? ''}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        return Object.fromEntries(
          sessionTasks.map(t => [t.id, {
            checkedIds: new Set<string>(parsed[t.id]?.checkedIds ?? []),
            reflection: parsed[t.id]?.reflection ?? '',
            submitted: parsed[t.id]?.submitted ?? false,
            submittedAt: parsed[t.id]?.submittedAt,
          }])
        )
      }
    } catch {}
    return Object.fromEntries(sessionTasks.map(t => [t.id, { checkedIds: new Set<string>(), reflection: '', submitted: false }]))
  }

  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>(() => loadDraft(activeSession?.checklistId))
  const [sbgCode, setSbgCode] = useState('')
  const [sbgSubmitted, setSbgSubmitted] = useState(false)
  const [draftSaved, setDraftSaved] = useState<Record<string, boolean>>({})

  function saveDraft(taskId: string) {
    if (activeSession?.checklistId) {
      const serialized = Object.fromEntries(
        Object.entries(taskStates).map(([k, v]) => [k, { ...v, checkedIds: [...v.checkedIds] }])
      )
      localStorage.setItem(`session-draft-${currentUser!.id}-${activeSession.checklistId}`, JSON.stringify(serialized))
    }
    setDraftSaved(prev => ({ ...prev, [taskId]: true }))
    setTimeout(() => setDraftSaved(prev => ({ ...prev, [taskId]: false })), 2000)
  }

  const prevChecklistId = useRef(activeSession?.checklistId)
  useEffect(() => {
    if (activeSession?.checklistId === prevChecklistId.current) return
    prevChecklistId.current = activeSession?.checklistId
    setTaskStates(loadDraft(activeSession?.checklistId))
    setSbgCode('')
    setSbgSubmitted(false)
  }, [activeSession?.checklistId]) // eslint-disable-line react-hooks/exhaustive-deps

  const doneCount = sessionTasks.filter(t => taskStates[t.id]?.submitted).length
  const allTasksDone = sessionTasks.length > 0 && doneCount === sessionTasks.length
  const sessionDone = isPenaksiran ? sbgSubmitted : allTasksDone
  const sessionChecklist = activeSession
    ? getFlChecklists(currentUser!.id).find(cl => cl.id === activeSession.checklistId)
    : undefined
  const isSessionScored = sessionChecklist?.status === 'scored'

  useEffect(() => {
    if (sessionDone && activeSession?.checklistId) {
      localStorage.removeItem(`session-draft-${currentUser!.id}-${activeSession.checklistId}`)
    }
  }, [sessionDone, activeSession?.checklistId]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleItem(taskId: string, itemId: string) {
    setTaskStates(prev => {
      const ts = prev[taskId]
      const next = new Set(ts.checkedIds)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return { ...prev, [taskId]: { ...ts, checkedIds: next } }
    })
  }

  function setReflectionText(taskId: string, value: string) {
    setTaskStates(prev => ({ ...prev, [taskId]: { ...prev[taskId], reflection: value } }))
  }

  function submitTask(taskId: string) {
    if (!activeSession) return
    const now = new Date().toISOString()
    const updatedStates = { ...taskStates, [taskId]: { ...taskStates[taskId], submitted: true, submittedAt: now } }
    setTaskStates(updatedStates)
    const submittedTasks: DailyTaskRecord[] = sessionTasks
      .filter(t => updatedStates[t.id]?.submitted)
      .map(t => ({
        taskId: t.id,
        taskName: t.name,
        completedItemIds: [...updatedStates[t.id].checkedIds],
        reflection: updatedStates[t.id].reflection,
        submittedAt: updatedStates[t.id].submittedAt ?? now,
      }))
    const checklist: DailyChecklist = {
      id: activeSession.checklistId,
      day: profile.currentDay,
      date: new Date().toISOString().slice(0, 10),
      flId: currentUser!.id,
      milestoneId: activeSession.milestoneId,
      tasks: submittedTasks,
      status: 'submitted',
      submittedAt: now,
    }
    submitChecklist(checklist)
  }

  function submitSbgCode() {
    if (!activeSession || !sbgCode.trim()) return
    const now = new Date().toISOString()
    const task = sessionTasks[0]
    const checklist: DailyChecklist = {
      id: activeSession.checklistId,
      day: profile.currentDay,
      date: new Date().toISOString().slice(0, 10),
      flId: currentUser!.id,
      milestoneId: activeSession.milestoneId,
      tasks: [{
        taskId: task?.id ?? activeSession.milestoneId,
        taskName: task?.name ?? activeSession.milestoneId,
        completedItemIds: [],
        reflection: `Kode SBG: ${sbgCode.trim()}`,
        submittedAt: now,
      }],
      status: 'submitted',
      submittedAt: now,
    }
    submitChecklist(checklist)
    setSbgSubmitted(true)
  }

  if (!milestone) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-sm text-[#65758B]">Modul tidak ditemukan.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#023DFF] hover:underline mt-2 inline-block">← Kembali</button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white border border-[#E1E7EF] flex items-center justify-center hover:border-[#023DFF] hover:text-[#023DFF] transition-colors flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2.5L5 7l4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#0F1729] leading-tight">Submit Tugas</h1>
          <p className="text-sm text-[#65758B] mt-0.5 truncate">{milestone.name}</p>
        </div>
      </div>

      {sessionDone ? (
        !isSessionScored ? (
          <div className="bg-[#FEFDEA] rounded-xl border border-[#E0A200]/30 p-6 flex flex-col items-center text-center gap-3">
            <p className="text-3xl">⏳</p>
            <div>
              <p className="text-base font-bold text-[#B27202]">Menunggu penilaian kanit</p>
              <p className="text-sm text-[#92400E]/80 mt-1">
                {isPenaksiran ? 'Data penaksiran sudah disubmit. Kanit akan memverifikasi.' : 'Semua task sudah disubmit. Kanit akan mereview dan menilai hasilnya.'}
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => { clearSession(); navigate('/fl/checklist') }}
                className="h-9 px-4 bg-white border border-[#E0A200] text-[#B27202] font-semibold text-sm rounded-lg hover:bg-[#FEFDEA] transition-colors"
              >
                Ke Checklist
              </button>
              <Link
                to={`/fl/milestones/${milestoneId}`}
                onClick={clearSession}
                className="h-9 px-5 bg-[#E0A200] hover:bg-[#B27202] text-white font-semibold text-sm rounded-lg transition-colors flex items-center"
              >
                Lihat Progress →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#F0FDF4] rounded-xl border border-[#16A34A]/20 p-6 flex flex-col items-center text-center gap-3">
            <p className="text-3xl">✅</p>
            <div>
              <p className="text-base font-bold text-[#15803D]">Sesi selesai!</p>
              <p className="text-sm text-[#15803D]/70 mt-1">
                {isPenaksiran ? 'Data penaksiran sudah diverifikasi Kanit.' : 'Semua task sudah dinilai oleh Kanit.'}
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => { clearSession(); navigate('/fl/checklist') }}
                className="h-9 px-4 bg-white border border-[#16A34A] text-[#15803D] font-semibold text-sm rounded-lg hover:bg-[#F0FDF4] transition-colors"
              >
                Ke Checklist
              </button>
              <Link
                to={`/fl/milestones/${milestoneId}`}
                onClick={clearSession}
                className="h-9 px-5 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm rounded-lg transition-colors flex items-center"
              >
                Lihat Progress →
              </Link>
            </div>
          </div>
        )
      ) : isPenaksiran ? (
        <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
          <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E1E7EF]">
            <p className="text-sm font-bold text-[#0F1729]">{milestone.name}</p>
          </div>
          <div className="p-5 flex items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-bold text-[#0F1729]">Kode SBG</p>
              <p className="text-xs text-[#65758B]">Masukkan kode dari Surat Bukti Gadai. Kanit akan verifikasi detail di Intools.</p>
              <input
                type="text"
                value={sbgCode}
                onChange={e => setSbgCode(e.target.value)}
                placeholder="Contoh: SBG-2026-00123"
                className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none focus:border-[#023DFF] transition-colors font-mono tracking-wide mt-1"
              />
            </div>
            <button
              disabled={!sbgCode.trim()}
              onClick={submitSbgCode}
              className={`h-9 px-5 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${sbgCode.trim() ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}
            >
              Submit Kode
            </button>
          </div>
          <div className="flex items-center gap-3 px-5">
            <div className="flex-1 h-px bg-[#E1E7EF]" />
            <span className="text-xs text-[#94A3B8] font-medium">atau</span>
            <div className="flex-1 h-px bg-[#E1E7EF]" />
          </div>
          <div className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#0F1729]">Simulasi Gadai</p>
              <p className="text-xs text-[#65758B] mt-0.5">Isi form penaksiran lengkap — jenis barang, kondisi, nilai taksiran, dan dokumen.</p>
            </div>
            <button
              onClick={() => navigate(`/fl/checklist/penaksiran-sim/${milestoneId}`)}
              className="h-9 px-5 rounded-lg text-sm font-semibold border border-[#023DFF] text-[#023DFF] hover:bg-[#023DFF] hover:text-white transition-all flex-shrink-0 flex items-center gap-1.5"
            >
              Mulai Simulasi
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="px-5 pb-4">
            <button onClick={clearSession} className="text-xs text-[#94A3B8] hover:text-[#DC2626] transition-colors">Batalkan sesi</button>
          </div>
        </div>
      ) : (
        <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sessionTasks.map((task, tIdx) => {
            const ts = taskStates[task.id]
            const isSubmitted = ts?.submitted ?? false
            const canSubmit = true
            const checkedCount = ts?.checkedIds.size ?? 0
            return (
              <div key={task.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${isSubmitted ? 'border-[#16A34A]' : 'border-[#E1E7EF]'}`}>
                <div className={`px-5 py-4 flex items-center justify-between gap-3 ${isSubmitted ? 'bg-[#F0FDF4]' : 'bg-[#F8FAFC]'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F1729]">{task.name}</p>
                    <p className="text-xs text-[#65758B] mt-0.5">{checkedCount}/{task.items.length} item dikerjakan</p>
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
                        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${checked ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1] group-hover:border-[#023DFF]'}`}>
                          {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <p className="text-sm leading-snug text-[#0F1729]">{item.text}</p>
                      </button>
                    )
                  })}
                </div>
                {!isSubmitted && (
                  <div className="px-5 pb-5 border-t border-[#E1E7EF] pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveDraft(task.id)}
                        className={`flex-1 h-10 rounded-lg font-semibold text-sm border transition-colors ${
                          draftSaved[task.id]
                            ? 'border-[#16A34A] text-[#15803D] bg-[#F0FDF4]'
                            : 'border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF] hover:text-[#023DFF]'
                        }`}
                      >
                        {draftSaved[task.id] ? 'Tersimpan ✓' : 'Simpan Draft'}
                      </button>
                      <button
                        onClick={() => submitTask(task.id)}
                        className="flex-1 h-10 bg-[#023DFF] hover:bg-[#001CDB] text-white rounded-lg font-semibold text-sm transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={clearSession}
            className="h-9 px-6 text-sm font-semibold text-[#94A3B8] hover:text-[#DC2626] transition-colors"
          >
            Batalkan sesi
          </button>
        </div>
        </div>
      )}
    </div>
  )
}
