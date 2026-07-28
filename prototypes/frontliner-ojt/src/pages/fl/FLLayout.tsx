import { Outlet, Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { FLSidebar } from '../../components/Sidebar'
import { FLBottomNav } from '../../components/BottomNav'
import FLDevPanel from '../../components/FLDevPanel'

export default function FLLayout() {
  const { currentUser, isLoading } = useApp()
  if (isLoading) return null
  if (!currentUser || currentUser.role !== 'fl') return <Navigate to="/" replace />
  return (
    <div className="flex w-screen min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <div className="hidden md:block"><FLSidebar /></div>
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="md:hidden"><FLBottomNav /></div>
      <FLDevPanel />
    </div>
  )
}
