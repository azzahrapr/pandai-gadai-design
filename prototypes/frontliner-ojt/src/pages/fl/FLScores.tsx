import { useApp } from '../../context/AppContext'
import type { FLProfile } from '../../types'

export default function FLScores() {
  const { currentUser, getFlScoreBreakdown, getFlChecklists, getFlPenaksiran, getFlAssessment } = useApp()
  const profile = currentUser!.profile as FLProfile
  const scores = getFlScoreBreakdown(currentUser!.id)
  const checklists = getFlChecklists(currentUser!.id).filter(c => c.status === 'scored')
  const penaksiran = getFlPenaksiran(currentUser!.id).filter(r => r.kanitScore !== undefined)
  const assessment = getFlAssessment(currentUser!.id)

  const PASSING_SCORE = 75

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Nilai OJT Saya</h1>
        <p className="text-[#65758B] text-sm mt-1">Rekap lengkap semua komponen penilaian kamu.</p>
      </div>

      {/* Total score hero */}
      <div className={`rounded-xl p-8 flex items-center gap-8 mb-6 ${
        scores.totalScore !== null
          ? scores.passed ? 'bg-[#F0FDF4] border border-[#16A34A]/20' : 'bg-[#FEF2F2] border border-[#DC2626]/20'
          : 'bg-white border border-[#E1E7EF]'
      }`}>
        <div className="text-center">
          <p className={`text-7xl font-black ${
            scores.totalScore !== null
              ? scores.passed ? 'text-[#15803D]' : 'text-[#DC2626]'
              : 'text-[#CBD5E1]'
          }`}>
            {scores.totalScore ?? '—'}
          </p>
          <p className="text-[#65758B] text-sm mt-1">Total Score</p>
        </div>
        <div className="flex-1">
          {scores.totalScore !== null ? (
            <>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm mb-3 ${
                scores.passed ? 'bg-[#16A34A] text-white' : 'bg-[#DC2626] text-white'
              }`}>
                {scores.passed ? '🎉 LULUS OJT' : '❌ Belum Memenuhi Standar'}
              </div>
              <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${scores.passed ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}
                  style={{ width: `${scores.totalScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#94A3B8]">
                <span>0</span>
                <span className="text-[#65758B] font-medium">Standar: {PASSING_SCORE}</span>
                <span>100</span>
              </div>
            </>
          ) : (
            <div>
              <p className="font-semibold text-[#0F1729] mb-1">Nilai akhir belum tersedia</p>
              <p className="text-sm text-[#65758B]">Nilai final dihitung setelah semua 3 komponen (harian, penaksiran, assessment) mendapat penilaian dari Kanit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ScoreCard
          label="Progress Harian"
          weight="50%"
          score={scores.dailyProgressScore}
          note={`${scores.daysScored} hari dinilai`}
          colorClass="text-[#023DFF]"
          barColor="bg-[#023DFF]"
        />
        <ScoreCard
          label="Assessment"
          weight="30%"
          score={scores.assessmentScore}
          note={assessment ? (assessment.status === 'scored' ? 'Sudah dinilai' : 'Menunggu penilaian') : 'Belum dikerjakan'}
          colorClass="text-[#B27202]"
          barColor="bg-[#E0A200]"
        />
        <ScoreCard
          label="Penaksiran"
          weight="20%"
          score={scores.penaksiranScore}
          note={`${scores.penaksiranCount} sesi`}
          colorClass="text-[#65758B]"
          barColor="bg-[#64748B]"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Daily history table */}
        <div className="bg-white rounded-xl border border-[#E1E7EF]">
          <div className="p-5 border-b border-[#E1E7EF] flex items-center justify-between">
            <h3 className="font-semibold text-[#0F1729]">Riwayat Penilaian Harian</h3>
            <span className="text-xs text-[#65758B]">{checklists.length} hari</span>
          </div>
          {checklists.length === 0 ? (
            <div className="p-8 text-center text-[#94A3B8] text-sm">Belum ada penilaian harian</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E1E7EF]">
                  <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-5 text-left">Hari</th>
                  <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-3 text-left">Milestone</th>
                  <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-5 text-right">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {checklists.map(cl => (
                  <tr key={cl.id} className="border-b border-[#E1E7EF] last:border-0">
                    <td className="py-3 px-5">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        (cl.kanitScore ?? 0) >= 85 ? 'bg-[#F0FDF4] text-[#15803D]' :
                        (cl.kanitScore ?? 0) >= 75 ? 'bg-[#FEFDEA] text-[#B27202]' : 'bg-[#FEF2F2] text-[#DC2626]'
                      }`}>{cl.day}</span>
                    </td>
                    <td className="py-3 px-3 text-sm text-[#0F1729]">{cl.milestoneName}</td>
                    <td className="py-3 px-5 text-right">
                      <span className={`text-base font-bold ${
                        (cl.kanitScore ?? 0) >= 85 ? 'text-[#15803D]' :
                        (cl.kanitScore ?? 0) >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'
                      }`}>{cl.kanitScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {checklists.length > 0 && (
                <tfoot>
                  <tr className="border-t border-[#E1E7EF]">
                    <td colSpan={2} className="py-3 px-5 text-sm font-semibold text-[#65758B]">Rata-rata</td>
                    <td className="py-3 px-5 text-right font-bold text-[#023DFF] text-base">{scores.dailyProgressScore ?? '—'}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>

        {/* Penaksiran + Assessment */}
        <div className="space-y-4">
          {/* Penaksiran */}
          <div className="bg-white rounded-xl border border-[#E1E7EF]">
            <div className="p-5 border-b border-[#E1E7EF] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F1729]">Penaksiran</h3>
              <span className="text-xs text-[#65758B]">{penaksiran.length} sesi dinilai</span>
            </div>
            {penaksiran.length === 0 ? (
              <div className="p-6 text-center text-[#94A3B8] text-sm">Belum ada sesi penaksiran dinilai</div>
            ) : (
              <table className="w-full">
                <tbody>
                  {penaksiran.map(r => (
                    <tr key={r.id} className="border-b border-[#E1E7EF] last:border-0">
                      <td className="py-3 px-5 text-sm text-[#0F1729] max-w-0">
                        <div className="truncate">
                          <p className="font-medium truncate">{r.barangDescription}</p>
                          <p className="text-xs text-[#65758B]">{r.accuracy ? `${r.accuracy.toFixed(1)}% akurasi` : '—'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className={`font-bold text-base ${(r.kanitScore ?? 0) >= 85 ? 'text-[#15803D]' : 'text-[#B27202]'}`}>{r.kanitScore}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#E1E7EF]">
                    <td className="py-3 px-5 text-sm font-semibold text-[#65758B]">Rata-rata</td>
                    <td className="py-3 px-5 text-right font-bold text-[#023DFF] text-base">{scores.penaksiranScore ?? '—'}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Assessment */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <h3 className="font-semibold text-[#0F1729] mb-4">Assessment Hari ke-14</h3>
            {assessment ? (
              <div className={`flex items-center justify-between p-4 rounded-xl ${assessment.status === 'scored' ? 'bg-[#FEFDEA]' : 'bg-[#F8FAFC]'}`}>
                <div>
                  <p className="text-sm font-semibold text-[#0F1729]">
                    {assessment.status === 'scored' ? '✅ Sudah dinilai' : '⏳ Menunggu penilaian'}
                  </p>
                  <p className="text-xs text-[#65758B] mt-0.5">
                    {assessment.masteryChecks.filter(m => m.mastered).length}/{assessment.masteryChecks.length} materi dikuasai
                  </p>
                </div>
                {assessment.kanitScore !== undefined && (
                  <p className={`text-3xl font-black ${assessment.kanitScore >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'}`}>{assessment.kanitScore}</p>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-[#94A3B8] text-sm">Belum dikerjakan</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ label, weight, score, note, colorClass, barColor }: {
  label: string; weight: string; score: number | null; note: string; colorClass: string; barColor: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">{label}</p>
        <span className="text-xs bg-[#F1F5F9] text-[#65758B] px-2 py-0.5 rounded-full font-semibold">{weight}</span>
      </div>
      <p className={`text-3xl font-bold mt-2 ${score !== null ? colorClass : 'text-[#CBD5E1]'}`}>
        {score ?? '—'}
      </p>
      <p className="text-xs text-[#65758B] mt-1">{note}</p>
      <div className="mt-3 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: score !== null ? `${score}%` : '0%' }} />
      </div>
    </div>
  )
}
