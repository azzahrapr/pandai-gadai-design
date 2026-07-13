import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { FLProfile, PenaksiranRecord } from '../../types'

const BARANG_TYPES = ['Emas 24K', 'Emas 18K', 'Emas 14K', 'Elektronik', 'Kendaraan', 'Lainnya']

export default function FLPenaksiran() {
  const { currentUser, addPenaksiran, getFlPenaksiran } = useApp()
  const profile = currentUser!.profile as FLProfile
  const records = getFlPenaksiran(currentUser!.id)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ barangType: 'Emas 24K', barangDescription: '', flEstimate: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!form.barangDescription || !form.flEstimate) return
    const record: PenaksiranRecord = {
      id: `pk-${currentUser!.id}-${records.length + 1}`,
      day: profile.currentDay,
      date: '2026-07-08',
      flId: currentUser!.id,
      barangType: form.barangType,
      barangDescription: form.barangDescription,
      flEstimate: parseInt(form.flEstimate.replace(/\D/g, '')),
    }
    addPenaksiran(record)
    setSubmitted(true)
    setShowForm(false)
    setForm({ barangType: 'Emas 24K', barangDescription: '', flEstimate: '' })
  }

  const scoredRecords = records.filter(r => r.accuracy !== undefined)
  const avgAccuracy = scoredRecords.length > 0
    ? Math.round(scoredRecords.reduce((s, r) => s + (r.accuracy ?? 0), 0) / scoredRecords.length * 10) / 10
    : null

  const avgKanitScore = records.filter(r => r.kanitScore !== undefined).length > 0
    ? Math.round(records.filter(r => r.kanitScore !== undefined).reduce((s, r) => s + (r.kanitScore ?? 0), 0) / records.filter(r => r.kanitScore !== undefined).length)
    : null

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Penaksiran</h1>
          <p className="text-[#65758B] text-sm mt-1">Catat hasil penilaian barang yang kamu lakukan selama OJT.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSubmitted(false) }}
          className="h-11 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Tambah Sesi
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">Total Sesi</p>
          <p className="text-3xl font-bold text-[#0F1729]">{records.length}</p>
          <p className="text-xs text-[#65758B] mt-1">{records.filter(r => r.intoolsValue === undefined).length} menunggu verifikasi</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">Rata-rata Akurasi</p>
          <p className="text-3xl font-bold text-[#023DFF]">{avgAccuracy !== null ? `${avgAccuracy}%` : '—'}</p>
          <p className="text-xs text-[#65758B] mt-1">vs nilai Intools</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
          <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">Avg Score Kanit</p>
          <p className={`text-3xl font-bold ${avgKanitScore !== null ? (avgKanitScore >= 85 ? 'text-[#16A34A]' : avgKanitScore >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]') : 'text-[#94A3B8]'}`}>
            {avgKanitScore ?? '—'}
          </p>
          <p className="text-xs text-[#65758B] mt-1">{records.filter(r => r.kanitScore !== undefined).length} sesi dinilai</p>
        </div>
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 flex items-center gap-3 mb-6">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-semibold text-[#15803D]">Penaksiran berhasil dicatat!</p>
            <p className="text-sm text-[#15803D]/80">Menunggu verifikasi nilai Intools dari Kanit.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Table (left 2/3) */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-[#E1E7EF]">
            <div className="p-5 border-b border-[#E1E7EF]">
              <h3 className="font-semibold text-[#0F1729]">Riwayat Penaksiran</h3>
            </div>
            {records.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-4xl">⚖️</span>
                <p className="text-[#65758B] mt-3 font-medium">Belum ada sesi penaksiran</p>
                <p className="text-[#94A3B8] text-sm mt-1">Tambahkan sesi penaksiran pertama kamu.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 h-9 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
                >
                  + Tambah Sesi
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E1E7EF]">
                    <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-5 text-left">Barang</th>
                    <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-3 text-left">Taksiran FL</th>
                    <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-3 text-left">Nilai Intools</th>
                    <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-3 text-left">Akurasi</th>
                    <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-5 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice().reverse().map(r => (
                    <tr key={r.id} className="border-b border-[#E1E7EF] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                            r.barangType.startsWith('Emas') ? 'bg-[#FEFDEA] text-[#B27202]' : 'bg-[#F1F5F9] text-[#65758B]'
                          }`}>{r.barangType}</span>
                          <div>
                            <p className="text-sm font-semibold text-[#0F1729]">{r.barangDescription}</p>
                            <p className="text-xs text-[#94A3B8]">Hari {r.day}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-sm text-[#0F1729]">{formatRp(r.flEstimate)}</td>
                      <td className="py-4 px-3 text-sm">
                        {r.intoolsValue ? (
                          <span className="text-[#023DFF] font-medium">{formatRp(r.intoolsValue)}</span>
                        ) : (
                          <span className="text-[#94A3B8] text-xs">Menunggu...</span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        {r.accuracy !== undefined ? (
                          <span className={`text-sm font-semibold ${r.accuracy >= 95 ? 'text-[#16A34A]' : r.accuracy >= 90 ? 'text-[#B27202]' : 'text-[#DC2626]'}`}>
                            {r.accuracy.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-[#94A3B8] text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {r.kanitScore !== undefined ? (
                          <span className={`text-base font-bold ${r.kanitScore >= 85 ? 'text-[#16A34A]' : r.kanitScore >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'}`}>{r.kanitScore}</span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: form or info */}
        <div>
          {showForm ? (
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#0F1729]">Tambah Sesi Baru</h3>
                <button onClick={() => setShowForm(false)} className="text-[#94A3B8] hover:text-[#65758B]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide block mb-2">Jenis Barang</label>
                  <div className="flex flex-wrap gap-2">
                    {BARANG_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setForm(f => ({ ...f, barangType: t }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.barangType === t ? 'bg-[#023DFF] text-white' : 'bg-[#F1F5F9] text-[#65758B] hover:bg-[#E1E7EF]'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide block mb-2">Deskripsi Barang</label>
                  <input
                    type="text"
                    value={form.barangDescription}
                    onChange={e => setForm(f => ({ ...f, barangDescription: e.target.value }))}
                    placeholder="Contoh: Kalung emas 10 gram"
                    className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide block mb-2">Estimasi Nilai Taksiran (Rp)</label>
                  <input
                    type="number"
                    value={form.flEstimate}
                    onChange={e => setForm(f => ({ ...f, flEstimate: e.target.value }))}
                    placeholder="Contoh: 9000000"
                    className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
                <div className="bg-[#E5F2FF] rounded-lg p-3">
                  <p className="text-xs text-[#001CDB]">💡 Pastikan kamu sudah melakukan penaksiran di Intools dan catat hasilnya. Kanit akan memasukkan nilai Intools untuk verifikasi.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowForm(false)} className="flex-1 h-9 rounded-lg border border-[#CBD5E1] text-sm font-semibold text-[#65758B] hover:border-[#94A3B8]">
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.barangDescription || !form.flEstimate}
                    className={`flex-1 h-9 rounded-lg text-sm font-semibold text-white transition-all ${form.barangDescription && form.flEstimate ? 'bg-[#023DFF] hover:bg-[#001CDB]' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E1E7EF] p-5">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">Tentang Penaksiran</p>
              <p className="text-sm text-[#65758B] leading-relaxed mb-4">Sesi penaksiran adalah latihan menilai barang gadai. Akurasi dihitung dari selisih estimasi kamu vs nilai Intools resmi.</p>
              <div className="space-y-2 text-xs text-[#65758B]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />
                  <span>≥95% akurasi = Sangat baik</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B27202] flex-shrink-0" />
                  <span>90–94% = Baik</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626] flex-shrink-0" />
                  <span>&lt;90% = Perlu latihan</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatRp(val: number) {
  return `Rp ${(val / 1_000_000).toFixed(1)}jt`
}
