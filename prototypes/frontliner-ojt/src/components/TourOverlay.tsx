import { useEffect, useState, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { useTour, TOUR_STEPS } from '../context/TourContext'

const PAD = 6
const POLL_MS = 60
const MAX_POLL_MS = 2000
// Sit right next to the target (16px gap) rather than far away at a screen edge — but
// anchor via `top`/`bottom` CSS (not a computed pixel offset that needs the tooltip's real
// height) so the browser sizes it naturally: "below" anchors from rect.bottom downward,
// "above" anchors from rect.top upward via `bottom`. Only when NEITHER side has comfortable
// room (the target itself is close to filling the viewport, e.g. a long task list) does it
// fall back to a fixed edge pin — that's what avoids the old overlap bug, now as a rare
// safety net rather than the default behavior.
const GAP = 16
const EDGE_MARGIN = 16
const MIN_COMFORTABLE = 140
// On mobile the bottom nav (FLBottomNav) sits fixed at the very bottom of the screen
// (~64px, see `pb-16` on <main> in FLLayout) — kept clear of on both mobile and desktop.
const BOTTOM_NAV_CLEARANCE = 76

// Some steps' selectors match more than one element (e.g. "Modul Belajar" exists in both
// the desktop sidebar and the mobile bottom nav — one of them is always display:none).
// Pick the first match that's actually rendered with real size, not just the first in DOM order.
function findVisibleTarget(selector: string): Element | null {
  const candidates = document.querySelectorAll(`[data-tour="${selector}"]`)
  for (const el of candidates) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return el
  }
  return null
}

export default function TourOverlay() {
  const { stepIndex, currentStep, isLast, next, prev } = useTour()
  const location = useLocation()
  const [rect, setRect] = useState<DOMRect | null>(null)

  // The target element may not be mounted yet right after navigate() (route/page still
  // rendering) — poll briefly instead of querying once and giving up.
  useEffect(() => {
    setRect(null)
    if (!currentStep) return
    let elapsed = 0
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const el = findVisibleTarget(currentStep.selector)
      if (el) {
        setRect(el.getBoundingClientRect())
        return
      }
      elapsed += POLL_MS
      if (elapsed < MAX_POLL_MS) setTimeout(tick, POLL_MS)
    }
    tick()
    return () => { cancelled = true }
  }, [currentStep, location.pathname])

  useEffect(() => {
    if (!currentStep) return
    const recompute = () => {
      const el = findVisibleTarget(currentStep.selector)
      if (el) setRect(el.getBoundingClientRect())
    }
    window.addEventListener('resize', recompute)
    window.addEventListener('scroll', recompute, true)
    return () => {
      window.removeEventListener('resize', recompute)
      window.removeEventListener('scroll', recompute, true)
    }
  }, [currentStep])

  if (!currentStep || stepIndex === null) return null

  const viewportH = window.innerHeight
  const spaceBelow = rect ? (viewportH - BOTTOM_NAV_CLEARANCE) - rect.bottom : 0
  const spaceAbove = rect ? rect.top : 0

  const tooltipStyle: CSSProperties = !rect
    ? { top: viewportH / 2 - 80, pointerEvents: 'auto' }
    : spaceBelow >= MIN_COMFORTABLE
      ? { top: rect.bottom + GAP, pointerEvents: 'auto' }
      : spaceAbove >= MIN_COMFORTABLE
        ? { bottom: viewportH - rect.top + GAP, pointerEvents: 'auto' }
        : spaceBelow >= spaceAbove
          ? { bottom: BOTTOM_NAV_CLEARANCE + EDGE_MARGIN, pointerEvents: 'auto' }
          : { top: EDGE_MARGIN, pointerEvents: 'auto' }

  return (
    <div className="fixed inset-0 z-[1000]" style={{ pointerEvents: 'none' }}>
      {rect && (
        <div
          className="fixed rounded-xl transition-all duration-300 ease-out"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)',
          }}
        />
      )}
      <div
        className="fixed left-4 right-4 mx-auto max-w-sm bg-white rounded-xl shadow-lg border border-[#E1E7EF] p-4"
        style={tooltipStyle}
      >
        <div className="mb-2">
          <span className="text-[10px] font-bold text-[#023DFF] uppercase tracking-wide">
            Langkah {stepIndex + 1}/{TOUR_STEPS.length}
          </span>
        </div>
        <p className="text-sm font-bold text-[#0F1729] mb-1">{currentStep.title}</p>
        <p className="text-xs text-[#65758B] leading-relaxed mb-3 line-clamp-5">{currentStep.description}</p>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={prev}
            className={`text-xs font-medium text-[#65758B] hover:text-[#0F1729] px-2 py-1 ${stepIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            ← Kembali
          </button>
          <button
            onClick={next}
            className="h-8 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {isLast ? 'Selesai' : 'Lanjut →'}
          </button>
        </div>
      </div>
    </div>
  )
}
