import { Link } from 'react-router-dom'
import type { FinalEvaluation } from '../types'

export function NilaiAkhirCard({ score, finalEval, message, action }: {
  score: number
  finalEval: FinalEvaluation | undefined
  message?: string
  action?: { label: string; to: string }
}) {
  const tone = !finalEval
    ? { bg: 'bg-[#F8FAFC]', border: 'border-[#E1E7EF]', badge: 'bg-[#94A3B8]', text: 'text-[#65758B]', dot: 'bg-[#CBD5E1]' }
    : finalEval.recommendation === 'lulus'
      ? { bg: 'bg-[#F0FDF4]', border: 'border-[#16A34A]/20', badge: 'bg-[#16A34A]', text: 'text-[#15803D]', dot: 'bg-[#16A34A]' }
      : { bg: 'bg-[#FEF2F2]', border: 'border-[#DC2626]/20', badge: 'bg-[#DC2626]', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' }
  const statusText = !finalEval
    ? 'Menunggu evaluasi akhir dari kanit'
    : finalEval.recommendation === 'lulus'
      ? '✅ Lulus OJT'
      : '❌ Tidak Lulus OJT'

  return (
    <>
      {message && <p className="text-base font-semibold text-[#0F1729] text-center mb-4">{message}</p>}
      <div className={`relative overflow-hidden rounded-2xl p-6 border ${tone.bg} ${tone.border} flex flex-col items-center text-center`}>
        <span className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${tone.dot} opacity-10`} />
        <span className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full ${tone.dot} opacity-10`} />
        <div className="relative flex items-center gap-1.5 self-start">
          <span className="text-base">🏅</span>
          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Nilai Akhir</p>
        </div>
        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${tone.badge} mt-5`}>
          <p className="text-3xl font-black text-white">{score}</p>
        </div>
        <p className={`relative text-sm font-normal mt-4 ${tone.text}`}>{statusText}</p>
      </div>
      {action && (
        <Link
          to={action.to}
          className="mt-4 w-full flex items-center justify-center h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
        >
          {action.label} →
        </Link>
      )}
    </>
  )
}
