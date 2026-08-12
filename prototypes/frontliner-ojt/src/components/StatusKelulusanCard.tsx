import { Link } from 'react-router-dom'

// Replaces the old NilaiAkhirCard (a single weighted 0-100 "Nilai Akhir" score) — the
// 2026-08-10 penilaian rework dropped that composite score entirely in favor of 3
// independent pass/fail components (Latihan, Ujian Akhir, Evaluasi Akhir), so this card
// now only ever shows the overall Lulus/Tidak Lulus/Menunggu gate, no number. Kept as a
// compact horizontal banner (not a big hero card with a giant icon circle) per explicit
// 2026-08-10 follow-up feedback — it sits above a 3-card score grid and shouldn't
// visually dominate the page.
const TONE = {
  neutral: { bg: 'bg-[#F8FAFC]', border: 'border-[#E1E7EF]', badge: 'bg-[#94A3B8]', text: 'text-[#65758B]' },
  lulus: { bg: 'bg-[#F0FDF4]', border: 'border-[#16A34A]/20', badge: 'bg-[#16A34A]', text: 'text-[#15803D]' },
  tidakLulus: { bg: 'bg-[#FEF2F2]', border: 'border-[#DC2626]/20', badge: 'bg-[#DC2626]', text: 'text-[#DC2626]' },
}

export function StatusKelulusanCard({ passed, message, action }: {
  // null = still undecided (nothing has failed yet, but not all 3 components are in)
  passed: boolean | null
  message?: string
  action?: { label: string; to: string }
}) {
  const tone = passed === true ? TONE.lulus : passed === false ? TONE.tidakLulus : TONE.neutral
  const statusText = passed === true ? 'Lulus' : passed === false ? 'Tidak Lulus' : 'Menunggu kelengkapan penilaian'

  // Plain white stroke icons instead of emoji — an emoji (✅/❌/⏳) already carries its
  // own built-in color, which clashed/flattened when nested inside another solid-color
  // circle (e.g. a red ❌ on a red circle reads as one muddy blob). Same checkmark/cross
  // path already used elsewhere in this app (Toast dismiss icon, the "selected peserta"
  // checkmark in KanitReviewProgress.tsx) for visual consistency.
  const icon = passed === true ? (
    <path d="M3 8.5l3.5 3.5L13 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  ) : passed === false ? (
    <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  ) : (
    <>
      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
      <path d="M8 5v3l2 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  )

  return (
    <>
      {message && <p className="text-sm font-semibold text-[#0F1729] mb-2">{message}</p>}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${tone.bg} ${tone.border}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tone.badge}`}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">{icon}</svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#65758B] uppercase tracking-wide">Status Kelulusan</p>
          <p className={`text-sm font-bold ${tone.text}`}>{statusText}</p>
        </div>
      </div>
      {action && (
        <Link
          to={action.to}
          className="mt-3 w-full flex items-center justify-center h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
        >
          {action.label} →
        </Link>
      )}
    </>
  )
}
