import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { MOCK_USERS } from '../data/mockData'
import type { UserRole, FLProfile } from '../types'

export default function Login() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const { login } = useApp()
  const navigate = useNavigate()

  const users = role ? MOCK_USERS.filter(u => u.role === role) : []

  function handleLogin() {
    if (!selectedId) return
    login(selectedId)
    navigate(role === 'fl' ? '/fl/dashboard' : '/kanit/dashboard')
  }

  return (
    <div className="flex w-screen min-h-screen overflow-x-hidden">
      {/* Left — brand panel */}
      <div className="hidden lg:flex w-[45%] bg-[#023DFF] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute bottom-32 left-10 w-40 h-40 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-[#023DFF] font-black text-sm">PG</span>
            </div>
            <span className="text-white font-bold text-lg">Pandai Gadai</span>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Sistem OJT<br />Frontliner
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-xs">
            Platform pembelajaran dan evaluasi untuk program On The Job Training Frontliner Pandai Gadai.
          </p>
          <div className="flex gap-6 mt-8">
            <Stat value="14" label="Hari OJT" />
            <Stat value="6" label="Milestone" />
            <Stat value="3" label="Komponen Nilai" />
          </div>
        </div>
        <p className="relative text-blue-300 text-xs">Internal Use Only · v0.1 Prototype</p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#023DFF] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">PG</span>
            </div>
            <span className="text-[#0F1729] font-bold text-lg">Pandai Gadai</span>
          </div>

          <h2 className="text-2xl font-bold text-[#0F1729] mb-1">Selamat datang</h2>
          <p className="text-[#65758B] text-sm mb-8">Masuk ke sistem OJT Frontliner</p>

          {!role ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-4">Pilih peran kamu</p>
              <RoleCard
                onClick={() => setRole('fl')}
                emoji="👤"
                title="OJT Frontliner"
                desc="Peserta program On The Job Training"
                color="blue"
              />
              <RoleCard
                onClick={() => setRole('kanit')}
                emoji="👔"
                title="Kepala Unit (Kanit)"
                desc="Supervisor & penilai peserta OJT"
                color="slate"
              />
            </div>
          ) : (
            <div>
              <button
                onClick={() => { setRole(null); setSelectedId('') }}
                className="flex items-center gap-1.5 text-sm text-[#65758B] hover:text-[#0F1729] mb-6 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Kembali
              </button>

              <p className="text-sm font-semibold text-[#0F1729] mb-4">
                {role === 'fl' ? 'Pilih akun OJT kamu' : 'Pilih akun Kepala Unit'}
              </p>

              <div className="space-y-2 mb-6">
                {users.map(u => {
                  const flProfile = u.role === 'fl' ? u.profile as FLProfile : null
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedId(u.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all text-left ${
                        selectedId === u.id ? 'border-[#023DFF] bg-[#E5F2FF]' : 'border-[#E1E7EF] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        selectedId === u.id ? 'bg-[#023DFF] text-white' : 'bg-[#F1F5F9] text-[#65758B]'
                      }`}>
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0F1729] text-sm">{u.name}</p>
                        {flProfile && (
                          <p className="text-xs text-[#65758B] mt-0.5">Hari ke-{flProfile.currentDay} dari 14 · {flProfile.branch}</p>
                        )}
                      </div>
                      {selectedId === u.id && (
                        <div className="w-5 h-5 bg-[#023DFF] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* DS Primary button: h=44px, px=16px, radius=8px, 14px SemiBold */}
              <button
                onClick={handleLogin}
                disabled={!selectedId}
                className={`w-full h-11 px-4 rounded-lg font-semibold text-sm transition-all ${
                  selectedId
                    ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
                    : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                Masuk ke Sistem
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RoleCard({ onClick, emoji, title, desc, color }: { onClick: () => void; emoji: string; title: string; desc: string; color: 'blue' | 'slate' }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-lg border border-[#E1E7EF] hover:border-[#023DFF] hover:bg-[#E5F2FF] transition-all text-left group"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color === 'blue' ? 'bg-[#E5F2FF]' : 'bg-[#F1F5F9]'}`}>
        {emoji}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[#0F1729] text-sm">{title}</p>
        <p className="text-[#65758B] text-xs mt-0.5">{desc}</p>
      </div>
      <svg className="text-[#CBD5E1] group-hover:text-[#023DFF] transition-colors" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6.75 4.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-blue-300 text-xs mt-0.5">{label}</p>
    </div>
  )
}
