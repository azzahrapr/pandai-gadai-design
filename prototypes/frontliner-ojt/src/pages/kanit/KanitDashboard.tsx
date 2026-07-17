import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { KanitProfile, FLProfile } from '../../types'

export default function KanitDashboard() {
  const { currentUser, getFlUsers, getFlChecklists, getFlScoreBreakdown, getFlPenaksiran, getFlFinalEvaluation, level2Unlocks } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  const minggu1Ids = MILESTONES.filter(m => m.type === 'minggu1').map(m => m.id)

  function needsLevel2(fl: ReturnType<typeof getFlUsers>[0]): boolean {
    const p = fl.profile as FLProfile
    if (p.currentDay < 8 || !!level2Unlocks[fl.id]) return false
    const activeMinggu1 = minggu1Ids.filter(id => p.activeMilestoneIds.includes(id))
    return activeMinggu1.some(id => !p.completedMilestoneIds?.includes(id))
  }

  const pendingReviews = flUsers.reduce((n, fl) => n + getFlChecklists(fl.id).filter(c => c.status === 'submitted').length, 0)
  const pendingPenaksiran = flUsers.reduce((n, fl) => n + getFlPenaksiran(fl.id).filter(r => r.intoolsValue === undefined).length, 0)
  const pendingLevel2 = flUsers.filter(needsLevel2).length
  const readyForFinalEval = flUsers.filter(fl => getFlScoreBreakdown(fl.id).totalScore !== null && !getFlFinalEvaluation(fl.id)).length

  const hasActions = pendingReviews > 0 || pendingPenaksiran > 0 || pendingLevel2 > 0 || readyForFinalEval > 0

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Dashboard Kanit</h1>
          <p className="text-[#65758B] text-sm mt-1">{profile.branch} · {profile.name}</p>
        </div>
        <div className="text-right text-sm text-[#65758B]">
          <p>{flUsers.length} peserta OJT aktif</p>
        </div>
      </div>

      {/* Action cards */}
      {hasActions ? (
        <div className="flex gap-4 mb-6">
          {pendingReviews > 0 && (
            <Link to="/kanit/review-progress" className="flex-1 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-xl p-5 flex items-center gap-4 hover:border-[#DC2626]/40 transition-colors">
              <div className="w-11 h-11 bg-[#DC2626] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{pendingReviews}</div>
              <div>
                <p className="font-semibold text-[#B91C1C] text-sm">Checklist menunggu penilaian</p>
                <p className="text-xs text-[#B91C1C]/70 mt-0.5">Beri penilaian sekarang →</p>
              </div>
            </Link>
          )}
          {pendingLevel2 > 0 && (
            <Link to="/kanit/review-progress" className="flex-1 bg-[#F0F4FF] border border-[#023DFF]/20 rounded-xl p-5 flex items-center gap-4 hover:border-[#023DFF]/40 transition-colors">
              <div className="w-11 h-11 bg-[#023DFF] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{pendingLevel2}</div>
              <div>
                <p className="font-semibold text-[#023DFF] text-sm">Buka Akses Level 2</p>
                <p className="text-xs text-[#023DFF]/60 mt-0.5">Peserta siap lanjut ke materi lanjutan →</p>
              </div>
            </Link>
          )}
          {pendingPenaksiran > 0 && (
            <Link to="/kanit/penaksiran" className="flex-1 bg-[#FEFDEA] border border-[#E0A200]/20 rounded-xl p-5 flex items-center gap-4 hover:border-[#E0A200]/40 transition-colors">
              <div className="w-11 h-11 bg-[#E0A200] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{pendingPenaksiran}</div>
              <div>
                <p className="font-semibold text-[#B27202] text-sm">Penaksiran perlu verifikasi</p>
                <p className="text-xs text-[#B27202]/70 mt-0.5">Masukkan nilai Intools →</p>
              </div>
            </Link>
          )}
          {readyForFinalEval > 0 && (
            <Link to="/kanit/results" className="flex-1 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-5 flex items-center gap-4 hover:border-[#16A34A]/40 transition-colors">
              <div className="w-11 h-11 bg-[#16A34A] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{readyForFinalEval}</div>
              <div>
                <p className="font-semibold text-[#15803D] text-sm">Evaluasi akhir siap diisi</p>
                <p className="text-xs text-[#15803D]/70 mt-0.5">Semua nilai sudah tersedia →</p>
              </div>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <p className="text-sm font-semibold text-[#15803D]">Tidak ada item yang perlu ditindaklanjuti saat ini.</p>
        </div>
      )}

      {/* FL Table */}
      <div className="bg-white rounded-xl border border-[#E1E7EF]">
        <div className="p-5 border-b border-[#E1E7EF]">
          <h3 className="font-semibold text-[#0F1729]">Daftar Peserta OJT</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E1E7EF]">
              <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-5 text-left">Peserta</th>
              <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-4 text-left">Hari OJT</th>
              <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-4 text-left">Progress Belajar</th>
              <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-4 text-left">Nilai Akhir</th>
              <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-5 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {flUsers.map(fl => {
              const flProfile = fl.profile as FLProfile
              const scores = getFlScoreBreakdown(fl.id)
              const pendingCount = getFlChecklists(fl.id).filter(c => c.status === 'submitted').length
              const flNeedsLevel2 = needsLevel2(fl)
              const needsFinalEval = scores.totalScore !== null && !getFlFinalEvaluation(fl.id)
              const completedMilestones = flProfile.completedMilestoneIds?.length ?? 0
              const totalMilestones = MILESTONES.length

              // Aksi state: priority order
              let aksi: React.ReactNode
              if (pendingCount > 0 || flNeedsLevel2) {
                aksi = (
                  <Link to="/kanit/review-progress" className="inline-flex items-center gap-1 text-xs bg-[#FEFDEA] text-[#B27202] px-2.5 py-1 rounded-full font-semibold hover:bg-[#FFF88F]/40 transition-colors">
                    Perlu Direview
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                )
              } else if (needsFinalEval) {
                aksi = (
                  <Link to={`/kanit/final-eval/${fl.id}`} className="text-xs h-7 px-3 bg-[#023DFF] text-white rounded-lg font-semibold hover:bg-[#001CDB] transition-all inline-flex items-center gap-1">
                    Isi Evaluasi
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                )
              } else {
                aksi = (
                  <Link to={`/kanit/results?flId=${fl.id}`} className="text-xs h-7 px-3 bg-white text-[#0F1729] border border-[#CBD5E1] rounded-lg font-semibold hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF] transition-all inline-flex items-center">
                    Lihat Nilai
                  </Link>
                )
              }

              return (
                <tr key={fl.id} className="border-b border-[#E1E7EF] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#E5F2FF] rounded-full flex items-center justify-center font-bold text-[#023DFF] text-sm flex-shrink-0">
                        {fl.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F1729] text-sm">{fl.name}</p>
                        <p className="text-xs text-[#65758B]">{flProfile.branch}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#E5F2FF] text-[#023DFF] text-xs font-bold">Hari {flProfile.currentDay}/14</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="min-w-[100px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#65758B]">{completedMilestones}/{totalMilestones} materi</span>
                        {completedMilestones > 0 && <span className="text-[#15803D] font-medium">{Math.round(completedMilestones / totalMilestones * 100)}%</span>}
                      </div>
                      <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#16A34A] rounded-full transition-all" style={{ width: `${Math.round(completedMilestones / totalMilestones * 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-left">
                    {(() => {
                      const displayScore = scores.totalScore ?? scores.dailyProgressScore
                      if (displayScore === null) return <span className="text-[#94A3B8] text-sm">—</span>
                      const scoreColor = displayScore >= 85 ? 'text-[#15803D]' : displayScore >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'
                      let badge: React.ReactNode
                      if (scores.totalScore !== null) {
                        badge = scores.passed
                          ? <span className="text-[10px] bg-[#F0FDF4] text-[#15803D] border border-[#16A34A]/20 px-2 py-0.5 rounded-full font-semibold">Final</span>
                          : <span className="text-[10px] bg-[#FEF2F2] text-[#B91C1C] border border-[#DC2626]/20 px-2 py-0.5 rounded-full font-semibold">Tidak Final</span>
                      } else {
                        badge = <span className="text-[10px] bg-[#F1F5F9] text-[#65758B] px-2 py-0.5 rounded-full font-semibold">Belum final</span>
                      }
                      return (
                        <div className="flex items-center justify-start gap-1.5">
                          <span className={`font-bold text-base ${scoreColor}`}>{displayScore}</span>
                          {badge}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="py-4 px-5 text-left">{aksi}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
