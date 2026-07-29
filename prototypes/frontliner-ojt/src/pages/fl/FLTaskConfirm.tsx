import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { FLProfile, TaskConfirmation } from '../../types'

const SBG_MILESTONE_IDS = new Set(['sop-administrasi', 'packing-sealing'])

export default function FLTaskConfirm() {
  const { milestoneId, itemId } = useParams<{ milestoneId: string; itemId: string }>()
  const navigate = useNavigate()
  const { currentUser, submitTaskConfirmation, getItemConfirmations } = useApp()
  const profile = currentUser!.profile as FLProfile

  const milestone = MILESTONES.find(m => m.id === milestoneId)
  const item = milestone?.checklistItems.find(i => i.id === itemId)
  const needsSbg = milestoneId ? SBG_MILESTONE_IDS.has(milestoneId) : false

  const target = item?.target ?? 1
  const existing = milestone && item
    ? getItemConfirmations(currentUser!.id, milestone.id, item.id)
    : []
  const atTarget = existing.length >= target

  const [nomorSbg, setNomorSbg] = useState('')
  const [catatan, setCatatan] = useState('')
  const [justSubmittedCount, setJustSubmittedCount] = useState<number | null>(null)

  function handleSubmit() {
    if (!milestone || !item) return
    const now = new Date().toISOString()
    const confirmation: TaskConfirmation = {
      id: `confirm-${currentUser!.id}-${milestone.id}-${item.id}-${now}`,
      flId: currentUser!.id,
      milestoneId: milestone.id,
      itemId: item.id,
      itemText: item.text,
      nomorSbg: needsSbg && nomorSbg.trim() ? nomorSbg.trim() : undefined,
      catatan: catatan.trim() || undefined,
      submittedAt: now,
      day: profile.currentDay,
    }
    submitTaskConfirmation(confirmation)
    setJustSubmittedCount(existing.length + 1)
    setNomorSbg('')
    setCatatan('')
  }

  if (!milestone || !item) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-sm text-[#65758B]">Tugas tidak ditemukan.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#023DFF] hover:underline mt-2 inline-block">← Kembali</button>
      </div>
    )
  }

  const currentCount = justSubmittedCount ?? existing.length
  const isDone = currentCount >= target

  return (
    <div className="p-4 md:p-8 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white border border-[#E1E7EF] flex items-center justify-center hover:border-[#023DFF] hover:text-[#023DFF] transition-colors flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2.5L5 7l4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#0F1729] leading-tight">{milestone.name}</h1>
          {target > 1 && (
            <Link
              to={`/fl/milestones/${milestone.id}`}
              className="text-xs text-[#023DFF] font-semibold mt-0.5 inline-flex items-center gap-1 hover:underline"
            >
              Baca Materi
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Task card — always visible */}
      <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-3 mb-4">
        {target > 1 && (
          <span className={`inline-flex items-center h-4 px-2 rounded-full text-[10px] font-bold border ${
            isDone ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]'
              : currentCount > 0 ? 'bg-[#FEFDEA] border-[#E0A200] text-[#B27202]'
              : 'bg-[#F8FAFC] border-[#E1E7EF] text-[#94A3B8]'
          }`}>
            Target: {currentCount}/{target} sesi
          </span>
        )}
        <p className="text-base font-bold text-[#0F1729]">{item.text}</p>
        {item.description && (
          <p className="text-sm text-[#65758B] leading-relaxed">{item.description}</p>
        )}
      </div>

      {justSubmittedCount !== null && (
        /* ── Just-submitted toast ── */
        <div className="rounded-xl bg-[#F0FDF4] border border-[#16A34A]/20 px-4 py-3 flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6l2.5 2.5L9.5 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#15803D]">
            {isDone ? 'Semua percobaan selesai!' : `Percobaan ${justSubmittedCount} dari ${target} berhasil disubmit.`}
          </p>
        </div>
      )}

      {isDone ? (
        target > 1 ? (
          <Link
            to={`/fl/milestones/${milestone.id}`}
            className="w-full h-11 flex items-center justify-center bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Baca Materi →
          </Link>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="w-full h-11 bg-white border border-[#E1E7EF] hover:bg-[#F8FAFC] text-[#0F1729] font-semibold text-sm rounded-xl transition-colors"
          >
            Kembali
          </button>
        )
      ) : (
        /* ── Form ── */
        <div className="space-y-4">
          {needsSbg && (
            <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5">
              <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide block mb-2">
                Nomor SBG <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={nomorSbg}
                onChange={e => setNomorSbg(e.target.value)}
                placeholder="Contoh: SBG-2026-00123"
                className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none focus:border-[#023DFF] transition-colors"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5">
            <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide block mb-2">
              Catatan <span className="normal-case font-normal text-[#94A3B8]">(opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan atau refleksi dari praktik yang sudah kamu lakukan..."
              rows={4}
              className="w-full text-sm text-[#0F1729] placeholder-[#CBD5E1] resize-none outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={needsSbg && !nomorSbg.trim()}
            className={`w-full h-12 font-bold text-sm rounded-xl transition-colors ${
              !needsSbg || nomorSbg.trim()
                ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
                : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            {target === 1 ? 'Submit' : 'Tandai Selesai'}
          </button>

        </div>
      )}
    </div>
  )
}
