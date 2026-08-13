import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { KanitProfile, FLProfile } from '../../types'

export default function KanitDashboard() {
  const { currentUser, getFlUsers, getFlChecklists, getFlScoreBreakdown, getFlPenaksiran, getFlFinalEvaluation, getItemConfirmations, level2Unlocks, extensionRequests } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  const minggu1Ids = MILESTONES.filter(m => m.type === 'minggu1').map(m => m.id)

  function needsLevel2(fl: ReturnType<typeof getFlUsers>[0]): boolean {
    const p = fl.profile as FLProfile
    if (p.currentDay < 8 || !!level2Unlocks[fl.id]) return false
    const activeMinggu1 = minggu1Ids.filter(id => p.activeMilestoneIds.includes(id))
    return activeMinggu1.some(id => !p.completedMilestoneIds?.includes(id))
  }

  // Checklist-type pending (status: 'submitted') PLUS individual-type ("essay"/discounter)
  // pending TaskConfirmations — same comprehensive definition KanitReviewProgress.tsx's own
  // hasPendingReview()/pendingModuleGroups use. Counting checklist-only here used to
  // silently undercount (and for an FL with ONLY confirmation-type pending items, like Sari
  // with her Penaksiran submissions, miss them entirely) — this is also what let the "Aksi
  // Cepat" links below point at the wrong FL, since without an explicit flId the target
  // page's own fallback logic decided who to show.
  function reviewPendingCountFor(fl: ReturnType<typeof getFlUsers>[0]): number {
    const p = fl.profile as FLProfile
    const checklistPending = getFlChecklists(fl.id).filter(c => c.status === 'submitted').length
    const confirmationPending = MILESTONES
      .filter(m => m.submissionType === 'individual' && p.activeMilestoneIds.includes(m.id) && !p.completedMilestoneIds?.includes(m.id))
      .reduce((sum, m) => sum + m.checklistItems.reduce((s, item) =>
        s + getItemConfirmations(fl.id, m.id, item.id).filter(c => c.kanitPassed === undefined).length, 0), 0)
    return checklistPending + confirmationPending
  }

  // Ready for Rapot Akhir once Latihan & Ujian Akhir are both scored — Evaluasi Akhir
  // (the 3rd component) is what the kanit is being prompted to go fill in.
  function readyForRapotAkhir(fl: ReturnType<typeof getFlUsers>[0]): boolean {
    const s = getFlScoreBreakdown(fl.id)
    return s.dailyProgressScore !== null && s.assessmentScore !== null
  }

  const pendingReviews = flUsers.reduce((n, fl) => n + reviewPendingCountFor(fl), 0)
  const pendingPenaksiran = flUsers.reduce((n, fl) => n + getFlPenaksiran(fl.id).filter(r => r.intoolsValue === undefined).length, 0)
  const pendingLevel2 = flUsers.filter(needsLevel2).length
  const readyForFinalEval = flUsers.filter(fl => readyForRapotAkhir(fl) && !getFlFinalEvaluation(fl.id)).length
  const flIdSet = new Set(flUsers.map(u => u.id))
  const pendingExtensions = extensionRequests.filter(r => flIdSet.has(r.flId) && r.status === 'pending').length
  const totalReviewPending = pendingReviews + pendingExtensions

  const hasActions = totalReviewPending > 0 || pendingPenaksiran > 0 || pendingLevel2 > 0 || readyForFinalEval > 0

  // Each "Aksi Cepat" row links to whichever specific FL actually needs that action — a
  // bare "/kanit/..." link with no flId used to fall back on that page's own (often
  // narrower/different) default-selection logic, which could land on a completely
  // different FL than the one the badge count was about.
  const flNeedingReview = flUsers.find(fl => reviewPendingCountFor(fl) > 0 || extensionRequests.some(r => r.flId === fl.id && r.status === 'pending'))
  const flNeedingLevel2 = flUsers.find(needsLevel2)
  const flNeedingPenaksiran = flUsers.find(fl => getFlPenaksiran(fl.id).some(r => r.intoolsValue === undefined))
  const flNeedingFinalEval = flUsers.find(fl => readyForRapotAkhir(fl) && !getFlFinalEvaluation(fl.id))

  const flRows = flUsers.map(fl => {
    const flProfile = fl.profile as FLProfile
    const pendingCount = getFlChecklists(fl.id).filter(c => c.status === 'submitted').length
    const flNeedsLevel2 = needsLevel2(fl)
    const needsFinalEval = readyForRapotAkhir(fl) && !getFlFinalEvaluation(fl.id)

    const level = flProfile.currentDay >= 8 ? 2 : 1
    const levelMilestones = MILESTONES.filter(m => m.type === (level === 2 ? 'minggu2' : 'minggu1') && flProfile.activeMilestoneIds.includes(m.id))
    const totalModules = levelMilestones.length
    const doneModules = levelMilestones.filter(m => flProfile.completedMilestoneIds?.includes(m.id)).length
    const pct = totalModules > 0 ? Math.round(doneModules / totalModules * 100) : 0

    let aksi: React.ReactNode
    if (pendingCount > 0 || flNeedsLevel2) {
      // Always pass flId explicitly — a bare fallback link here used to let the
      // destination page fall back to its own default-selection logic, which could land
      // on a completely different FL than the row this button was actually on (same bug
      // class as flNeedingReview/flNeedingLevel2 etc. above, just missed in this branch).
      const reviewTo = pendingCount > 0 ? `/kanit/review-progress?flId=${fl.id}` : `/kanit/review-progress?tab=progress&flId=${fl.id}`
      aksi = (
        <Link to={reviewTo} className="text-xs h-7 px-3 bg-[#023DFF] text-white rounded-lg font-semibold hover:bg-[#001CDB] transition-all inline-flex items-center whitespace-nowrap">
          Perlu Direview
        </Link>
      )
    } else if (needsFinalEval) {
      aksi = (
        <Link to={`/kanit/final-eval/${fl.id}`} className="text-xs h-7 px-3 bg-[#023DFF] text-white rounded-lg font-semibold hover:bg-[#001CDB] transition-all inline-flex items-center gap-1 whitespace-nowrap">
          Isi Evaluasi
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      )
    } else {
      aksi = (
        <Link to={`/kanit/results?flId=${fl.id}`} className="text-xs h-7 px-3 bg-white text-[#0F1729] border border-[#CBD5E1] rounded-lg font-semibold hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF] transition-all inline-flex items-center whitespace-nowrap">
          Lihat Nilai
        </Link>
      )
    }

    return { fl, flProfile, level, doneModules, totalModules, pct, aksi, flNeedsLevel2 }
  })

  return (
    <div className="p-4 md:p-8">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Halo, {profile.name}!</h1>
        <p className="text-[#65758B] text-sm sm:text-right sm:mt-1">Kanit {profile.branch}</p>
      </div>

      {/* Action cards */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] mb-6">
        <div className="p-4 md:p-5 border-b border-[#E1E7EF]">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">Aksi Cepat</h3>
        </div>
        {hasActions ? (
          <div className="divide-y divide-[#E1E7EF]">
            {totalReviewPending > 0 && (
              <Link to={`/kanit/review-progress${flNeedingReview ? `?flId=${flNeedingReview.id}` : ''}`} className="flex items-center gap-3 p-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-6 h-6 bg-[#E0A200] rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">{totalReviewPending}</div>
                <p className="flex-1 font-semibold text-[#B27202] text-sm">Latihan perlu direview</p>
                <Chevron className="text-[#CBD5E1]" />
              </Link>
            )}
            {pendingLevel2 > 0 && (
              <Link to={`/kanit/review-progress?tab=progress${flNeedingLevel2 ? `&flId=${flNeedingLevel2.id}` : ''}`} className="flex items-center gap-3 p-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">{pendingLevel2}</div>
                <p className="flex-1 font-semibold text-[#B91C1C] text-sm">Latihan lewat deadline</p>
                <Chevron className="text-[#CBD5E1]" />
              </Link>
            )}
            {pendingPenaksiran > 0 && (
              <Link to={`/kanit/penaksiran${flNeedingPenaksiran ? `?flId=${flNeedingPenaksiran.id}` : ''}`} className="flex items-center gap-3 p-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-6 h-6 bg-[#E0A200] rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">{pendingPenaksiran}</div>
                <p className="flex-1 font-semibold text-[#B27202] text-sm">Penaksiran perlu verifikasi</p>
                <Chevron className="text-[#CBD5E1]" />
              </Link>
            )}
            {readyForFinalEval > 0 && (
              <Link to={`/kanit/results${flNeedingFinalEval ? `?flId=${flNeedingFinalEval.id}` : ''}`} className="flex items-center gap-3 p-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-6 h-6 bg-[#023DFF] rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">{readyForFinalEval}</div>
                <p className="flex-1 font-semibold text-[#023DFF] text-sm">Rapot akhir siap diisi</p>
                <Chevron className="text-[#CBD5E1]" />
              </Link>
            )}
          </div>
        ) : (
          <div className="p-4 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="text-sm font-semibold text-[#15803D]">Tidak ada item yang perlu ditindaklanjuti saat ini.</p>
          </div>
        )}
      </div>

      {/* FL list — single table, scrolls horizontally on narrow screens */}
      <div className="bg-white rounded-xl border border-[#E1E7EF]">
        <div className="p-4 md:p-5 border-b border-[#E1E7EF]">
          <h3 className="font-semibold text-[#0F1729]">Progress Peserta OJT</h3>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] table-fixed">
          <thead>
            <tr className="border-b border-[#E1E7EF]">
              <th className="w-[36%] text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-4 text-left">Peserta</th>
              <th className="w-[34%] text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-3 text-left">Progress Belajar</th>
              <th className="w-[30%] text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {flRows.map(({ fl, flProfile, level, doneModules, totalModules, pct, aksi, flNeedsLevel2 }) => (
              <tr key={fl.id} className="border-b border-[#E1E7EF] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                <td className="py-4 px-4">
                  <p className="font-semibold text-[#0F1729] text-sm">{fl.name}</p>
                  <p className="text-xs text-[#65758B] mt-0.5">Hari ke-{flProfile.currentDay} dari 14</p>
                </td>
                <td className="py-4 px-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-semibold ${level === 2 ? 'text-[#023DFF]' : 'text-[#65758B]'}`}>Level {level}</span>
                      {/* This row's "Progress Belajar" column only ever reflects the
                          CURRENT level's modules (Level 2 for Sari) — without this badge,
                          a Level-1 module still stuck "Terlambat" is completely invisible
                          here even though it's exactly why "Perlu Direview" shows up in
                          Aksi. Same flNeedsLevel2 signal KanitReviewProgress.tsx's own
                          late-modules banner and the Aksi button both already use. */}
                      {flNeedsLevel2 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FEFDEA] border border-[#E0A200] text-[#B27202] whitespace-nowrap">
                          ⚠️ Terlambat
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#65758B]">{doneModules}/{totalModules} modul selesai</span>
                        {doneModules > 0 && <span className="text-[#15803D] font-medium">{pct}%</span>}
                      </div>
                      <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#16A34A] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-left">{aksi}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`flex-shrink-0 ${className ?? ''}`}>
      <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
