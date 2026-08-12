// Shown above the submission list on the review-latihan page for any Penaksiran-type
// module (Elektronik, BPKB, Emas) — reused by KanitReviewConfirmation.tsx's
// ConfirmationReview (Elektronik/BPKB, individual-type) and KanitReviewLatihan.tsx's
// ChecklistReview (Emas, still session-type). Generic on purpose — applies the same
// regardless of which penaksiran type is being reviewed.
export function PenaksiranGuidanceBanner() {
  return (
    <div className="bg-[#EFF6FF] rounded-lg px-4 py-3 mb-4">
      <div className="flex items-start gap-2">
        <div className="w-[14px] h-[14px] rounded-full bg-[#023DFF] flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4 3.5v3" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="4" cy="2" r="0.6" fill="white"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#023DFF] mb-1">Panduan Penilaian Penaksiran</p>
          <p className="text-sm text-[#65758B]">Nilai hasil penaksiran berdasarkan akurasi penginputan data dan kesesuaian kondisi discounter dengan barang sebenarnya.</p>
        </div>
      </div>
    </div>
  )
}
