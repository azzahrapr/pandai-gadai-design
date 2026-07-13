import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { FLProfile } from '../../types'

export default function FLMilestones() {
  const { currentUser } = useApp()
  const profile = currentUser!.profile as FLProfile
  const minggu1 = MILESTONES.filter(m => m.type === 'minggu1')
  const minggu2 = MILESTONES.filter(m => m.type === 'minggu2')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Materi Belajar</h1>
        <p className="text-[#65758B] text-sm mt-1">Pelajari milestone sesuai urutan program OJT 14 hari kamu.</p>
      </div>

      {/* Minggu 1 */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-5 w-1 rounded-full bg-[#65758B] flex-shrink-0" />
          <h2 className="text-base font-bold text-[#0F1729]">Tahap 1</h2>
          <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Hari 1–7</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {minggu1.map(m => {
            const isActive = profile.activeMilestoneIds.includes(m.id)
            const isCompleted = profile.completedMilestoneIds?.includes(m.id) ?? false
            return <MilestoneCard key={m.id} milestone={m} isActive={isActive} isCompleted={isCompleted} />
          })}
        </div>
      </section>

      {/* Minggu 2 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-5 w-1 rounded-full bg-[#023DFF] flex-shrink-0" />
          <h2 className="text-base font-bold text-[#0F1729]">Tahap 2</h2>
          <span className="text-xs text-[#023DFF] bg-[#E5F2FF] px-2 py-0.5 rounded-full">Hari 8–13</span>
        </div>
        {profile.currentDay < 8 && (
          <div className="bg-[#FEFDEA] border border-[#E0A200] rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <p className="text-sm text-[#B27202]">Materi tahap 2 akan terbuka di hari ke-8. Selesaikan materi tahap 1 terlebih dahulu.</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {minggu2.map(m => {
            const isActive = profile.activeMilestoneIds.includes(m.id)
            const isLocked = profile.currentDay < 8
            const isCompleted = profile.completedMilestoneIds?.includes(m.id) ?? false
            return <MilestoneCard key={m.id} milestone={m} isActive={isActive} isLocked={isLocked} isCompleted={isCompleted} />
          })}
        </div>
      </section>
    </div>
  )
}

function MilestoneCard({ milestone: m, isActive, isLocked, isCompleted }: {
  milestone: typeof MILESTONES[0]; isActive: boolean; isLocked?: boolean; isCompleted?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border p-6 flex flex-col gap-4 transition-all ${
      isLocked ? 'border-[#E1E7EF] opacity-60' : isCompleted ? 'border-[#16A34A]' : isActive ? 'border-[#023DFF]' : 'border-[#E1E7EF]'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isCompleted && !isLocked && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D]">Selesai ✓</span>
            )}
            {!isCompleted && isActive && !isLocked && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D]">Aktif</span>
            )}
          </div>
          <h3 className="font-bold text-[#0F1729] text-base">{m.name}</h3>
        </div>
        {isLocked && <span className="text-[#94A3B8] text-xl flex-shrink-0">🔒</span>}
      </div>
      <p className="text-sm text-[#65758B] leading-relaxed">{m.description}</p>
      <div className="flex flex-wrap gap-2">
        <InfoChip label={`${m.materials.length} materi`} />
        <InfoChip label={`${m.estimatedMinutes} menit`} />
        {m.quiz && <InfoChip label="🔒 Mini Quiz" highlight />}
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
          {isCompleted ? 'Pelajari Lagi' : 'Kerjakan Sekarang →'}
        </Link>
      ) : (
        <div className="mt-auto flex items-center justify-center h-9 px-4 rounded-lg bg-[#F1F5F9] text-[#94A3B8] font-semibold text-sm cursor-not-allowed">
          Terkunci
        </div>
      )}
    </div>
  )
}

function InfoChip({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${
      highlight
        ? 'text-[#B27202] bg-[#FEFDEA] border-[#E0A200]/40'
        : 'text-[#65758B] bg-[#F8FAFC] border-[#E1E7EF]'
    }`}>{label}</span>
  )
}
