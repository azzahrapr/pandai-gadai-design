import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightSlot?: React.ReactNode
}

export default function TopBar({ title, subtitle, showBack, rightSlot }: TopBarProps) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 pt-3 pb-3 flex items-center gap-3">
      {showBack && (
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-[15px] leading-tight truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
    </div>
  )
}
