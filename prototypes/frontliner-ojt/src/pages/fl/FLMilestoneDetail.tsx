import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MILESTONES } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import type { FLProfile, QuizQuestion } from '../../types'

export default function FLMilestoneDetail() {
  const { id } = useParams<{ id: string }>()
  const { currentUser } = useApp()
  const profile = currentUser!.profile as FLProfile
  const milestone = MILESTONES.find(m => m.id === id)

  const isCompleted = !!(milestone && profile.completedMilestoneIds?.includes(milestone.id))
  const storedQuizScore: number | null = (milestone?.quiz?.length && profile.quizScores?.[milestone.id] !== undefined)
    ? profile.quizScores![milestone.id]
    : null

  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(
    () => isCompleted ? null : (milestone?.materials[0]?.id ?? null)
  )
  const [completedMaterials, setCompletedMaterials] = useState<Set<string>>(() =>
    isCompleted ? new Set(milestone?.materials.map(m => m.id) ?? []) : new Set()
  )
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(
    () => (milestone?.id && profile.quizAnswers?.[milestone.id]) ? profile.quizAnswers[milestone.id] : {}
  )
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(() => isCompleted && !!(milestone?.quiz?.length))
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

  const isMinggu2 = milestone.type === 'minggu2'
  const hasQuiz = !!(milestone.quiz && milestone.quiz.length > 0)
  const allMaterialsDone = completedMaterials.size >= milestone.materials.length

  const markDone = (materialId: string) => {
    setCompletedMaterials(prev => new Set([...prev, materialId]))
    const idx = milestone.materials.findIndex(m => m.id === materialId)
    const next = milestone.materials[idx + 1]
    setExpandedMaterial(next ? next.id : null)
  }

  const unmarkDone = (materialId: string) => {
    setCompletedMaterials(prev => {
      const next = new Set(prev)
      next.delete(materialId)
      return next
    })
  }

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
          <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${isMinggu2 ? 'bg-[#E5F2FF] text-[#023DFF]' : 'bg-[#F1F5F9] text-[#65758B]'}`}>
            {isMinggu2 ? 'Minggu 2' : 'Minggu 1'}
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
        <div className={`flex items-center gap-3 px-4 ${hasQuiz ? 'border-r border-[#E1E7EF]' : ''}`}>
          <span className="text-2xl font-bold text-[#0F1729]">~{milestone.estimatedMinutes}</span>
          <span className="text-sm text-[#65758B]">Menit belajar</span>
        </div>
        {hasQuiz && (
          <div className="flex items-center gap-3 px-4">
            <span className="text-2xl font-bold text-[#0F1729]">{milestone.quiz!.length}</span>
            <span className="text-sm text-[#65758B]">Soal quiz</span>
          </div>
        )}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: materials OR quiz */}
        <div className="col-span-2 space-y-3">
          {view === 'materi' ? (
            <>
              {milestone.materials.map((m, idx) => {
                const isDone = completedMaterials.has(m.id)
                const isExpanded = expandedMaterial === m.id
                return (
                  <div key={m.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                    <button
                      onClick={() => setExpandedMaterial(isExpanded ? null : m.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                        isDone ? 'bg-[#16A34A] text-white' : isExpanded ? 'bg-[#023DFF] text-white' : 'bg-[#F1F5F9] text-[#65758B]'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <p className="flex-1 font-semibold text-[#0F1729] text-sm">{m.title}</p>
                      {isDone && (
                        <span className="text-xs text-[#15803D] font-semibold bg-[#F0FDF4] px-2 py-0.5 rounded-full flex-shrink-0">Selesai</span>
                      )}
                      <svg
                        className={`text-[#94A3B8] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                        width="18" height="18" viewBox="0 0 18 18" fill="none"
                      >
                        <path d="M4.5 6.75L9 11.25l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-[#E1E7EF]">
                        <div className="pt-4 text-sm text-[#65758B] leading-relaxed whitespace-pre-wrap">
                          {m.content.replace(/##\s*/g, '\n').replace(/###\s*/g, '\n').replace(/\*\*/g, '')}
                        </div>
                        <button
                          onClick={() => isDone ? unmarkDone(m.id) : markDone(m.id)}
                          className={`mt-5 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            isDone
                              ? 'bg-[#F0FDF4] text-[#15803D] border border-[#16A34A]/20 hover:bg-[#DCFCE7]'
                              : 'bg-[#023DFF] text-white hover:bg-[#001CDB]'
                          }`}
                        >
                          {isDone ? '✓ Sudah Dibaca' : 'Tandai Sudah Dibaca'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

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
                ) : allMaterialsDone ? (
                  <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-base flex-shrink-0">🔓</div>
                      <div>
                        <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
                        <p className="text-xs text-[#65758B] mt-0.5">Semua materi sudah dibaca. Kamu siap mengerjakan quiz!</p>
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
                      <p className="text-xs text-[#65758B] mt-0.5">Selesaikan semua materi dulu untuk membuka quiz ini.</p>
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
          {/* Progress */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-4">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Progress</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#65758B]">Materi dibaca</span>
                <span className={`font-semibold ${allMaterialsDone ? 'text-[#15803D]' : 'text-[#0F1729]'}`}>
                  {completedMaterials.size}/{milestone.materials.length}
                </span>
              </div>
              {hasQuiz && (
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Mini quiz</span>
                  <span className={`font-semibold ${quizPassing ? 'text-[#15803D]' : quizSubmitted ? 'text-[#DC2626]' : 'text-[#94A3B8]'}`}>
                    {quizSubmitted ? `${quizScore}/100` : 'Belum dikerjakan'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick nav — hidden during quiz */}
          {view === 'materi' && <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Daftar Materi</p>
            <div className="space-y-1">
              {milestone.materials.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setExpandedMaterial(m.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    expandedMaterial === m.id ? 'bg-[#E5F2FF] text-[#023DFF] font-medium' : 'text-[#65758B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className={`text-xs font-bold w-4 text-center flex-shrink-0 ${completedMaterials.has(m.id) ? 'text-[#15803D]' : ''}`}>
                    {completedMaterials.has(m.id) ? '✓' : idx + 1}
                  </span>
                  <span className="truncate">{m.title}</span>
                </button>
              ))}
            </div>
          </div>}

          <div className="bg-[#E5F2FF] rounded-xl border border-[#023DFF]/20 p-4">
            <p className="text-xs font-semibold text-[#023DFF] mb-2">💡 Tips belajar</p>
            <p className="text-xs text-[#001CDB] leading-relaxed">
              {hasQuiz
                ? 'Baca semua materi sebelum mengerjakan quiz. Tandai tiap materi yang sudah dipahami.'
                : 'Baca semua materi dan tandai setelah memahaminya. Ini jadi bukti progress belajarmu.'}
            </p>
          </div>
        </div>
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
