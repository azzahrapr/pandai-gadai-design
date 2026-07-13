import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { KanitProfile, FLProfile } from '../../types'

export default function KanitResults() {
  const { currentUser, getFlUsers, getFlScoreBreakdown, getFlAssessment, scoreAssessment, getFlChecklists, getFlPenaksiran } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  const [selectedFlId, setSelectedFlId] = useState<string>(flUsers.find(u => u.id === 'fl-001')?.id ?? flUsers[0]?.id ?? '')
  const [selectedCard, setSelectedCard] = useState<'daily' | 'assessment' | 'penaksiran'>('daily')
  const [assessScore, setAssessScore] = useState<string>('')
  const [assessNote, setAssessNote] = useState<string>('')
  const [justScored, setJustScored] = useState(false)

  const selectedFl = flUsers.find(u => u.id === selectedFlId)
  const scores = getFlScoreBreakdown(selectedFlId)
  const assessment = getFlAssessment(selectedFlId)
  const checklists = getFlChecklists(selectedFlId).filter(c => c.status === 'scored')
  const penaksiran = getFlPenaksiran(selectedFlId).filter(r => r.kanitScore !== undefined)

  function handleScoreAssessment() {
    const s = parseInt(assessScore)
    if (isNaN(s)) return
    scoreAssessment(selectedFlId, s, assessNote)
    setJustScored(true)
    setAssessScore('')
    setAssessNote('')
  }

  const PASSING_SCORE = 75

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Hasil Akhir OJT</h1>
        <p className="text-[#65758B] text-sm mt-1">Rekap nilai akhir seluruh peserta OJT.</p>
      </div>

      {/* Pilih peserta — dropdown */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-semibold text-[#65758B] flex-shrink-0">Pilih peserta</span>
        <div className="relative">
          <select
            value={selectedFlId}
            onChange={e => { setSelectedFlId(e.target.value); setJustScored(false); setAssessScore(''); setAssessNote('') }}
            className="appearance-none bg-white border border-[#E1E7EF] rounded-lg pl-3 pr-8 py-1.5 text-sm font-semibold text-[#0F1729] outline-none focus:border-[#023DFF] cursor-pointer"
          >
            {flUsers.map(fl => (
              <option key={fl.id} value={fl.id}>{fl.name}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {selectedFl && (
        <div className="space-y-4">
          {/* Score breakdown — 3 cards in a row */}
          <div className="grid grid-cols-3 gap-3">
            <ScoreCard label="Checklist Harian" weight="50%" score={scores.dailyProgressScore} note={`rata-rata dari ${scores.daysScored}/14 hari`} isActive={selectedCard === 'daily'} onClick={() => setSelectedCard('daily')} />
            <ScoreCard label="Assessment" weight="30%" score={scores.assessmentScore} note={assessment ? (assessment.status === 'scored' ? 'Sudah dinilai' : 'Menunggu penilaian') : 'Belum ada'} isActive={selectedCard === 'assessment'} onClick={() => setSelectedCard('assessment')} />
            <ScoreCard label="Penaksiran" weight="20%" score={scores.penaksiranScore} note={`${scores.penaksiranCount} sesi`} isActive={selectedCard === 'penaksiran'} onClick={() => setSelectedCard('penaksiran')} />
          </div>

            {/* Total score */}
            {scores.totalScore !== null && (
              <div className={`rounded-xl p-5 flex items-center gap-5 ${scores.passed ? 'bg-[#F0FDF4] border border-[#16A34A]/20' : 'bg-[#FEF2F2] border border-[#DC2626]/20'}`}>
                <p className={`text-5xl font-black flex-shrink-0 ${scores.passed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{scores.totalScore}</p>
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs mb-1.5 ${scores.passed ? 'bg-[#16A34A] text-white' : 'bg-[#DC2626] text-white'}`}>
                    {scores.passed ? '🎉 REKOMENDASI: LULUS' : '❌ REKOMENDASI: TIDAK LULUS'}
                  </div>
                  <p className="text-xs text-[#65758B]">Standar minimal: {PASSING_SCORE} · Selisih: {Math.abs(scores.totalScore - PASSING_SCORE)} poin</p>
                </div>
              </div>
            )}

            {/* Detail panel — switches based on selectedCard */}
            <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
              {selectedCard === 'daily' && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#0F1729] text-sm">Nilai Harian</h3>
                    <Link to="/kanit/review" className="text-xs font-semibold text-[#023DFF] hover:underline">Lihat detail →</Link>
                  </div>
                  {checklists.length === 0 ? (
                    <p className="text-sm text-[#94A3B8] text-center py-6">Belum ada checklist yang dinilai</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: 14 }, (_, i) => {
                          const day = i + 1
                          const cl = checklists.find(c => c.day === day)
                          const scored = cl?.kanitScore ?? null
                          return (
                            <div key={day} className={`rounded-lg h-10 flex items-center justify-between px-2 ${
                              scored !== null
                                ? scored >= 85 ? 'bg-[#F0FDF4] border border-[#16A34A]/20'
                                  : scored >= 75 ? 'bg-[#FEFDEA] border border-[#E0A200]/20'
                                  : 'bg-[#FEF2F2] border border-[#DC2626]/20'
                                : 'bg-[#F8FAFC] border border-[#E1E7EF]'
                            }`}>
                              <span className="text-[10px] text-[#94A3B8]">Hari ke-{day}</span>
                              <span className={`text-xs font-bold ${
                                scored !== null
                                  ? scored >= 85 ? 'text-[#15803D]' : scored >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
                                  : 'text-[#CBD5E1]'
                              }`}>{scored ?? '—'}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-[#65758B]">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#F0FDF4] border border-[#16A34A]/20 inline-block" />≥85</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#FEFDEA] border border-[#E0A200]/20 inline-block" />75–84</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#FEF2F2] border border-[#DC2626]/20 inline-block" />&lt;75</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#F8FAFC] border border-[#E1E7EF] inline-block" />Belum dinilai</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {selectedCard === 'assessment' && (
                <div className="p-5">
                  <h3 className="font-semibold text-[#0F1729] text-sm mb-4">Assessment</h3>
                  {!assessment ? (
                    <p className="text-sm text-[#94A3B8] text-center py-6">Belum ada data assessment</p>
                  ) : assessment.status === 'submitted' && !justScored ? (
                    <div className="space-y-4">
                      <div className="bg-[#FEFDEA] border border-[#E0A200]/30 rounded-xl p-3 flex items-center gap-2">
                        <span>🎓</span>
                        <p className="text-sm font-semibold text-[#B27202]">Menunggu penilaian</p>
                      </div>
                      {/* Mastery */}
                      <div>
                        <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">Penguasaan Materi ({assessment.masteryChecks.filter(m => m.mastered).length}/{assessment.masteryChecks.length})</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {assessment.masteryChecks.map(m => (
                            <div key={m.materialId} className={`flex items-center gap-2 p-2 rounded-lg ${m.mastered ? 'bg-[#F0FDF4]' : 'bg-[#F8FAFC]'}`}>
                              <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center ${m.mastered ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}`}>
                                {m.mastered && <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                              <p className="text-xs text-[#0F1729]">{m.material}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Answers */}
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Jawaban</p>
                        {assessment.answers.filter(a => a.answer.trim()).map((a, idx) => (
                          <div key={a.questionId}>
                            <p className="text-xs font-semibold text-[#65758B]">Pertanyaan {idx + 1}: {a.question}</p>
                            <div className="mt-1 bg-[#F8FAFC] rounded-lg px-3 py-2">
                              <p className="text-xs text-[#0F1729] leading-relaxed">{a.answer}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Scoring */}
                      <div className="space-y-3 pt-2 border-t border-[#E1E7EF]">
                        <div>
                          <label className="text-xs font-semibold text-[#65758B] uppercase tracking-wide">Nilai Assessment*</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {[60, 70, 75, 80, 85, 90].map(s => (
                              <button key={s} onClick={() => setAssessScore(String(s))} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${assessScore === String(s) ? 'bg-[#023DFF] text-white' : 'bg-[#F8FAFC] text-[#65758B] border border-[#CBD5E1] hover:border-[#023DFF]'}`}>{s}</button>
                            ))}
                          </div>
                        </div>
                        <textarea value={assessNote} onChange={e => setAssessNote(e.target.value)} placeholder="Catatan penilaian..." className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2 text-sm outline-none resize-none" rows={2} />
                        <button onClick={handleScoreAssessment} disabled={!assessScore} className={`w-full h-10 rounded-lg font-semibold text-sm transition-all ${assessScore ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}>Submit Nilai Assessment</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <div>
                          <p className="font-semibold text-[#15803D]">Sudah dinilai</p>
                          {assessment.kanitScore !== undefined && <p className="text-sm text-[#15803D]/80">Nilai: {assessment.kanitScore}/100</p>}
                        </div>
                      </div>
                      {assessment.kanitNote && (
                        <div className="bg-[#F8FAFC] rounded-xl px-4 py-3">
                          <p className="text-xs font-semibold text-[#65758B] mb-1">Catatan</p>
                          <p className="text-sm text-[#0F1729] italic">"{assessment.kanitNote}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedCard === 'penaksiran' && (
                <div className="p-5">
                  <h3 className="font-semibold text-[#0F1729] text-sm mb-4">Penaksiran</h3>
                  {penaksiran.length === 0 ? (
                    <p className="text-sm text-[#94A3B8] text-center py-6">Belum ada sesi penaksiran yang dinilai</p>
                  ) : (
                    <div className="space-y-2">
                      {penaksiran.map((r, idx) => (
                        <div key={r.id} className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] rounded-lg">
                          <span className="w-6 h-6 rounded-md bg-[#E5F2FF] text-[#023DFF] text-[11px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#0F1729]">Sesi {r.day ? `Hari ${r.day}` : `#${idx + 1}`}</p>
                            {r.kanitNote && <p className="text-[11px] text-[#65758B] truncate italic">"{r.kanitNote}"</p>}
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ${(r.kanitScore ?? 0) >= 85 ? 'text-[#15803D]' : (r.kanitScore ?? 0) >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'}`}>{r.kanitScore}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  )
}

function ScoreCard({ label, weight, score, note, isActive, onClick }: {
  label: string; weight: string; score: number | null; note: string; isActive: boolean; onClick: () => void
}) {
  const scoreColor = score === null ? 'text-[#CBD5E1]' : score >= 85 ? 'text-[#15803D]' : score >= 75 ? 'text-[#B27202]' : 'text-[#B91C1C]'
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-4 transition-all ${
        isActive ? 'bg-[#E5F2FF] border-[#023DFF]' : 'bg-white border-[#E1E7EF] hover:border-[#94A3B8]'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <p className={`text-xs font-semibold ${isActive ? 'text-[#023DFF]' : 'text-[#65758B]'}`}>{label}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isActive ? 'bg-[#023DFF]/10 text-[#023DFF]' : 'bg-[#F1F5F9] text-[#65758B]'}`}>{weight}</span>
      </div>
      <p className={`text-3xl font-black mb-1 ${scoreColor}`}>{score ?? '—'}</p>
      <p className="text-[11px] text-[#94A3B8]">{note}</p>
    </button>
  )
}
