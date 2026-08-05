import { useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { MILESTONES } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import type { FLProfile } from '../../types'

const MAX_QUIZ_ATTEMPTS = 2

export default function FLQuiz() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, saveQuizResult } = useApp()
  const profile = currentUser!.profile as FLProfile
  const milestone = MILESTONES.find(m => m.id === id)
  const attemptsUsed = (milestone?.id && profile.quizAttempts?.[milestone.id]) ?? 0
  // Arriving here via the "Coba Lagi" link from the milestone page should drop
  // straight into a fresh attempt, not the previous attempt's result screen.
  const startFresh = !!(location.state as { retry?: boolean } | null)?.retry

  const storedQuizScore: number | null =
    milestone?.quiz?.length && profile.quizScores?.[milestone.id] !== undefined
      ? profile.quizScores![milestone.id]
      : null

  const [answers, setAnswers] = useState<Record<string, number>>(
    () => startFresh ? {} : (milestone?.id && profile.quizAnswers?.[milestone.id]) ? profile.quizAnswers[milestone.id] : {}
  )
  const [submitted, setSubmitted] = useState<boolean>(
    () => !startFresh && !!(milestone?.quiz?.length) && profile.quizScores?.[milestone.id] !== undefined
  )
  const [highlightedQ, setHighlightedQ] = useState<string | null>(null)
  const questionRefs = useRef<(HTMLDivElement | null)[]>([])

  if (!milestone?.quiz?.length) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-[#65758B]">Quiz tidak tersedia untuk modul ini.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#023DFF] hover:underline">← Kembali</button>
        </div>
      </div>
    )
  }

  const quiz = milestone.quiz!
  const allAnswered = quiz.every(q => answers[q.id] !== undefined)

  const score: number | null = submitted
    ? (storedQuizScore !== null
        ? storedQuizScore
        : Math.round(quiz.filter(q => answers[q.id] === q.correctIndex).length / quiz.length * 100))
    : null
  const passing = score !== null && score >= 75
  const canRetry = submitted && !passing && attemptsUsed < MAX_QUIZ_ATTEMPTS
  const revealAnswers = submitted && !canRetry

  function handleRetry() {
    setAnswers({})
    setSubmitted(false)
  }

  function handleSubmit() {
    if (!allAnswered) {
      const firstUnanswered = quiz.find(q => answers[q.id] === undefined)
      if (firstUnanswered) {
        const idx = quiz.indexOf(firstUnanswered)
        questionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedQ(firstUnanswered.id)
        setTimeout(() => setHighlightedQ(null), 1800)
      }
      return
    }
    const s = Math.round(quiz.filter(q => answers[q.id] === q.correctIndex).length / quiz.length * 100)
    setSubmitted(true)
    saveQuizResult(milestone!.id, s, answers)
  }

  return (
    <div className="p-4 md:p-8">
      <button
        onClick={() => navigate(`/fl/milestones/${id}`)}
        className="flex items-center gap-2 text-sm text-[#65758B] hover:text-[#023DFF] transition-colors mb-4"
      >
        ← Kembali ke Materi
      </button>

      <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
        <div className="p-5 border-b border-[#E1E7EF] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-base flex-shrink-0">📝</div>
          <div>
            <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
            <p className="text-xs text-[#65758B]">{milestone.name} · {quiz.length} soal</p>
          </div>
          {submitted && (
            <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
              passing ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#FEF2F2] text-[#DC2626]'
            }`}>
              {score}/100
            </span>
          )}
        </div>

        <div className="p-5 space-y-6">
          {quiz.map((q, qIdx) => {
            const selected = answers[q.id]
            const isHighlighted = highlightedQ === q.id
            return (
              <div
                key={q.id}
                ref={el => { questionRefs.current[qIdx] = el }}
                className={`rounded-xl transition-all duration-300 ${isHighlighted ? 'bg-[#FEF2F2] outline outline-2 outline-[#DC2626]/40 px-3 pt-3 pb-1 -mx-3' : ''}`}
              >
                <p className={`text-sm font-semibold mb-3 ${isHighlighted ? 'text-[#DC2626]' : 'text-[#0F1729]'}`}>
                  {qIdx + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => {
                    let cls = 'border-[#E1E7EF] text-[#0F1729] hover:border-[#023DFF]/40'
                    if (!submitted) {
                      if (selected === oIdx) cls = 'border-[#023DFF] bg-[#E5F2FF] text-[#023DFF]'
                    } else if (revealAnswers) {
                      if (oIdx === q.correctIndex) cls = 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                      else if (selected === oIdx) cls = 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                      else cls = 'border-[#E1E7EF] text-[#94A3B8]'
                    } else {
                      // A retry is still available — don't leak the answer key before the next attempt.
                      if (selected === oIdx) cls = 'border-[#023DFF] bg-[#E5F2FF] text-[#023DFF]'
                      else cls = 'border-[#E1E7EF] text-[#94A3B8]'
                    }
                    return (
                      <button
                        key={oIdx}
                        disabled={submitted}
                        onClick={() => !submitted && setAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
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
              onClick={handleSubmit}
              className="w-full h-10 rounded-lg font-semibold text-sm bg-[#023DFF] hover:bg-[#001CDB] text-white transition-all"
            >
              Submit Quiz
            </button>
          ) : passing ? (
            <>
              <div className="rounded-xl p-4 bg-[#F0FDF4] border border-[#16A34A]/20">
                <p className="font-bold text-sm text-[#15803D]">🎉 Selamat! Skor kamu {score}/100.</p>
              </div>
              <button
                onClick={() => navigate(`/fl/milestones/${id}`)}
                className="w-full h-9 rounded-lg text-sm font-semibold bg-white text-[#0F1729] border border-[#CBD5E1] hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF] transition-colors"
              >
                ← Kembali ke Materi
              </button>
            </>
          ) : canRetry ? (
            <>
              <div className="rounded-xl p-4 bg-white border border-[#DC2626]/40">
                <p className="font-bold text-sm text-[#DC2626]">Skor: {score}/100 — Belum Lulus</p>
              </div>
              <div className="rounded-lg px-4 py-3 bg-[#FEFDEA] border border-[#E0A200]/30 flex items-start gap-2.5">
                <span className="text-sm flex-shrink-0">⚠️</span>
                <p className="text-xs text-[#B27202] leading-relaxed">
                  Kamu masih punya 1 kali kesempatan lagi. Pelajari kembali materi yang belum dipahami, lalu coba lagi.
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="w-full h-10 rounded-lg font-semibold text-sm bg-[#023DFF] hover:bg-[#001CDB] text-white transition-all"
              >
                Coba Lagi →
              </button>
              <button
                onClick={() => navigate(`/fl/milestones/${id}`)}
                className="w-full h-9 rounded-lg text-sm font-semibold bg-white text-[#0F1729] border border-[#CBD5E1] hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF] transition-colors"
              >
                ← Kembali ke Materi
              </button>
            </>
          ) : (
            <>
              <div className="rounded-xl p-4 bg-white border border-[#DC2626]/40">
                <p className="font-bold text-sm text-[#DC2626]">Skor: {score}/100 — Tidak Lulus</p>
                <p className="text-xs text-[#65758B] mt-1 leading-relaxed">
                  Kesempatan mengerjakan quiz sudah habis. {score !== null && score <= 50
                    ? 'Yuk belajar lagi — pastikan kamu pahami materi ke depannya. 💪'
                    : 'Pelajari kembali materi yang belum dipahami ya.'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/fl/milestones/${id}`)}
                className="w-full h-9 rounded-lg text-sm font-semibold bg-white text-[#0F1729] border border-[#CBD5E1] hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF] transition-colors"
              >
                ← Kembali ke Materi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
