import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { FLSidebar } from '../../components/Sidebar'
import { FLBottomNav } from '../../components/BottomNav'
import TourOverlay from '../../components/TourOverlay'
import { TourProvider } from '../../context/TourContext'
import type { FLProfile } from '../../types'

export default function FLLayout() {
  const { currentUser, isLoading } = useApp()
  const location = useLocation()
  if (isLoading) return null
  if (!currentUser || currentUser.role !== 'fl') return <Navigate to="/" replace />

  const profile = currentUser.profile as FLProfile

  // Not enrolled yet (start date hasn't arrived, or it has but they haven't clicked
  // through to begin) — Profil is the only page they have anything to do on (it's where
  // "Mulai Sekarang" now lives), so land there and stay there regardless of which URL
  // they hit; no sidebar/bottom nav since every other menu is inaccessible until started.
  const notEnrolledYet = profile.currentDay < 1 || !(profile.hasStarted ?? true)
  // No overflow-x-hidden here (correction from an earlier, incomplete fix): ANY
  // non-`visible` overflow value on EITHER axis — even paired with an explicit
  // overflow-y-visible on the other axis — still makes an element a "scroll container"
  // per spec, which is what position:sticky's descendants anchor to. Since these divs'
  // height is unbounded (min-h-screen lets them grow with content), they never actually
  // have internal overflow to scroll through — so anything sticky inside them (including
  // FLSidebar's own `sticky top-0` and any sticky element inside <main>) silently never
  // sticks, because it's anchored to a container that never scrolls, instead of the
  // browser window that actually does. `w-full` instead of `w-screen` sidesteps the
  // usual reason overflow-x-hidden gets reached for here (100vw can exceed the visible
  // viewport width once a scrollbar is present) without needing overflow-x-hidden at all.
  // min-w-0 on <main> is required now that overflow-x-hidden is gone — a flex item's
  // default min-width is `auto` (its own content's intrinsic width), so without this
  // <main> refused to shrink below whatever its widest unwrapped descendant wanted (e.g.
  // a "Batas pengerjaan hari ini 07:31:14" line), pushing the whole row wider than the
  // viewport on mobile. min-w-0 lets it actually shrink to the available width so the
  // existing truncate/min-w-0 classes deeper in each page can do their job, instead of
  // overflow-x-hidden silently papering over it as before.
  if (notEnrolledYet) {
    return (
      <div className="flex w-full min-h-screen bg-[#F8FAFC]">
        <main className="flex-1 min-w-0">
          {location.pathname === '/fl/profile' ? <Outlet /> : <Navigate to="/fl/profile" replace />}
        </main>
      </div>
    )
  }

  return (
    <TourProvider>
      <div className="flex w-full min-h-screen bg-[#F8FAFC]">
        <div className="hidden md:block"><FLSidebar /></div>
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          <Outlet />
        </main>
        <div className="md:hidden"><FLBottomNav /></div>
        <TourOverlay />
      </div>
    </TourProvider>
  )
}
