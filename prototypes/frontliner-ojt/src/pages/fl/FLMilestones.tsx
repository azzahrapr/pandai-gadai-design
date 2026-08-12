import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES, getEffectiveTarget } from '../../data/mockData'
import type { FLProfile } from '../../types'

const PENAKSIRAN_MILESTONE_IDS = ['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb']
const MAX_QUIZ_ATTEMPTS = 2

// A quiz is "resolved" (won't block a module's "Selesai" status any further) once
// passed, or once the one-retry allowance has been used up without passing.
function isQuizResolved(quizScore: number | undefined, attemptsUsed: number): boolean {
  return quizScore !== undefined && (quizScore >= 75 || attemptsUsed >= MAX_QUIZ_ATTEMPTS)
}

const MILESTONE_TASK_MAP: Record<string, string[]> = {
  'closing-cabang': ['closing-cabang'],
  'opening-cabang': ['opening-cabang'],
  'personal-grooming': ['personal-grooming'],
  'pengenalan-produk': ['pengenalan-produk'],
  'canvassing': ['canvassing'],
  'cash-management': ['cash-management'],
  'sop-administrasi': ['sop-administrasi'],
  'packing-sealing': ['packing-sealing'],
  'offloading': ['offloading'],
  'pelayanan-nasabah': ['pelayanan-nasabah'],
  'pelayanan-nasabah-transaksi': ['pelayanan-nasabah-transaksi'],
  'customer-service-wa': ['customer-service-wa'],
  'penaksiran-elektronik': ['penaksiran-elektronik'],
  'penaksiran-emas': ['penaksiran-emas'],
  'penaksiran-bpkb': ['penaksiran-bpkb'],
}

export default function FLMilestones() {
  const { currentUser, getFlChecklists, level2Unlocks, getItemConfirmations } = useApp()
  const profile = currentUser!.profile as FLProfile
  const minggu1 = MILESTONES.filter(m => m.type === 'minggu1')
  const minggu2 = MILESTONES.filter(m => m.type === 'minggu2')

  const submittedChecklists = getFlChecklists(currentUser!.id).filter(c =>
    c.status === 'submitted' || c.status === 'scored'
  )
  const scoredChecklists = submittedChecklists.filter(c => c.status === 'scored')

  // Level 2 opens purely on its own start date (day 8) — Level 1 completion no longer
  // gates it. Kanit approval only decides the fate of individual late Level 1 modules
  // (carry-over vs closed/"Tidak Lulus"), never whether Level 2 itself is reachable.
  const activeMinggu1 = minggu1.filter(m => profile.activeMilestoneIds.includes(m.id))
  const allLevel1Done = activeMinggu1.every(m => profile.completedMilestoneIds?.includes(m.id) ?? false)
  const level2Unlocked = profile.currentDay >= 8
  const needsKanitApproval = profile.currentDay >= 7 && !allLevel1Done && !level2Unlocks[currentUser!.id]

  // A kanit can explicitly close a Level 1 module instead of carrying it over — that's
  // an immediate, final "Tidak Lulus", independent of the day-13 program-end fallback.
  function moduleClosedByKanit(milestoneId: string): boolean {
    return level2Unlocks[currentUser!.id]?.moduleDecisions?.[milestoneId]?.action === 'close'
  }

  // Only a handful of Level 1 modules (Canvassing, SOP Administrasi, Packing) can be
  // carried over into Level 2 with an expanded target — see level2Target/level2TargetForPass.
  function carriedOverFor(milestoneId: string): boolean {
    return level2Unlocks[currentUser!.id]?.moduleDecisions?.[milestoneId]?.action === 'carry-over'
  }

  // "Tidak Lulus" — either kanit explicitly closed it, or the whole program ended (day
  // 13) while the completion target was never met. Mutually exclusive with completed.
  function isModuleFailed(milestoneId: string, isLocked: boolean): boolean {
    if (isLocked || isMilestoneCompleted(milestoneId)) return false
    return moduleClosedByKanit(milestoneId) || profile.currentDay >= 13
  }

  function getStatusPriority(milestoneId: string, isLocked: boolean, isLate: boolean, isFailed: boolean): number {
    if (isLocked) return 4
    if (isFailed || isMilestoneCompleted(milestoneId)) return 2
    if (isLate) return 0.5
    const { isStarted } = getMilestoneProgress(milestoneId)
    return isStarted ? 0 : 1
  }

  function getMilestoneProgress(milestoneId: string): { actual: number; expected: number; isStarted: boolean; isCompleted: boolean; isAwaitingReview: boolean } {
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    const carriedOver = carriedOverFor(milestoneId)
    if (profile.completedMilestoneIds?.includes(milestoneId)) {
      const expected = milestone?.submissionType === 'individual'
        ? milestone.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).attempts, 0)
        : getEffectiveTarget(milestone ?? {}, carriedOver).attempts
      return { actual: expected, expected, isStarted: true, isCompleted: true, isAwaitingReview: false }
    }
    if (milestone?.submissionType === 'individual') {
      // Rejected confirmations (kanitPassed === false) don't count toward the target.
      const actual = milestone.checklistItems.reduce((sum, item) =>
        sum + getItemConfirmations(currentUser!.id, milestoneId, item.id).filter(c => c.kanitPassed !== false).length, 0
      )
      const actualReviewed = milestone.checklistItems.reduce((sum, item) =>
        sum + getItemConfirmations(currentUser!.id, milestoneId, item.id).filter(c => c.kanitPassed === true).length, 0
      )
      const expected = milestone.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).attempts, 0)
      const expectedForPass = milestone.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).forPass, 0)
      const isCompleted = actualReviewed >= expectedForPass
      return { actual, expected, isStarted: actual > 0, isCompleted, isAwaitingReview: !isCompleted && actual >= expected }
    }
    const { attempts: expected, forPass: expectedForPass } = milestone ? getEffectiveTarget(milestone, carriedOver) : { attempts: 2, forPass: 2 }
    let actual: number
    let actualReviewed: number
    if (PENAKSIRAN_MILESTONE_IDS.includes(milestoneId)) {
      actual = submittedChecklists.filter(cl => cl.milestoneId === milestoneId).length
      actualReviewed = scoredChecklists.filter(cl => cl.milestoneId === milestoneId).length
    } else {
      const taskIds = MILESTONE_TASK_MAP[milestoneId] ?? []
      actual = taskIds.length > 0
        ? submittedChecklists.filter(cl => cl.tasks?.some(t => taskIds.includes(t.taskId))).length
        : 0
      actualReviewed = taskIds.length > 0
        ? scoredChecklists.filter(cl => cl.tasks?.some(t => taskIds.includes(t.taskId))).length
        : 0
    }
    const hasDraft = (() => {
      try {
        const key = `checklist-draft-${currentUser!.id}-${milestoneId}-d${profile.currentDay}`
        const raw = localStorage.getItem(key)
        if (!raw) return false
        const parsed = JSON.parse(raw) as string[]
        return Array.isArray(parsed) && parsed.length > 0
      } catch { return false }
    })()
    const isCompleted = actualReviewed >= expectedForPass
    return { actual, expected, isStarted: actual > 0 || hasDraft, isCompleted, isAwaitingReview: !isCompleted && actual >= expected }
  }

  function isMilestoneCompleted(milestoneId: string): boolean {
    const { isCompleted } = getMilestoneProgress(milestoneId)
    const checklistDone = profile.completedMilestoneIds?.includes(milestoneId)
      || (MILESTONE_TASK_MAP[milestoneId]?.length ? isCompleted : false)
    if (!checklistDone) return false
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (milestone?.quiz?.length) return isQuizResolved(profile.quizScores?.[milestoneId], profile.quizAttempts?.[milestoneId] ?? 0)
    return true
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Modul Belajar</h1>
        <p className="text-[#65758B] text-sm mt-1">Pelajari materi dan selesaikan tugas sesuai target.</p>
      </div>

      {/* Level 1 */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-5 w-1 rounded-full bg-[#65758B] flex-shrink-0" />
          <h2 className="text-base font-bold text-[#0F1729]">Level 1</h2>
          <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Hari 1–7</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...minggu1].filter(m => !carriedOverFor(m.id)).sort((a, b) => {
            const isFailedA = isModuleFailed(a.id, false)
            const isFailedB = isModuleFailed(b.id, false)
            const isLateA = !isFailedA && !isMilestoneCompleted(a.id) && needsKanitApproval && !a.noRemedial
            const isLateB = !isFailedB && !isMilestoneCompleted(b.id) && needsKanitApproval && !b.noRemedial
            return getStatusPriority(a.id, false, isLateA, isFailedA) - getStatusPriority(b.id, false, isLateB, isFailedB)
          }).map(m => {
            const isActive = profile.activeMilestoneIds.includes(m.id)
            const isCompleted = isMilestoneCompleted(m.id)
            const progress = getMilestoneProgress(m.id)
            const isFailed = isModuleFailed(m.id, false)
            const isLate = !isFailed && !isCompleted && needsKanitApproval && !m.noRemedial
            return <MilestoneCard key={m.id} milestone={m} isActive={isActive} isCompleted={isCompleted} isFailed={isFailed} isLate={isLate} progress={progress} quizScore={profile.quizScores?.[m.id]} quizAttempts={profile.quizAttempts?.[m.id] ?? 0} />
          })}
        </div>
      </section>

      {/* Level 2 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-5 w-1 rounded-full bg-[#023DFF] flex-shrink-0" />
          <h2 className="text-base font-bold text-[#0F1729]">Level 2</h2>
          <span className="text-xs text-[#023DFF] bg-[#E5F2FF] px-2 py-0.5 rounded-full">Hari 8–13</span>
        </div>
        {!level2Unlocked && (
          <div className="bg-[#FEFDEA] border border-[#E0A200] rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <p className="text-sm text-[#B27202]">Materi Level 2 akan terbuka di hari ke-8.</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(() => {
            // Carried-over Level 1 modules effectively become Level 2 modules — their
            // startDate/deadline now follow Level 2's window — so their card moves here
            // instead of staying in the Level 1 grid above (see KanitReviewProgress.tsx
            // for the Kanit-side equivalent of this same move).
            const carriedOverL1 = minggu1.filter(m => profile.activeMilestoneIds.includes(m.id) && carriedOverFor(m.id))
            const level2All = [...carriedOverL1, ...[...minggu2].sort((a, b) => {
              const locked = !level2Unlocked
              return getStatusPriority(a.id, locked, false, isModuleFailed(a.id, locked)) - getStatusPriority(b.id, locked, false, isModuleFailed(b.id, locked))
            })]
            return level2All.map(m => {
              const isActive = profile.activeMilestoneIds.includes(m.id)
              const isLocked = !level2Unlocked
              const isCompleted = isMilestoneCompleted(m.id)
              const progress = getMilestoneProgress(m.id)
              const isFailed = isModuleFailed(m.id, isLocked)
              return <MilestoneCard key={m.id} milestone={m} isActive={isActive} isLocked={isLocked} isCompleted={isCompleted} isFailed={isFailed} progress={progress} quizScore={profile.quizScores?.[m.id]} quizAttempts={profile.quizAttempts?.[m.id] ?? 0} />
            })
          })()}
        </div>
      </section>
    </div>
  )
}

function MilestoneCard({ milestone: m, isActive, isLocked, isCompleted, isFailed, isLate, progress, quizScore, quizAttempts }: {
  milestone: typeof MILESTONES[0]; isActive: boolean; isLocked?: boolean; isCompleted?: boolean; isFailed?: boolean; isLate?: boolean
  progress: { actual: number; expected: number; isStarted: boolean; isCompleted: boolean; isAwaitingReview: boolean }
  quizScore?: number
  quizAttempts: number
}) {
  const hasQuiz = (m.quiz?.length ?? 0) > 0
  const quizDone = !hasQuiz || isQuizResolved(quizScore, quizAttempts)
  const needsQuiz = !isLocked && progress.isCompleted && !quizDone
  // "Menunggu Kanit" (isAwaitingReview) is a dashboard-TaskCard-only status — on the
  // module card it folds into "Aktif" (module card only ever shows: Belum Dimulai,
  // Aktif, Terlambat, Lulus, Tidak Lulus).
  const showInProgress = !isLocked && progress.isStarted && !isCompleted
  return (
    <div className={`bg-white rounded-xl border border-[#E1E7EF] p-6 flex flex-col gap-4 transition-all ${isLocked ? 'opacity-60' : ''}`} data-tour="module-card">
      <div>
        <div className="flex items-center gap-1.5 text-xs mb-2 flex-wrap">
          {isLocked
            ? <span className="text-[#94A3B8]">🔒 Terkunci</span>
            : isCompleted
              ? <span className="text-[#15803D] font-medium">Lulus</span>
              : isFailed
                ? <span className="text-[#DC2626] font-medium">Tidak Lulus</span>
                : isLate
                  ? <span className="text-[#DC2626] font-medium">⚠️ Terlambat</span>
                  : showInProgress
                    ? <span className="text-[#023DFF] font-medium">Aktif</span>
                    : <span className="text-[#94A3B8]">Belum dimulai</span>
          }
          <span className="text-[#CBD5E1]">·</span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full border font-bold text-[10px] leading-none tabular-nums ${
            progress.isCompleted
              ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]'
              : progress.isStarted
                ? 'bg-[#FEFDEA] border-[#E0A200] text-[#B27202]'
                : 'bg-[#F8FAFC] border-[#E1E7EF] text-[#94A3B8]'
          }`}>
            {progress.actual}/{progress.expected} latihan
          </span>
          {hasQuiz && <><span className="text-[#CBD5E1]">·</span><span className="text-[#65758B]">{quizDone ? '🔓' : '🔒'} Mini Quiz</span></>}
        </div>
        <h3 className="font-bold text-[#0F1729] text-base">{m.name}</h3>
      </div>
      {!isLocked ? (
        <Link
          to={`/fl/milestones/${m.id}`}
          className={`mt-auto flex items-center justify-center h-9 px-4 rounded-lg font-semibold text-sm transition-colors ${
            isCompleted
              ? 'border border-[#CBD5E1] bg-white text-[#0F1729] hover:bg-[#E5F2FF] hover:border-[#023DFF] hover:text-[#023DFF]'
              : 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
          }`}
        >
          {isCompleted ? 'Pelajari Lagi' : needsQuiz ? 'Kerjakan Mini Quiz' : progress.isStarted ? 'Lanjutkan' : 'Mulai Sekarang'}
        </Link>
      ) : (
        <div className="mt-auto flex items-center justify-center h-9 px-4 rounded-lg bg-[#F1F5F9] text-[#94A3B8] font-semibold text-sm cursor-not-allowed">
          Terkunci
        </div>
      )}
    </div>
  )
}
