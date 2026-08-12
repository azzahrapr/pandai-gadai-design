import { useEffect } from 'react'

// Cortes DS Toast — Single Action variant. Per component-specs.md (2026-07-23 token
// pass): solid saturated background + neutral (white) text, message + dismiss "×" only,
// no status icon in the current anatomy. 343px wide, rounded-xl, 16px padding.
export type ToastType = 'positive' | 'alert' | 'error' | 'general'

const TOAST_STYLES: Record<ToastType, { bg: string; text: string }> = {
  positive: { bg: 'bg-[#16A34A]', text: 'text-white' },
  alert: { bg: 'bg-[#FFCD05]', text: 'text-[#0F1729]' },
  error: { bg: 'bg-[#DC2626]', text: 'text-white' },
  general: { bg: 'bg-[#344256]', text: 'text-white' },
}

export function Toast({ message, type = 'positive', onDismiss, duration = 4000 }: {
  message: string
  type?: ToastType
  onDismiss: () => void
  duration?: number
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [onDismiss, duration])

  const style = TOAST_STYLES[type]
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-[343px]">
      <div className={`rounded-xl p-4 flex items-center gap-3 shadow-lg ${style.bg}`}>
        <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>
        <button onClick={onDismiss} className={`flex-shrink-0 ${style.text} opacity-80 hover:opacity-100 transition-opacity`}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
