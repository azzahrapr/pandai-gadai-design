import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MILESTONES } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import type { FLProfile, QuizQuestion } from '../../types'

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

const MILESTONE_EXPECTED_COUNT: Record<string, number> = {
  'closing-cabang': 2,
  'opening-cabang': 2,
  'personal-grooming': 12,
  'pengenalan-produk': 3,
  'canvassing': 3,
  'cash-management': 1,
  'sop-administrasi': 5,
  'packing-sealing': 3,
  'offloading': 1,
  'pelayanan-nasabah': 5,
  'customer-service-wa': 2,
  'penaksiran-elektronik': 2,
  'penaksiran-emas': 1,
  'penaksiran-bpkb': 2,
}

export default function FLMilestoneDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser, getFlChecklists, startMilestone, startSession, activeSession, saveQuizResult, getItemConfirmations } = useApp()
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
      ? allChecklists.filter(cl => cl.tasks?.some(t => relatedTaskIds.includes(t.taskId))).length
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
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(
    () => (milestone?.id && profile.quizAnswers?.[milestone.id]) ? profile.quizAnswers[milestone.id] : {}
  )
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(
    () => !!(milestone?.quiz?.length) && profile.quizScores?.[milestone.id] !== undefined
  )
  const [view, setView] = useState<'materi' | 'quiz'>('materi')
  const [activeSection, setActiveSection] = useState<'progress' | null>(null)

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
  const hasQuiz = !!(milestone.quiz && milestone.quiz.length > 0)

  const quizScore: number | null = hasQuiz && quizSubmitted
    ? (storedQuizScore !== null
        ? storedQuizScore
        : Math.round(milestone.quiz!.filter(q => quizAnswers[q.id] === q.correctIndex).length / milestone.quiz!.length * 100))
    : null
  const quizPassing = quizScore !== null && quizScore >= 75

  // IA conditions
  const hasActiveTugas = isIndividual
    ? confirmedItemIds.size > 0
    : effectiveSubmissions > 0 || hasMeaningfulDraft

  // Progress block — rendered either above or below content depending on hasActiveTugas
  const progressBlock = isIndividual ? (
    <div className="bg-white rounded-xl border border-[#E1E7EF] p-4 mb-6">
      <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Progress Tugas</p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#65758B]">Tugas selesai</span>
          <span className={`font-semibold ${isCompleted ? 'text-[#15803D]' : 'text-[#0F1729]'}`}>
            {confirmedItemIds.size}/{milestone.checklistItems.length}
          </span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`}
            style={{ width: `${Math.min(100, (confirmedItemIds.size / milestone.checklistItems.length) * 100)}%` }}
          />
        </div>
        {isCompleted ? (
          <div className="space-y-2.5">
            <p className="text-xs text-[#15803D] font-medium">✓ Semua tugas sudah selesai</p>
            <Link
              to={`/fl/milestones/${milestone.id}/tasks`}
              className="w-full flex items-center justify-center gap-1.5 h-9 bg-white border border-[#E1E7EF] hover:bg-[#F8FAFC] text-[#65758B] text-sm font-semibold rounded-lg transition-colors"
            >
              Lihat Daftar Tugas
            </Link>
          </div>
        ) : (
          <Link
            to={`/fl/milestones/${milestone.id}/tasks`}
            className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Kerjakan Tugas →
          </Link>
        )}
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-xl border border-[#E1E7EF] p-4 mb-6">
      <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Progress Tugas</p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#65758B]">Sesi selesai</span>
          <span className={`font-semibold ${isCompleted ? 'text-[#15803D]' : 'text-[#0F1729]'}`}>
            {Math.min(effectiveSubmissions, expectedCount)}/{expectedCount}
          </span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`}
            style={{ width: `${Math.min(100, (effectiveSubmissions / expectedCount) * 100)}%` }}
          />
        </div>
        {isCompleted ? (
          <p className="text-xs text-[#15803D] font-medium">✓ Semua tugas sudah selesai</p>
        ) : hasMeaningfulDraft ? (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-lg px-3 py-2.5">
              <span className="text-sm flex-shrink-0">🔄</span>
              <p className="text-xs text-[#15803D] font-medium leading-relaxed">Ada draft sesi yang tersimpan.</p>
            </div>
            <Link
              to={`/fl/milestones/${milestone.id}/tasks`}
              className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Lanjutkan Sesi →
            </Link>
          </div>
        ) : ocAlreadyDoneToday ? (
          <p className="text-xs text-[#15803D] font-medium">✓ Sesi ini sudah dilakukan hari ini</p>
        ) : (
          <div className="space-y-2.5">
            {effectiveSubmissions > 0 && (
              <p className="text-xs text-[#65758B]">{Math.max(0, expectedCount - effectiveSubmissions)} sesi lagi untuk selesaikan modul ini.</p>
            )}
            <button
              onClick={handleMulaiSesi}
              className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Kerjakan Tugas →
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // Quiz card — floated above materi when unlocked (condition c)
  const quizCard = hasQuiz ? (
    quizSubmitted ? (
      <div className={`bg-white rounded-xl border p-5 flex items-center gap-4 mb-6 ${quizPassing ? 'border-[#16A34A]' : 'border-[#DC2626]/40'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${quizPassing ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'}`}>📝</div>
        <div className="flex-1">
          <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
          <p className={`text-xs mt-0.5 ${quizPassing ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
            {quizPassing ? 'Selesai · Quiz sudah dikerjakan' : 'Skor belum memenuhi standar kelulusan'}
          </p>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 ${quizPassing ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
          {quizScore}/100
        </span>
        <button
          onClick={() => setView('quiz')}
          className="flex-shrink-0 h-8 px-3 bg-white border border-[#CBD5E1] text-[#0F1729] text-xs font-semibold rounded-lg hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF] transition-all"
        >
          Lihat Jawaban
        </button>
      </div>
    ) : quizUnlocked ? (
      <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-base flex-shrink-0">🔓</div>
          <div>
            <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
            <p className="text-xs text-[#65758B] mt-0.5">Semua tugas selesai. Kamu siap mengerjakan quiz!</p>
          </div>
        </div>
        <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg px-4 py-3 flex items-start gap-2.5">
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-xs text-[#DC2626] leading-relaxed">
            Quiz ini hanya bisa dikerjakan <strong>1 kali</strong>. Kerjakan dengan serius karena hasilnya akan dipertimbangkan dalam penilaian akhir.
          </p>
        </div>
        <button
          onClick={() => setView('quiz')}
          className="h-9 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors self-start"
        >
          Mulai Quiz →
        </button>
      </div>
    ) : null
  ) : null

  return (
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

      {/* c: Mini quiz floated above materi when unlocked */}
      {quizUnlocked && view !== 'quiz' && quizCard}

      {/* 3. Daftar Isi */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] p-4 mb-6">
        <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Daftar Isi</p>
        <div className="space-y-1">
          {milestone.materials.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => { setCurrentMaterialIdx(idx); setView('materi'); setActiveSection(null) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                view === 'materi' && currentMaterialIdx === idx && activeSection === null ? 'bg-[#E5F2FF] text-[#023DFF] font-medium' : 'text-[#65758B] hover:bg-[#F8FAFC]'
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
            <span className="truncate">Progress Tugas</span>
            {isCompleted && <span className="ml-auto text-[10px] font-bold text-[#15803D] flex-shrink-0">✓</span>}
          </button>
          {hasQuiz && (
            <button
              onClick={() => { setView('quiz'); setActiveSection(null) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                view === 'quiz' && activeSection === null ? 'bg-[#E5F2FF] text-[#023DFF] font-medium'
                : 'text-[#65758B] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className={`text-xs font-bold w-4 text-center flex-shrink-0 ${quizPassing ? 'text-[#15803D]' : ''}`}>
                {quizPassing ? '✓' : '📝'}
              </span>
              <span className="truncate flex-1">Mini Quiz</span>
              {quizSubmitted ? (
                <span className={`ml-auto text-[10px] font-bold flex-shrink-0 ${quizPassing ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{quizScore}/100</span>
              ) : !quizUnlocked ? (
                <span className="ml-auto text-[10px] text-[#CBD5E1] flex-shrink-0">🔒</span>
              ) : null}
            </button>
          )}
        </div>
      </div>

      {/* b: Progress Tugas above content when user has active/ongoing tugas */}
      {hasActiveTugas && <div ref={progressRef}>{progressBlock}</div>}

      {/* Content viewer */}
      <div className="space-y-3">
        {view === 'materi' ? (
          <>
            <SlideViewer
              materials={milestone.materials}
              currentIdx={currentMaterialIdx}
              onNavigate={setCurrentMaterialIdx}
            />

          </>
        ) : (
          <>
            <button
              onClick={() => setView('materi')}
              className="flex items-center gap-2 text-sm text-[#65758B] hover:text-[#023DFF] transition-colors"
            >
              ← Kembali ke Materi
            </button>
            {quizUnlocked ? (
              <QuizSection
                quiz={milestone.quiz!}
                answers={quizAnswers}
                submitted={quizSubmitted}
                score={quizScore}
                onAnswer={(qId, idx) => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [qId]: idx }))}
                onSubmit={() => {
                  const score = Math.round(
                    milestone.quiz!.filter(q => quizAnswers[q.id] === q.correctIndex).length / milestone.quiz!.length * 100
                  )
                  setQuizSubmitted(true)
                  saveQuizResult(milestone.id, score, quizAnswers)
                }}
              />
            ) : (
              <div className="bg-white rounded-xl border border-[#E1E7EF] p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xl flex-shrink-0">🔒</div>
                <div>
                  <p className="font-bold text-[#0F1729] text-sm">Mini Quiz terkunci</p>
                  <p className="text-xs text-[#65758B] mt-1 leading-relaxed">Selesaikan semua target sesi tugas untuk membuka mini quiz.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* a: Progress Tugas below content when no active tugas yet */}
      {!hasActiveTugas && <div ref={progressRef} className="mt-6">{progressBlock}</div>}

      {/* Locked quiz — always at the very bottom */}
      {hasQuiz && !quizUnlocked && view !== 'quiz' && (
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 flex items-center gap-4 opacity-60 mt-3">
          <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">🔒</div>
          <div>
            <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
            <p className="text-xs text-[#65758B] mt-0.5">Selesaikan semua target sesi checklist untuk membuka quiz.</p>
          </div>
        </div>
      )}

    </div>
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

function QuizSection({ quiz, answers, submitted, score, onAnswer, onSubmit }: {
  quiz: QuizQuestion[]
  answers: Record<string, number>
  submitted: boolean
  score: number | null
  onAnswer: (qId: string, idx: number) => void
  onSubmit: () => void
}) {
  const allAnswered = quiz.every(q => answers[q.id] !== undefined)
  const passing = score !== null && score >= 75

  return (
    <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
      <div className="p-5 border-b border-[#E1E7EF] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-base flex-shrink-0">📝</div>
        <div>
          <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
          <p className="text-xs text-[#65758B]">{quiz.length} soal · Minimal {Math.ceil(quiz.length * 0.75)}/{quiz.length} benar untuk lulus</p>
        </div>
        {submitted && (
          <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${passing ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
            {score}/100
          </span>
        )}
      </div>

      <div className="p-5 space-y-6">
        {quiz.map((q, qIdx) => {
          const selected = answers[q.id]
          return (
            <div key={q.id}>
              <p className="text-sm font-semibold text-[#0F1729] mb-3">{qIdx + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  let cls = 'border-[#E1E7EF] text-[#0F1729] hover:border-[#023DFF]/40'
                  if (!submitted) {
                    if (selected === oIdx) cls = 'border-[#023DFF] bg-[#E5F2FF] text-[#023DFF]'
                  } else {
                    if (oIdx === q.correctIndex) cls = 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                    else if (selected === oIdx) cls = 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                    else cls = 'border-[#E1E7EF] text-[#94A3B8]'
                  }
                  return (
                    <button
                      key={oIdx}
                      disabled={submitted}
                      onClick={() => onAnswer(q.id, oIdx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all ${cls} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                        !submitted && selected === oIdx ? 'border-[#023DFF] bg-[#023DFF] text-white' : 'border-current'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {!submitted ? (
          <button
            disabled={!allAnswered}
            onClick={onSubmit}
            className={`w-full h-10 rounded-lg font-semibold text-sm transition-all ${
              allAnswered ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            {allAnswered ? 'Submit Quiz' : `Jawab semua soal dulu (${Object.keys(answers).length}/${quiz.length})`}
          </button>
        ) : (
          <div className={`rounded-xl p-4 ${
            passing ? 'bg-[#F0FDF4] border border-[#16A34A]/20'
            : score !== null && score <= 50 ? 'bg-[#F8FAFC] border border-[#E1E7EF]'
            : 'bg-[#FEF2F2] border border-[#DC2626]/20'
          }`}>
            <p className={`font-bold text-sm ${
              passing ? 'text-[#15803D]'
              : score !== null && score <= 50 ? 'text-[#65758B]'
              : 'text-[#DC2626]'
            }`}>
              {passing
                ? `🎉 Selamat! Skor kamu ${score}/100.`
                : score !== null && score <= 50
                  ? `Skor kamu ${score}/100. Yuk belajar lagi — pastikan kamu pahami materi sebelum lanjut. 💪`
                  : `Skor kamu ${score}/100. Pelajari kembali materi yang belum dipahami ya.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
