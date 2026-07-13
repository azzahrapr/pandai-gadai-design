import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { KanitProfile, FLProfile } from '../../types'

export default function KanitPenaksiran() {
  const { currentUser, getFlUsers, getFlPenaksiran, scorePenaksiran } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  const [selectedFlId, setSelectedFlId] = useState<string>(flUsers[0]?.id ?? '')
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [intoolsValue, setIntoolsValue] = useState<string>('')
  const [score, setScore] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [justScored, setJustScored] = useState<string | null>(null)

  const records = getFlPenaksiran(selectedFlId)
  const pending = records.filter(r => r.intoolsValue === undefined)
  const scored = records.filter(r => r.intoolsValue !== undefined)

  const selectedFl = flUsers.find(u => u.id === selectedFlId)

  function handleScore(recordId: string) {
    const iVal = parseInt(intoolsValue.replace(/\D/g, ''))
    const sVal = parseInt(score)
    if (isNaN(iVal) || isNaN(sVal)) return
    scorePenaksiran(recordId, iVal, sVal, note)
    setJustScored(recordId)
    setScoringId(null)
    setIntoolsValue('')
    setScore('')
    setNote('')
  }

  const pendingRecord = pending.find(r => r.id === scoringId)
  const pendingIntools = pendingRecord && intoolsValue
    ? Math.abs(parseInt(intoolsValue) - pendingRecord.flEstimate) / parseInt(intoolsValue) * 100
    : null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Verifikasi Penaksiran</h1>
        <p className="text-[#65758B] text-sm mt-1">Masukkan nilai Intools dan beri penilaian sesi penaksiran peserta.</p>
      </div>

      {/* FL tab selector */}
      <div className="border-b border-[#E1E7EF] mb-6">
        <div className="flex gap-1">
          {flUsers.map(fl => {
            const pend = getFlPenaksiran(fl.id).filter(r => r.intoolsValue === undefined).length
            const isActive = selectedFlId === fl.id
            return (
              <button
                key={fl.id}
                onClick={() => { setSelectedFlId(fl.id); setScoringId(null) }}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${
                  isActive ? 'border-[#023DFF] text-[#023DFF]' : 'border-transparent text-[#65758B] hover:text-[#0F1729]'
                }`}
              >
                {fl.name.split(' ')[0]}
                {pend > 0 && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 bg-[#DC2626] text-white rounded-full text-[9px] font-bold flex items-center justify-center">{pend}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedFl && (
        <div className="grid grid-cols-3 gap-6">
          {/* Left 2/3 */}
          <div className="col-span-2 space-y-4">
            {/* Pending */}
            {pending.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <p className="text-sm font-semibold text-[#0F1729]">Menunggu Verifikasi ({pending.length})</p>
                </div>
                <div className="space-y-4">
                  {pending.map(r => (
                    <div key={r.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-[#FEFDEA] text-[#B27202] text-xs font-bold px-2.5 py-0.5 rounded-full">{r.barangType}</span>
                              <span className="text-xs text-[#65758B]">Hari {r.day}</span>
                            </div>
                            <p className="font-semibold text-[#0F1729]">{r.barangDescription}</p>
                          </div>
                        </div>
                        <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4 flex items-center justify-between">
                          <p className="text-xs text-[#65758B]">Estimasi taksiran FL</p>
                          <p className="font-bold text-[#0F1729]">Rp {r.flEstimate.toLocaleString('id-ID')}</p>
                        </div>

                        {justScored === r.id ? (
                          <div className="bg-[#F0FDF4] text-[#15803D] text-sm font-semibold rounded-xl px-4 py-3 text-center">
                            ✅ Berhasil diverifikasi!
                          </div>
                        ) : scoringId === r.id ? (
                          <div className="border border-[#E1E7EF] rounded-xl p-4 space-y-3 bg-[#F8FAFC]">
                            <div>
                              <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Nilai Intools (Rp)*</label>
                              <input
                                type="number"
                                value={intoolsValue}
                                onChange={e => setIntoolsValue(e.target.value)}
                                placeholder="Masukkan nilai dari sistem Intools"
                                className="mt-2 w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                              />
                              {pendingIntools !== null && !isNaN(pendingIntools) && (
                                <div className={`mt-2 p-3 rounded-xl text-xs font-medium ${
                                  pendingIntools <= 5 ? 'bg-[#F0FDF4] text-[#15803D]' :
                                  pendingIntools <= 10 ? 'bg-[#FEFDEA] text-[#B27202]' : 'bg-[#FEF2F2] text-[#B91C1C]'
                                }`}>
                                  Selisih: Rp {Math.abs(parseInt(intoolsValue) - r.flEstimate).toLocaleString('id-ID')} ({pendingIntools.toFixed(1)}%)
                                  {' — '}{pendingIntools <= 5 ? 'Sangat akurat' : pendingIntools <= 10 ? 'Cukup akurat' : 'Perlu latihan lebih'}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Score Penaksiran (0–100)*</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {[70, 80, 85, 90, 95, 100].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => setScore(String(s))}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${score === String(s) ? 'bg-[#023DFF] text-white' : 'bg-white text-[#65758B] border border-[#CBD5E1] hover:border-[#023DFF]'}`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Catatan</label>
                              <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Feedback untuk peserta..."
                                className="mt-2 w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2 text-sm outline-none transition-colors resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-3">
                              <button onClick={() => setScoringId(null)} className="flex-1 h-9 rounded-lg border border-[#CBD5E1] text-sm font-semibold text-[#65758B]">Batal</button>
                              <button
                                onClick={() => handleScore(r.id)}
                                disabled={!intoolsValue || !score}
                                className={`flex-1 h-9 rounded-lg text-sm font-semibold text-white transition-all ${intoolsValue && score ? 'bg-[#023DFF] hover:bg-[#001CDB]' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setScoringId(r.id); setIntoolsValue(''); setScore(''); setNote('') }}
                            className="w-full h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
                          >
                            Masukkan Nilai Intools →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-6 text-center">
                <span className="text-2xl">✅</span>
                <p className="font-semibold text-[#15803D] mt-2 text-sm">
                  {records.length === 0 ? `${selectedFl.name.split(' ')[0]} belum ada sesi penaksiran.` : 'Semua penaksiran sudah diverifikasi!'}
                </p>
              </div>
            )}

            {/* Scored history */}
            {scored.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  <p className="text-sm font-semibold text-[#0F1729]">Sudah Diverifikasi ({scored.length})</p>
                </div>
                <div className="bg-white rounded-xl border border-[#E1E7EF]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E1E7EF]">
                        <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-5 text-left">Barang</th>
                        <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-4 text-right">FL</th>
                        <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-4 text-right">Intools</th>
                        <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-4 text-right">Akurasi</th>
                        <th className="text-xs font-semibold text-[#65758B] uppercase tracking-wide py-3 px-5 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scored.slice().reverse().map(r => (
                        <tr key={r.id} className="border-b border-[#E1E7EF] last:border-0">
                          <td className="py-3 px-5">
                            <p className="text-sm font-semibold text-[#0F1729]">{r.barangDescription}</p>
                            <p className="text-xs text-[#65758B]">{r.barangType} · Hari {r.day}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-[#65758B] text-right">Rp {(r.flEstimate / 1_000_000).toFixed(1)}jt</td>
                          <td className="py-3 px-4 text-sm text-[#023DFF] font-medium text-right">Rp {((r.intoolsValue ?? 0) / 1_000_000).toFixed(1)}jt</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`text-sm font-semibold ${(r.accuracy ?? 0) >= 95 ? 'text-[#15803D]' : (r.accuracy ?? 0) >= 90 ? 'text-[#B27202]' : 'text-[#B91C1C]'}`}>
                              {r.accuracy?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <span className="font-bold text-base text-[#0F1729]">{r.kanitScore}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-3">{selectedFl.name.split(' ')[0]}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Total sesi</span>
                  <span className="font-semibold text-[#0F1729]">{records.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Pending</span>
                  <span className={`font-semibold ${pending.length > 0 ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>{pending.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Terverifikasi</span>
                  <span className="font-semibold text-[#0F1729]">{scored.length}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#E5F2FF] rounded-xl border border-[#023DFF]/20 p-4">
              <p className="text-xs font-semibold text-[#023DFF] mb-2">Panduan Akurasi</p>
              <div className="space-y-1.5 text-xs text-[#001CDB]">
                <p>• Selisih ≤5%: Sangat akurat</p>
                <p>• Selisih 5–10%: Cukup akurat</p>
                <p>• Selisih &gt;10%: Perlu banyak latihan</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
