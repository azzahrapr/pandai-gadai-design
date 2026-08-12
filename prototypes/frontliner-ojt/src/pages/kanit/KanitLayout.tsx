import { Outlet, Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { KanitSidebar } from '../../components/Sidebar'
import { KanitBottomNav } from '../../components/BottomNav'
import KanitDevPanel from '../../components/KanitDevPanel'

export default function KanitLayout() {
  const { currentUser, isLoading } = useApp()
  if (isLoading) return null
  if (!currentUser || currentUser.role !== 'kanit') return <Navigate to="/" replace />
  return (
    // No overflow-x-hidden here (correction from an earlier, incomplete fix): ANY
    // non-`visible` overflow value on EITHER axis — even paired with an explicit
    // overflow-y-visible on the other axis — still makes an element a "scroll container"
    // per spec, which is what position:sticky's descendants anchor to. Since this div's
    // height is unbounded (min-h-screen lets it grow with content), it never actually
    // has internal overflow to scroll through — so anything sticky inside it (including
    // KanitSidebar's own `sticky top-0` and any sticky card inside <main>) silently never
    // sticks, because it's anchored to a container that never scrolls, instead of the
    // browser window that actually does. `w-full` instead of `w-screen` sidesteps the
    // usual reason overflow-x-hidden gets reached for here (100vw can exceed the visible
    // viewport width once a scrollbar is present) without needing overflow-x-hidden at all.
    <div className="flex w-full min-h-screen bg-[#F8FAFC]">
      <div className="hidden md:block"><KanitSidebar /></div>
      {/* No overflow-y-auto here either — same reasoning as above. <main> is never
          height-bound (its min-h-screen parent lets it grow with content), so
          overflow-y-auto here never actually scrolls; it just creates the same phantom
          scroll container for anything sticky nested inside it. The real scroll context
          is the browser window, which is what KanitSidebar's own sticky assumes.
          min-w-0 is required here now that overflow-x-hidden is gone — a flex item's
          default min-width is `auto` (its own content's intrinsic width), so without this
          <main> refused to shrink below whatever its widest unwrapped descendant wanted
          (e.g. a "Batas pengerjaan hari ini 07:31:14" line), pushing the whole row wider
          than the viewport on mobile. min-w-0 lets it actually shrink to the available
          width so the existing truncate/min-w-0 classes deeper in each page can do their
          job, instead of overflow-x-hidden silently papering over it as before. */}
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="md:hidden"><KanitBottomNav /></div>
      <KanitDevPanel />
    </div>
  )
}
