import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { FLProfile, DailyChecklist } from '../../types'

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID').format(Math.round(n))
}

// ─── Elektronik form ──────────────────────────────────────────────────────────

type ElektronikForm = {
  jenisBarang: string
  merekModel: string
  serialImei: string
  kondisi: string
  kelengkapan: string[]
  nilaiPasar: string
}

const JENIS_OPTIONS = ['HP', 'Laptop', 'Kamera', 'Game Console']
const KONDISI_OPTIONS = ['Baik', 'Cukup', 'Kurang']
const KELENGKAPAN_OPTIONS = ['Box', 'Charger / Adaptor', 'Aksesori Lain']
const PERSEN_ELEKTRONIK = 0.85

function ElektronikSim({ onSubmit, onCancel }: { onSubmit: (summary: string, items: string[]) => void; onCancel: () => void }) {
  const [form, setForm] = useState<ElektronikForm>({
    jenisBarang: '', merekModel: '', serialImei: '', kondisi: '', kelengkapan: [], nilaiPasar: '',
  })

  function setField<K extends keyof ElektronikForm>(k: K, v: ElektronikForm[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }
  function toggleKelengkapan(val: string) {
    setForm(f => ({
      ...f,
      kelengkapan: f.kelengkapan.includes(val) ? f.kelengkapan.filter(x => x !== val) : [...f.kelengkapan, val],
    }))
  }

  const nilaiPasarNum = parseFloat(form.nilaiPasar.replace(/\D/g, '')) || 0
  const nilaiTaksiran = nilaiPasarNum * PERSEN_ELEKTRONIK

  const canSubmit = form.jenisBarang && form.merekModel && form.kondisi && form.nilaiPasar

  function handleSubmit() {
    const summary = [
      `Jenis: ${form.jenisBarang}`,
      `Merek/Model: ${form.merekModel}`,
      form.serialImei ? `IMEI/S.N.: ${form.serialImei}` : null,
      `Kondisi: ${form.kondisi}`,
      form.kelengkapan.length ? `Kelengkapan: ${form.kelengkapan.join(', ')}` : 'Tanpa kelengkapan',
      `Nilai Pasar: Rp ${fmt(nilaiPasarNum)}`,
      `Nilai Taksiran (${PERSEN_ELEKTRONIK * 100}%): Rp ${fmt(nilaiTaksiran)}`,
    ].filter(Boolean).join(' · ')

    const completedItems = [
      form.jenisBarang ? 'pne-c1' : null,
      form.kondisi ? 'pne-c2' : null,
      'pne-c3',
      'pne-c4',
    ].filter(Boolean) as string[]

    onSubmit(summary, completedItems)
  }

  return (
    <div className="space-y-6">
      <Field label="Jenis Barang" required>
        <div className="flex gap-2 flex-wrap">
          {JENIS_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setField('jenisBarang', opt)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                form.jenisBarang === opt ? 'bg-[#023DFF] border-[#023DFF] text-white' : 'bg-white border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF]'
              }`}>{opt}</button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Merek & Model" required>
          <input value={form.merekModel} onChange={e => setField('merekModel', e.target.value)}
            placeholder={form.jenisBarang === 'HP' ? 'Samsung Galaxy S24' : form.jenisBarang === 'Laptop' ? 'MacBook Air M2' : 'Contoh: Canon EOS R50'}
            className={inputCls} />
        </Field>
        <Field label={form.jenisBarang === 'Laptop' ? 'Serial Number' : 'IMEI / Serial Number'}>
          <input value={form.serialImei} onChange={e => setField('serialImei', e.target.value)}
            placeholder="Opsional"
            className={`${inputCls} font-mono`} />
        </Field>
      </div>

      <Field label="Kondisi Fisik & Fungsional" required>
        <div className="flex gap-2">
          {KONDISI_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setField('kondisi', opt)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                form.kondisi === opt ? 'bg-[#023DFF] border-[#023DFF] text-white' : 'bg-white border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF]'
              }`}>{opt}</button>
          ))}
        </div>
      </Field>

      <Field label="Kelengkapan">
        <div className="flex gap-3 flex-wrap">
          {KELENGKAPAN_OPTIONS.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => toggleKelengkapan(opt)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  form.kelengkapan.includes(opt) ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1]'
                }`}>
                {form.kelengkapan.includes(opt) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <span className="text-sm text-[#0F1729]">{opt}</span>
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 items-end">
        <Field label="Nilai Pasar Acuan (Intools)" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#65758B]">Rp</span>
            <input value={form.nilaiPasar} onChange={e => setField('nilaiPasar', e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className={`${inputCls} pl-10 font-mono tabular-nums`} />
          </div>
        </Field>
        <Field label={`Nilai Taksiran (${PERSEN_ELEKTRONIK * 100}%)`}>
          <div className={`${inputCls} bg-[#F8FAFC] text-[#0F1729] font-mono tabular-nums font-semibold`}>
            {nilaiPasarNum > 0 ? `Rp ${fmt(nilaiTaksiran)}` : '—'}
          </div>
        </Field>
      </div>

      <Actions canSubmit={!!canSubmit} onSubmit={handleSubmit} onCancel={onCancel} />
    </div>
  )
}

// ─── Emas form ────────────────────────────────────────────────────────────────

type EmasForm = {
  jenisEmas: string
  kadar: string
  beratKotor: string
  beratBersih: string
  kondisi: string
  adaSertifikat: boolean
  hargaPerGram: string
}

const KADAR_OPTIONS = [{ label: '24K (999)', pct: 1 }, { label: '18K (750)', pct: 0.75 }, { label: '9K (375)', pct: 0.375 }]

function EmasSim({ onSubmit, onCancel }: { onSubmit: (summary: string, items: string[]) => void; onCancel: () => void }) {
  const [form, setForm] = useState<EmasForm>({
    jenisEmas: '', kadar: '', beratKotor: '', beratBersih: '', kondisi: '', adaSertifikat: false, hargaPerGram: '',
  })

  function setField<K extends keyof EmasForm>(k: K, v: EmasForm[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  const beratBersihNum = parseFloat(form.beratBersih) || 0
  const hargaNum = parseFloat(form.hargaPerGram.replace(/\D/g, '')) || 0
  const persen = form.jenisEmas === 'Emas Batang' ? 0.9 : 0.85
  const nilaiTaksiran = beratBersihNum * hargaNum * persen

  const canSubmit = form.jenisEmas && form.kadar && form.beratBersih && form.kondisi && form.hargaPerGram

  function handleSubmit() {
    const summary = [
      `Jenis: ${form.jenisEmas}`,
      `Kadar: ${form.kadar}`,
      `Berat: ${form.beratKotor}g kotor / ${form.beratBersih}g bersih`,
      `Kondisi: ${form.kondisi}`,
      form.adaSertifikat ? 'Sertifikat: Ada' : 'Sertifikat: Tidak ada',
      `Harga/gram: Rp ${fmt(hargaNum)}`,
      `Nilai Taksiran (${persen * 100}%): Rp ${fmt(nilaiTaksiran)}`,
    ].join(' · ')

    onSubmit(summary, ['pna-c1', 'pna-c2', 'pna-c3', form.kondisi ? 'pna-c4' : '', 'pna-c5'].filter(Boolean))
  }

  return (
    <div className="space-y-6">
      <Field label="Jenis Emas" required>
        <div className="flex gap-2">
          {['Perhiasan', 'Emas Batang'].map(opt => (
            <button key={opt} onClick={() => setField('jenisEmas', opt)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                form.jenisEmas === opt ? 'bg-[#023DFF] border-[#023DFF] text-white' : 'bg-white border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF]'
              }`}>{opt}</button>
          ))}
        </div>
      </Field>

      <Field label="Kadar" required>
        <div className="flex gap-2 flex-wrap">
          {KADAR_OPTIONS.map(opt => (
            <button key={opt.label} onClick={() => setField('kadar', opt.label)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                form.kadar === opt.label ? 'bg-[#023DFF] border-[#023DFF] text-white' : 'bg-white border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF]'
              }`}>{opt.label}</button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Berat Kotor (gram)">
          <input value={form.beratKotor} onChange={e => setField('beratKotor', e.target.value)}
            type="number" min="0" step="0.01" placeholder="0.00"
            className={`${inputCls} font-mono tabular-nums`} />
        </Field>
        <Field label="Berat Bersih / Estimasi (gram)" required>
          <input value={form.beratBersih} onChange={e => setField('beratBersih', e.target.value)}
            type="number" min="0" step="0.01" placeholder="0.00"
            className={`${inputCls} font-mono tabular-nums`} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        <Field label="Kondisi" required>
          <div className="flex gap-2">
            {['Baik', 'Cukup'].map(opt => (
              <button key={opt} onClick={() => setField('kondisi', opt)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  form.kondisi === opt ? 'bg-[#023DFF] border-[#023DFF] text-white' : 'bg-white border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF]'
                }`}>{opt}</button>
            ))}
          </div>
        </Field>
        {form.jenisEmas === 'Emas Batang' && (
          <Field label="Sertifikat Antam/UBS">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setField('adaSertifikat', !form.adaSertifikat)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  form.adaSertifikat ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1]'
                }`}>
                {form.adaSertifikat && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <span className="text-sm text-[#0F1729]">Sertifikat ada</span>
            </label>
          </Field>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <Field label="Harga per Gram (Intools)" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#65758B]">Rp</span>
            <input value={form.hargaPerGram} onChange={e => setField('hargaPerGram', e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className={`${inputCls} pl-10 font-mono tabular-nums`} />
          </div>
        </Field>
        <Field label={`Nilai Taksiran (${persen * 100}%)`}>
          <div className={`${inputCls} bg-[#F8FAFC] font-mono tabular-nums font-semibold text-[#0F1729]`}>
            {nilaiTaksiran > 0 ? `Rp ${fmt(nilaiTaksiran)}` : '—'}
          </div>
        </Field>
      </div>

      <Actions canSubmit={!!canSubmit} onSubmit={handleSubmit} onCancel={onCancel} />
    </div>
  )
}

// ─── BPKB form ────────────────────────────────────────────────────────────────

type BpkbForm = {
  jenisKendaraan: string
  merek: string
  tipe: string
  tahun: string
  nopol: string
  kondisi: string
  dokumen: string[]
  nilaiPasar: string
  catatan: string
}

const DOKUMEN_OPTIONS = ['BPKB Asli', 'STNK Aktif', 'KTP Pemilik']
const PERSEN_BPKB = 0.75

function BpkbSim({ onSubmit, onCancel }: { onSubmit: (summary: string, items: string[]) => void; onCancel: () => void }) {
  const [form, setForm] = useState<BpkbForm>({
    jenisKendaraan: '', merek: '', tipe: '', tahun: '', nopol: '', kondisi: '', dokumen: [], nilaiPasar: '', catatan: '',
  })

  function setField<K extends keyof BpkbForm>(k: K, v: BpkbForm[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }
  function toggleDokumen(val: string) {
    setForm(f => ({
      ...f,
      dokumen: f.dokumen.includes(val) ? f.dokumen.filter(x => x !== val) : [...f.dokumen, val],
    }))
  }

  const nilaiPasarNum = parseFloat(form.nilaiPasar.replace(/\D/g, '')) || 0
  const nilaiTaksiran = nilaiPasarNum * PERSEN_BPKB

  const canSubmit = form.jenisKendaraan && form.merek && form.tahun && form.kondisi && form.nilaiPasar

  function handleSubmit() {
    const summary = [
      `Jenis: ${form.jenisKendaraan}`,
      `Kendaraan: ${form.merek}${form.tipe ? ` ${form.tipe}` : ''} ${form.tahun}`,
      form.nopol ? `Nopol: ${form.nopol}` : null,
      `Kondisi: ${form.kondisi}`,
      `Dokumen: ${form.dokumen.length ? form.dokumen.join(', ') : 'Tidak lengkap'}`,
      `Nilai Pasar: Rp ${fmt(nilaiPasarNum)}`,
      `Nilai Taksiran (${PERSEN_BPKB * 100}%): Rp ${fmt(nilaiTaksiran)}`,
      form.catatan ? `Catatan: ${form.catatan}` : null,
    ].filter(Boolean).join(' · ')

    const completedItems = [
      'pnb-c1',
      form.merek && form.tahun ? 'pnb-c2' : null,
      'pnb-c3',
      form.dokumen.length >= 2 ? 'pnb-c4' : null,
      'pnb-c5',
    ].filter(Boolean) as string[]

    onSubmit(summary, completedItems)
  }

  return (
    <div className="space-y-6">
      <Field label="Jenis Kendaraan" required>
        <div className="flex gap-2">
          {['Motor', 'Mobil'].map(opt => (
            <button key={opt} onClick={() => setField('jenisKendaraan', opt)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                form.jenisKendaraan === opt ? 'bg-[#023DFF] border-[#023DFF] text-white' : 'bg-white border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF]'
              }`}>{opt}</button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Merek" required>
          <input value={form.merek} onChange={e => setField('merek', e.target.value)}
            placeholder={form.jenisKendaraan === 'Motor' ? 'Honda' : 'Toyota'}
            className={inputCls} />
        </Field>
        <Field label="Tipe / Model">
          <input value={form.tipe} onChange={e => setField('tipe', e.target.value)}
            placeholder={form.jenisKendaraan === 'Motor' ? 'Vario 125' : 'Avanza'}
            className={inputCls} />
        </Field>
        <Field label="Tahun" required>
          <input value={form.tahun} onChange={e => setField('tahun', e.target.value)}
            type="number" min="1990" max="2026" placeholder="2022"
            className={`${inputCls} font-mono tabular-nums`} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nomor Polisi">
          <input value={form.nopol} onChange={e => setField('nopol', e.target.value.toUpperCase())}
            placeholder="B 1234 ABC"
            className={`${inputCls} font-mono tracking-widest uppercase`} />
        </Field>
        <Field label="Kondisi Fisik" required>
          <div className="flex gap-2">
            {['Baik', 'Cukup', 'Kurang'].map(opt => (
              <button key={opt} onClick={() => setField('kondisi', opt)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  form.kondisi === opt ? 'bg-[#023DFF] border-[#023DFF] text-white' : 'bg-white border-[#E1E7EF] text-[#65758B] hover:border-[#023DFF]'
                }`}>{opt}</button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Kelengkapan Dokumen">
        <div className="flex gap-4 flex-wrap">
          {DOKUMEN_OPTIONS.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => toggleDokumen(opt)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  form.dokumen.includes(opt) ? 'bg-[#023DFF] border-[#023DFF]' : 'border-[#CBD5E1]'
                }`}>
                {form.dokumen.includes(opt) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <span className="text-sm text-[#0F1729]">{opt}</span>
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 items-end">
        <Field label="Nilai Pasar Acuan (Intools)" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#65758B]">Rp</span>
            <input value={form.nilaiPasar} onChange={e => setField('nilaiPasar', e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className={`${inputCls} pl-10 font-mono tabular-nums`} />
          </div>
        </Field>
        <Field label={`Nilai Taksiran (${PERSEN_BPKB * 100}%)`}>
          <div className={`${inputCls} bg-[#F8FAFC] font-mono tabular-nums font-semibold text-[#0F1729]`}>
            {nilaiTaksiran > 0 ? `Rp ${fmt(nilaiTaksiran)}` : '—'}
          </div>
        </Field>
      </div>

      <Field label="Catatan Tambahan">
        <textarea value={form.catatan} onChange={e => setField('catatan', e.target.value)}
          rows={2} placeholder="Kondisi khusus, catatan untuk Kanit, dll."
          className={`${inputCls} resize-none leading-relaxed`} />
      </Field>

      <Actions canSubmit={!!canSubmit} onSubmit={handleSubmit} onCancel={onCancel} />
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls = 'w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none focus:border-[#023DFF] transition-colors'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#0F1729]">
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Actions({ canSubmit, onSubmit, onCancel }: { canSubmit: boolean; onSubmit: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#E1E7EF]">
      <button onClick={onCancel}
        className="h-9 px-4 rounded-lg text-sm font-semibold border border-[#E1E7EF] text-[#65758B] hover:border-[#DC2626] hover:text-[#DC2626] transition-colors">
        Batalkan sesi
      </button>
      <button disabled={!canSubmit} onClick={onSubmit}
        className={`h-9 px-6 rounded-lg text-sm font-semibold transition-all ${
          canSubmit ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
        }`}>
        Submit Simulasi
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FLPenaksiranSim() {
  const { milestoneId } = useParams<{ milestoneId: string }>()
  const navigate = useNavigate()
  const { currentUser, submitChecklist, clearSession, activeSession } = useApp()
  const profile = currentUser!.profile as FLProfile

  const milestone = MILESTONES.find(m => m.id === milestoneId)

  const taskId = milestoneId ?? ''
  const taskName = milestone?.name ?? milestoneId ?? ''

  // Redirect guard: if no active session for this milestone, go back
  if (!activeSession || activeSession.milestoneId !== milestoneId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96 text-center">
        <div>
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-[#65758B] text-sm mb-4">Tidak ada sesi aktif untuk modul ini.</p>
          <Link to="/fl/checklist" className="text-sm text-[#023DFF] hover:underline">← Kembali ke Checklist</Link>
        </div>
      </div>
    )
  }

  function handleSubmit(summary: string, completedItemIds: string[]) {
    if (!activeSession) return
    const now = new Date().toISOString()
    const checklist: DailyChecklist = {
      id: activeSession.checklistId,
      day: profile.currentDay,
      date: new Date().toISOString().slice(0, 10),
      flId: currentUser!.id,
      milestoneId: activeSession.milestoneId,
      tasks: [{
        taskId,
        taskName,
        completedItemIds,
        reflection: `[Simulasi] ${summary}`,
        submittedAt: now,
      }],
      status: 'submitted',
      submittedAt: now,
    }
    submitChecklist(checklist)
    clearSession()
    navigate('/fl/checklist')
  }

  function handleCancel() {
    clearSession()
    navigate('/fl/checklist')
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#65758B] mb-6">
        <Link to="/fl/checklist" className="hover:text-[#023DFF] transition-colors">Checklist</Link>
        <span>/</span>
        <span className="text-[#0F1729]">{milestone?.shortName ?? milestoneId}</span>
        <span>/</span>
        <span className="text-[#0F1729]">Simulasi</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Simulasi Gadai</h1>
        <p className="text-[#65758B] text-sm mt-1">{milestone?.name} · Hari ke-{profile.currentDay}</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] p-6">
        {milestoneId === 'penaksiran-elektronik' && (
          <ElektronikSim onSubmit={handleSubmit} onCancel={handleCancel} />
        )}
        {milestoneId === 'penaksiran-emas' && (
          <EmasSim onSubmit={handleSubmit} onCancel={handleCancel} />
        )}
        {milestoneId === 'penaksiran-bpkb' && (
          <BpkbSim onSubmit={handleSubmit} onCancel={handleCancel} />
        )}
        {!['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb'].includes(milestoneId ?? '') && (
          <p className="text-[#94A3B8] text-sm">Form simulasi tidak tersedia untuk modul ini.</p>
        )}
      </div>
    </div>
  )
}
