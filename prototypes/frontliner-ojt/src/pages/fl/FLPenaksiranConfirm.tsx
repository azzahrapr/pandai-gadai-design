import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import { HP_ITEM_LABELS, parseHpItemLabel } from '../../data/penaksiranHpItems'
import type { FLProfile, TaskConfirmation } from '../../types'

// Only the Handphone device types get a real "Cari Barang" catalog search — the other 9
// device types (Tablet, iPad, Laptop x3, Game Console x2, Smartwatch, Camera) don't have a
// catalog dataset yet, so they go straight to manual entry. Everyone shares the exact same
// "Potongan Nilai" defect checklist below regardless of device type, per explicit request.
const HP_ITEM_IDS = new Set(['pe-1', 'pe-3'])

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1]'}`}>
      {checked && (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </span>
  )
}

// A single defect that's just checked or not (e.g. "Baterai Gembung") — whole row is the
// tap target, checkbox on the right. Leaving it unchecked is a legitimate "normal" answer.
function DefectRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 rounded-lg border border-[#E1E7EF] hover:border-[#94A3B8] p-3 text-left transition-colors"
    >
      <span className="flex-1 text-sm font-semibold text-[#0F1729]">{label}</span>
      <Checkbox checked={checked} />
    </button>
  )
}

// A defect with a Ringan/Parah severity — checking the box reveals the picker; checked but
// never picking a severity is flagged as incomplete on submit (matches the reference app).
function DefectPickRow({ label, options, optionDescriptions, checked, value, onToggleChecked, onPick, error }: {
  label: string
  options: [string, string]
  optionDescriptions?: [string, string]
  checked: boolean
  value: string | null
  onToggleChecked: (v: boolean) => void
  onPick: (v: string | null) => void
  error?: boolean
}) {
  return (
    <div className={`rounded-lg border p-3 space-y-3 ${error ? 'border-[#DC2626]' : 'border-[#E1E7EF]'}`}>
      <button
        type="button"
        onClick={() => { onToggleChecked(!checked); if (checked) onPick(null) }}
        className="w-full flex items-center gap-3 text-left"
      >
        <span className="flex-1 text-sm font-semibold text-[#0F1729]">{label}</span>
        <Checkbox checked={checked} />
      </button>
      {checked && (
        <>
          <div className="h-px bg-[#F1F5F9]" />
          <div className="flex gap-2">
            {options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onClick={() => onPick(value === opt ? null : opt)}
                className={`flex-1 rounded-md p-2.5 text-left border transition-colors ${value === opt ? 'border-[#023DFF] bg-[#E5F2FF]' : 'border-[#E1E7EF] bg-white hover:border-[#94A3B8]'}`}
              >
                <p className={`text-sm font-semibold ${value === opt ? 'text-[#023DFF]' : 'text-[#0F1729]'}`}>{opt}</p>
                {optionDescriptions?.[i] && <p className="text-xs text-[#65758B] mt-0.5">{optionDescriptions[i]}</p>}
              </button>
            ))}
          </div>
        </>
      )}
      {error && <p className="text-xs text-[#DC2626]">Pilih salah satu tingkat kondisi</p>}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#94A3B8]">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 14l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function FLPenaksiranConfirm() {
  const { milestoneId, itemId } = useParams<{ milestoneId: string; itemId: string }>()
  const navigate = useNavigate()
  const { currentUser, submitTaskConfirmation, getItemConfirmations } = useApp()
  const profile = currentUser!.profile as FLProfile

  const milestone = MILESTONES.find(m => m.id === milestoneId)
  const item = milestone?.checklistItems.find(i => i.id === itemId)
  const isHpDevice = itemId ? HP_ITEM_IDS.has(itemId) : false

  const target = item?.target ?? 1
  const existing = milestone && item ? getItemConfirmations(currentUser!.id, milestone.id, item.id) : []

  // ── Tipe Item ──────────────────────────────────────────────
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [isManualEntry, setIsManualEntry] = useState(!isHpDevice)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [merekManual, setMerekManual] = useState('')
  const [namaItemManual, setNamaItemManual] = useState('')
  const [basisNilaiManual, setBasisNilaiManual] = useState('')

  const selectedHp = selectedLabel ? parseHpItemLabel(selectedLabel) : null
  const filteredLabels = searchQuery.trim()
    ? HP_ITEM_LABELS.filter(l => l.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 8)
    : HP_ITEM_LABELS.slice(0, 8)

  // ── Potongan Nilai — same shape/copy as the reference app's "Pengecekan Barang" ──
  const [boxChargerOri, setBoxChargerOri] = useState(false)
  const [lcdMinusChecked, setLcdMinusChecked] = useState(false)
  const [lcdMinus, setLcdMinus] = useState<string | null>(null)
  const [bodyLecetChecked, setBodyLecetChecked] = useState(false)
  const [bodyLecet, setBodyLecet] = useState<string | null>(null)
  const [kameraChecked, setKameraChecked] = useState(false)
  const [kamera, setKamera] = useState<string | null>(null)
  const [fisikBengkok, setFisikBengkok] = useState<string | null>(null)
  const [tombol, setTombol] = useState<string | null>(null)
  const [fisikBaterai, setFisikBaterai] = useState<string | null>(null)
  const [garansiUnit, setGaransiUnit] = useState<string | null>(null)
  const [sinyalProvider, setSinyalProvider] = useState<string | null>(null)
  const [speakerMic, setSpeakerMic] = useState<string | null>(null)
  const [fingerprintTouch, setFingerprintTouch] = useState<string | null>(null)

  const [refleksi, setRefleksi] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [justSubmittedCount, setJustSubmittedCount] = useState<number | null>(null)

  const isTipeItemComplete = isManualEntry
    ? merekManual.trim().length > 0 && namaItemManual.trim().length > 0
    : selectedLabel !== null
  const isPotonganNilaiValid = !(
    (lcdMinusChecked && lcdMinus === null) ||
    (bodyLecetChecked && bodyLecet === null) ||
    (kameraChecked && kamera === null)
  )
  const canSubmit = isTipeItemComplete && isPotonganNilaiValid && refleksi.trim().length > 0

  function resetForm() {
    setSelectedLabel(null)
    setIsManualEntry(!isHpDevice)
    setSearchQuery('')
    setMerekManual('')
    setNamaItemManual('')
    setBasisNilaiManual('')
    setBoxChargerOri(false)
    setLcdMinusChecked(false); setLcdMinus(null)
    setBodyLecetChecked(false); setBodyLecet(null)
    setKameraChecked(false); setKamera(null)
    setFisikBengkok(null); setTombol(null); setFisikBaterai(null)
    setGaransiUnit(null); setSinyalProvider(null); setSpeakerMic(null); setFingerprintTouch(null)
    setRefleksi('')
    setSubmitAttempted(false)
  }

  function buildSummary(): string {
    const tipeItem = isManualEntry
      ? `${merekManual.trim()} ${namaItemManual.trim()}`.trim() + (basisNilaiManual.trim() ? ` (Basis Nilai: Rp ${basisNilaiManual.trim()})` : '')
      : selectedLabel ?? '-'
    const defects = [
      boxChargerOri ? 'Tidak Ada Box Ori / Charger Ori' : null,
      lcdMinus ? `LCD Minus: ${lcdMinus}` : null,
      bodyLecet ? `Body Lecet/Jamur/Gompal: ${bodyLecet}` : null,
      kamera ? `Kamera/Flash Minus: ${kamera}` : null,
      fisikBengkok ? 'Body Bengkok' : null,
      tombol ? 'Tombol (Volume & Power) Minus' : null,
      fisikBaterai ? 'Baterai Gembung' : null,
      garansiUnit ? 'Garansi Inter' : null,
      sinyalProvider ? 'Sinyal Tidak Aktif' : null,
      speakerMic ? 'Speaker/Microphone Rusak' : null,
      fingerprintTouch ? 'Fingerprint/Touch ID Rusak' : null,
    ].filter((v): v is string => v !== null)

    return [
      `Tipe Item: ${tipeItem}`,
      `Potongan Nilai: ${defects.length > 0 ? defects.join(', ') : 'Semua kondisi normal, tidak ada yang ditandai.'}`,
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
          {/* ── Tipe Item ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-3">
            <p className="text-sm font-bold text-[#0F1729]">Tipe Item</p>

            {isHpDevice && !isManualEntry ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F1729]">Cari Barang<span className="text-[#DC2626]">*</span></label>
                <div className="relative">
                  <div className={`relative flex items-center border rounded-lg px-3 ${submitAttempted && !isTipeItemComplete ? 'border-[#DC2626]' : 'border-[#CBD5E1] focus-within:border-[#023DFF]'}`}>
                    <SearchIcon />
                    <input
                      value={selectedLabel ?? searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setSelectedLabel(null); setSearchOpen(true) }}
                      onFocus={() => setSearchOpen(true)}
                      onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                      placeholder="Ketik nama barang disini"
                      className="w-full pl-2.5 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none bg-transparent"
                    />
                  </div>
                  {searchOpen && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E1E7EF] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredLabels.map(label => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => { setSelectedLabel(label); setSearchQuery(''); setSearchOpen(false) }}
                          className="w-full text-left px-3 py-2.5 text-sm text-[#0F1729] hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-0"
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setIsManualEntry(true); setSearchOpen(false) }}
                        className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[#023DFF] hover:bg-[#E5F2FF]"
                      >
                        + Masukkan manual
                      </button>
                    </div>
                  )}
                </div>
                {!selectedLabel && <p className="text-xs text-[#94A3B8]">Pilih barang untuk mendapatkan estimasi pencairan</p>}
                {submitAttempted && !isTipeItemComplete && <p className="text-xs text-[#DC2626]">Data wajib diisi</p>}
              </div>
            ) : null}

            {isHpDevice && !isManualEntry && selectedHp && (
              <div className="rounded-md border border-[#E1E7EF] p-3">
                <p className="text-xs text-[#94A3B8]">Nama Barang</p>
                <p className="text-sm font-semibold text-[#0F1729] mt-0.5">{selectedLabel}</p>
              </div>
            )}

            {(!isHpDevice || isManualEntry) && (
              <div className="space-y-3">
                {isHpDevice && (
                  <button
                    type="button"
                    onClick={() => { setIsManualEntry(false); setMerekManual(''); setNamaItemManual(''); setBasisNilaiManual('') }}
                    className="text-xs font-semibold text-[#023DFF] hover:underline"
                  >
                    ← Cari dari katalog
                  </button>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F1729]">Merek<span className="text-[#DC2626]">*</span></label>
                  <input
                    value={merekManual}
                    onChange={e => setMerekManual(e.target.value)}
                    placeholder="Contoh: Samsung"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none transition-colors ${submitAttempted && !merekManual.trim() ? 'border-[#DC2626]' : 'border-[#CBD5E1] focus:border-[#023DFF]'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F1729]">Nama Item<span className="text-[#DC2626]">*</span></label>
                  <input
                    value={namaItemManual}
                    onChange={e => setNamaItemManual(e.target.value)}
                    placeholder="Masukkan Nama Item"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none transition-colors ${submitAttempted && !namaItemManual.trim() ? 'border-[#DC2626]' : 'border-[#CBD5E1] focus:border-[#023DFF]'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F1729]">Basis Nilai Taksiran</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#65758B]">Rp</span>
                    <input
                      value={basisNilaiManual}
                      onChange={e => setBasisNilaiManual(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none transition-colors font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Potongan Nilai ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-4">
            <p className="text-sm font-bold text-[#0F1729]">Potongan Nilai</p>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0F1729]">Kelengkapan</p>
              <p className="text-xs text-[#65758B]">Cek kelengkapan aksesoris bawaan barang</p>
            </div>
            <DefectRow label="Tidak Ada Box Ori / Charger Ori" checked={boxChargerOri} onChange={setBoxChargerOri} />

            <div className="h-px bg-[#F1F5F9]" />

            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0F1729]">Pengecekan LCD</p>
              <p className="text-xs text-[#65758B]">Cek kondisi layar barang</p>
            </div>
            <DefectPickRow
              label="LCD Minus"
              options={['Ringan', 'Parah']}
              optionDescriptions={['Retak Ringan, Shadow Tipis, Deadpixel, Whitespot', 'Retak Parah, Shadow Pekat, LCD Non Ori']}
              checked={lcdMinusChecked}
              value={lcdMinus}
              onToggleChecked={setLcdMinusChecked}
              onPick={setLcdMinus}
              error={submitAttempted && lcdMinusChecked && lcdMinus === null}
            />

            <div className="h-px bg-[#F1F5F9]" />

            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0F1729]">Pengecekan Body</p>
              <p className="text-xs text-[#65758B]">Cek kondisi fisik luar barang</p>
            </div>
            <div className="space-y-2">
              <DefectPickRow
                label="Body Lecet/Jamur/Gompal"
                options={['Ringan', 'Parah']}
                optionDescriptions={['Lecet Pemakaian, Jamur 1/2 Body, Gompal Max 1 Titik', 'Lecet Parah, Jamur Full Body, Gompal >1 Titik']}
                checked={bodyLecetChecked}
                value={bodyLecet}
                onToggleChecked={setBodyLecetChecked}
                onPick={setBodyLecet}
                error={submitAttempted && bodyLecetChecked && bodyLecet === null}
              />
              <DefectPickRow
                label="Kamera/Flash Minus"
                options={['Whitespot / Flash Rusak', 'Minus']}
                checked={kameraChecked}
                value={kamera}
                onToggleChecked={setKameraChecked}
                onPick={setKamera}
                error={submitAttempted && kameraChecked && kamera === null}
              />
              <DefectRow label="Body Bengkok" checked={fisikBengkok !== null} onChange={next => setFisikBengkok(next ? 'Bengkok' : null)} />
              <DefectRow label="Tombol (Volume & Power) Minus" checked={tombol !== null} onChange={next => setTombol(next ? 'Minus' : null)} />
              <DefectRow label="Baterai Gembung" checked={fisikBaterai !== null} onChange={next => setFisikBaterai(next ? 'Gembung' : null)} />
            </div>

            <div className="h-px bg-[#F1F5F9]" />

            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0F1729]">Pengecekan Dalam</p>
              <p className="text-xs text-[#65758B]">Cek kondisi komponen dan fungsi internal barang</p>
            </div>
            <div className="space-y-2">
              <DefectRow label="Garansi Inter" checked={garansiUnit !== null} onChange={next => setGaransiUnit(next ? 'Inter' : null)} />
              <DefectRow label="Sinyal Tidak Aktif" checked={sinyalProvider !== null} onChange={next => setSinyalProvider(next ? 'Tidak Aktif' : null)} />
              <DefectRow label="Speaker/Microphone Rusak" checked={speakerMic !== null} onChange={next => setSpeakerMic(next ? 'Rusak' : null)} />
              <DefectRow label="Fingerprint/Touch ID Rusak" checked={fingerprintTouch !== null} onChange={next => setFingerprintTouch(next ? 'Rusak' : null)} />
            </div>
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
