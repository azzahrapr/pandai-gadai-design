import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from './AppContext'

export interface TourStep {
  id: string
  page: string
  selector: string
  title: string
  description: string
}

// Anchors to real, always-present UI (data-tour attrs in FLDashboard/FLMilestones/
// FLMilestoneDetail) rather than describing them in text — each step navigates to the
// page that owns its target before highlighting it. Order matches the product's own
// information flow: overall progress → what to do today → where modules live & their
// statuses → what's inside a module once you open it.
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'level-progress',
    page: '/fl/dashboard',
    selector: 'level-carousel',
    title: 'Ringkasan progress belajarmu',
    description: 'Lihat progress modul belajarmu di tiap level: Level 1 (Hari 1–7) dan Level 2 (Hari 8–13). Geser kartu ini untuk memantau progresnya.',
  },
  {
    id: 'daily-tasks',
    page: '/fl/dashboard',
    selector: 'daily-tasks',
    title: 'Tugas yang harus dikerjakan',
    description: 'Tugas di tiap level muncul di sini — mencakup latihan dan mini quiz yang perlu dikerjakan sebelum deadline. Klik kartunya untuk mulai.',
  },
  {
    id: 'module-status',
    page: '/fl/milestones',
    selector: 'module-card',
    title: 'Menu Modul Belajar & status tiap modul',
    description: 'Diakses lewat menu "Modul Belajar". Tiap modul punya status: Belum Dimulai, Aktif, Terlambat, Lulus (hijau), atau Tidak Lulus (merah).',
  },
  {
    id: 'module-detail',
    page: '/fl/milestones/closing-cabang',
    selector: 'daftar-isi-card',
    title: 'Isi sebuah modul',
    description: 'Tiap modul punya 3 bagian: Materi, Latihan, dan Mini Quiz — semua bisa diakses dari daftar isi ini.',
  },
]

interface TourContextValue {
  stepIndex: number | null
  currentStep: TourStep | null
  isLast: boolean
  hasCompleted: boolean
  start: () => void
  next: () => void
  prev: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { currentUser } = useApp()
  const storageKey = `onboarding-tour-completed-${currentUser?.id}`
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  // Onboarding is mandatory — no skip. Once finished (Selesai on the last step), it never
  // shows again for this user; persisted client-side same as hasStarted/currentDay (see
  // project memory: this prototype treats those as session state, not real Supabase fields).
  const [hasCompleted, setHasCompleted] = useState(() => {
    try { return localStorage.getItem(storageKey) === 'true' } catch { return false }
  })

  function goTo(idx: number) {
    setStepIndex(idx)
    navigate(TOUR_STEPS[idx].page)
  }

  function finish() {
    setStepIndex(null)
    setHasCompleted(true)
    try { localStorage.setItem(storageKey, 'true') } catch { /* ignore */ }
  }

  const value: TourContextValue = {
    stepIndex,
    currentStep: stepIndex !== null ? TOUR_STEPS[stepIndex] : null,
    isLast: stepIndex === TOUR_STEPS.length - 1,
    hasCompleted,
    start: () => goTo(0),
    next: () => {
      if (stepIndex === null) return
      const n = stepIndex + 1
      if (n >= TOUR_STEPS.length) finish()
      else goTo(n)
    },
    prev: () => {
      if (stepIndex === null || stepIndex === 0) return
      goTo(stepIndex - 1)
    },
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within a TourProvider')
  return ctx
}
