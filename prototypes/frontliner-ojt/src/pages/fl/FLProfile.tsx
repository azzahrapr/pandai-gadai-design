import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES, COURSES } from '../../data/mockData'
import type { FLProfile } from '../../types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function FLProfile() {
  const { currentUser, logout, startProgram } = useApp()
  const navigate = useNavigate()
  const profile = currentUser!.profile as FLProfile

  const initials = currentUser!.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const dayProgress = Math.round((Math.min(profile.currentDay, 13) / 13) * 100)
  const completedCount = profile.completedMilestoneIds?.length ?? 0
  const totalCount = MILESTONES.filter(m => profile.activeMilestoneIds.includes(m.id)).length
  const course = COURSES.find(c => c.id === profile.courseId)

  // Not enrolled yet — FLLayout routes here as the only reachable page in that state, so
  // this is also where "Mulai Sekarang" now lives (previously a standalone gate screen).
  const hasStarted = profile.hasStarted ?? true
  const dateArrived = profile.currentDay >= 1

  function handleLogout() {
    logout()
    navigate('/')
  }

  function handleStart() {
    startProgram()
    navigate('/fl/dashboard')
  }

  return (
    <div className="p-4 md:p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Profil</h1>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#023DFF] flex items-center justify-center">
          <span className="text-white text-2xl font-black tracking-tight">{initials}</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#0F1729]">{currentUser!.name}</h2>
          <p className="text-sm text-[#65758B] mt-0.5">{profile.position}</p>
        </div>
      </div>

      {/* Course enrollment */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-[#F1F5F9]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">Course</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-[#E5F2FF] flex items-center justify-center flex-shrink-0">
            <span className="text-base">🎓</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F1729] truncate">{course?.name ?? '—'}</p>
            <p className="text-xs text-[#65758B] mt-0.5">
              {hasStarted ? 'Sedang berjalan' : dateArrived ? 'Belum dimulai' : `Tersedia mulai ${formatDate(profile.startDate)}`}
            </p>
          </div>
        </div>
        {!hasStarted && dateArrived && (
          <div className="px-4 pb-4">
            <button
              onClick={handleStart}
              className="w-full h-9 flex items-center justify-center bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Mulai Sekarang →
            </button>
          </div>
        )}
      </div>

      {/* OJT Info — Mulai OJT/Hari ke only mean anything once actually started */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-[#F1F5F9]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">Info OJT</p>
        </div>
        <div className="divide-y divide-[#F8FAFC]">
          <Row label="Cabang" value={profile.branch} />
          {hasStarted && (
            <>
              <Row label="Mulai OJT" value={formatDate(profile.startDate)} />
              <Row label="Hari ke" value={`${profile.currentDay} dari 14`} highlight />
            </>
          )}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-[#DC2626]/30 bg-white text-[#DC2626] font-semibold text-sm hover:bg-[#FEF2F2] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10.5 5.5L13.5 8l-3 2.5M13.5 8H6M6 3H3.5A1.5 1.5 0 002 4.5v7A1.5 1.5 0 003.5 13H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Keluar dari akun
      </button>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#65758B]">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-[#023DFF]' : 'text-[#0F1729]'}`}>{value}</span>
    </div>
  )
}
