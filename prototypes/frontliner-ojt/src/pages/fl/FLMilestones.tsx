import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { FLProfile } from '../../types'

const PENAKSIRAN_MILESTONE_IDS = ['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb']

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
  'customer-service-wa': ['customer-service-wa'],
  'penaksiran-elektronik': ['penaksiran-elektronik'],
  'penaksiran-emas': ['penaksiran-emas'],
  'penaksiran-bpkb': ['penaksiran-bpkb'],
}

const MILESTONE_EXPECTED_COUNT: Record<string, number> = {
  'closing-cabang': 3,
  'opening-cabang': 3,
  'personal-grooming': 12,
  'pengenalan-produk': 3,
  'canvassing': 3,
  'cash-management': 1,
  'sop-administrasi': 5,
  'packing-sealing': 3,
  'offloading': 1,
  'pelayanan-nasabah': 6,
  'customer-service-wa': 3,
  'penaksiran-elektronik': 2,
  'penaksiran-emas': 1,
  'penaksiran-bpkb': 2,
}

export default function FLMilestones() {
  const { currentUser, getFlChecklists, level2Unlocks, getItemConfirmations } = useApp()
  const profile = currentUser!.profile as FLProfile
  const level2Unlocked = !!(level2Unlocks[currentUser!.id])
  const minggu1 = MILESTONES.filter(m => m.type === 'minggu1')
  const minggu2 = MILESTONES.filter(m => m.type === 'minggu2')

  const submittedChecklists = getFlChecklists(currentUser!.id).filter(c =>
    c.status === 'submitted' || c.status === 'scored'
  )

  const activeMinggu1 = minggu1.filter(m => profile.activeMilestoneIds.includes(m.id))
  const allLevel1Done = activeMinggu1.every(m => isMilestoneCompleted(m.id))
  const needsKanitApproval = profile.currentDay >= 8 && !allLevel1Done && !level2Unlocked

  function getStatusPriority(milestoneId: string, isLocked: boolean): number {
    if (isLocked) return 3
    const completed = isMilestoneCompleted(milestoneId)
    if (completed) return 2
    const { isStarted } = getMilestoneProgress(milestoneId)
    return isStarted ? 0 : 1
  }

  function getMilestoneProgress(milestoneId: string): { actual: number; expected: number; isStarted: boolean; isCompleted: boolean } {
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (milestone?.submissionType === 'individual') {
      const actual = milestone.checklistItems.reduce((sum, item) =>
        sum + getItemConfirmations(currentUser!.id, milestoneId, item.id).length, 0
      )
      const expected = milestone.checklistItems.reduce((sum, item) => sum + (item.target ?? 1), 0)
      return { actual, expected, isStarted: actual > 0, isCompleted: actual >= expected }
    }
    const expected = MILESTONE_EXPECTED_COUNT[milestoneId] ?? 2
    let actual: number
    if (PENAKSIRAN_MILESTONE_IDS.includes(milestoneId)) {
      actual = submittedChecklists.filter(cl => cl.milestoneId === milestoneId).length
    } else {
      const taskIds = MILESTONE_TASK_MAP[milestoneId] ?? []
      actual = taskIds.length > 0
        ? submittedChecklists.filter(cl => cl.tasks?.some(t => taskIds.includes(t.taskId))).length
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
    return { actual, expected, isStarted: actual > 0 || hasDraft, isCompleted: actual >= expected }
  }

  function isMilestoneCompleted(milestoneId: string): boolean {
    if (profile.completedMilestoneIds?.includes(milestoneId)) return true
    const { isCompleted } = getMilestoneProgress(milestoneId)
    const checklistDone = MILESTONE_TASK_MAP[milestoneId]?.length ? isCompleted : false
    if (!checklistDone) return false
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (milestone?.quiz?.length) return profile.quizScores?.[milestoneId] !== undefined
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
          {[...minggu1].sort((a, b) => getStatusPriority(a.id, false) - getStatusPriority(b.id, false)).map(m => {
            const isActive = profile.activeMilestoneIds.includes(m.id)
            const isCompleted = isMilestoneCompleted(m.id)
            const progress = getMilestoneProgress(m.id)
            return <MilestoneCard key={m.id} milestone={m} isActive={isActive} isCompleted={isCompleted} progress={progress} />
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
        {profile.currentDay < 8 && !level2Unlocked && (
          <div className="bg-[#FEFDEA] border border-[#E0A200] rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <p className="text-sm text-[#B27202]">Materi Level 2 akan terbuka di hari ke-8. Selesaikan Level 1 terlebih dahulu.</p>
          </div>
        )}
        {needsKanitApproval && (
          <div className="bg-[#F0F4FF] border border-[#023DFF]/20 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">⏳</span>
              <div>
                <p className="text-sm font-semibold text-[#023DFF]">Menunggu persetujuan Kanit untuk lanjut ke Level 2</p>
                <p className="text-sm text-[#023DFF]/80 mt-1">Kamu sudah memasuki hari ke-{profile.currentDay}, tapi masih ada modul Level 1 yang belum selesai. Kanit perlu memberikan akses sebelum kamu bisa lanjut.</p>
                <p className="text-sm text-[#65758B] mt-2">Belum dapat akses? Hubungi Kanit kamu langsung untuk konfirmasi.</p>
              </div>
            </div>
          </div>
        )}
        {level2Unlocked && level2Unlocks[currentUser!.id] && (
          <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-lg">🔓</span>
            <p className="text-sm text-[#15803D]">Akses Level 2 dibuka oleh Kanit kamu. Lanjutkan belajar!</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...minggu2].sort((a, b) => {
            const locked = !level2Unlocked && (profile.currentDay < 8 || !allLevel1Done)
            return getStatusPriority(a.id, locked) - getStatusPriority(b.id, locked)
          }).map(m => {
            const isActive = profile.activeMilestoneIds.includes(m.id)
            const isLocked = !level2Unlocked && (profile.currentDay < 8 || !allLevel1Done)
            const isCompleted = isMilestoneCompleted(m.id)
            const progress = getMilestoneProgress(m.id)
            return <MilestoneCard key={m.id} milestone={m} isActive={isActive} isLocked={isLocked} isCompleted={isCompleted} progress={progress} />
          })}
        </div>
      </section>
    </div>
  )
}

function MilestoneCard({ milestone: m, isActive, isLocked, isCompleted, progress }: {
  milestone: typeof MILESTONES[0]; isActive: boolean; isLocked?: boolean; isCompleted?: boolean
  progress: { actual: number; expected: number; isStarted: boolean; isCompleted: boolean }
}) {
  const showInProgress = !isLocked && progress.isStarted && !isCompleted
  return (
    <div className={`bg-white rounded-xl border border-[#E1E7EF] p-6 flex flex-col gap-4 transition-all ${isLocked ? 'opacity-60' : ''}`}>
      <div>
        <div className="flex items-center gap-1.5 text-xs mb-2 flex-wrap">
          {isLocked
            ? <span className="text-[#94A3B8]">🔒 Terkunci</span>
            : isCompleted
              ? <span className="text-[#15803D] font-medium">Selesai</span>
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
          {m.quiz && <><span className="text-[#CBD5E1]">·</span><span className="text-[#65758B]">{isCompleted ? '🔓' : '🔒'} Mini Quiz</span></>}
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
          {isCompleted ? 'Pelajari Lagi' : progress.isStarted ? 'Lanjutkan' : 'Mulai Sekarang'}
        </Link>
      ) : (
        <div className="mt-auto flex items-center justify-center h-9 px-4 rounded-lg bg-[#F1F5F9] text-[#94A3B8] font-semibold text-sm cursor-not-allowed">
          Terkunci
        </div>
      )}
    </div>
  )
}
