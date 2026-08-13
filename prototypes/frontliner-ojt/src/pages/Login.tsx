import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// Curated for the Kanit handover demo (2026-08-12) — Dewi and Rizky's own FL logins are
// hidden here (not relevant to the 4 exploration flows below), but both still exist as
// MOCK_USERS; Dewi specifically stays in kanit-001's roster for the Rapot Akhir case.
const DEMO_ACCOUNTS = [
  { email: 'melati@pandaigadai.com', label: 'Melati Anjani',     role: 'OJT Frontliner · Hari 1 (Dashboard awal)' },
  { email: 'andi@pandaigadai.com',  label: 'Andi Pratama',       role: 'OJT Frontliner · Hari 2 (Mendekati deadline)' },
  { email: 'sari@pandaigadai.com',  label: 'Sari Dewi Lestari',  role: 'OJT Frontliner · Hari 8 (Modul terlambat)' },
  { email: 'budi@pandaigadai.com',  label: 'Budi Santoso',       role: 'OJT Frontliner · Hari 13 (Ujian akhir)' },
  { email: 'kanit@pandaigadai.com', label: 'Kepala Unit',        role: 'Supervisor & Penilai' },
]

export default function Login() {
  const { login, currentUser, isLoading, resetData } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Redirect if already logged in
  if (isLoading) return <LoadingScreen />
  if (currentUser) return <Navigate to={currentUser.role === 'fl' ? '/fl/dashboard' : '/kanit/dashboard'} replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    setError('')
    const err = await login(email.trim().toLowerCase(), password)
    setSubmitting(false)
    if (err) {
      setError('Email atau password salah.')
    } else {
      // navigate handled by redirect above once currentUser is set
      navigate(email.includes('kanit') ? '/kanit/dashboard' : '/fl/dashboard')
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail)
    setPassword('demo1234')
    setError('')
  }

  async function handleReset() {
    setResetting(true)
    await resetData()
    setResetting(false)
    setShowReset(false)
  }

  return (
    <div className="flex w-screen min-h-screen overflow-x-hidden">
      {/* Left — brand */}
      <div className="hidden lg:flex w-[45%] bg-[#023DFF] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute bottom-32 left-10 w-40 h-40 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-[#023DFF] font-black text-sm">PG</span>
          </div>
          <span className="text-white font-bold text-lg">Pandai Gadai</span>
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
        <div className="relative flex items-center justify-between">
          <p className="text-blue-300 text-xs">Internal Use Only · v0.2 Demo</p>
          {!showReset ? (
            <button onClick={() => setShowReset(true)} className="text-blue-300/60 hover:text-blue-200 text-xs transition-colors">
              Reset data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-blue-200 text-xs">Reset semua data?</span>
              <button onClick={handleReset} disabled={resetting} className="text-red-300 hover:text-red-200 text-xs font-semibold transition-colors">
                {resetting ? 'Mereset...' : 'Ya'}
              </button>
              <button onClick={() => setShowReset(false)} className="text-blue-300/60 hover:text-blue-200 text-xs transition-colors">Batal</button>
            </div>
          )}
        </div>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="nama@ojt.demo"
                className="w-full h-11 px-3.5 rounded-lg border border-[#CBD5E1] text-sm text-[#0F1729] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#023DFF] focus:ring-2 focus:ring-[#023DFF]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-lg border border-[#CBD5E1] text-sm text-[#0F1729] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#023DFF] focus:ring-2 focus:ring-[#023DFF]/10 transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={!email || !password || submitting}
              className={`w-full h-11 px-4 rounded-lg font-semibold text-sm transition-all ${
                email && password && !submitting
                  ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
                  : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              {submitting ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Akun Demo (password: demo1234)</p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc.email)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    email === acc.email
                      ? 'border-[#023DFF] bg-[#E5F2FF]'
                      : 'border-[#E1E7EF] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    email === acc.email ? 'bg-[#023DFF] text-white' : 'bg-[#F1F5F9] text-[#65758B]'
                  }`}>
                    {acc.label.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0F1729] text-xs">{acc.label}</p>
                    <p className="text-[#65758B] text-[11px]">{acc.role}</p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-mono">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex w-screen h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-[#023DFF] rounded-xl flex items-center justify-center">
          <span className="text-white font-black text-sm">PG</span>
        </div>
        <div className="w-5 h-5 border-2 border-[#023DFF] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
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
