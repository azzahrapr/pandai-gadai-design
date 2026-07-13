import { useState } from 'react'
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
  const [answers, setAnswers] = useState<{ questionId: string; question: string; answer: string }[]>(
    existing?.answers ?? ASSESSMENT_QUESTIONS.map(q => ({ questionId: q.id, question: q.question, answer: '' }))
  )

  function toggleMastery(materialId: string) {
    setMasteryChecks(prev => prev.map(m => m.materialId === materialId ? { ...m, mastered: !m.mastered } : m))
  }

  function setAnswer(questionId: string, answer: string) {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, answer } : a))
  }

  function handleSubmit() {
    const assessment: Assessment = {
      id: `assess-${currentUser!.id}`,
      flId: currentUser!.id,
      day: profile.currentDay,
      date: '2026-07-08',
      masteryChecks,
      answers,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    }
    submitAssessment(assessment)
    setStep('done')
  }

  const masteredCount = masteryChecks.filter(m => m.mastered).length
  const answeredCount = answers.filter(a => a.answer.trim().length > 0).length

  if (profile.currentDay < 14) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#0F1729]">Assessment Belum Tersedia</h2>
          <p className="text-[#65758B] text-sm mt-2">Assessment hanya bisa dilakukan di Hari ke-14 OJT.</p>
          <p className="text-[#023DFF] font-semibold text-sm mt-1">Kamu sekarang di Hari {profile.currentDay} dari 14.</p>
        </div>
      </div>
    )
  }

  if (step === 'done' || existing) {
    const assessment = existing ?? { masteryChecks, answers, status: 'submitted', kanitScore: undefined, kanitNote: undefined }
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F1729]">Assessment Hari ke-14</h1>
          <p className="text-[#65758B] text-sm mt-1">Penilaian akhir program OJT kamu</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {/* Status */}
            <div className={`rounded-xl p-6 flex items-center gap-5 ${assessment.status === 'scored' ? 'bg-[#F0FDF4] border border-[#16A34A]/20' : 'bg-[#FEFDEA] border border-[#E0A200]/30'}`}>
              <div className="text-4xl">{assessment.status === 'scored' ? '🎓' : '⏳'}</div>
              <div className="flex-1">
                <p className={`font-bold text-lg ${assessment.status === 'scored' ? 'text-[#15803D]' : 'text-[#B27202]'}`}>
                  {assessment.status === 'scored' ? 'Assessment Sudah Dinilai!' : 'Assessment Tersubmit!'}
                </p>
                <p className={`text-sm mt-0.5 ${assessment.status === 'scored' ? 'text-[#15803D]/80' : 'text-[#B27202]/80'}`}>
                  {assessment.status === 'scored' ? 'Nilai kamu sudah tersedia.' : 'Menunggu penilaian dari Kanit.'}
                </p>
              </div>
              {assessment.status === 'scored' && assessment.kanitScore !== undefined && (
                <div className="text-center">
                  <p className={`text-5xl font-black ${assessment.kanitScore >= 75 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{assessment.kanitScore}</p>
                  <p className="text-xs text-[#65758B]">/100</p>
                </div>
              )}
            </div>

            {/* Mastery summary */}
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

            {assessment.kanitNote && (
              <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
                <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">Catatan Kanit</p>
                <p className="text-sm text-[#0F1729] leading-relaxed">"{assessment.kanitNote}"</p>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Ringkasan</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Materi dikuasai</span>
                  <span className="font-semibold text-[#0F1729]">{assessment.masteryChecks.filter(m => m.mastered).length}/{assessment.masteryChecks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Soal dijawab</span>
                  <span className="font-semibold text-[#0F1729]">{assessment.answers.filter(a => a.answer.trim()).length}/{assessment.answers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Status</span>
                  <span className={`font-semibold ${assessment.status === 'scored' ? 'text-[#15803D]' : 'text-[#B27202]'}`}>
                    {assessment.status === 'scored' ? 'Dinilai' : 'Pending'}
                  </span>
                </div>
                {assessment.kanitScore !== undefined && (
                  <div className="flex justify-between pt-2 border-t border-[#E1E7EF]">
                    <span className="text-[#65758B]">Nilai</span>
                    <span className={`text-xl font-black ${assessment.kanitScore >= 75 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{assessment.kanitScore}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'intro') {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F1729]">Assessment Hari ke-14</h1>
          <p className="text-[#65758B] text-sm mt-1">Penilaian akhir program OJT kamu</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="bg-[#023DFF] rounded-xl p-6 text-white">
              <span className="text-4xl">🎓</span>
              <h2 className="text-xl font-bold mt-3 mb-2">Selamat! Ini Hari ke-14 OJT kamu</h2>
              <p className="text-blue-100 text-sm leading-relaxed">Kamu telah menyelesaikan 13 hari OJT. Assessment akhir ini akan menentukan kelulusan dan nilai akhir program OJT kamu.</p>
            </div>

            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <h3 className="font-semibold text-[#0F1729] mb-4">Yang akan kamu kerjakan:</h3>
              <div className="space-y-4">
                <StepCard num={1} title="Pernyataan Penguasaan Materi" desc="Cek materi mana yang sudah kamu kuasai selama OJT" />
                <StepCard num={2} title="Soal Assessment" desc={`Jawab ${ASSESSMENT_QUESTIONS.length} pertanyaan tentang materi yang telah dipelajari`} />
              </div>
            </div>

            <div className="bg-[#E5F2FF] rounded-xl border border-[#023DFF]/20 p-4">
              <p className="text-sm font-semibold text-[#023DFF] mb-2">💡 Tips mengerjakan assessment</p>
              <ul className="space-y-1.5 text-xs text-[#001CDB]">
                <li>• Jawab dengan jujur sesuai yang kamu pelajari</li>
                <li>• Gunakan bahasa yang jelas dan mudah dipahami</li>
                <li>• Tidak ada jawaban benar/salah mutlak — yang dinilai adalah pemahamanmu</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Detail Assessment</p>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Langkah</span>
                  <span className="font-semibold text-[#0F1729]">2 bagian</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Soal</span>
                  <span className="font-semibold text-[#0F1729]">{ASSESSMENT_QUESTIONS.length} pertanyaan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Bobot nilai</span>
                  <span className="font-semibold text-[#0F1729]">30%</span>
                </div>
              </div>
              <button
                onClick={() => setStep('mastery')}
                className="w-full h-11 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
              >
                Mulai Assessment →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'mastery') {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setStep('intro')} className="text-[#65758B] hover:text-[#0F1729] transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F1729]">Langkah 1: Penguasaan Materi</h1>
            <p className="text-[#65758B] text-sm mt-0.5">Tandai materi yang sudah kamu kuasai</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <StepIndicator num={1} active />
          <div className="h-0.5 w-12 bg-[#E1E7EF]" />
          <StepIndicator num={2} active={false} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-4">Saya sudah menguasai materi berikut:</p>
              <div className="grid grid-cols-2 gap-3">
                {masteryChecks.map(m => (
                  <button
                    key={m.materialId}
                    onClick={() => toggleMastery(m.materialId)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      m.mastered ? 'border-[#023DFF] bg-[#E5F2FF]' : 'border-[#E1E7EF] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${m.mastered ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1]'}`}>
                      {m.mastered && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <p className="text-sm text-[#0F1729]">{m.material}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Progress</p>
              <p className="text-3xl font-bold text-[#023DFF]">{masteredCount}<span className="text-lg text-[#94A3B8]">/{masteryChecks.length}</span></p>
              <p className="text-xs text-[#65758B] mt-1">materi dikuasai</p>
            </div>
            <button
              onClick={() => setStep('questions')}
              className="w-full h-11 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Lanjut ke Soal →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // step === 'questions'
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setStep('mastery')} className="text-[#65758B] hover:text-[#0F1729] transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Langkah 2: Soal Assessment</h1>
          <p className="text-[#65758B] text-sm mt-0.5">Jawab semua pertanyaan berikut</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <StepIndicator num={1} active={false} done />
        <div className="h-0.5 w-12 bg-[#023DFF]" />
        <StepIndicator num={2} active />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {answers.map((a, idx) => (
            <div key={a.questionId} className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 bg-[#F1F5F9] rounded-full flex items-center justify-center text-xs font-bold text-[#65758B]">{idx + 1}</span>
                <p className="text-sm font-semibold text-[#0F1729]">{a.question}</p>
              </div>
              <textarea
                value={a.answer}
                onChange={e => setAnswer(a.questionId, e.target.value)}
                placeholder="Tulis jawabanmu di sini..."
                className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                rows={3}
              />
              {a.answer.trim() && (
                <div className="mt-2 flex justify-end">
                  <span className="text-[10px] text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full">✓ Dijawab</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Progress</p>
            <p className="text-3xl font-bold text-[#023DFF]">{answeredCount}<span className="text-lg text-[#94A3B8]">/{answers.length}</span></p>
            <p className="text-xs text-[#65758B] mt-1">soal dijawab</p>
            <div className="mt-3 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#023DFF] rounded-full transition-all" style={{ width: `${(answeredCount / answers.length) * 100}%` }} />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className={`w-full h-11 px-4 rounded-lg font-semibold text-sm transition-all ${
              answeredCount > 0
                ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
                : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            Submit Assessment
          </button>
          {answeredCount === 0 && <p className="text-xs text-center text-[#94A3B8]">Jawab minimal 1 soal untuk submit</p>}
        </div>
      </div>
    </div>
  )
}

function StepCard({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 bg-[#E5F2FF] rounded-full flex items-center justify-center font-bold text-[#023DFF] text-sm flex-shrink-0 mt-0.5">{num}</div>
      <div>
        <p className="font-semibold text-[#0F1729] text-sm">{title}</p>
        <p className="text-xs text-[#65758B] mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function StepIndicator({ num, active, done }: { num: number; active: boolean; done?: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
      done ? 'bg-[#16A34A] text-white' : active ? 'bg-[#023DFF] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
    }`}>
      {done ? '✓' : num}
    </div>
  )
}
