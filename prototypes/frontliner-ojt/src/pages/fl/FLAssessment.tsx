import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ASSESSMENT_QUESTIONS, MASTERY_MATERIALS } from '../../data/mockData'
import type { FLProfile, Assessment } from '../../types'

export default function FLAssessment() {
  const { currentUser, submitAssessment, getFlAssessment } = useApp()
  const profile = currentUser!.profile as FLProfile
  const existing = getFlAssessment(currentUser!.id)

  const [step, setStep] = useState<'intro' | 'mastery' | 'questions' | 'done'>(
    existing ? 'done' : 'intro'
  )
  const [masteryChecks, setMasteryChecks] = useState(
    existing?.masteryChecks ?? MASTERY_MATERIALS.map(m => ({ ...m, mastered: false }))
  )
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({})

  const startTimeRef = useRef<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (step !== 'mastery' && step !== 'questions') return
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current!) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  function toggleMastery(materialId: string) {
    setMasteryChecks(prev => prev.map(m => m.materialId === materialId ? { ...m, mastered: !m.mastered } : m))
  }

  function selectAnswer(questionId: string, optionIndex: number) {
    setMcqAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  function handleSubmit() {
    const firstUnanswered = ASSESSMENT_QUESTIONS.find(q => mcqAnswers[q.id] === undefined)
    if (firstUnanswered) {
      questionRefs.current[firstUnanswered.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const answers = ASSESSMENT_QUESTIONS.map(q => ({
      questionId: q.id,
      question: q.question,
      answer: mcqAnswers[q.id] !== undefined ? q.options[mcqAnswers[q.id]] : '',
    }))
    const mcqCorrectCount = ASSESSMENT_QUESTIONS.reduce((count, q) => {
      const selectedIdx = mcqAnswers[q.id]
      return count + (selectedIdx === q.correctIndex ? 1 : 0)
    }, 0)
    const assessment: Assessment = {
      id: `assess-${currentUser!.id}`,
      flId: currentUser!.id,
      day: profile.currentDay,
      date: '2026-07-14',
      masteryChecks,
      answers,
      status: 'selesai',
      submittedAt: new Date().toISOString(),
      mcqScore: Math.round((mcqCorrectCount / ASSESSMENT_QUESTIONS.length) * 100),
    }
    submitAssessment(assessment)
    setStep('done')
  }

  const masteredCount = masteryChecks.filter(m => m.mastered).length
  const answeredCount = Object.keys(mcqAnswers).length

  if (profile.currentDay < 14) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#0F1729]">Assessment Belum Tersedia</h2>
          <p className="text-[#65758B] text-sm mt-2">Assessment akhir OJT baru bisa dikerjakan di hari ke-14.</p>
          <p className="text-[#023DFF] font-semibold text-sm mt-1">Kamu sekarang di Hari {profile.currentDay} dari 14.</p>
        </div>
      </div>
    )
  }

  if (step === 'done' || existing) {
    const assessment = existing ?? { masteryChecks, answers: ASSESSMENT_QUESTIONS.map(q => ({ questionId: q.id, question: q.question, answer: '' })), status: 'selesai' as const, mcqScore: 0 }

    const score = assessment.mcqScore ?? ASSESSMENT_QUESTIONS.reduce((count, q) => {
      const ans = assessment.answers.find(a => a.questionId === q.id)
      return count + (ans?.answer === q.options[q.correctIndex] ? 1 : 0)
    }, 0) / ASSESSMENT_QUESTIONS.length * 100

    return (
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F1729]">Assessment Akhir OJT</h1>
          <p className="text-[#65758B] text-sm mt-1">Penilaian akhir program OJT kamu</p>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="bg-gradient-to-br from-[#023DFF] to-[#1A55FF] rounded-xl p-6 text-white">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold mb-1">Selamat, kamu sudah selesai!</h2>
            <p className="text-blue-100 text-sm mb-5">Assessment Akhir OJT berhasil dikumpulkan dan nilai sudah dihitung otomatis.</p>
            <div className="flex items-center gap-4">
              <div className="bg-white/15 rounded-xl px-6 py-3 text-center">
                <p className="text-4xl font-black">{Math.round(score)}</p>
                <p className="text-xs text-blue-100 mt-0.5">nilai</p>
              </div>
              <div className="flex-1" />
              <Link
                to="/fl/assessment/review"
                className="flex items-center gap-2 bg-white text-[#023DFF] font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
              >
                Lihat Jawaban →
              </Link>
            </div>
          </div>

          <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="font-semibold text-sm text-[#15803D]">Assessment selesai — nilai dihitung otomatis dari jawaban kamu.</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <h3 className="font-semibold text-[#0F1729] mb-4">Pernyataan Penguasaan Materi</h3>
            <div className="grid grid-cols-2 gap-2">
              {assessment.masteryChecks.map(m => (
                <div key={m.materialId} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${m.mastered ? 'bg-[#F0FDF4]' : 'bg-[#F8FAFC]'}`}>
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${m.mastered ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}`}>
                    {m.mastered && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <p className="text-sm text-[#0F1729]">{m.material}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'intro') {
    return (
      <div className="p-4 md:p-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F1729]">Assessment Akhir OJT</h1>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-4">Yang akan kamu kerjakan</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-[#E5F2FF] rounded-full flex items-center justify-center font-bold text-[#023DFF] text-xs flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm">Pernyataan Penguasaan Materi</p>
                  <p className="text-xs text-[#65758B] mt-0.5">Tandai materi yang sudah kamu kuasai selama OJT</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-[#E5F2FF] rounded-full flex items-center justify-center font-bold text-[#023DFF] text-xs flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm">Soal Assessment</p>
                  <p className="text-xs text-[#65758B] mt-0.5">{ASSESSMENT_QUESTIONS.length} soal pilihan ganda · bobot 30% nilai akhir</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#E5F2FF] rounded-xl border border-[#023DFF]/20 p-4">
            <p className="text-sm font-semibold text-[#023DFF] mb-2">💡 Tips mengerjakan</p>
            <ul className="space-y-1 text-xs text-[#001CDB]">
              <li>• Jawab dengan jujur sesuai yang kamu pelajari selama OJT</li>
              <li>• Skor assessment ini akan masuk ke penilaian akhir OJT kamu</li>
            </ul>
          </div>

          <button
            onClick={() => setStep('mastery')}
            className="w-full h-11 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Mulai Sekarang →
          </button>
        </div>
      </div>
    )
  }

  if (step === 'mastery') {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('intro')} className="text-[#65758B] hover:text-[#0F1729] transition-colors flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0F1729]">Langkah 1: Penguasaan Materi</h1>
              <p className="text-[#65758B] text-sm mt-0.5">Tandai materi yang sudah kamu kuasai</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#94A3B8" strokeWidth="1.2"/><path d="M7 4.5V7l1.5 1.5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-mono text-sm text-[#65758B] tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
        </div>

        <DStepper currentStep={1} />

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Saya sudah menguasai materi berikut:</p>
              <span className="text-sm font-bold text-[#023DFF]">{masteredCount}/{masteryChecks.length}</span>
            </div>
            <p className="text-[10px] text-[#94A3B8] mb-4">Tidak ada yang benar atau salah — pilih sesuai yang benar-benar kamu kuasai.</p>
            <div className="space-y-2">
              {masteryChecks.map(m => (
                <button
                  key={m.materialId}
                  onClick={() => toggleMastery(m.materialId)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    m.mastered ? 'border-[#023DFF] bg-[#E5F2FF]' : 'border-[#E1E7EF] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${m.mastered ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1]'}`}>
                    {m.mastered && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <p className="text-sm text-[#0F1729]">{m.material}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep('questions')}
            className="w-full h-11 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Lanjut ke Soal →
          </button>
        </div>
      </div>
    )
  }

  // step === 'questions'
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('mastery')} className="text-[#65758B] hover:text-[#0F1729] transition-colors flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F1729]">Langkah 2: Soal Assessment</h1>
            <p className="text-[#65758B] text-sm mt-0.5">Jawab semua pertanyaan berikut</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#94A3B8" strokeWidth="1.2"/><path d="M7 4.5V7l1.5 1.5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="font-mono text-sm text-[#65758B] tabular-nums">{formatElapsed(elapsed)}</span>
        </div>
      </div>

      <DStepper currentStep={2} />

      <div className="space-y-4">
        {ASSESSMENT_QUESTIONS.map((q, idx) => {
          const selected = mcqAnswers[q.id]
          return (
            <div
              key={q.id}
              ref={(el) => { questionRefs.current[q.id] = el }}
              className="bg-white rounded-xl border border-[#E1E7EF] p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-6 h-6 bg-[#F1F5F9] rounded-full flex items-center justify-center text-xs font-bold text-[#65758B] flex-shrink-0 mt-0.5">{idx + 1}</span>
                <p className="text-sm font-semibold text-[#0F1729]">{q.question}</p>
              </div>
              <div className="space-y-2 pl-9">
                {q.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => selectAnswer(q.id, oIdx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                      selected === oIdx
                        ? 'border-[#023DFF] bg-[#E5F2FF] text-[#023DFF]'
                        : 'border-[#E1E7EF] text-[#0F1729] hover:border-[#023DFF]/40'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold transition-all ${
                      selected === oIdx ? 'border-[#023DFF] bg-[#023DFF] text-white' : 'border-[#CBD5E1] text-[#94A3B8]'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        <div className="bg-white rounded-xl border border-[#E1E7EF] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#65758B]">Soal dijawab</span>
            <span className="text-sm font-bold text-[#023DFF]">{answeredCount}/{ASSESSMENT_QUESTIONS.length}</span>
          </div>
          <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-[#023DFF] rounded-full transition-all" style={{ width: `${(answeredCount / ASSESSMENT_QUESTIONS.length) * 100}%` }} />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full h-11 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
        >
          Submit Jawaban
        </button>
      </div>
    </div>
  )
}

function DStepper({ currentStep }: { currentStep: 1 | 2 }) {
  const lineActive = currentStep === 2
  return (
    <div className="flex items-start mt-5 mb-8">
      <StepperBubble
        state={currentStep === 1 ? 'active' : 'done'}
        num={1}
        label="Penguasaan Materi"
      />
      <div className="h-0.5 flex-1 mt-3 mx-2" style={{ backgroundColor: lineActive ? '#023DFF' : '#CBD5E1' }} />
      <StepperBubble
        state={currentStep === 2 ? 'active' : 'inactive'}
        num={2}
        label="Soal Assessment"
      />
    </div>
  )
}

function StepperBubble({ state, num, label }: { state: 'active' | 'inactive' | 'done'; num: number; label: string }) {
  return (
    <div className="flex flex-col items-center" style={{ minWidth: 64 }}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        state === 'done' ? 'bg-[#023DFF] text-white' :
        state === 'active' ? 'bg-[#E5F2FF] text-[#001CDB]' :
        'bg-[#E1E7EF] text-[#94A3B8]'
      }`}>
        {state === 'done'
          ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : num
        }
      </div>
      <p className={`text-[10px] mt-1 text-center leading-tight ${state === 'inactive' ? 'text-[#65758B]' : 'text-[#0F1729]'}`}>{label}</p>
    </div>
  )
}
