import { useState } from 'react'
import { useApp } from '../context/AppContext'

// Kanit-side equivalent of FLDevPanel.tsx. Kanit has no `currentDay` of its own (that's
// an FL-profile concept), so there's no day-control dial here — the one genuinely useful
// dev affordance for this role is the same global `resetData()` the Login page's own
// "Reset data" flow already uses, surfaced here so a kanit session doesn't need to log
// out back to Login just to reset test data.
export default function KanitDevPanel() {
  const { currentUser, resetData } = useApp()
  const [open, setOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  if (!currentUser || currentUser.role !== 'kanit') return null

  async function handleReset() {
    if (!confirm('Reset SEMUA data (semua FL & kanit) balik ke data awal? Bukan cuma akun ini. Tidak bisa dibatalkan.')) return
    setResetting(true)
    await resetData()
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

          {/* Reset */}
          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-3">Data Testing</p>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full h-9 rounded-xl bg-[#DC2626]/80 hover:bg-[#DC2626] disabled:opacity-40 text-white font-semibold text-xs transition-colors"
            >
              {resetting ? 'Mereset data...' : '🗑 Reset Semua Data'}
            </button>
            <p className="text-[10px] text-white/25 text-center mt-2 leading-tight">
              Reset SEMUA data (semua FL &amp; kanit) balik ke seed awal — bukan cuma akun ini, tidak ada dial hari (itu milik masing-masing FL).
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
