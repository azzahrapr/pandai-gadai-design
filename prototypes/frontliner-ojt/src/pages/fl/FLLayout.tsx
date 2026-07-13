import { Outlet, Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { FLSidebar } from '../../components/Sidebar'

export default function FLLayout() {
  const { currentUser } = useApp()
  if (!currentUser || currentUser.role !== 'fl') return <Navigate to="/" replace />
  return (
    <div className="flex w-screen min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <FLSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
