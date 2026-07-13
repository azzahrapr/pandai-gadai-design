import { createContext, useContext, useEffect, useState } from 'react'

export interface SelectedInfo {
  type: 'component' | 'image' | 'svg' | 'element'
  label: string
  tokens: string[]
  css?: string
  // image fields
  src?: string
  isSvg?: boolean
  displayW?: number; displayH?: number
  naturalW?: number; naturalH?: number
  // element ref (for export)
  elId?: number
  // svg markup ref (for copy)
  markupId?: number
}

interface InspectCtxType {
  active: boolean
  selectedInfo: SelectedInfo | null
  setSelectedInfo: (info: SelectedInfo | null) => void
}

const InspectCtx = createContext<InspectCtxType>({
  active: false,
  selectedInfo: null,
  setSelectedInfo: () => {},
})

export function InspectProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('inspect') === 'true'
    const fromSession = sessionStorage.getItem('pandai_inspect') === 'true'
    return fromUrl || fromSession
  })
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null)

  useEffect(() => {
    sessionStorage.setItem('pandai_inspect', active ? 'true' : 'false')
    if (!active) setSelectedInfo(null)
  }, [active])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if ((e.key === 'i' || e.key === 'I') && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.metaKey && !e.ctrlKey)
        setActive(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <InspectCtx.Provider value={{ active, selectedInfo, setSelectedInfo }}>
      {children}
    </InspectCtx.Provider>
  )
}

export const useInspect = () => useContext(InspectCtx)
