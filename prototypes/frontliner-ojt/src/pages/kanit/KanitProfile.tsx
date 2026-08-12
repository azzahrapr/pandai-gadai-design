import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { KanitProfile } from '../../types'

export default function KanitProfilePage() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const profile = currentUser!.profile as KanitProfile

  const initials = currentUser!.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/')
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
          <p className="text-sm text-[#65758B] mt-0.5">Kepala Unit</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-[#F1F5F9]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">Info Kanit</p>
        </div>
        <div className="divide-y divide-[#F8FAFC]">
          <Row label="Cabang" value={profile.branch} />
          <Row label="Peserta OJT" value={`${profile.flIds.length} peserta`} />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#65758B]">{label}</span>
      <span className="text-sm font-semibold text-[#0F1729]">{value}</span>
    </div>
  )
}
