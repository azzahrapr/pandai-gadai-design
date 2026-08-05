import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { FLSidebar } from '../../components/Sidebar'
import { FLBottomNav } from '../../components/BottomNav'
import FLDevPanel from '../../components/FLDevPanel'
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
  if (notEnrolledYet) {
    return (
      <div className="flex w-screen min-h-screen bg-[#F8FAFC] overflow-x-hidden">
        <main className="flex-1 overflow-y-auto">
          {location.pathname === '/fl/profile' ? <Outlet /> : <Navigate to="/fl/profile" replace />}
        </main>
        <FLDevPanel />
      </div>
    )
  }

  return (
    <TourProvider>
      <div className="flex w-screen min-h-screen bg-[#F8FAFC] overflow-x-hidden">
        <div className="hidden md:block"><FLSidebar /></div>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
        <div className="md:hidden"><FLBottomNav /></div>
        <FLDevPanel />
        <TourOverlay />
      </div>
    </TourProvider>
  )
}
