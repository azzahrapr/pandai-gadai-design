import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { FLProfile, TaskConfirmation } from '../../types'

const inputCls = 'w-full border rounded-lg px-3 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none transition-colors'
const borderCls = (error: boolean) => error ? 'border-[#DC2626]' : 'border-[#CBD5E1] focus:border-[#023DFF]'

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return <label className="text-xs font-semibold text-[#0F1729] block mb-1.5">{children}{required && <span className="text-[#DC2626]">*</span>}</label>
}

// A native <select>'s OS-rendered dropdown (system font, system highlight color, no DS
// styling at all) doesn't match this app anywhere else a picker is needed — every other
// "choose one from a list" surface uses a DS bottom sheet (see the "Pilih peserta" sheets
// in KanitResults.tsx/KanitReviewProgress.tsx: drag handle, title + ✕, Body-2-regular rows
// with a checkmark on the selected one). This reimplements that exact same pattern as a
// reusable field so Denominasi/Jenis Perhiasan/Kadar all get it instead of a bare <select>.
function PickerField({ label, required, placeholder, value, options, onChange, error }: {
  label: string
  required?: boolean
  placeholder: string
  value: string
  options: string[]
  onChange: (v: string) => void
  error?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${inputCls} ${borderCls(!!error)} bg-white flex items-center justify-between gap-2 text-left`}
      >
        <span className={value ? 'text-[#0F1729]' : 'text-[#94A3B8]'}>{value || placeholder}</span>
        <svg className="flex-shrink-0 text-[#94A3B8]" width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="bg-white rounded-t-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-[#E1E7EF]" />
            </div>
            <div className="px-5 py-4 border-b border-[#E1E7EF] flex items-center justify-between flex-shrink-0">
              <p className="text-sm font-bold text-[#0F1729]">{label}</p>
              <button onClick={() => setOpen(false)} className="text-[#94A3B8] hover:text-[#65758B] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-[#E1E7EF]">
              {options.map(opt => {
                const isSelected = opt === value
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false) }}
                    className={`w-full min-h-11 flex items-center justify-between gap-3 px-5 py-2.5 text-left transition-colors ${isSelected ? 'bg-[#E5F2FF]' : 'hover:bg-[#F8FAFC]'}`}
                  >
                    <p className={`text-sm font-normal truncate ${isSelected ? 'text-[#023DFF]' : 'text-[#0F1729]'}`}>{opt}</p>
                    {isSelected && (
                      <svg className="flex-shrink-0 text-[#023DFF]" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Standard Antam LM Press denominations sold per keping.
const DENOMINASI_OPTIONS = ['0.5 gram', '1 gram', '2 gram', '3 gram', '5 gram', '10 gram', '25 gram', '50 gram', '100 gram', '250 gram', '500 gram', '1000 gram']
const JENIS_PERHIASAN_OPTIONS = ['Cincin', 'Kalung', 'Gelang', 'Anting', 'Liontin', 'Giwang', 'Bros']
const KADAR_OPTIONS = ['24K (99.9%)', '23K (96%)', '22K (91.6%)', '21K (87.5%)', '20K (83.3%)', '19K (79.2%)', '18K (75%)', '17K (70.8%)', '16K (66.6%)', '15K (62.5%)', '14K (58.5%)', '10K (41.6%)', '8K (33.3%)']

export default function FLPenaksiranEmasConfirm() {
  const { milestoneId, itemId } = useParams<{ milestoneId: string; itemId: string }>()
  const navigate = useNavigate()
  const { currentUser, submitTaskConfirmation, getItemConfirmations } = useApp()
  const profile = currentUser!.profile as FLProfile

  const milestone = MILESTONES.find(m => m.id === milestoneId)
  const item = milestone?.checklistItems.find(i => i.id === itemId)

  const target = item?.target ?? 1
  const existing = milestone && item ? getItemConfirmations(currentUser!.id, milestone.id, item.id) : []

  // ── Pilih Jenis Emas ──────────────────────────────────────────
  const [jenisEmas, setJenisEmas] = useState<'Perhiasan' | 'Logam Mulia' | null>(null)

  // Logam Mulia fields
  const [denominasi, setDenominasi] = useState('')
  const [jumlahKeping, setJumlahKeping] = useState(1)

  // Perhiasan fields
  const [jenisPerhiasan, setJenisPerhiasan] = useState('')
  const [kadar, setKadar] = useState('')
  const [berat, setBerat] = useState('')

  const [refleksi, setRefleksi] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [justSubmittedCount, setJustSubmittedCount] = useState<number | null>(null)

  const isJenisEmasComplete = jenisEmas === 'Logam Mulia'
    ? denominasi !== '' && jumlahKeping > 0
    : jenisEmas === 'Perhiasan'
      ? jenisPerhiasan !== '' && kadar !== '' && berat.trim().length > 0
      : false
  const canSubmit = isJenisEmasComplete && refleksi.trim().length > 0

  function resetJenisFields() {
    setJenisEmas(null)
    setDenominasi(''); setJumlahKeping(1)
    setJenisPerhiasan(''); setKadar(''); setBerat('')
  }

  function resetForm() {
    resetJenisFields()
    setRefleksi('')
    setSubmitAttempted(false)
  }

  function buildSummary(): string {
    // Each of these becomes its own Ya/Tidak-checkable row in the kanit's review (see
    // KanitReviewConfirmation.tsx's parseSimulationCatatan — every "Label: value" line
    // other than "Tipe Item"/"Refleksi" is one row), same convention as
    // FLPenaksiranBpkbConfirm.tsx's Kelengkapan fields. "Tipe Item" itself stays
    // informational-only (Perhiasan vs Logam Mulia isn't something to mark Ya/Tidak on).
    const typeLines = jenisEmas === 'Logam Mulia'
      ? [`Denominasi: ${denominasi}`, `Jumlah Keping: ${jumlahKeping}`]
      : [`Jenis Perhiasan: ${jenisPerhiasan}`, `Kadar: ${kadar}`, `Berat: ${berat.trim()} gram`]
    return [
      `Tipe Item: ${jenisEmas}`,
      ...typeLines,
      `Refleksi: ${refleksi.trim()}`,
    ].join('\n')
  }

  function handleSubmit() {
    if (!milestone || !item) return
    if (!canSubmit) { setSubmitAttempted(true); return }
    const now = new Date().toISOString()
    const confirmation: TaskConfirmation = {
      id: `confirm-${currentUser!.id}-${milestone.id}-${item.id}-${now}`,
      flId: currentUser!.id,
      milestoneId: milestone.id,
      itemId: item.id,
      itemText: item.text,
      catatan: buildSummary(),
      submittedAt: now,
      day: profile.currentDay,
    }
    submitTaskConfirmation(confirmation)
    setJustSubmittedCount(existing.length + 1)
    resetForm()
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
          <h1 className="text-xl font-bold text-[#0F1729] leading-tight">Submit Latihan</h1>
          <p className="text-sm text-[#65758B] mt-0.5 truncate">{milestone.name}</p>
        </div>
      </div>

      {/* Task card */}
      <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-3 mb-4">
        <span className={`inline-flex items-center h-4 px-2 rounded-full text-[10px] font-bold border ${
          isDone ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]'
            : currentCount > 0 ? 'bg-[#FEFDEA] border-[#E0A200] text-[#B27202]'
            : 'bg-[#F8FAFC] border-[#E1E7EF] text-[#94A3B8]'
        }`}>
          Target: {currentCount}/{target} sesi
        </span>
        <p className="text-base font-bold text-[#0F1729]">{item.text}</p>
      </div>

      {justSubmittedCount !== null && (
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
        <Link
          to={`/fl/milestones/${milestone.id}/tasks`}
          className="w-full h-11 flex items-center justify-center bg-white border border-[#E1E7EF] hover:bg-[#F8FAFC] text-[#0F1729] font-semibold text-sm rounded-xl transition-colors"
        >
          Kembali ke Daftar Latihan
        </Link>
      ) : (
        <div className="space-y-4">
          {/* ── Pilih Jenis Emas ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-3">
            <p className="text-sm font-bold text-[#0F1729]">Pilih Jenis Emas</p>

            {jenisEmas === null ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {(['Perhiasan', 'Logam Mulia'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setJenisEmas(opt)}
                      className={`rounded-xl border p-4 text-center transition-colors ${
                        submitAttempted && !isJenisEmasComplete ? 'border-[#DC2626]' : 'border-[#E1E7EF] hover:border-[#023DFF] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#0F1729]">{opt}</p>
                    </button>
                  ))}
                </div>
                {submitAttempted && !isJenisEmasComplete && <p className="text-xs text-[#DC2626]">Pilih jenis emas terlebih dahulu</p>}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-4 py-3">
                  <div>
                    <p className="text-xs text-[#65758B]">Jenis Emas</p>
                    <p className="text-sm font-bold text-[#0F1729] mt-0.5">{jenisEmas}</p>
                  </div>
                  <button type="button" onClick={resetJenisFields} className="text-sm font-semibold text-[#023DFF] hover:underline flex-shrink-0">
                    Ubah
                  </button>
                </div>

                <div className="h-px bg-[#F1F5F9]" />

                {jenisEmas === 'Logam Mulia' ? (
                  <>
                    <PickerField
                      label="Denominasi"
                      required
                      placeholder="Pilih denominasi"
                      value={denominasi}
                      options={DENOMINASI_OPTIONS}
                      onChange={setDenominasi}
                      error={submitAttempted && denominasi === ''}
                    />
                    <div>
                      <FieldLabel required>Jumlah Keping</FieldLabel>
                      <div className="flex items-center border border-[#CBD5E1] rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setJumlahKeping(n => Math.max(1, n - 1))}
                          className="w-11 h-11 flex items-center justify-center text-[#65758B] hover:bg-[#F8FAFC] transition-colors flex-shrink-0"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        </button>
                        <div className="flex-1 text-center text-sm font-semibold text-[#0F1729] tabular-nums">{jumlahKeping}</div>
                        <button
                          type="button"
                          onClick={() => setJumlahKeping(n => n + 1)}
                          className="w-11 h-11 flex items-center justify-center text-[#65758B] hover:bg-[#F8FAFC] transition-colors flex-shrink-0"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <PickerField
                      label="Jenis Perhiasan"
                      required
                      placeholder="Pilih jenis perhiasan"
                      value={jenisPerhiasan}
                      options={JENIS_PERHIASAN_OPTIONS}
                      onChange={setJenisPerhiasan}
                      error={submitAttempted && jenisPerhiasan === ''}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <PickerField
                        label="Kadar"
                        required
                        placeholder="Pilih kadar"
                        value={kadar}
                        options={KADAR_OPTIONS}
                        onChange={setKadar}
                        error={submitAttempted && kadar === ''}
                      />
                      <div>
                        <FieldLabel required>Berat</FieldLabel>
                        <div className="relative">
                          <input
                            value={berat}
                            onChange={e => setBerat(e.target.value.replace(/[^\d.]/g, ''))}
                            placeholder="0"
                            className={`${inputCls} ${borderCls(submitAttempted && !berat.trim())} pr-14 font-mono tabular-nums`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#65758B]">Gram</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* ── Refleksi ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5">
            <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide block mb-2">
              Refleksi <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              value={refleksi}
              onChange={e => setRefleksi(e.target.value)}
              placeholder="Apa yang berjalan dengan baik atau yang perlu diperbaiki?"
              rows={3}
              className={`w-full text-sm text-[#0F1729] placeholder-[#CBD5E1] resize-none outline-none ${submitAttempted && !refleksi.trim() ? 'text-[#DC2626]' : ''}`}
            />
            {submitAttempted && !refleksi.trim() && <p className="text-xs text-[#DC2626] mt-1">Refleksi wajib diisi sebelum submit.</p>}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full h-12 font-bold text-sm rounded-xl transition-colors bg-[#023DFF] hover:bg-[#001CDB] text-white"
          >
            {target === 1 ? 'Submit' : 'Submit Simulasi'}
          </button>
        </div>
      )}
    </div>
  )
}
