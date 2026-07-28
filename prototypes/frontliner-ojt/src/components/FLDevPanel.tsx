import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { FLProfile } from '../types'

const QUICK_DAYS = [
  { day: 1,  label: 'D1',  note: 'Closing & Grooming mulai' },
  { day: 3,  label: 'D3',  note: 'Closing hari terakhir' },
  { day: 4,  label: 'D4',  note: 'Opening mulai' },
  { day: 7,  label: 'D7',  note: 'Akhir Minggu 1' },
  { day: 8,  label: 'D8',  note: 'Minggu 2 mulai' },
  { day: 13, label: 'D13', note: 'Pelayanan hari terakhir' },
  { day: 14, label: 'D14', note: 'Assessment' },
]

export default function FLDevPanel() {
  const { currentUser, setCurrentDay, resetUserProgress } = useApp()
  const [open, setOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  if (!currentUser || currentUser.role !== 'fl') return null

  const profile = currentUser.profile as FLProfile
  const day = profile.currentDay
  const week = day <= 7 ? 'Minggu 1' : day <= 13 ? 'Minggu 2' : 'Assessment'

  async function handleReset() {
    if (!confirm('Reset checklist & progress untuk akun ini? Hari tetap di angka yang sudah diset. Tidak bisa dibatalkan.')) return
    setResetting(true)
    await resetUserProgress()
    setResetting(false)
  }

  return (
    <div className="fixed bottom-20 right-3 md:bottom-4 md:right-4 z-50">
      {open ? (
        <div className="bg-[#0D1523] text-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden w-64">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🔧</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Dev Panel</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Day control */}
          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-3">Hari OJT</p>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => setCurrentDay(day - 1)}
                disabled={day <= 1}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center text-lg font-bold transition-colors"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-black tabular-nums">{day}</span>
              </div>
              <button
                onClick={() => setCurrentDay(day + 1)}
                disabled={day >= 14}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-center text-xs text-white/40 mb-4">{week}</p>

            {/* Quick-set buttons */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {QUICK_DAYS.map(q => (
                <div key={q.day} className="relative">
                  <button
                    onClick={() => setCurrentDay(q.day)}
                    onMouseEnter={() => setHovered(q.day)}
                    onMouseLeave={() => setHovered(null)}
                    className={`w-full h-8 rounded-lg text-xs font-bold transition-colors ${
                      day === q.day
                        ? 'bg-[#023DFF] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white/70'
                    }`}
                  >
                    {q.label}
                  </button>
                  {hovered === q.day && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max max-w-40 bg-[#1E2D45] text-white/80 text-[10px] rounded-lg px-2 py-1 text-center leading-tight pointer-events-none z-10">
                      {q.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reset button */}
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full h-9 rounded-xl bg-[#DC2626]/80 hover:bg-[#DC2626] disabled:opacity-40 text-white font-semibold text-xs transition-colors"
            >
              {resetting ? 'Mereset data...' : '🗑 Reset Semua Data'}
            </button>
            <p className="text-[10px] text-white/25 text-center mt-2 leading-tight">
              Hapus checklist & progress akun ini saja. Hari tidak direset.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          title="Dev Panel"
          className="w-10 h-10 bg-[#0D1523] text-white rounded-2xl shadow-2xl shadow-black/40 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <span className="text-base">🔧</span>
        </button>
      )}
    </div>
  )
}
