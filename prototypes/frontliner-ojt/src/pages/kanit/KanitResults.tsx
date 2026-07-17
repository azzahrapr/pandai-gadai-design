import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ASSESSMENT_QUESTIONS } from '../../data/mockData'
import type { KanitProfile, FLProfile, DailyChecklist } from '../../types'

export default function KanitResults() {
  const { currentUser, getFlUsers, getFlScoreBreakdown, getFlAssessment, getFlChecklists, getFlFinalEvaluation } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  const [searchParams] = useSearchParams()
  const [selectedFlId, setSelectedFlId] = useState<string>(() => {
    const fromUrl = searchParams.get('flId')
    if (fromUrl && flUsers.some(u => u.id === fromUrl)) return fromUrl
    const withAll = flUsers.find(u => getFlScoreBreakdown(u.id).totalScore !== null)
    return withAll?.id ?? flUsers.find(u => u.id === 'fl-001')?.id ?? flUsers[0]?.id ?? ''
  })
  const [selectedCard, setSelectedCard] = useState<'daily' | 'assessment'>('daily')

  const selectedFl = flUsers.find(u => u.id === selectedFlId)
  const scores = getFlScoreBreakdown(selectedFlId)
  const assessment = getFlAssessment(selectedFlId)
  const checklists = getFlChecklists(selectedFlId).filter(c => c.status === 'scored')
  const finalEval = getFlFinalEvaluation(selectedFlId)

  const mcqCorrect = assessment ? ASSESSMENT_QUESTIONS.reduce((count, q) => {
    const ans = assessment.answers.find(a => a.questionId === q.id)
    return count + (ans?.answer === q.options[q.correctIndex] ? 1 : 0)
  }, 0) : 0

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
            onChange={e => setSelectedFlId(e.target.value)}
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
          {/* Blue eval CTA banner */}
          {scores.totalScore !== null && !finalEval && (
            <div className="bg-[#023DFF] rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📋</div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Semua nilai sudah tersedia</p>
                <p className="text-blue-100 text-xs mt-0.5">Isi form evaluasi akhir untuk {selectedFl?.name} — penilaian soft skills, attitude, dan feedback keseluruhan.</p>
              </div>
              <Link to={`/kanit/final-eval/${selectedFlId}`} className="flex-shrink-0 bg-white text-[#023DFF] font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                Isi Evaluasi →
              </Link>
            </div>
          )}
          {scores.totalScore !== null && finalEval && (
            <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#15803D]">Evaluasi akhir sudah diisi</p>
              </div>
              <Link to={`/kanit/final-eval/${selectedFlId}`} className="flex-shrink-0 h-[34px] px-3 bg-white border border-[#CBD5E1] text-[#0F1729] text-xs font-semibold rounded-lg flex items-center hover:bg-[#F1F5F9] transition-colors">
                Lihat Evaluasi →
              </Link>
            </div>
          )}

          {/* Score breakdown — 2 component cards + total score card */}
          <div className="grid grid-cols-3 gap-3">
            <ScoreCard label="Checklist" weight="60%" score={scores.dailyProgressScore} note={`rata-rata dari ${scores.daysScored}/14 hari`} isActive={selectedCard === 'daily'} onClick={() => setSelectedCard('daily')} />
            <ScoreCard label="Assessment" weight="40%" score={scores.assessmentScore} note={assessment ? `${mcqCorrect}/${ASSESSMENT_QUESTIONS.length} jawaban benar` : 'Belum tersedia'} isActive={selectedCard === 'assessment'} onClick={() => setSelectedCard('assessment')} />
            {scores.totalScore !== null ? (
              <div className={`rounded-xl border px-4 py-4 ${scores.passed ? 'bg-[#F0FDF4] border-[#16A34A]/30' : 'bg-[#FEF2F2] border-[#DC2626]/20'}`}>
                <p className={`text-xs font-semibold mb-3 ${scores.passed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>Nilai Akhir</p>
                <p className={`text-3xl font-black mb-2 ${scores.passed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{scores.totalScore}</p>
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs ${scores.passed ? 'bg-[#16A34A] text-white' : 'bg-[#DC2626] text-white'}`}>
                  {scores.passed ? '🎉 Rekomendasi: Final' : '❌ Rekomendasi: Tidak Final'}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E1E7EF] border-dashed bg-[#F8FAFC] px-4 py-4">
                <p className="text-xs font-semibold text-[#94A3B8] mb-3">Nilai Akhir</p>
                <p className="text-3xl font-black text-[#CBD5E1] mb-2">—</p>
                <p className="text-[11px] text-[#94A3B8] leading-snug">Menunggu semua komponen dinilai</p>
              </div>
            )}
          </div>

          {/* Detail panel — switches based on selectedCard */}
            <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
              {selectedCard === 'daily' && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#0F1729] text-sm">Progress Per Task</h3>
                    <Link to="/kanit/review" className="text-xs font-semibold text-[#023DFF] hover:underline">Review checklist →</Link>
                  </div>
                  {checklists.length === 0 ? (
                    <p className="text-sm text-[#94A3B8] text-center py-6">Belum ada checklist yang dinilai</p>
                  ) : (
                    <TaskDayMatrix checklists={checklists} />
                  )}
                </div>
              )}

              {selectedCard === 'assessment' && (
                <div className="p-5">
                  <h3 className="font-semibold text-[#0F1729] text-sm mb-4">Assessment Akhir OJT</h3>
                  {!assessment ? (
                    <p className="text-sm text-[#94A3B8] text-center py-6">Belum ada data assessment</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="text-center">
                          <p className={`text-4xl font-black ${(assessment.mcqScore ?? 0) >= 75 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{assessment.mcqScore ?? Math.round((mcqCorrect / ASSESSMENT_QUESTIONS.length) * 100)}</p>
                          <p className="text-xs text-[#65758B]">/100</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#15803D] text-sm">✅ Selesai — dinilai otomatis</p>
                          <p className="text-xs text-[#65758B] mt-0.5">{mcqCorrect}/{ASSESSMENT_QUESTIONS.length} jawaban benar · {assessment.masteryChecks.filter(m => m.mastered).length}/{assessment.masteryChecks.length} materi dikuasai</p>
                        </div>
                      </div>
                      {/* Mastery */}
                      <div>
                        <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">Penguasaan Materi</p>
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

function taskScoreColor(s: number | null) {
  if (s === null) return { text: 'text-[#CBD5E1]', bg: 'bg-[#F8FAFC] border border-[#E1E7EF]' }
  if (s >= 85) return { text: 'text-[#15803D]', bg: 'bg-[#F0FDF4] border border-[#16A34A]/20' }
  if (s >= 75) return { text: 'text-[#B27202]', bg: 'bg-[#FEFDEA] border border-[#E0A200]/20' }
  return { text: 'text-[#B91C1C]', bg: 'bg-[#FEF2F2] border border-[#DC2626]/20' }
}

function TaskDayMatrix({ checklists }: { checklists: DailyChecklist[] }) {
  const taskOrder: string[] = []
  const taskNames: Record<string, string> = {}
  const taskDayScores: Record<string, Record<number, number | null>> = {}

  for (const cl of checklists) {
    if (!cl.tasks) continue
    for (const t of cl.tasks) {
      if (!taskOrder.includes(t.taskId)) { taskOrder.push(t.taskId); taskNames[t.taskId] = t.taskName }
      if (!taskDayScores[t.taskId]) taskDayScores[t.taskId] = {}
      taskDayScores[t.taskId][cl.day] = t.kanitScore ?? null
    }
  }

  const hasPerTaskScores = taskOrder.some(id => Object.values(taskDayScores[id] ?? {}).some(s => s !== null))
  if (!hasPerTaskScores) {
    return (
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 14 }, (_, i) => {
          const day = i + 1
          const cl = checklists.find(c => c.day === day)
          const s = cl?.kanitScore ?? null
          const c = taskScoreColor(s)
          return (
            <div key={day} className={`rounded-lg h-10 flex items-center justify-between px-2 ${c.bg}`}>
              <span className="text-[10px] text-[#94A3B8]">H{day}</span>
              <span className={`text-xs font-bold ${c.text}`}>{s ?? '—'}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const allDays = Array.from({ length: 14 }, (_, i) => i + 1)

  return (
    <div>
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className="text-left text-[10px] font-semibold text-[#65758B] pb-2 pr-3 whitespace-nowrap" style={{ width: '8rem' }}>Task</th>
            {allDays.map(d => (
              <th key={d} className="text-center text-[9px] text-[#94A3B8] pb-2 px-0.5">H{d}</th>
            ))}
            <th className="text-right text-[10px] font-semibold text-[#65758B] pb-2 pl-3 whitespace-nowrap">Rata-rata</th>
          </tr>
        </thead>
        <tbody>
          {taskOrder.map(taskId => {
            const dayMap = taskDayScores[taskId] ?? {}
            const scored = Object.values(dayMap).filter((s): s is number => s !== null)
            const avg = scored.length > 0 ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null
            const avgC = taskScoreColor(avg)
            return (
              <tr key={taskId}>
                <td className="pr-3 py-1">
                  <span className="text-xs font-medium text-[#0F1729] whitespace-nowrap">{taskNames[taskId]}</span>
                </td>
                {allDays.map(d => {
                  const s = dayMap[d] ?? null
                  const c = taskScoreColor(s)
                  return (
                    <td key={d} className="px-0.5 py-1">
                      <div className={`w-full h-7 rounded flex items-center justify-center text-[10px] font-bold ${c.bg} ${c.text}`}>
                        {s ?? '—'}
                      </div>
                    </td>
                  )
                })}
                <td className="pl-3 py-1 text-right">
                  <span className={`text-sm font-black ${avgC.text}`}>{avg ?? '—'}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-[#65758B]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#F0FDF4] border border-[#16A34A]/20 inline-block" />≥85</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#FEFDEA] border border-[#E0A200]/20 inline-block" />75–84</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#FEF2F2] border border-[#DC2626]/20 inline-block" />&lt;75</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#F8FAFC] border border-[#E1E7EF] inline-block" />Belum dinilai</span>
      </div>
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
      className={`w-full text-left rounded-xl px-4 py-4 transition-all ${
        isActive ? 'bg-white border-2 border-[#023DFF]' : 'bg-white border border-[#E1E7EF] hover:border-[#94A3B8]'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <p className={`text-xs font-semibold ${isActive ? 'text-[#023DFF]' : 'text-[#65758B]'}`}>{label}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isActive ? 'bg-[#E5F2FF] text-[#023DFF]' : 'bg-[#F1F5F9] text-[#65758B]'}`}>{weight}</span>
      </div>
      <p className={`text-3xl font-black mb-1 ${scoreColor}`}>{score ?? '—'}</p>
      <p className="text-[11px] text-[#94A3B8]">{note}</p>
      <div className="flex items-center gap-0.5 mt-2 text-[11px] font-semibold text-[#023DFF]">
        Lihat detail
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </button>
  )
}
