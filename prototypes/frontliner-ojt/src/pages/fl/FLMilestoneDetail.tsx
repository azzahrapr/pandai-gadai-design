import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MILESTONES } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import type { FLProfile, QuizQuestion } from '../../types'

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

export default function FLMilestoneDetail() {
  const { id } = useParams<{ id: string }>()
  const { currentUser, getFlChecklists } = useApp()
  const profile = currentUser!.profile as FLProfile
  const milestone = MILESTONES.find(m => m.id === id)

  const allChecklists = getFlChecklists(currentUser!.id).filter(c =>
    c.status === 'submitted' || c.status === 'scored'
  )

  const relatedTaskIds = milestone ? (MILESTONE_TASK_MAP[milestone.id] ?? []) : []
  const expectedCount = milestone ? (MILESTONE_EXPECTED_COUNT[milestone.id] ?? 14) : 14
  const milestoneSubmissions = relatedTaskIds.length > 0
    ? allChecklists.filter(cl => cl.tasks?.some(t => relatedTaskIds.includes(t.taskId))).length
    : 0

  const hasRelatedChecklist = relatedTaskIds.length > 0
    ? milestoneSubmissions > 0
    : (milestone ? (profile.completedMilestoneIds?.includes(milestone.id) ?? false) : false)
  const isCompleted = milestoneSubmissions >= expectedCount
  const quizUnlocked = relatedTaskIds.length > 0
    ? isCompleted
    : hasRelatedChecklist

  const storedQuizScore: number | null = (milestone?.quiz?.length && profile.quizScores?.[milestone.id] !== undefined)
    ? profile.quizScores![milestone.id]
    : null

  const [currentMaterialIdx, setCurrentMaterialIdx] = useState<number>(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(
    () => (milestone?.id && profile.quizAnswers?.[milestone.id]) ? profile.quizAnswers[milestone.id] : {}
  )
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(
    () => !!(milestone?.quiz?.length) && profile.quizScores?.[milestone.id] !== undefined
  )
  const [view, setView] = useState<'materi' | 'quiz'>('materi')

  if (!milestone) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#65758B]">Milestone tidak ditemukan</p>
          <Link to="/fl/milestones" className="mt-4 inline-flex items-center gap-2 text-sm text-[#023DFF] hover:underline">← Kembali ke Materi</Link>
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

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#65758B] mb-6">
        <Link to="/fl/milestones" className="hover:text-[#023DFF] transition-colors">Materi Belajar</Link>
        <span>/</span>
        <span className="text-[#0F1729]">{milestone.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${isLevel2 ? 'bg-[#E5F2FF] text-[#023DFF]' : 'bg-[#F1F5F9] text-[#65758B]'}`}>
            {isLevel2 ? 'Level 2' : 'Level 1'}
          </span>
          <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2.5 py-1 rounded-full">~{milestone.estimatedMinutes} menit</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F1729] mt-1">{milestone.name}</h1>
        <p className="text-[#65758B] text-sm mt-2 max-w-2xl">{milestone.description}</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-[#E1E7EF]">
        <div className="flex items-center gap-3 px-4 border-r border-[#E1E7EF]">
          <span className="text-2xl font-bold text-[#0F1729]">{milestone.materials.length}</span>
          <span className="text-sm text-[#65758B]">Materi belajar</span>
        </div>
        <div className="flex items-center gap-3 px-4 border-r border-[#E1E7EF]">
          <span className="text-2xl font-bold text-[#0F1729]">~{milestone.estimatedMinutes}</span>
          <span className="text-sm text-[#65758B]">Menit belajar</span>
        </div>
        <div className="flex items-center gap-3 px-4">
          <span className="text-2xl font-bold text-[#0F1729]">{expectedCount}</span>
          <span className="text-sm text-[#65758B]">Target checklist</span>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: materials OR quiz */}
        <div className="col-span-2 space-y-3">
          {view === 'materi' ? (
            <>
              <SlideViewer
                materials={milestone.materials}
                currentIdx={currentMaterialIdx}
                onNavigate={setCurrentMaterialIdx}
              />

              {/* Quiz entry point */}
              {hasQuiz && (
                quizSubmitted ? (
                  <div className={`bg-white rounded-xl border p-5 flex items-center gap-4 ${quizPassing ? 'border-[#16A34A]' : 'border-[#DC2626]/40'}`}>
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
                  <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-base flex-shrink-0">🔓</div>
                      <div>
                        <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
                        <p className="text-xs text-[#65758B] mt-0.5">Checklist terkait sudah selesai. Kamu siap mengerjakan quiz!</p>
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
                ) : (
                  <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 flex items-center gap-4 opacity-60">
                    <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">🔒</div>
                    <div>
                      <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
                      <p className="text-xs text-[#65758B] mt-0.5">Selesaikan semua target sesi checklist untuk membuka quiz.</p>
                    </div>
                  </div>
                )
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setView('materi')}
                className="flex items-center gap-2 text-sm text-[#65758B] hover:text-[#023DFF] transition-colors"
              >
                ← Kembali ke Materi
              </button>
              <QuizSection
                quiz={milestone.quiz!}
                answers={quizAnswers}
                submitted={quizSubmitted}
                score={quizScore}
                onAnswer={(qId, idx) => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [qId]: idx }))}
                onSubmit={() => setQuizSubmitted(true)}
              />
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Progress Checklist */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-4">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Progress Checklist</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#65758B]">Task dilakukan</span>
                <span className={`font-semibold ${milestoneSubmissions >= expectedCount ? 'text-[#15803D]' : 'text-[#0F1729]'}`}>
                  {Math.min(milestoneSubmissions, expectedCount)}/{expectedCount}
                </span>
              </div>
              <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${milestoneSubmissions >= expectedCount ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`}
                  style={{ width: `${Math.min(100, (milestoneSubmissions / expectedCount) * 100)}%` }}
                />
              </div>
              {milestoneSubmissions >= expectedCount ? (
                <p className="text-xs text-[#15803D] font-medium">✓ Semua sesi checklist sudah selesai</p>
              ) : (
                <div className="space-y-2.5">
                  {hasRelatedChecklist ? (
                    <div className="flex items-start gap-2 bg-[#E5F2FF] border border-[#023DFF]/20 rounded-lg px-3 py-2.5">
                      <span className="text-sm flex-shrink-0">🔄</span>
                      <p className="text-xs text-[#023DFF] font-medium leading-relaxed">{Math.max(0, expectedCount - milestoneSubmissions)} sesi lagi untuk selesaikan modul ini</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#65758B] leading-relaxed">Belum ada sesi checklist untuk modul ini. Klik tombol di bawah untuk mulai.</p>
                  )}
                  <Link
                    to="/fl/checklist"
                    className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Mulai Sesi →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Nav — always visible so quiz entry is reachable */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Daftar Materi</p>
            <div className="space-y-1">
              {milestone.materials.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => { setCurrentMaterialIdx(idx); setView('materi') }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    view === 'materi' && currentMaterialIdx === idx ? 'bg-[#E5F2FF] text-[#023DFF] font-medium' : 'text-[#65758B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className="text-xs font-bold w-4 text-center flex-shrink-0 text-[#94A3B8]">
                    {idx + 1}
                  </span>
                  <span className="truncate">{m.title}</span>
                </button>
              ))}
              {hasQuiz && (
                <>
                  <div className="border-t border-[#E1E7EF] my-1" />
                  <button
                    onClick={() => quizUnlocked && setView('quiz')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      view === 'quiz' ? 'bg-[#E5F2FF] text-[#023DFF] font-medium'
                      : !quizUnlocked ? 'text-[#CBD5E1] cursor-not-allowed'
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
                </>
              )}
            </div>
          </div>

          <div className="bg-[#E5F2FF] rounded-xl border border-[#023DFF]/20 p-4">
            <p className="text-xs font-semibold text-[#023DFF] mb-2">💡 Tips belajar</p>
            <p className="text-xs text-[#001CDB] leading-relaxed">
              {hasQuiz
                ? 'Pelajari materi, lalu mulai sesi checklist dari halaman ini. Quiz terbuka setelah semua target sesi terpenuhi.'
                : 'Pelajari materi, lalu klik "Mulai Sesi Checklist" setiap kali kamu mau praktikkan di lapangan. Progress diukur dari jumlah sesi yang sudah disubmit.'}
            </p>
          </div>
        </div>
      </div>
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

const DUMMY_SLIDE_URL =
  'https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/embed?start=false&loop=false&delayms=3000'

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
  const embedUrl = material.slideUrl ?? DUMMY_SLIDE_URL

  return (
    <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden shadow-sm">
      {/* Toolbar chrome */}
      <div className="bg-[#F1F5F9] border-b border-[#E1E7EF] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E1E7EF]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E1E7EF]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E1E7EF]" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-[#65758B] font-medium truncate">{material.title}</span>
        </div>
        <span className="text-[11px] text-[#94A3B8] flex-shrink-0 tabular-nums">{currentIdx + 1} / {total}</span>
      </div>

      {/* Google Slides iframe — 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          key={embedUrl}
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay"
        />
      </div>

      {/* Navigation bar */}
      <div className="bg-[#F8FAFC] border-t border-[#E1E7EF] px-5 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate(currentIdx - 1)}
          disabled={currentIdx === 0}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            currentIdx === 0
              ? 'text-[#CBD5E1] cursor-not-allowed'
              : 'text-[#65758B] hover:bg-[#E1E7EF] hover:text-[#0F1729]'
          }`}
        >
          ← Materi Sebelumnya
        </button>

        <div className="flex items-center gap-1.5">
          {materials.map((_, i) => (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`rounded-full transition-all duration-200 ${
                i === currentIdx ? 'w-4 h-1.5 bg-[#023DFF]' : 'w-1.5 h-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => onNavigate(currentIdx + 1)}
          disabled={currentIdx === total - 1}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            currentIdx === total - 1
              ? 'text-[#CBD5E1] cursor-not-allowed'
              : 'text-[#65758B] hover:bg-[#E1E7EF] hover:text-[#0F1729]'
          }`}
        >
          Materi Berikutnya →
        </button>
      </div>
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
