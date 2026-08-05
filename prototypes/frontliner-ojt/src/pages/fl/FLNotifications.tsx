import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { FLNotification } from '../../types'

function relativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins} menit lalu`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} jam lalu`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} hari lalu`
}

function typeIcon(type: FLNotification['type']): string {
  if (type === 'feedback_latihan') return '💬'
  if (type === 'persetujuan_kanit') return '✅'
  if (type === 'quiz_unlocked') return '🧩'
  return '🎓'
}

function iconBg(type: FLNotification['type']): string {
  if (type === 'feedback_latihan') return 'bg-[#F0F4FF]'
  if (type === 'persetujuan_kanit') return 'bg-[#F0FDF4]'
  if (type === 'quiz_unlocked') return 'bg-[#F5F3FF]'
  return 'bg-[#FFF7ED]'
}

export default function FLNotifications() {
  const { notifications, markNotificationRead } = useApp()
  const navigate = useNavigate()

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  function handleTap(notif: FLNotification) {
    markNotificationRead(notif.id)
    if (notif.type === 'final_assessment') {
      navigate('/fl/assessment')
    } else if (notif.type === 'quiz_unlocked' && notif.milestoneId) {
      navigate(`/fl/milestones/${notif.milestoneId}`)
    } else if (notif.milestoneId) {
      navigate(`/fl/milestones/${notif.milestoneId}`, { state: { openHistory: true } })
    }
  }

  return (
    <div className="p-4 md:p-8 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Notifikasi</h1>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-4xl">🔔</span>
          <p className="text-sm text-[#65758B]">Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden divide-y divide-[#F1F5F9]">
          {sorted.map(notif => (
            <button
              key={notif.id}
              onClick={() => handleTap(notif)}
              className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-[#F8FAFC] transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${iconBg(notif.type)}`}>
                {typeIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${notif.read ? 'text-[#0F1729] font-medium' : 'text-[#0F1729] font-semibold'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-[#65758B] mt-1 leading-relaxed line-clamp-2">{notif.body}</p>
                <span className="text-[10px] text-[#94A3B8] mt-1.5 block">{relativeTime(notif.createdAt)}</span>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#023DFF] flex-shrink-0 mt-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
