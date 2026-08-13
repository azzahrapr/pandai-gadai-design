import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import { MOTOR_ITEM_LABELS, parseMotorItemLabel } from '../../data/penaksiranMotorItems'
import type { FLProfile, TaskConfirmation } from '../../types'

const inputCls = 'w-full border rounded-lg px-3 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none transition-colors'
const borderCls = (error: boolean) => error ? 'border-[#DC2626]' : 'border-[#CBD5E1] focus:border-[#023DFF]'

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return <label className="text-xs font-semibold text-[#0F1729] block mb-1.5">{children}{required && <span className="text-[#DC2626]">*</span>}</label>
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#94A3B8]">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 14l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function FLPenaksiranBpkbConfirm() {
  const { milestoneId, itemId } = useParams<{ milestoneId: string; itemId: string }>()
  const navigate = useNavigate()
  const { currentUser, submitTaskConfirmation, getItemConfirmations } = useApp()
  const profile = currentUser!.profile as FLProfile

  const milestone = MILESTONES.find(m => m.id === milestoneId)
  const item = milestone?.checklistItems.find(i => i.id === itemId)

  const target = item?.target ?? 1
  const existing = milestone && item ? getItemConfirmations(currentUser!.id, milestone.id, item.id) : []

  // ── Cek Nomor Rangka ──────────────────────────────────────────
  const [nomorRangka, setNomorRangka] = useState('')
  const [nomorRangkaSubmitted, setNomorRangkaSubmitted] = useState(false)

  // ── Tipe Item ─────────────────────────────────────────────────
  const [sumberReferensi, setSumberReferensi] = useState<'Internal' | 'Eksternal'>('Internal')
  const isEksternal = sumberReferensi === 'Eksternal'
  const [selectedMotorLabel, setSelectedMotorLabel] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [merekManual, setMerekManual] = useState('')
  const [tipeModelManual, setTipeModelManual] = useState('')
  const [tahunManual, setTahunManual] = useState('')
  const [basisManual, setBasisManual] = useState('')
  const [merekFromSearch, setMerekFromSearch] = useState('')
  const [modelFromSearch, setModelFromSearch] = useState('')
  const [tahunFromSearch, setTahunFromSearch] = useState('')
  const [basisFromSearch, setBasisFromSearch] = useState('')

  const selectedMotor = selectedMotorLabel ? parseMotorItemLabel(selectedMotorLabel) : null
  useEffect(() => {
    if (!selectedMotor) return
    setMerekFromSearch(selectedMotor.merek)
    setModelFromSearch(selectedMotor.model)
    setTahunFromSearch(selectedMotor.tahun)
  }, [selectedMotorLabel]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredLabels = searchQuery.trim()
    ? MOTOR_ITEM_LABELS.filter(l => l.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 8)
    : MOTOR_ITEM_LABELS.slice(0, 8)

  // ── Kelengkapan & Info Akses ──────────────────────────────────
  const [kepemilikan, setKepemilikan] = useState<'Diri Sendiri' | 'Orang Lain'>('Diri Sendiri')
  const [nomorStnk, setNomorStnk] = useState('')
  const [masaBerlakuStnk, setMasaBerlakuStnk] = useState('')
  const [nomorMesin, setNomorMesin] = useState('')
  const [nomorBpkb, setNomorBpkb] = useState('')

  // ── Pengecekan Luar ───────────────────────────────────────────
  const [warnaKendaraan, setWarnaKendaraan] = useState('')
  const [nomorPlat, setNomorPlat] = useState('')

  const [refleksi, setRefleksi] = useState('')
  // Optional — a Nomor SBG reference gives the kanit a way to cross-check this
  // submission directly against the real Pandai Gadai system when reviewing, but doesn't
  // block submission the way it does for SOP Administrasi/Packing (see FLTaskConfirm.tsx's
  // required version).
  const [nomorSbg, setNomorSbg] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [justSubmittedCount, setJustSubmittedCount] = useState<number | null>(null)

  const isItemCheckComplete = nomorRangkaSubmitted
  const isTipeItemComplete = isEksternal
    ? merekManual.trim().length > 0 && tipeModelManual.trim().length > 0 && tahunManual.trim().length > 0 && basisManual.trim().length > 0
    : selectedMotor !== null && merekFromSearch.trim().length > 0 && modelFromSearch.trim().length > 0 && tahunFromSearch.trim().length > 0 && basisFromSearch.trim().length > 0
  const isKelengkapanComplete = nomorStnk.trim().length > 0 && masaBerlakuStnk.trim().length > 0 && nomorMesin.trim().length > 0 && nomorBpkb.trim().length > 0
  const isPengecekanLuarComplete = warnaKendaraan.trim().length > 0 && nomorPlat.trim().length > 0
  const canSubmit = isItemCheckComplete && isTipeItemComplete && isKelengkapanComplete && isPengecekanLuarComplete && refleksi.trim().length > 0

  function resetForm() {
    setNomorRangka(''); setNomorRangkaSubmitted(false)
    setSumberReferensi('Internal')
    setSelectedMotorLabel(null); setSearchQuery('')
    setMerekManual(''); setTipeModelManual(''); setTahunManual(''); setBasisManual('')
    setMerekFromSearch(''); setModelFromSearch(''); setTahunFromSearch(''); setBasisFromSearch('')
    setKepemilikan('Diri Sendiri'); setNomorStnk(''); setMasaBerlakuStnk(''); setNomorMesin(''); setNomorBpkb('')
    setWarnaKendaraan(''); setNomorPlat('')
    setRefleksi('')
    setNomorSbg('')
    setSubmitAttempted(false)
  }

  function buildSummary(): string {
    const merek = isEksternal ? merekManual : merekFromSearch
    const model = isEksternal ? tipeModelManual : modelFromSearch
    const tahun = isEksternal ? tahunManual : tahunFromSearch
    const basis = isEksternal ? basisManual : basisFromSearch
    return [
      `Tipe Item: ${merek.toUpperCase()} ${model.toUpperCase()} ${tahun}${basis ? ` (Basis Nilai: Rp ${basis})` : ''}`,
      `Kepemilikan: ${kepemilikan}`,
      `Dokumen: STNK ${nomorStnk} (berlaku s/d ${masaBerlakuStnk || '-'}), Mesin ${nomorMesin}, BPKB ${nomorBpkb}, Rangka ${nomorRangka}`,
      `Pengecekan Luar: Warna ${warnaKendaraan}, Plat ${nomorPlat}`,
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
      nomorSbg: nomorSbg.trim() || undefined,
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
          {/* ── Cek Nomor Rangka ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-3">
            <p className="text-sm font-bold text-[#0F1729]">Cek Nomor Rangka</p>
            <div>
              <FieldLabel required>Cek Nomor Rangka</FieldLabel>
              <div className="flex gap-2">
                <input
                  value={nomorRangka}
                  onChange={e => setNomorRangka(e.target.value)}
                  placeholder="Masukkan Nomor Rangka"
                  className={`${inputCls} ${borderCls(submitAttempted && !isItemCheckComplete)}`}
                />
                <button
                  type="button"
                  onClick={() => nomorRangka.trim().length > 0 && setNomorRangkaSubmitted(true)}
                  className="h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#023DFF] hover:bg-[#001CDB] transition-colors flex-shrink-0"
                >
                  Cek Nomor
                </button>
              </div>
              {submitAttempted && !isItemCheckComplete && <p className="text-xs text-[#DC2626] mt-1">Data wajib diisi</p>}
            </div>
            {nomorRangkaSubmitted && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div><FieldLabel>Item Pernah Digadai?</FieldLabel><div className={`${inputCls} bg-[#F8FAFC] border-[#E1E7EF]`}>Belum pernah digadai</div></div>
                <div><FieldLabel>Tgl Gadai Sebelumnya</FieldLabel><div className={`${inputCls} bg-[#F8FAFC] border-[#E1E7EF]`}>-</div></div>
                <div><FieldLabel>Nilai Taksiran Sebelumnya</FieldLabel><div className={`${inputCls} bg-[#F8FAFC] border-[#E1E7EF]`}>-</div></div>
                <div><FieldLabel>HPS Sebelumnya</FieldLabel><div className={`${inputCls} bg-[#F8FAFC] border-[#E1E7EF]`}>-</div></div>
              </div>
            )}
          </div>

          {/* ── Tipe Item ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-3">
            <p className="text-sm font-bold text-[#0F1729]">Tipe Item</p>
            <div>
              <FieldLabel>Sumber Referensi Harga</FieldLabel>
              <select
                value={sumberReferensi}
                onChange={e => setSumberReferensi(e.target.value as 'Internal' | 'Eksternal')}
                className={`${inputCls} border-[#CBD5E1] focus:border-[#023DFF] bg-white`}
              >
                <option value="Internal">Internal</option>
                <option value="Eksternal">Eksternal</option>
              </select>
            </div>

            {isEksternal ? (
              <>
                <div><FieldLabel required>Merek</FieldLabel><input value={merekManual} onChange={e => setMerekManual(e.target.value)} placeholder="Masukkan merek motor" className={`${inputCls} ${borderCls(submitAttempted && !merekManual.trim())}`} /></div>
                <div><FieldLabel required>Tipe/Model</FieldLabel><input value={tipeModelManual} onChange={e => setTipeModelManual(e.target.value)} placeholder="Masukkan tipe motor" className={`${inputCls} ${borderCls(submitAttempted && !tipeModelManual.trim())}`} /></div>
                <div><FieldLabel required>Tahun Kendaraan</FieldLabel><input value={tahunManual} onChange={e => setTahunManual(e.target.value)} placeholder="2022" className={`${inputCls} ${borderCls(submitAttempted && !tahunManual.trim())} font-mono tabular-nums`} /></div>
                <div>
                  <FieldLabel required>Basis Nilai Taksiran</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#65758B]">Rp</span>
                    <input value={basisManual} onChange={e => setBasisManual(e.target.value.replace(/\D/g, ''))} placeholder="0" className={`${inputCls} ${borderCls(submitAttempted && !basisManual.trim())} pl-9 font-mono tabular-nums`} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <FieldLabel>Pilih Item</FieldLabel>
                  <div className={`relative flex items-center border rounded-lg px-3 ${borderCls(submitAttempted && !isTipeItemComplete)}`}>
                    <SearchIcon />
                    <input
                      value={selectedMotorLabel ?? searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setSelectedMotorLabel(null); setSearchOpen(true) }}
                      onFocus={() => setSearchOpen(true)}
                      onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                      placeholder="Cari merek, tipe, atau tahun..."
                      className="w-full pl-2.5 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none bg-transparent"
                    />
                  </div>
                  {searchOpen && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E1E7EF] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredLabels.map(label => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => { setSelectedMotorLabel(label); setSearchQuery(''); setSearchOpen(false) }}
                          className="w-full text-left px-3 py-2.5 text-sm text-[#0F1729] hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-0"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {submitAttempted && !isTipeItemComplete && <p className="text-xs text-[#DC2626] mt-1">Data wajib diisi</p>}
                </div>
                {selectedMotor && (
                  <>
                    <div><FieldLabel required>Merek</FieldLabel><input value={merekFromSearch} onChange={e => setMerekFromSearch(e.target.value)} className={`${inputCls} ${borderCls(submitAttempted && !merekFromSearch.trim())}`} /></div>
                    <div><FieldLabel required>Tipe/Model</FieldLabel><input value={modelFromSearch} onChange={e => setModelFromSearch(e.target.value)} className={`${inputCls} ${borderCls(submitAttempted && !modelFromSearch.trim())}`} /></div>
                    <div><FieldLabel required>Tahun Kendaraan</FieldLabel><input value={tahunFromSearch} onChange={e => setTahunFromSearch(e.target.value)} className={`${inputCls} ${borderCls(submitAttempted && !tahunFromSearch.trim())} font-mono tabular-nums`} /></div>
                    <div>
                      <FieldLabel required>Basis Nilai Taksiran</FieldLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#65758B]">Rp</span>
                        <input value={basisFromSearch} onChange={e => setBasisFromSearch(e.target.value.replace(/\D/g, ''))} placeholder="0" className={`${inputCls} ${borderCls(submitAttempted && !basisFromSearch.trim())} pl-9 font-mono tabular-nums`} />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* ── Kelengkapan & Info Akses ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-3">
            <p className="text-sm font-bold text-[#0F1729]">Kelengkapan & Info Akses</p>
            <div>
              <FieldLabel>Kepemilikan</FieldLabel>
              <div className="flex gap-2">
                {(['Diri Sendiri', 'Orang Lain'] as const).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setKepemilikan(opt)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${kepemilikan === opt ? 'border-[#023DFF] bg-[#E5F2FF] text-[#023DFF]' : 'border-[#E1E7EF] text-[#0F1729] hover:border-[#94A3B8]'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${kepemilikan === opt ? 'border-[#023DFF]' : 'border-[#CBD5E1]'}`}>
                      {kepemilikan === opt && <span className="w-1.5 h-1.5 rounded-full bg-[#023DFF]" />}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div><FieldLabel required>Nomor STNK</FieldLabel><input value={nomorStnk} onChange={e => setNomorStnk(e.target.value)} placeholder="Masukkan Nomor STNK" className={`${inputCls} ${borderCls(submitAttempted && !nomorStnk.trim())}`} /></div>
            <div>
              <FieldLabel required>Masa Berlaku STNK</FieldLabel>
              <input type="date" value={masaBerlakuStnk} onChange={e => setMasaBerlakuStnk(e.target.value)} className={`${inputCls} ${borderCls(submitAttempted && !masaBerlakuStnk.trim())}`} />
            </div>
            <div><FieldLabel required>Nomor Mesin</FieldLabel><input value={nomorMesin} onChange={e => setNomorMesin(e.target.value)} placeholder="Masukkan Nomor Mesin" className={`${inputCls} ${borderCls(submitAttempted && !nomorMesin.trim())}`} /></div>
            <div><FieldLabel required>Nomor BPKB</FieldLabel><input value={nomorBpkb} onChange={e => setNomorBpkb(e.target.value)} placeholder="Masukkan Nomor BPKB" className={`${inputCls} ${borderCls(submitAttempted && !nomorBpkb.trim())}`} /></div>
          </div>

          {/* ── Pengecekan Luar ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 space-y-3">
            <p className="text-sm font-bold text-[#0F1729]">Pengecekan Luar</p>
            <p className="text-xs text-[#65758B] -mt-2">Identitas Visual Kendaraan</p>
            <div className="grid grid-cols-2 gap-3">
              <div><FieldLabel required>Warna Kendaraan</FieldLabel><input value={warnaKendaraan} onChange={e => setWarnaKendaraan(e.target.value)} placeholder="Hitam" className={`${inputCls} ${borderCls(submitAttempted && !warnaKendaraan.trim())}`} /></div>
              <div><FieldLabel required>Nomor Plat</FieldLabel><input value={nomorPlat} onChange={e => setNomorPlat(e.target.value)} placeholder="B 8823 SST" className={`${inputCls} ${borderCls(submitAttempted && !nomorPlat.trim())}`} /></div>
            </div>
          </div>

          {/* ── Nomor SBG (opsional) ── */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5">
            <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide block mb-2">
              Nomor SBG <span className="normal-case font-normal text-[#94A3B8]">(opsional)</span>
            </label>
            <input
              type="text"
              value={nomorSbg}
              onChange={e => setNomorSbg(e.target.value)}
              placeholder="Contoh: SBG-2026-00123"
              className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-4 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none transition-colors"
            />
            <p className="text-xs text-[#94A3B8] mt-1.5">Tambahkan sebagai referensi apabila transaksi ini nyata dan sudah tercatat di Intools.</p>
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
              className="w-full text-sm text-[#0F1729] placeholder-[#CBD5E1] resize-none outline-none"
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
