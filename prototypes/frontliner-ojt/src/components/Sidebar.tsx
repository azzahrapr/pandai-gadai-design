import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { FLProfile, KanitProfile } from '../types'

// DS tokens:
// Sidebar bg: background/dark = #0F1729
// Active item bg: background/dark-secondary = #344256
// Active indicator: background/primary = #023DFF (left 3px bar)
// Label default: text/neutral @ opacity 60%
// Label active: text/neutral (#FFFFFF)
// Typography: Body 2 — 14px Regular

const NAV_LINK_BASE = 'relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all'
const NAV_LINK_ACTIVE = 'bg-[#344256] text-white font-medium'
const NAV_LINK_INACTIVE = 'text-white/50 hover:bg-white/5 hover:text-white/80 font-normal'

function NavItem({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${NAV_LINK_BASE} ${isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#023DFF] rounded-r-full" />
          )}
          <span className={isActive ? 'text-white' : 'text-white/50'}>{icon}</span>
          {label}
        </>
      )}
    </NavLink>
  )
}

export function FLSidebar() {
  const { currentUser, logout } = useApp()
  const profile = currentUser?.profile as FLProfile | undefined
  const day = profile?.currentDay ?? 1
  const dayProgress = Math.round((day / 14) * 100)

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0F1729] flex flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="w-8 h-8 bg-[#023DFF] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xs">PG</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">Pandai Gadai</p>
          <p className="text-white/40 text-[11px] mt-0.5">OJT System</p>
        </div>
      </div>

      {/* Day progress */}
      {profile && (
        <div className="mx-4 mb-4 bg-white/5 rounded-lg px-3 py-2.5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-white/60 text-xs">Hari {day} dari 14</span>
            <span className="text-white/60 text-xs">{dayProgress}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#023DFF] rounded-full transition-all" style={{ width: `${dayProgress}%` }} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Menu</p>
        <NavItem to="/fl/dashboard" label="Beranda" icon={<IconHome />} />
        <NavItem to="/fl/milestones" label="Materi Belajar" icon={<IconBook />} />
        <NavItem to="/fl/checklist" label="Daily Checklist" icon={<IconChecklist />} />
        <NavItem to="/fl/scores" label="Nilai Saya" icon={<IconChart />} />

        {day >= 8 && (
          <>
            <div className="my-2 border-t border-white/10" />
            <p className="px-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Lanjutan</p>
            <NavItem to="/fl/penaksiran" label="Penaksiran" icon={<IconScale />} />
          </>
        )}
        {day >= 14 && (
          <NavItem to="/fl/assessment" label="Assessment" icon={<IconGrad />} />
        )}
      </nav>

      {/* User */}
      <div className="px-2 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#023DFF]/30 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{currentUser?.name}</p>
              <p className="text-white/40 text-[10px]">OJT Frontliner</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-red-400 text-sm transition-all"
        >
          <IconLogout /> Keluar
        </button>
      </div>
    </aside>
  )
}

export function KanitSidebar() {
  const { currentUser, logout } = useApp()
  const profile = currentUser?.profile as KanitProfile | undefined

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0F1729] flex flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="w-8 h-8 bg-[#023DFF] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xs">PG</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">Pandai Gadai</p>
          <p className="text-white/40 text-[11px] mt-0.5">OJT — Kepala Unit</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Menu</p>
        <NavItem to="/kanit/dashboard" label="Dashboard" icon={<IconHome />} />
        <NavItem to="/kanit/review" label="Review Checklist" icon={<IconChecklist />} />
        <NavItem to="/kanit/penaksiran" label="Penaksiran" icon={<IconScale />} />
        <NavItem to="/kanit/results" label="Hasil Akhir OJT" icon={<IconChart />} />
      </nav>

      {/* User */}
      <div className="px-2 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#023DFF]/30 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{currentUser?.name}</p>
              <p className="text-white/40 text-[10px]">{profile?.branch}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-red-400 text-sm transition-all"
        >
          <IconLogout /> Keluar
        </button>
      </div>
    </aside>
  )
}

// Icons (inline SVG, 16×16)
function IconHome() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.667l6-5 6 5V14a.667.667 0 01-.667.667H10V10H6v4.667H2.667A.667.667 0 012 14V6.667z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconBook() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13.333S3.333 11.333 3.333 6.667V3.333l4.667-2 4.667 2v3.334C12.667 11.333 8 13.333 8 13.333z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconChecklist() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 7.333l1.333 1.334L11.333 5M4 2.667H2.667A.667.667 0 002 3.333v10c0 .368.298.667.667.667h10.666c.369 0 .667-.299.667-.667v-10a.667.667 0 00-.667-.666H12M4 2.667C4 2.298 4.298 2 4.667 2h6.666c.369 0 .667.298.667.667V4H4V2.667z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconChart() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 13.333V6.667M8 13.333V2.667M4 13.333v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function IconScale() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M5 14h6M3.333 5.333l9.334 1.334M3.333 5.333L2 9.333c0 .737.597 1.334 1.333 1.334S4.667 10.07 4.667 9.333L3.333 5.333zm9.334 1.334L14 10.667c0 .736-.597 1.333-1.333 1.333-.737 0-1.334-.597-1.334-1.333l1.334-4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconGrad() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L1.333 5.333 8 8.667l6.667-3.334L8 2zM1.333 5.333V10M4.667 6.667v3.666c0 1.105 1.492 2 3.333 2s3.333-.895 3.333-2V6.667" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconLogout() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3.333A.667.667 0 012.667 13.333V2.667A.667.667 0 013.333 2H6M10.667 11.333L14 8l-3.333-3.333M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
