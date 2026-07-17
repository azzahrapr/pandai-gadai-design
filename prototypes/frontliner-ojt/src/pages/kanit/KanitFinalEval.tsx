import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ASSESSMENT_QUESTIONS } from '../../data/mockData'
import type { KanitProfile, FLProfile, FinalEvaluation } from '../../types'

const SOFT_SKILLS = [
  { key: 'teamwork', label: 'Kerja Tim' },
  { key: 'komunikasi', label: 'Komunikasi' },
  { key: 'inisiatif', label: 'Inisiatif' },
  { key: 'ketelitian', label: 'Ketelitian' },
  { key: 'adaptasi', label: 'Adaptasi' },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-xl transition-transform hover:scale-110"
        >
          <span className={(hovered || value) >= n ? 'text-[#E0A200]' : 'text-[#E1E7EF]'}>★</span>
        </button>
      ))}
      {value > 0 && <span className="ml-2 text-xs text-[#65758B] self-center">{['', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik', 'Luar Biasa'][value]}</span>}
    </div>
  )
}

export default function KanitFinalEval() {
  const { flId } = useParams<{ flId: string }>()
  const navigate = useNavigate()
  const { currentUser, getUserById, getFlScoreBreakdown, getFlChecklists, getFlPenaksiran, getFlAssessment, getFlFinalEvaluation, submitFinalEvaluation } = useApp()
  const kanitProfile = currentUser!.profile as KanitProfile

  const flUser = getUserById(flId ?? '')
  const flProfile = flUser?.profile as FLProfile | undefined
  const scores = getFlScoreBreakdown(flId ?? '')
  const checklists = getFlChecklists(flId ?? '').filter(c => c.status === 'scored')
  const penaksiran = getFlPenaksiran(flId ?? '').filter(r => r.kanitScore !== undefined)
  const assessment = getFlAssessment(flId ?? '')
  const existingEval = getFlFinalEvaluation(flId ?? '')

  const mcqCorrect = assessment ? ASSESSMENT_QUESTIONS.reduce((count, q) => {
    const ans = assessment.answers.find(a => a.questionId === q.id)
    return count + (ans?.answer === q.options[q.correctIndex] ? 1 : 0)
  }, 0) : 0

  const initSkills = (eval_: FinalEvaluation | undefined) =>
    SOFT_SKILLS.map(s => ({ skill: s.label, score: eval_?.softSkills.find(ss => ss.skill === s.label)?.score ?? 0 }))

  const [softSkills, setSoftSkills] = useState(() => initSkills(existingEval))
  const [attitudeScore, setAttitudeScore] = useState(existingEval?.attitudeScore ?? 0)
  const [feedback, setFeedback] = useState(existingEval?.feedback ?? '')
  const [recommendation, setRecommendation] = useState<'lulus' | 'tidak_lulus'>(
    existingEval?.recommendation ?? (scores.passed ? 'lulus' : 'tidak_lulus')
  )
  const [submitted, setSubmitted] = useState(!!existingEval)

  if (!flUser || !flProfile) {
    return (
      <div className="p-8 text-center text-[#65758B]">
        <p>Peserta tidak ditemukan.</p>
        <Link to="/kanit/results" className="text-[#023DFF] text-sm mt-2 inline-block">← Kembali</Link>
      </div>
    )
  }

  function handleSubmit() {
    if (!flId || attitudeScore === 0 || softSkills.some(s => s.score === 0) || !feedback.trim()) return
    const evaluation: FinalEvaluation = {
      id: `eval-${flId}`,
      flId,
      kanitId: currentUser!.id,
      submittedAt: new Date().toISOString(),
      softSkills,
      attitudeScore,
      feedback,
      recommendation,
    }
    submitFinalEvaluation(evaluation)
    setSubmitted(true)
  }

  const canSubmit = attitudeScore > 0 && softSkills.every(s => s.score > 0) && feedback.trim().length > 0
  const avgSoftSkill = softSkills.every(s => s.score > 0)
    ? Math.round(softSkills.reduce((s, ss) => s + ss.score, 0) / softSkills.length * 10) / 10
    : null

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/kanit/results" className="text-sm text-[#65758B] hover:text-[#023DFF] transition-colors">← Hasil Akhir OJT</Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Evaluasi Akhir OJT</h1>
          <p className="text-[#65758B] text-sm mt-1">{flUser.name} · {flProfile.branch}</p>
        </div>
        {submitted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#16A34A]/20 text-[#15803D] text-xs font-semibold rounded-lg">
            ✅ Sudah diisi
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Score summary */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-4">Ringkasan Nilai Objektif</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[#023DFF]">{scores.dailyProgressScore ?? '—'}</p>
                <p className="text-xs text-[#65758B] mt-0.5">Checklist</p>
                <p className="text-[10px] text-[#94A3B8]">{checklists.length}/14 hari</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[#023DFF]">{scores.assessmentScore ?? '—'}</p>
                <p className="text-xs text-[#65758B] mt-0.5">Assessment</p>
                <p className="text-[10px] text-[#94A3B8]">{mcqCorrect}/{ASSESSMENT_QUESTIONS.length} soal benar</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[#023DFF]">{scores.penaksiranScore ?? '—'}</p>
                <p className="text-xs text-[#65758B] mt-0.5">Penaksiran</p>
                <p className="text-[10px] text-[#94A3B8]">{penaksiran.length} sesi</p>
              </div>
            </div>
            {scores.totalScore !== null && (
              <div className={`mt-4 rounded-xl p-4 flex items-center gap-4 ${scores.passed ? 'bg-[#F0FDF4] border border-[#16A34A]/20' : 'bg-[#FEF2F2] border border-[#DC2626]/20'}`}>
                <p className={`text-4xl font-black ${scores.passed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{scores.totalScore}</p>
                <div>
                  <p className={`font-bold text-sm ${scores.passed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>Nilai Akhir OJT</p>
                  <p className="text-xs text-[#65758B]">60% checklist + 40% assessment</p>
                </div>
              </div>
            )}
          </div>

          {/* Soft skills */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-4">Penilaian Soft Skills</p>
            <div className="space-y-4">
              {SOFT_SKILLS.map((sk, i) => (
                <div key={sk.key} className="flex items-center gap-4">
                  <span className="w-28 text-sm text-[#0F1729] flex-shrink-0">{sk.label}</span>
                  <StarRating
                    value={softSkills[i].score}
                    onChange={v => setSoftSkills(prev => prev.map((s, j) => j === i ? { ...s, score: v } : s))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Attitude */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-4">Penilaian Attitude & Kedisiplinan</p>
            <StarRating value={attitudeScore} onChange={setAttitudeScore} />
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Feedback Keseluruhan</p>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Tulis catatan dan feedback untuk peserta OJT ini..."
              className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-xl px-4 py-3 text-sm text-[#0F1729] outline-none resize-none leading-relaxed transition-colors"
              rows={5}
            />
          </div>

          {/* Recommendation */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Rekomendasi Kelulusan</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRecommendation('lulus')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${recommendation === 'lulus' ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]' : 'border-[#E1E7EF] text-[#65758B] hover:border-[#16A34A]/40'}`}
              >
                🎉 Lulus
              </button>
              <button
                onClick={() => setRecommendation('tidak_lulus')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${recommendation === 'tidak_lulus' ? 'border-[#DC2626] bg-[#FEF2F2] text-[#B91C1C]' : 'border-[#E1E7EF] text-[#65758B] hover:border-[#DC2626]/40'}`}
              >
                ❌ Tidak Lulus
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full h-12 rounded-xl font-semibold text-sm transition-all ${canSubmit ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}
          >
            {submitted ? 'Perbarui Evaluasi' : 'Simpan Evaluasi Akhir'}
          </button>

          {submitted && (
            <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 flex items-center gap-3 -mt-2">
              <span>✅</span>
              <p className="text-sm font-semibold text-[#15803D]">Evaluasi berhasil disimpan!</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#E5F2FF] rounded-full flex items-center justify-center font-bold text-[#023DFF] text-sm flex-shrink-0">
                {flUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0F1729]">{flUser.name}</p>
                <p className="text-xs text-[#65758B]">Hari {flProfile.currentDay}/14 · {flProfile.position}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm border-t border-[#E1E7EF] pt-4">
              <div className="flex justify-between">
                <span className="text-[#65758B]">Nilai Checklist</span>
                <span className="font-semibold">{scores.dailyProgressScore ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65758B]">Assessment</span>
                <span className="font-semibold">{scores.assessmentScore ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65758B]">Penaksiran</span>
                <span className="font-semibold">{scores.penaksiranScore ?? '—'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E1E7EF]">
                <span className="text-[#65758B] font-semibold">Total</span>
                <span className={`font-black text-lg ${scores.passed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{scores.totalScore ?? '—'}</span>
              </div>
            </div>
          </div>

          {avgSoftSkill && (
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Soft Skills Terisi</p>
              <div className="space-y-2">
                {softSkills.map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-[#65758B]">{SOFT_SKILLS[i].label}</span>
                    <span className="font-semibold text-[#0F1729]">{s.score > 0 ? `${'★'.repeat(s.score)}${'☆'.repeat(5 - s.score)}` : '—'}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm pt-2 border-t border-[#E1E7EF]">
                  <span className="text-[#65758B] font-semibold">Attitude</span>
                  <span className="font-semibold">{attitudeScore > 0 ? `${'★'.repeat(attitudeScore)}${'☆'.repeat(5 - attitudeScore)}` : '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
