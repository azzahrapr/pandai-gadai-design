import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
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
  const { currentUser, getUserById, getFlScoreBreakdown, getFlFinalEvaluation, submitFinalEvaluation } = useApp()
  const kanitProfile = currentUser!.profile as KanitProfile

  const flUser = getUserById(flId ?? '')
  const flProfile = flUser?.profile as FLProfile | undefined
  const scores = getFlScoreBreakdown(flId ?? '')
  const existingEval = getFlFinalEvaluation(flId ?? '')

  const initSkills = (eval_: FinalEvaluation | undefined) =>
    SOFT_SKILLS.map(s => ({ skill: s.label, score: eval_?.softSkills.find(ss => ss.skill === s.label)?.score ?? 0 }))

  // OJT is Tidak Lulus the moment ANY known component fails (fail-fast, see
  // getFlScoreBreakdown) — if Latihan or Ujian Akhir already failed, "Lulus" here would
  // be a contradictory, misleading choice regardless of the kanit's own judgment, so it's
  // disabled outright rather than just defaulted. "Tidak Lulus" is never disabled — it
  // never contradicts the fail-fast rule, whatever the other 2 components say.
  const anyOtherComponentFailed = scores.latihanPassed === false || scores.ujianPassed === false

  const [softSkills, setSoftSkills] = useState(() => initSkills(existingEval))
  const [attitudeScore, setAttitudeScore] = useState(existingEval?.attitudeScore ?? 0)
  const [feedback, setFeedback] = useState(existingEval?.feedback ?? '')
  const [recommendation, setRecommendation] = useState<'lulus' | 'tidak_lulus'>(() => {
    if (anyOtherComponentFailed) return 'tidak_lulus'
    return existingEval?.recommendation ?? (scores.passed ? 'lulus' : 'tidak_lulus')
  })
  const [submitted, setSubmitted] = useState(!!existingEval)
  const [showConfirmSheet, setShowConfirmSheet] = useState(false)

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
    // Rapot Akhir is one of 3 pass/fail components — once it's in, Nilai Saya is where
    // the kanit actually sees the (possibly now-decided) Status Kelulusan gate, so send
    // them straight there instead of leaving them staring at this form.
    navigate(`/kanit/results?flId=${flId}`)
  }

  const canSubmit = attitudeScore > 0 && softSkills.every(s => s.score > 0) && feedback.trim().length > 0
  const avgSoftSkill = softSkills.every(s => s.score > 0)
    ? Math.round(softSkills.reduce((s, ss) => s + ss.score, 0) / softSkills.length * 10) / 10
    : null

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/kanit/results" className="text-sm text-[#65758B] hover:text-[#023DFF] transition-colors">← Nilai Akhir</Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Rapot Akhir</h1>
          <p className="text-[#65758B] text-sm mt-1">{flUser.name} · {flProfile.branch}</p>
        </div>
        {submitted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#16A34A]/20 text-[#15803D] text-xs font-semibold rounded-lg self-start">
            ✅ Sudah diisi
          </span>
        )}
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Score summary — sticky so the Sikap Kerja tile visibly updates in place as
            soon as the kanit finishes the ratings below, without needing to scroll back
            up to see the effect of what they just did. */}
        <div className="sticky top-0 z-10 bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-md">
          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-4">Ringkasan Nilai Objektif</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-[#F8FAFC] rounded-xl p-2.5 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-[#023DFF]">{scores.dailyProgressScore ?? '—'}</p>
              <p className="text-xs text-[#65758B] mt-0.5">Latihan</p>
              {scores.latihanPassed !== null && (
                <p className={`text-[10px] font-semibold mt-1 ${scores.latihanPassed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                  {scores.latihanPassed ? 'Lulus' : 'Tidak Lulus'}
                </p>
              )}
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-2.5 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-[#023DFF]">{scores.assessmentScore ?? '—'}</p>
              <p className="text-xs text-[#65758B] mt-0.5">Ujian Akhir</p>
              {scores.ujianPassed !== null && (
                <p className={`text-[10px] font-semibold mt-1 ${scores.ujianPassed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                  {scores.ujianPassed ? 'Lulus' : 'Tidak Lulus'}
                </p>
              )}
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-2.5 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-[#023DFF]">{avgSoftSkill !== null ? `${avgSoftSkill}/5` : '—'}</p>
              <p className="text-xs text-[#65758B] mt-0.5">Sikap Kerja</p>
            </div>
          </div>
        </div>

        {/* Soft skills */}
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-4">Penilaian Soft Skills</p>
          <div className="space-y-4">
            {SOFT_SKILLS.map((sk, i) => (
              <div key={sk.key} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                <span className="sm:w-28 text-sm text-[#0F1729] flex-shrink-0">{sk.label}</span>
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
          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Pernyataan Kelulusan</p>
          <div className="flex gap-3">
            <button
              onClick={() => !anyOtherComponentFailed && setRecommendation('lulus')}
              disabled={anyOtherComponentFailed}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                anyOtherComponentFailed
                  ? 'border-[#E1E7EF] text-[#CBD5E1] cursor-not-allowed'
                  : recommendation === 'lulus' ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]' : 'border-[#E1E7EF] text-[#65758B] hover:border-[#16A34A]/40'
              }`}
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
          {anyOtherComponentFailed && (
            <p className="text-xs text-[#94A3B8] mt-2">Tidak bisa memilih "Lulus" — ada komponen penilaian lain (Latihan/Ujian Akhir) yang belum memenuhi passing grade.</p>
          )}
        </div>

        <button
          onClick={() => canSubmit && setShowConfirmSheet(true)}
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

      {/* Konfirmasi Pernyataan Kelulusan — bottom sheet. Rapot Akhir has no edit path
          back once saved (the "Edit Evaluasi" link was removed earlier), so this is the
          one chance to catch a wrong Lulus/Tidak Lulus pick before it's final. */}
      {showConfirmSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) setShowConfirmSheet(false) }}>
          <div className="bg-white rounded-t-2xl w-full max-w-xl overflow-hidden">
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-[#E1E7EF]" />
            </div>
            <div className="px-6 pt-3 pb-6">
              <p className="text-base font-bold text-[#0F1729] mb-1">Konfirmasi Pernyataan Kelulusan</p>
              <p className="text-xs text-[#65758B] mb-4">Rapot Akhir untuk {flUser.name} tidak bisa diubah lagi setelah disimpan. Pastikan pernyataan kelulusan di bawah ini sudah benar.</p>

              <div className={`rounded-xl border-2 p-4 flex items-center gap-3 mb-5 ${
                recommendation === 'lulus' ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#DC2626] bg-[#FEF2F2]'
              }`}>
                <span className="text-2xl">{recommendation === 'lulus' ? '🎉' : '❌'}</span>
                <div>
                  <p className="text-[10px] font-semibold text-[#65758B] uppercase tracking-wide">Pernyataan Kelulusan</p>
                  <p className={`text-sm font-bold ${recommendation === 'lulus' ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                    {recommendation === 'lulus' ? 'Lulus' : 'Tidak Lulus'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSheet(false)}
                  className="flex-1 h-11 rounded-xl border border-[#CBD5E1] bg-white text-[#0F1729] font-semibold text-sm hover:bg-[#F1F5F9] transition-colors"
                >
                  Batalkan
                </button>
                <button
                  onClick={() => { setShowConfirmSheet(false); handleSubmit() }}
                  className="flex-1 h-11 rounded-xl bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm transition-colors"
                >
                  Ya, Sudah Benar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
