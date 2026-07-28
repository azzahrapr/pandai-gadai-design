import { Outlet, Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { KanitSidebar } from '../../components/Sidebar'
import { KanitBottomNav } from '../../components/BottomNav'

export default function KanitLayout() {
  const { currentUser, isLoading } = useApp()
  if (isLoading) return null
  if (!currentUser || currentUser.role !== 'kanit') return <Navigate to="/" replace />
  return (
    <div className="flex w-screen min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <div className="hidden md:block"><KanitSidebar /></div>
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="md:hidden"><KanitBottomNav /></div>
    </div>
  )
}
