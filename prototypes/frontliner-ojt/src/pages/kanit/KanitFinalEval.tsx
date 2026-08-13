import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { KKM_SIKAP_KERJA } from '../../data/mockData'
import type { KanitProfile, FLProfile, FinalEvaluation } from '../../types'

// Aligned to "On The Job Training Curriculum - Aspek Penilaian Softskill.csv" (2026-08-12)
// — the official rubric defines exactly 4 soft-skill aspects (this list) + 1 separate
// Attitude aspect (kept as its own rating below, matching how this page already split
// them). "Ketelitian" (previously a 5th soft skill here) isn't part of the official
// rubric and was dropped rather than kept unguided.
const SOFT_SKILLS = [
  { key: 'teamwork', label: 'Kerja Tim' },
  { key: 'inisiatif', label: 'Inisiatif' },
  { key: 'komunikasi', label: 'Komunikasi' },
  { key: 'adaptasi', label: 'Adaptasi' },
]

// 4-point scale (was 5) — matches the CSV's exact "Skala 1–4" rubric instead of an
// invented 5th level. Skala 1 = Sangat Kurang, ..., Skala 4 = Baik.
const SKALA_LABELS = ['Sangat Kurang', 'Kurang', 'Cukup', 'Baik']

// Full per-aspect rubric text from the CSV. Keyed the same way as SOFT_SKILLS (plus
// 'attitude' for the Attitude row) so each rating row can open just its OWN aspect's guide
// instead of one combined sheet covering all 5 at once — 5 aspects × 4 levels of paragraph
// text in a single sheet read as way too much at once.
const PENILAIAN_GUIDE: Record<string, { aspek: string; skala: string[] }> = {
  teamwork: {
    aspek: 'Kerjasama Tim (Teamwork)',
    skala: [
      'Individualis, enggan berinteraksi/membantu rekan kerja, atau memicu ketegangan dalam tim cabang.',
      'Pasif dalam tim, hanya mau bekerja sama jika diperintah secara langsung oleh atasan/mentor.',
      'Cooperative, mau bekerja sama dengan baik, menyelesaikan bagian tugasnya, dan bersikap kooperatif.',
      'Proaktif menawarkan bantuan kepada rekan kerja yang membutuhkan tanpa mengganggu tugas utamanya.',
    ],
  },
  inisiatif: {
    aspek: 'Inisiatif (Initiative)',
    skala: [
      "Sangat pasif, 'menunggu disuapi' instruksi, tidak menunjukkan rasa ingin tahu terhadap pekerjaan.",
      'Hanya bergerak jika diingatkan, jarang bertanya saat ada kendala, mudah menyerah jika menemui jalan buntu.',
      'Aktif bertanya jika ada hal yang kurang dipahami dan mampu menyelesaikan tugas rutin OJT tanpa diawasi ketat.',
      'Cepat tanggap melihat peluang untuk membantu atau mempelajari hal baru saat ada waktu luang di cabang.',
    ],
  },
  komunikasi: {
    aspek: 'Komunikasi dalam Tim (Communication)',
    skala: [
      'Tertutup, sering terjadi miskomunikasi karena enggan bertanya/berbicara, mengabaikan arahan mentor.',
      'Ragu-ragu menyampaikan masalah/progres pekerjaan dan kurang menjadi pendengar yang baik saat diberi arahan.',
      'Berkomunikasi jelas, sopan, serta rajin melaporkan progres OJT harian kepada mentor atau Kepala Cabang.',
      'Artikulatif, dapat menyampaikan ide/pertanyaan secara efektif, dan menjadi pendengar yang sangat aktif.',
    ],
  },
  adaptasi: {
    aspek: 'Adaptasi Tim & Pekerjaan (Adaptability)',
    skala: [
      'Menolak budaya/aturan cabang, sulit menerima perubahan, melakukan kesalahan mendasar sama berulang kali.',
      'Membutuhkan waktu lama beradaptasi dengan ritme cabang, masih sering bingung alur kerja standar OJT.',
      'Mampu menyesuaikan diri dengan ritme cabang dan memahami alur kerja standar dalam masa OJT 14 hari.',
      'Fast learner, cepat menyerap materi, fleksibel menghadapi dinamika lapangan, dan mudah berbaur.',
    ],
  },
  attitude: {
    aspek: 'Attitude & Kesopanan (Etiquette & Conduct)',
    skala: [
      'Berkata kurang sopan/kasar, tidak menghargai rekan/atasan/nasabah, atau menunjukkan gestur tidak profesional.',
      'Terkadang kurang menjaga etika (intonasi tinggi, kurang ramah, atau acuh tak acuh saat disapa).',
      'Santun, ramah (menerapkan 3S: Senyum, Salam, Sapa), bahasa baik, menghormati seluruh tim cabang.',
      'Sangat menghargai orang lain, konsisten menjaga etika bicara & perilaku, berpenampilan rapi & profesional.',
    ],
  },
}

function InfoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 7.2v3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="0.7" fill="currentColor"/>
    </svg>
  )
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map(n => (
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
      {value > 0 && <span className="ml-2 text-xs text-[#65758B] self-center">{['', ...SKALA_LABELS][value]}</span>}
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

  const [softSkills, setSoftSkills] = useState(() => initSkills(existingEval))
  const [attitudeScore, setAttitudeScore] = useState(existingEval?.attitudeScore ?? 0)

  // Sikap Kerja's own KKM check — needs softSkills/attitudeScore state above, unlike
  // Latihan/Ujian Akhir's pass flags which come straight off getFlScoreBreakdown(). Doesn't
  // feed evaluasiPassed directly (that's still just whichever Pernyataan Kelulusan the
  // kanit picks below) — it only gates whether "Lulus" is even pickable, same idea as the
  // other 2 components. Score is 0-100, same formula as getFlScoreBreakdown()'s own
  // sikapKerjaScore — (sum of all 5 ratings [4 soft skills + Attitude, each 1-4] / 20) *
  // 100 — so this live preview and the read-only post-submit value never disagree. Stays
  // null (nothing to disable yet) until ALL 5 are rated, not just the 4 soft skills, so the
  // Lulus-disable logic can't kick in off a partial rating.
  const sikapKerjaScore = (softSkills.every(s => s.score > 0) && attitudeScore > 0)
    ? Math.round(((softSkills.reduce((s, ss) => s + ss.score, 0) + attitudeScore) / 20) * 100)
    : null
  const sikapKerjaPassed = sikapKerjaScore !== null ? sikapKerjaScore >= KKM_SIKAP_KERJA : null

  // OJT is Tidak Lulus the moment ANY known component fails (fail-fast, see
  // getFlScoreBreakdown) — if Latihan, Ujian Akhir, or Sikap Kerja's own rating average
  // already failed, "Lulus" here would be a contradictory, misleading choice regardless of
  // the kanit's own judgment, so it's disabled outright rather than just defaulted. "Tidak
  // Lulus" is never disabled — it never contradicts the fail-fast rule, whatever the other
  // components say.
  const lulusDisabled = scores.latihanPassed === false || scores.ujianPassed === false || sikapKerjaPassed === false

  // All 3 components have a score in hand — Latihan/Ujian Akhir come pre-resolved off
  // getFlScoreBreakdown, so in practice this flips true the moment Sikap Kerja's own
  // rating (all 4 soft skills + Attitude) finishes above.
  const allScoresReady = scores.latihanPassed !== null && scores.ujianPassed !== null && sikapKerjaPassed !== null

  const [feedback, setFeedback] = useState(existingEval?.feedback ?? '')
  // No default pick — starts unselected (null) so the kanit isn't nudged toward either
  // answer before there's anything to base it on. A previously-saved evaluation still
  // loads its own recommendation as-is.
  const [recommendation, setRecommendation] = useState<'lulus' | 'tidak_lulus' | null>(
    () => existingEval?.recommendation ?? null
  )
  // Tracks whether the KANIT has ever clicked a button directly, as opposed to the value
  // just sitting there from auto-select. Needs to be separate from `recommendation` itself
  // — a plain "recommendation !== null" guard would auto-pick once and then freeze, so if
  // the kanit later re-rates Sikap Kerja from passing to failing (or back), the stale
  // auto-pick would keep showing the wrong button selected. A saved evaluation counts as
  // touched too — that decision is already made, so re-rating something before it's
  // resubmitted must not silently flip it back to a suggestion.
  const [recommendationTouched, setRecommendationTouched] = useState(!!existingEval)
  const [submitted, setSubmitted] = useState(!!existingEval)
  const [showConfirmSheet, setShowConfirmSheet] = useState(false)
  const [guideKey, setGuideKey] = useState<string | null>(null)

  // Auto-select. Two rules, in priority order:
  // 1. Disqualified (lulusDisabled) always forces "Tidak Lulus", no matter what's already
  //    selected — same hard rule that keeps the "Lulus" button disabled regardless of any
  //    earlier click. Without this, a kanit who picks "Lulus" while passing and then
  //    re-rates Sikap Kerja down to failing would be left with a stale, contradictory
  //    "Lulus" value even though neither button visibly shows as selected anymore.
  // 2. Otherwise, keep suggesting "Lulus" as soon as all 3 components are in — but only
  //    while the kanit hasn't manually touched the buttons yet, so a deliberate downgrade
  //    (choosing "Tidak Lulus" despite passing) is never silently flipped back.
  useEffect(() => {
    if (lulusDisabled) {
      if (recommendation !== 'tidak_lulus') setRecommendation('tidak_lulus')
      return
    }
    if (recommendationTouched || !allScoresReady) return
    setRecommendation('lulus')
  }, [allScoresReady, lulusDisabled, recommendationTouched, recommendation])

  if (!flUser || !flProfile) {
    return (
      <div className="p-8 text-center text-[#65758B]">
        <p>Peserta tidak ditemukan.</p>
        <Link to="/kanit/results" className="text-[#023DFF] text-sm mt-2 inline-block">← Kembali</Link>
      </div>
    )
  }

  function handleSubmit() {
    if (!flId || attitudeScore === 0 || softSkills.some(s => s.score === 0) || !feedback.trim() || !recommendation) return
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

  const canSubmit = attitudeScore > 0 && softSkills.every(s => s.score > 0) && feedback.trim().length > 0 && recommendation !== null

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
              <p className="text-xl sm:text-2xl font-black text-[#023DFF]">{sikapKerjaScore ?? '—'}</p>
              <p className="text-xs text-[#65758B] mt-0.5">Sikap Kerja</p>
              {sikapKerjaPassed !== null && (
                <p className={`text-[10px] font-semibold mt-1 ${sikapKerjaPassed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                  {sikapKerjaPassed ? 'Lulus' : 'Tidak Lulus'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Soft skills + Attitude — one card, not two, per explicit request. Each row has
            its own info icon opening just that aspect's Panduan Penilaian, instead of one
            combined sheet covering all 5 aspects at once (too much text in one place). */}
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-1">Penilaian Soft Skills & Attitude</p>
          <p className="text-[11px] text-[#94A3B8] mb-4 leading-relaxed">Penilaian atas hasil 14 hari OJT; jika kondisi peserta berubah, nilai berdasarkan kondisi maksimal 7 hari terakhir.</p>
          <div className="space-y-4">
            {SOFT_SKILLS.map((sk, i) => (
              <div key={sk.key} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                <div className="sm:w-28 flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-sm text-[#0F1729]">{sk.label}</span>
                  <button type="button" onClick={() => setGuideKey(sk.key)} className="text-[#94A3B8] hover:text-[#023DFF] transition-colors">
                    <InfoIcon />
                  </button>
                </div>
                <StarRating
                  value={softSkills[i].score}
                  onChange={v => setSoftSkills(prev => prev.map((s, j) => j === i ? { ...s, score: v } : s))}
                />
              </div>
            ))}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
              <div className="sm:w-28 flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm text-[#0F1729]">Attitude</span>
                <button type="button" onClick={() => setGuideKey('attitude')} className="text-[#94A3B8] hover:text-[#023DFF] transition-colors">
                  <InfoIcon />
                </button>
              </div>
              <StarRating value={attitudeScore} onChange={setAttitudeScore} />
            </div>
          </div>
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
              onClick={() => { if (!lulusDisabled) { setRecommendationTouched(true); setRecommendation('lulus') } }}
              disabled={lulusDisabled}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                lulusDisabled
                  ? 'border-[#E1E7EF] text-[#CBD5E1] cursor-not-allowed'
                  : recommendation === 'lulus' ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]' : 'border-[#E1E7EF] text-[#65758B] hover:border-[#16A34A]/40'
              }`}
            >
              🎉 Lulus
            </button>
            <button
              onClick={() => { setRecommendationTouched(true); setRecommendation('tidak_lulus') }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${recommendation === 'tidak_lulus' ? 'border-[#DC2626] bg-[#FEF2F2] text-[#B91C1C]' : 'border-[#E1E7EF] text-[#65758B] hover:border-[#DC2626]/40'}`}
            >
              ❌ Tidak Lulus
            </button>
          </div>
          {lulusDisabled && (
            <p className="text-xs text-[#94A3B8] mt-2">Peserta tidak lulus karena ada komponen penilaian yang tidak memenuhi minimum skor untuk lulus.</p>
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

      {/* Panduan Penilaian — bottom sheet scoped to ONE aspect at a time, opened from that
          aspect's own row above, instead of one sheet covering all 5 aspects at once. */}
      {guideKey && PENILAIAN_GUIDE[guideKey] && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) setGuideKey(null) }}>
          <div className="bg-white rounded-t-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-[#E1E7EF]" />
            </div>
            <div className="px-5 py-4 border-b border-[#E1E7EF] flex items-center justify-between flex-shrink-0">
              <p className="text-sm font-bold text-[#0F1729]">{PENILAIAN_GUIDE[guideKey].aspek}</p>
              <button onClick={() => setGuideKey(null)} className="text-[#94A3B8] hover:text-[#65758B] transition-colors flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {PENILAIAN_GUIDE[guideKey].skala.map((desc, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="flex-shrink-0 h-fit mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#65758B] whitespace-nowrap">
                    {SKALA_LABELS[i]}
                  </span>
                  <p className="text-xs text-[#65758B] leading-relaxed flex-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
