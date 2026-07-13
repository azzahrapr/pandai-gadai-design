import { Outlet, Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { KanitSidebar } from '../../components/Sidebar'

export default function KanitLayout() {
  const { currentUser } = useApp()
  if (!currentUser || currentUser.role !== 'kanit') return <Navigate to="/" replace />
  return (
    <div className="flex w-screen min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <KanitSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
