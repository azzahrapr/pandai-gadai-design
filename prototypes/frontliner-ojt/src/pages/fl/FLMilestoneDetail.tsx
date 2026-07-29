import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { MILESTONES, DAILY_TASKS } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import type { FLProfile } from '../../types'

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

const DAILY_MILESTONE_IDS = new Set(['closing-cabang', 'opening-cabang', 'personal-grooming', 'pengenalan-produk', 'pelayanan-nasabah', 'customer-service-wa'])

const MILESTONE_EXPECTED_COUNT: Record<string, number> = {
  'closing-cabang': 3,
  'opening-cabang': 3,
  'personal-grooming': 12,
  'pengenalan-produk': 3,
  'canvassing': 3,
  'cash-management': 1,
  'sop-administrasi': 5,
  'packing-sealing': 3,
  'offloading': 1,
  'pelayanan-nasabah': 6,
  'customer-service-wa': 3,
  'penaksiran-elektronik': 2,
  'penaksiran-emas': 1,
  'penaksiran-bpkb': 2,
}

export default function FLMilestoneDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, getFlChecklists, startMilestone, startSession, activeSession, getItemConfirmations } = useApp()
  const profile = currentUser!.profile as FLProfile
  const milestone = MILESTONES.find(m => m.id === id)

  const isIndividual = milestone?.submissionType === 'individual'

  const allChecklists = getFlChecklists(currentUser!.id).filter(c =>
    c.status === 'submitted' || c.status === 'scored'
  )

  const relatedTaskIds = milestone ? (MILESTONE_TASK_MAP[milestone.id] ?? []) : []
  const expectedCount = milestone ? (MILESTONE_EXPECTED_COUNT[milestone.id] ?? 2) : 2
  const isPenaksiran = milestone ? PENAKSIRAN_MILESTONE_IDS.includes(milestone.id) : false
  const milestoneSubmissions = isPenaksiran
    ? allChecklists.filter(cl => cl.milestoneId === milestone!.id).length
    : relatedTaskIds.length > 0
      ? allChecklists.filter(cl =>
          cl.tasks?.some(t => {
            if (!relatedTaskIds.includes(t.taskId)) return false
            if (t.reflection?.startsWith('Kode SBG:')) return true
            const ms = MILESTONES.find(m => m.id === t.taskId)
            const total = ms?.checklistItems?.length ?? 0
            return total === 0 || t.completedItemIds.length >= total
          })
        ).length
      : 0

  // For individual-type modules: track per-item confirmations
  const itemConfirmationCounts = Object.fromEntries(
    (milestone?.checklistItems ?? []).map(item => [
      item.id,
      getItemConfirmations(currentUser!.id, milestone!.id, item.id).length,
    ])
  )
  const confirmedItemIds = new Set(
    (milestone?.checklistItems ?? [])
      .filter(item => itemConfirmationCounts[item.id] >= (item.target ?? 1))
      .map(item => item.id)
  )
  const allItemsConfirmed = isIndividual
    ? (milestone?.checklistItems ?? []).every(item => confirmedItemIds.has(item.id))
    : false
  const actualIndividualCount = isIndividual
    ? Object.values(itemConfirmationCounts).reduce((s, n) => s + n, 0)
    : 0
  const expectedIndividualCount = isIndividual
    ? (milestone?.checklistItems ?? []).reduce((s, item) => s + (item.target ?? 1), 0)
    : 0

  const explicitlyCompleted = milestone ? (profile.completedMilestoneIds?.includes(milestone.id) ?? false) : false
  const effectiveSubmissions = explicitlyCompleted ? expectedCount : milestoneSubmissions
  const hasRelatedChecklist = explicitlyCompleted || milestoneSubmissions > 0
  const isCompleted = explicitlyCompleted || (isIndividual ? allItemsConfirmed : milestoneSubmissions >= expectedCount)
  const quizUnlocked = isCompleted

  const storedQuizScore: number | null = (milestone?.quiz?.length && profile.quizScores?.[milestone.id] !== undefined)
    ? profile.quizScores![milestone.id]
    : null

  // Session state
  const hasActiveSessionHere = activeSession?.milestoneId === milestone?.id
  const hasChecklistDraft = !isIndividual && !isCompleted && (() => {
    try {
      const key = `checklist-draft-${currentUser!.id}-${milestone?.id}-d${profile.currentDay}`
      const raw = localStorage.getItem(key)
      if (!raw) return false
      const parsed = JSON.parse(raw) as string[]
      return Array.isArray(parsed) && parsed.length > 0
    } catch { return false }
  })()
  const hasMeaningfulDraft = hasChecklistDraft || (hasActiveSessionHere && !!activeSession?.checklistId && (() => {
    try {
      const raw = localStorage.getItem(`session-draft-${currentUser!.id}-${activeSession.checklistId}`)
      if (!raw) return false
      const parsed = JSON.parse(raw)
      return Object.values(parsed).some((ts: unknown) => {
        const t = ts as { checkedIds?: string[]; reflection?: string }
        return (t.checkedIds?.length ?? 0) > 0 || (t.reflection?.trim().length ?? 0) > 0
      })
    } catch { return false }
  })())
  // Opening & Closing: only 1 per day — check if BOTH opening & closing already submitted
  const ocAlreadyDoneToday = (milestone?.id === 'opening-cabang' || milestone?.id === 'closing-cabang') && !hasActiveSessionHere &&
    allChecklists.some(c =>
      c.day === profile.currentDay &&
      (c.tasks?.some(t => t.taskId === 'opening-cabang') || c.tasks?.some(t => t.taskId === 'closing-cabang'))
    )

  function handleMulaiSesi() {
    if (!milestone) return
    if (!profile.activeMilestoneIds?.includes(milestone.id)) startMilestone(milestone.id)
    navigate(`/fl/milestones/${milestone.id}/tasks`)
  }

  const progressRef = useRef<HTMLDivElement>(null)

  const [currentMaterialIdx, setCurrentMaterialIdx] = useState<number>(0)
  const [quizAnswers] = useState<Record<string, number>>(
    () => (milestone?.id && profile.quizAnswers?.[milestone.id]) ? profile.quizAnswers[milestone.id] : {}
  )
  const [quizSubmitted] = useState<boolean>(
    () => !!(milestone?.quiz?.length) && profile.quizScores?.[milestone.id] !== undefined
  )
  const [activeSection, setActiveSection] = useState<'progress' | null>(null)
  const [showHistory, setShowHistory] = useState(() => !!(location.state as { openHistory?: boolean } | null)?.openHistory)
  const [expandedHistorySessions, setExpandedHistorySessions] = useState<Set<string>>(new Set())
  const [expandedHistoryConfs, setExpandedHistoryConfs] = useState<Set<string>>(new Set())

  // Deadline badge
  const isDaily = DAILY_MILESTONE_IDS.has(milestone?.id ?? '')
  const daysLeft = !milestone ? 0 : isDaily ? 0 : milestone.type === 'minggu1' ? 7 - profile.currentDay : 13 - profile.currentDay
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date(), end = new Date()
    end.setHours(23, 59, 59, 999)
    return Math.max(0, end.getTime() - now.getTime())
  })
  useEffect(() => {
    if (isCompleted || daysLeft !== 0) return
    const iv = setInterval(() => {
      const now = new Date(), end = new Date()
      end.setHours(23, 59, 59, 999)
      setTimeLeft(Math.max(0, end.getTime() - now.getTime()))
    }, 1000)
    return () => clearInterval(iv)
  }, [isCompleted, daysLeft])
  function formatCountdown(ms: number) {
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }
  const deadlineText = !isCompleted ? (
    daysLeft > 0
      ? <p className="text-xs text-[#94A3B8] mt-2 text-center">Batas pengerjaan <span className="text-[#B27202] font-medium">{daysLeft} hari lagi</span></p>
      : daysLeft === 0
        ? <p className="text-xs text-[#94A3B8] mt-2 text-center">Batas pengerjaan hari ini <span className="text-[#B27202] font-medium tabular-nums">{formatCountdown(timeLeft)}</span></p>
        : null
  ) : null

  if (!milestone) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#65758B]">Milestone tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 text-sm text-[#023DFF] hover:underline">← Kembali</button>
        </div>
      </div>
    )
  }

  const isLevel2 = milestone.type === 'minggu2'

  const historySessions = !isIndividual
    ? (isPenaksiran
        ? allChecklists.filter(cl => cl.milestoneId === milestone.id)
        : allChecklists.filter(cl => cl.tasks?.some(t => relatedTaskIds.includes(t.taskId)))
      ).sort((a, b) => b.day - a.day || (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))
    : []

  const itemHistory = isIndividual
    ? milestone.checklistItems
        .map(item => ({
          item,
          confirmations: getItemConfirmations(currentUser!.id, milestone.id, item.id)
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
        }))
        .filter(g => g.confirmations.length > 0)
    : []
  const submittedToday = !isIndividual && !isPenaksiran && allChecklists.some(c =>
    c.day === profile.currentDay && c.tasks?.some(t => relatedTaskIds.includes(t.taskId))
  )

  const MILESTONE_FROM_DAY: Record<string, number> = {
    'closing-cabang': 1, 'opening-cabang': 4, 'personal-grooming': 1,
    'pelayanan-nasabah': 8, 'customer-service-wa': 8,
  }
  const scheduleFromDay = MILESTONE_FROM_DAY[milestone.id] ?? 1
  const isScheduleLocked = !isIndividual && !isPenaksiran && profile.currentDay < scheduleFromDay
  const scheduleStartDateStr = (() => {
    const d = new Date(profile.startDate)
    d.setDate(d.getDate() + scheduleFromDay - 1)
    const mo = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
    return `${d.getDate()} ${mo[d.getMonth()]} ${d.getFullYear()}`
  })()

  const hasQuiz = !!(milestone.quiz && milestone.quiz.length > 0)

  const quizScore: number | null = hasQuiz && quizSubmitted
    ? (storedQuizScore !== null
        ? storedQuizScore
        : Math.round(milestone.quiz!.filter(q => quizAnswers[q.id] === q.correctIndex).length / milestone.quiz!.length * 100))
    : null
  const quizPassing = quizScore !== null && quizScore >= 75

  // IA conditions
  const hasActiveTugas = isIndividual
    ? actualIndividualCount > 0
    : effectiveSubmissions > 0 || hasMeaningfulDraft

  // Progress block — rendered either above or below content depending on hasActiveTugas
  const progressBlock = isIndividual ? (
    <div className="mb-6">
    <div className="bg-white rounded-xl border border-[#E1E7EF] p-4">
      <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Latihan</p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#65758B]">Target penyelesaian</span>
          <span className={`font-semibold ${isCompleted ? 'text-[#15803D]' : 'text-[#0F1729]'}`}>
            {actualIndividualCount}/{expectedIndividualCount} latihan
          </span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`}
            style={{ width: `${expectedIndividualCount > 0 ? Math.min(100, (actualIndividualCount / expectedIndividualCount) * 100) : 0}%` }}
          />
        </div>
        {!isCompleted && (
          <Link
            to={`/fl/milestones/${milestone.id}/tasks`}
            className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {actualIndividualCount === 0 ? 'Mulai Latihan' : 'Lanjutkan'}
          </Link>
        )}
        {actualIndividualCount > 0 && (
          <p className="text-xs text-[#65758B]">
            Total {actualIndividualCount} latihan sudah disubmit.{' '}
            <button onClick={() => setShowHistory(true)} className="text-[#023DFF] hover:underline font-medium">
              Lihat riwayat →
            </button>
          </p>
        )}
      </div>
    </div>
    {deadlineText}
    </div>
  ) : (
    <div className="mb-6">
    <div className="bg-white rounded-xl border border-[#E1E7EF] p-4">
      <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Latihan</p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#65758B]">Target penyelesaian</span>
          <span className={`font-semibold ${isCompleted ? 'text-[#15803D]' : 'text-[#0F1729]'}`}>
            {Math.min(effectiveSubmissions, expectedCount)}/{expectedCount} latihan
          </span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`}
            style={{ width: `${Math.min(100, (effectiveSubmissions / expectedCount) * 100)}%` }}
          />
        </div>
        {submittedToday && !isCompleted && isDaily && (
          <div className="flex items-center gap-2.5 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-lg px-3 py-2.5">
            <div className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-xs text-[#15803D] leading-relaxed">Latihan hari ini berhasil dikerjakan. Silakan kembali lagi besok.</p>
          </div>
        )}
        {isScheduleLocked && (
          <div className="flex items-center gap-2.5 bg-[#F8FAFC] border border-[#E1E7EF] rounded-lg px-3 py-2.5">
            <span className="text-sm flex-shrink-0">🔒</span>
            <p className="text-xs text-[#65758B]">Latihan ini tersedia mulai <span className="text-[#0F1729] font-medium">{scheduleStartDateStr}</span></p>
          </div>
        )}
        {hasMeaningfulDraft ? (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-lg px-3 py-2.5">
              <span className="text-sm flex-shrink-0">🔄</span>
              <p className="text-xs text-[#15803D] font-medium leading-relaxed">Ada draft latihan yang tersimpan.</p>
            </div>
            <Link
              to={`/fl/milestones/${milestone.id}/tasks`}
              className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Lanjutkan →
            </Link>
          </div>
        ) : !isCompleted && !ocAlreadyDoneToday && !isScheduleLocked ? (
          <button
            onClick={handleMulaiSesi}
            className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {effectiveSubmissions === 0 ? 'Mulai Latihan' : 'Lanjutkan'}
          </button>
        ) : null}
        {effectiveSubmissions > 0 && (
          <p className="text-xs text-[#65758B]">
            Total {effectiveSubmissions} latihan sudah disubmit.{' '}
            <button onClick={() => setShowHistory(true)} className="text-[#023DFF] hover:underline font-medium">
              Lihat riwayat →
            </button>
          </p>
        )}
      </div>
    </div>
    {deadlineText}
    </div>
  )

  // Quiz card — floated above materi when unlocked (condition c)
  const quizCard = hasQuiz ? (
    quizSubmitted ? (
      <div className={`bg-white rounded-xl border p-4 mb-6 ${quizPassing ? 'border-[#E1E7EF]' : 'border-[#DC2626]/40'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${quizPassing ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'}`}>📝</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-bold ${quizPassing ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                {quizScore}/100
              </span>
              <span className={`inline-flex items-center h-4 px-2 rounded-full text-[10px] font-bold border ${
                quizPassing
                  ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]'
                  : 'bg-[#FEF2F2] border-[#DC2626]/50 text-[#DC2626]'
              }`}>
                {quizPassing ? 'Lulus' : 'Tidak Lulus'}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/fl/milestones/${milestone.id}/quiz`)}
            className="flex-shrink-0 h-8 px-3 bg-white border border-[#CBD5E1] text-[#0F1729] text-xs font-semibold rounded-lg hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF] transition-all"
          >
            Lihat Jawaban
          </button>
        </div>
      </div>
    ) : quizUnlocked ? (
      <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-base flex-shrink-0">📝</div>
          <div>
            <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
            <p className="text-xs text-[#65758B] mt-0.5">Satu langkah lagi! Kerjakan quiz untuk menyelesaikan modul.</p>
          </div>
        </div>
        <div className="bg-[#FEFDEA] border border-[#E0A200]/30 rounded-lg px-4 py-3 flex items-start gap-2.5">
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-xs text-[#B27202] leading-relaxed">
            Quiz hanya bisa dikerjakan <strong>1 kali</strong> — kerjakan dengan serius.
          </p>
        </div>
        <button
          onClick={() => navigate(`/fl/milestones/${milestone.id}/quiz`)}
          className="w-full h-9 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
        >
          Mulai Quiz →
        </button>
      </div>
    ) : null
  ) : null

  return (
    <>
    <div className="p-4 md:p-8">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white border border-[#E1E7EF] flex items-center justify-center hover:border-[#023DFF] hover:text-[#023DFF] transition-colors flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2.5L5 7l4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#0F1729] leading-tight">{milestone.name}</h1>
        </div>
      </div>

      {/* 2. Tips banner — DS Banner Info / Informative / Desktop */}
      <div className="bg-[#EFF6FF] rounded-lg px-4 py-3 mb-6">
        <div className="flex items-start gap-2">
          <div className="w-[14px] h-[14px] rounded-full bg-[#023DFF] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M4 3.5v3" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="4" cy="2" r="0.6" fill="white"/>
            </svg>
          </div>
          <p className="text-sm text-[#65758B]">
            {isIndividual
              ? 'Pelajari materi, lalu kerjakan setiap tugas secara terpisah melalui halaman daftar tugas.'
              : hasQuiz
                ? 'Pelajari materi, lalu kerjakan tugas dan mini quiz. Progress dihitung dari terpenuhinya target tugas.'
                : 'Pelajari materi, lalu kerjakan tugas. Progress dihitung dari terpenuhinya target tugas.'}
          </p>
        </div>
      </div>

      {/* 3. Daftar Isi */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] p-4 mb-6">
        <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Daftar Isi</p>
        <div className="space-y-1">
          {milestone.materials.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => { setCurrentMaterialIdx(idx); setActiveSection(null) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                currentMaterialIdx === idx && activeSection === null ? 'bg-[#E5F2FF] text-[#023DFF] font-medium' : 'text-[#65758B] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="text-xs font-bold w-4 text-center flex-shrink-0 text-[#94A3B8]">{idx + 1}</span>
              <span className="truncate">{m.title}</span>
            </button>
          ))}
          <div className="border-t border-[#E1E7EF] my-1" />
          <button
            onClick={() => { setActiveSection('progress'); progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${activeSection === 'progress' ? 'bg-[#E5F2FF] text-[#023DFF] font-medium' : 'text-[#65758B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="w-4 text-center flex-shrink-0 text-sm leading-none">🎯</span>
            <span className="truncate">Latihan</span>
            {isCompleted && <span className="ml-auto flex-shrink-0 inline-flex items-center h-4 px-2 rounded-full text-[10px] font-bold bg-[#F0FDF4] border border-[#16A34A] text-[#15803D]">Lulus</span>}
          </button>
          {hasQuiz && (
            <button
              onClick={() => quizUnlocked && navigate(`/fl/milestones/${milestone.id}/quiz`)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all text-[#65758B] hover:bg-[#F8FAFC]"
            >
              <span className="text-xs font-bold w-4 text-center flex-shrink-0">📝</span>
              <span className="truncate flex-1">Mini Quiz</span>
              {quizSubmitted ? (
                <span className={`ml-auto flex-shrink-0 inline-flex items-center h-4 px-2 rounded-full text-[10px] font-bold border ${
                  quizPassing
                    ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]'
                    : 'bg-[#FEF2F2] border-[#DC2626]/50 text-[#DC2626]'
                }`}>
                  {quizPassing ? 'Lulus' : 'Tidak Lulus'}
                </span>
              ) : !quizUnlocked ? (
                <span className="ml-auto text-[10px] text-[#CBD5E1] flex-shrink-0">🔒</span>
              ) : null}
            </button>
          )}
        </div>
      </div>

      {/* Quiz card — below daftar isi when unlocked or submitted */}
      {quizUnlocked && quizCard}

      {/* b: Progress Latihan above content when user has active/ongoing tugas */}
      {hasActiveTugas && <div ref={progressRef}>{progressBlock}</div>}

      {/* Content viewer */}
      <div className="space-y-3">
        <SlideViewer
          materials={milestone.materials}
          currentIdx={currentMaterialIdx}
          onNavigate={setCurrentMaterialIdx}
        />
      </div>

      {/* a: Progress Latihan below content when no active tugas yet */}
      {!hasActiveTugas && <div ref={progressRef} className="mt-6">{progressBlock}</div>}

      {/* Locked quiz — always at the very bottom */}
      {hasQuiz && !quizUnlocked && (
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 flex items-center gap-4 opacity-60 mt-3">
          <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">🔒</div>
          <div>
            <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
            <p className="text-xs text-[#65758B] mt-0.5">Selesaikan semua target latihan untuk membuka quiz.</p>
          </div>
        </div>
      )}

    </div>

    {/* Riwayat Latihan bottom sheet */}
    {showHistory && (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowHistory(false)} />
        <div className="relative bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E1E7EF] flex-shrink-0">
            <div>
              <p className="font-bold text-[#0F1729]">Riwayat Latihan</p>
              <p className="text-xs text-[#65758B] mt-0.5">{milestone!.name}</p>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="w-8 h-8 rounded-full border border-[#E1E7EF] flex items-center justify-center text-[#65758B] hover:border-[#023DFF] hover:text-[#023DFF] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {isIndividual ? (
              itemHistory.length === 0 ? (
                <p className="text-sm text-[#94A3B8] text-center py-8">Belum ada riwayat untuk modul ini.</p>
              ) : itemHistory.map(({ item, confirmations }) => (
                <div key={item.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                  <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#0F1729] leading-snug">{item.text}</p>
                    <span className="flex-shrink-0 text-xs text-[#94A3B8] tabular-nums">
                      {confirmations.length}/{item.target ?? 1} latihan
                    </span>
                  </div>
                  <div className="divide-y divide-[#F1F5F9]">
                    {confirmations.map((conf, i) => {
                      const confExpanded = expandedHistoryConfs.has(conf.id)
                      const d = new Date(conf.submittedAt)
                      const mo = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
                      const dateStr = `${d.getDate()} ${mo[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}`
                      return (
                        <div key={conf.id}>
                          <button
                            onClick={() => setExpandedHistoryConfs(prev => {
                              const next = new Set(prev)
                              next.has(conf.id) ? next.delete(conf.id) : next.add(conf.id)
                              return next
                            })}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#0F1729]">Sesi {confirmations.length - i}</p>
                              <p className="text-[10px] text-[#94A3B8] tabular-nums mt-0.5">{dateStr}</p>
                            </div>
                            <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] border border-[#16A34A]/30 text-[#15803D]">
                              Lulus
                            </span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                              className={`flex-shrink-0 text-[#CBD5E1] transition-transform duration-200 ${confExpanded ? '-rotate-90' : 'rotate-90'}`}
                            >
                              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {confExpanded && (
                            <div className="px-4 pb-3 pt-1 space-y-1.5">
                              {conf.nomorSbg && (
                                <p className="text-xs text-[#65758B]">Nomor SBG: <span className="text-[#0F1729] font-medium">{conf.nomorSbg}</span></p>
                              )}
                              {conf.nomorBox && conf.nomorBox.length > 0 && (
                                <p className="text-xs text-[#65758B]">Nomor Box: <span className="text-[#0F1729] font-medium">{conf.nomorBox.join(', ')}</span></p>
                              )}
                              {conf.catatan && (
                                <p className="text-xs text-[#65758B]">Refleksi: <span className="text-[#0F1729] italic">"{conf.catatan}"</span></p>
                              )}
                              {conf.kanitNote && (
                                <div className="flex items-start gap-2 bg-[#FEFDEA] border border-[#E0A200]/30 rounded-lg px-3 py-2.5 mt-1.5">
                                  <div className="w-3.5 h-3.5 rounded-full bg-[#E0A200] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                                      <path d="M3 1.5v2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                                      <circle cx="3" cy="4.5" r="0.5" fill="white"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-[#B27202] uppercase tracking-wide mb-0.5">Feedback Kanit</p>
                                    <p className="text-xs text-[#92400E] italic leading-relaxed">"{conf.kanitNote}"</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              historySessions.length === 0 ? (
                <p className="text-sm text-[#94A3B8] text-center py-8">Belum ada riwayat untuk modul ini.</p>
              ) : historySessions.map((cl, revIdx) => {
                const sessionIdx = historySessions.length - 1 - revIdx
                const relevantTasks = cl.tasks?.filter(t => relatedTaskIds.includes(t.taskId)) ?? []
                const scored = relevantTasks.filter(t => t.kanitScore !== undefined)
                const sessionScore = scored.length > 0
                  ? Math.round(scored.reduce((sum, t) => sum + t.kanitScore!, 0) / scored.length)
                  : null
                const isExpanded = expandedHistorySessions.has(cl.id)
                const mo = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
                const [y, m2, d2] = cl.date.split('-').map(Number)
                const dateStr = `${d2} ${mo[m2 - 1]} ${y}`
                return (
                  <div key={cl.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                    <button
                      onClick={() => setExpandedHistorySessions(prev => {
                        const next = new Set(prev)
                        next.has(cl.id) ? next.delete(cl.id) : next.add(cl.id)
                        return next
                      })}
                      className="w-full px-4 py-3 bg-[#F8FAFC] flex items-center gap-3 text-left hover:bg-[#F1F5F9] transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E1E7EF] flex items-center justify-center text-xs font-bold text-[#65758B] flex-shrink-0">
                        {sessionIdx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#0F1729]">Sesi {sessionIdx + 1}</p>
                        <p className="text-xs text-[#65758B]">{dateStr}</p>
                      </div>
                      {sessionScore !== null ? (
                        <span className="text-sm font-bold text-[#15803D] flex-shrink-0">{sessionScore}</span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEFDEA] text-[#B27202] flex-shrink-0">Menunggu nilai</span>
                      )}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                        className={`flex-shrink-0 text-[#CBD5E1] transition-transform duration-200 ${isExpanded ? '-rotate-90' : 'rotate-90'}`}
                      >
                        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-[#E1E7EF] px-4 py-3 space-y-4">
                        {relevantTasks.map(taskRecord => {
                          const taskDef = DAILY_TASKS.find(t => t.id === taskRecord.taskId)
                          return (
                            <div key={taskRecord.taskId}>
                              {taskDef && taskDef.items.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  <p className="text-[10px] font-semibold text-[#65758B] uppercase tracking-wide">
                                    Checklist ({taskRecord.completedItemIds.length}/{taskDef.items.length})
                                  </p>
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
                                        <p className={`text-xs leading-snug ${done ? 'text-[#0F1729]' : 'text-[#94A3B8]'}`}>{item.text}</p>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                              {taskRecord.kanitNote && (
                                <div className="bg-[#F8FAFC] rounded-lg px-3 py-2.5 mb-2">
                                  <p className="text-[10px] font-semibold text-[#65758B] uppercase tracking-wide mb-1">Catatan Kanit</p>
                                  <p className="text-xs text-[#0F1729] italic leading-relaxed">"{taskRecord.kanitNote}"</p>
                                </div>
                              )}
                              {taskRecord.reflection && (
                                <div>
                                  <p className="text-[10px] font-semibold text-[#65758B] uppercase tracking-wide mb-1">Refleksi</p>
                                  <p className="text-xs text-[#0F1729] italic leading-relaxed">"{taskRecord.reflection}"</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    )}
    </>
  )
}

type SlideBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'li'; text: string; num: number }
  | { type: 'bullet'; text: string }
  | { type: 'p'; text: string }

function parseSlideBlocks(content: string): SlideBlock[] {
  const blocks: SlideBlock[] = []
  let listNum = 0
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line) { listNum = 0; continue }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', text: line.slice(3) }); continue }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', text: line.slice(4) }); continue }
    if (/^\d+\.\s/.test(line)) { listNum++; blocks.push({ type: 'li', text: line.replace(/^\d+\.\s/, ''), num: listNum }); continue }
    if (line.startsWith('- ')) { blocks.push({ type: 'bullet', text: line.slice(2) }); continue }
    blocks.push({ type: 'p', text: line })
  }
  return blocks
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-[#0F1729]">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

function SlideContent({ content }: { content: string }) {
  const blocks = parseSlideBlocks(content)
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        if (block.type === 'h2') return (
          <h2 key={i} className="text-xl font-bold text-[#0F1729] leading-snug mb-4">{renderInline(block.text)}</h2>
        )
        if (block.type === 'h3') return (
          <h3 key={i} className="text-sm font-bold text-[#0F1729] mt-5 mb-1">{renderInline(block.text)}</h3>
        )
        if (block.type === 'li') return (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#023DFF] text-white text-[10px] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">{block.num}</span>
            <p className="text-sm text-[#334155] leading-relaxed">{renderInline(block.text)}</p>
          </div>
        )
        if (block.type === 'bullet') return (
          <div key={i} className="flex items-start gap-3">
            <span className="text-[#023DFF] font-bold flex-shrink-0 mt-0.5 text-xs">–</span>
            <p className="text-sm text-[#334155] leading-relaxed">{renderInline(block.text)}</p>
          </div>
        )
        return <p key={i} className="text-sm text-[#65758B] leading-relaxed">{renderInline(block.text)}</p>
      })}
    </div>
  )
}

function SlideViewer({
  materials,
  currentIdx,
  onNavigate,
}: {
  materials: { id: string; title: string; content: string; slideUrl?: string }[]
  currentIdx: number
  onNavigate: (idx: number) => void
}) {
  const material = materials[currentIdx]
  const total = materials.length
  const isFirst = currentIdx === 0
  const isLast = currentIdx === total - 1
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toolbar = (
    <div className="relative z-10 bg-[#F1F5F9] border-b border-[#E1E7EF] px-2 py-1.5 flex items-center gap-1 flex-shrink-0">
      {total > 1 ? (
        <button
          type="button"
          onClick={() => onNavigate(currentIdx - 1)}
          disabled={isFirst}
          style={{ touchAction: 'manipulation' }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isFirst ? 'text-[#CBD5E1] cursor-not-allowed' : 'text-[#65758B] active:bg-white active:text-[#023DFF]'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M9 2.5L5 7l4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      ) : (
        <div className="flex gap-1.5 px-1 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E1E7EF]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E1E7EF]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E1E7EF]" />
        </div>
      )}
      <div className="flex-1 text-center px-1">
        <span className="text-xs text-[#65758B] font-medium">{material.title}</span>
      </div>
      <span className="text-[11px] text-[#94A3B8] flex-shrink-0 tabular-nums">{currentIdx + 1} / {total}</span>
      {total > 1 && (
        <button
          type="button"
          onClick={() => onNavigate(currentIdx + 1)}
          disabled={isLast}
          style={{ touchAction: 'manipulation' }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isLast ? 'text-[#CBD5E1] cursor-not-allowed' : 'text-[#65758B] active:bg-white active:text-[#023DFF]'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      {material.slideUrl && (
        <button
          type="button"
          onClick={() => setIsFullscreen(f => !f)}
          style={{ touchAction: 'manipulation' }}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[#65758B] active:bg-white active:text-[#023DFF] ml-0.5"
          title={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2v3H2M9 2v3h3M5 12v-3H2M9 12v-3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      )}
    </div>
  )

  const slideContent = material.slideUrl ? (
    <div className={isFullscreen ? 'flex-1 relative min-h-0' : 'relative w-full'} style={isFullscreen ? {} : { paddingBottom: '56.25%' }}>
      <iframe
        key={material.slideUrl}
        src={material.slideUrl}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        allow="autoplay"
        tabIndex={-1}
      />
    </div>
  ) : (
    <div className="p-6 min-h-64 overflow-y-auto max-h-[480px]">
      <SlideContent content={material.content} />
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ touchAction: 'none' }}>
        {toolbar}
        {slideContent}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden shadow-sm">
      {toolbar}
      {slideContent}
    </div>
  )
}
