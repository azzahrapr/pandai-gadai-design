import { useState } from 'react'
import { ChecklistItem } from '../types'

// Shown above the submission list on the review-latihan page for any module whose
// checklistItems carry a `kondisiIdeal` (the curriculum spreadsheet's "Kondisi Ideal"
// column, col AD) — a standardized per-item acceptance criterion for the Kanit to check
// against, sourced straight from the curriculum instead of left to individual judgment.
// Unlike the static PenaksiranGuidanceBanner (one fixed sentence, always visible), this
// one is CLICKABLE — the underlying content is a per-item list, so it opens a bottom
// sheet rather than trying to cram every item's condition into the banner itself.
// Renders nothing if none of the module's items have a kondisiIdeal — never show an
// empty/useless banner just because the module happens to be reviewable here.
export function PanduanPenilaianBanner({ checklistItems }: { checklistItems: ChecklistItem[] }) {
  const [open, setOpen] = useState(false)
  const itemsWithKondisi = checklistItems.filter(
    (ci): ci is ChecklistItem & { kondisiIdeal: string } => !!ci.kondisiIdeal
  )
  if (itemsWithKondisi.length === 0) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-2 bg-[#EFF6FF] rounded-lg px-4 py-3 mb-4 text-left hover:bg-[#E5F2FF] transition-colors"
      >
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-[14px] h-[14px] rounded-full bg-[#023DFF] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M4 3.5v3" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="4" cy="2" r="0.6" fill="white"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#023DFF]">Panduan Penilaian</p>
            <p className="text-sm text-[#65758B]">Lihat kondisi ideal tiap poin sebagai acuan penilaian.</p>
          </div>
        </div>
        <svg className="flex-shrink-0 text-[#023DFF] mt-1" width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-t-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
            {/* Drag handle — DS Bottom Sheet anatomy: handle → title → body → actions */}
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-[#E1E7EF]" />
            </div>
            <div className="px-5 py-4 border-b border-[#E1E7EF] flex items-center justify-between flex-shrink-0">
              <p className="text-sm font-bold text-[#0F1729]">Panduan Penilaian</p>
              <button onClick={() => setOpen(false)} className="text-[#94A3B8] hover:text-[#65758B] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-[#E1E7EF]">
              {itemsWithKondisi.map(ci => (
                <div key={ci.id} className="px-5 py-3.5">
                  <p className="text-sm font-semibold text-[#0F1729] mb-1">{ci.text}</p>
                  <p className="text-sm text-[#65758B]">{ci.kondisiIdeal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
