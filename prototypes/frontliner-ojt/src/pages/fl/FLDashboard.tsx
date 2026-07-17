import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ASSESSMENT_QUESTIONS, MILESTONES } from '../../data/mockData'
import type { FLProfile } from '../../types'

function scoreColor(score: number | null) {
  if (score === null) return 'text-[#CBD5E1]'
  if (score >= 85) return 'text-[#15803D]'
  if (score >= 75) return 'text-[#B27202]'
  return 'text-[#B91C1C]'
}

export default function FLDashboard() {
  const { currentUser, getTodayChecklist, getFlScoreBreakdown, getFlChecklists, getFlAssessment, getFlFinalEvaluation } = useApp()
  const profile = currentUser!.profile as FLProfile
  const day = profile.currentDay
  const todayChecklist = getTodayChecklist(currentUser!.id)
  const scores = getFlScoreBreakdown(currentUser!.id)
  const allChecklists = getFlChecklists(currentUser!.id)
  const dayProgress = Math.round((day / 14) * 100)
  const existingAssessment = getFlAssessment(currentUser!.id)
  const finalEval = getFlFinalEvaluation(currentUser!.id)


  const checklistStatus = todayChecklist?.status === 'scored'
    ? { label: `Dinilai: ${todayChecklist.kanitScore}/100`, color: 'success', dot: '●' }
    : todayChecklist?.status === 'submitted'
    ? { label: 'Menunggu penilaian Kanit', color: 'warning', dot: '●' }
    : { label: 'Belum isi checklist hari ini', color: 'error', dot: '●' }

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Selamat datang, {profile.name.split(' ')[0]}!</h1>
          <p className="text-[#65758B] text-sm mt-1">{profile.branch} · {profile.position}</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
            day === 14 ? 'bg-[#FEFDEA] text-[#B27202] border border-[#E0A200]' : 'bg-[#E5F2FF] text-[#001CDB] border border-[#023DFF]'
          }`}>
            {day === 14 ? '🎓 Hari Assessment' : `Hari ke-${day} dari 14`}
          </div>
          <p className="text-xs text-[#65758B] mt-1.5">Mulai: {profile.startDate}</p>
        </div>
      </div>

      {/* Assessment alert */}
      {day === 14 && !existingAssessment && (
        <div className="bg-[#FEFDEA] border border-[#E0A200] rounded-xl p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <p className="font-semibold text-[#B27202]">Ini adalah Hari ke-14 — Hari Assessment kamu!</p>
              <p className="text-sm text-[#B27202]/80 mt-0.5">Selesaikan assessment hari ini untuk mendapatkan nilai akhir OJT.</p>
            </div>
          </div>
          <Link to="/fl/assessment" className="flex-shrink-0 h-[38px] px-4 bg-[#E0A200] hover:bg-[#B27202] text-white font-semibold text-sm rounded-lg flex items-center transition-colors">
            Mulai Assessment →
          </Link>
        </div>
      )}
      {day === 14 && existingAssessment && (() => {
        const mcqCorrect = ASSESSMENT_QUESTIONS.reduce((count, q) => {
          const ans = existingAssessment.answers.find(a => a.questionId === q.id)
          return count + (ans?.answer === q.options[q.correctIndex] ? 1 : 0)
        }, 0)
        return (
          <div className="rounded-xl p-4 flex items-center gap-3 mb-6 bg-[#F0FDF4] border border-[#16A34A]/20">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#15803D]">Assessment Akhir OJT selesai!</p>
              <p className="text-xs mt-0.5 text-[#15803D]/80">{mcqCorrect}/{ASSESSMENT_QUESTIONS.length} soal benar · Nilai: {existingAssessment.mcqScore ?? Math.round((mcqCorrect / ASSESSMENT_QUESTIONS.length) * 100)}/100</p>
            </div>
            <Link to="/fl/assessment" className="flex-shrink-0 h-[34px] px-3 bg-white border border-[#CBD5E1] text-[#0F1729] text-xs font-semibold rounded-lg flex items-center hover:bg-[#F1F5F9] transition-colors">
              Lihat Detail →
            </Link>
          </div>
        )
      })()}

      {/* Stat cards row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Checklist" value={scores.dailyProgressScore !== null ? String(scores.dailyProgressScore) : '—'} unit="/100" note={`${scores.daysScored}/14 hari sudah dinilai`} colorClass={scoreColor(scores.dailyProgressScore)} />
        <StatCard label="Assessment" value={scores.assessmentScore !== null ? String(scores.assessmentScore) : '—'} unit="/100" note="Hari ke-14" colorClass={scoreColor(scores.assessmentScore)} />
        <StatCard
          label="Nilai Akhir"
          value={scores.totalScore !== null ? String(scores.totalScore) : '—'}
          unit="/100"
          note={scores.totalScore !== null ? (finalEval ? (scores.passed ? '✓ Lulus' : '✗ Belum lulus') : 'Menunggu evaluasi akhir') : 'Menunggu semua nilai'}
          colorClass={scoreColor(scores.totalScore)}
        />
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="col-span-2 space-y-4">
          {/* Today checklist */}
          {day === 14 ? (
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <h3 className="font-semibold text-[#0F1729] mb-3">Checklist OJT</h3>
              <div className="bg-[#F0FDF4] rounded-xl p-4 text-center mb-3">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-sm font-semibold text-[#15803D]">Semua checklist sudah selesai!</p>
                <p className="text-xs text-[#15803D]/70 mt-0.5">Kamu sudah menyelesaikan seluruh 14 hari OJT.</p>
              </div>
              <Link to="/fl/checklist" className="flex items-center justify-center h-[34px] px-3 rounded-lg text-sm font-semibold border border-[#CBD5E1] text-[#0F1729] hover:border-[#023DFF] hover:bg-[#E5F2FF] hover:text-[#023DFF] transition-all">
                Lihat Riwayat
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#0F1729]">Checklist Hari Ini</h3>
                <StatusBadge status={checklistStatus.color as any} label={checklistStatus.label} />
              </div>
              {todayChecklist ? (
                <div className="space-y-2">
                  {todayChecklist.tasks ? (
                    todayChecklist.tasks.slice(0, 4).map(task => (
                      <div key={task.taskId} className="flex items-center gap-2.5 py-1">
                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 bg-[#023DFF]">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <span className="text-sm text-[#65758B]">{task.taskName} <span className="text-[#94A3B8]">({task.completedItemIds.length} item)</span></span>
                      </div>
                    ))
                  ) : todayChecklist.items ? (
                    <>
                      {todayChecklist.items.slice(0, 4).map(it => (
                        <div key={it.itemId} className="flex items-center gap-2.5 py-1">
                          <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${it.completed ? 'bg-[#023DFF]' : 'border border-[#CBD5E1]'}`}>
                            {it.completed && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className={`text-sm ${it.completed ? 'text-[#65758B] line-through' : 'text-[#0F1729]'}`}>{it.itemId}</span>
                        </div>
                      ))}
                      {todayChecklist.items.length > 4 && (
                        <p className="text-xs text-[#65758B] mt-1">+{todayChecklist.items.length - 4} item lainnya</p>
                      )}
                    </>
                  ) : null}
                  {todayChecklist.kanitNote && (
                    <div className="mt-3 pt-3 border-t border-[#E1E7EF] bg-[#F8FAFC] rounded-lg p-3">
                      <p className="text-xs font-semibold text-[#65758B] mb-1">Catatan Kanit</p>
                      <p className="text-sm text-[#0F1729]">"{todayChecklist.kanitNote}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-2.5">Task hari ini</p>
                  <div className="space-y-2 mb-4">
                    {profile.activeMilestoneIds.slice(0, 4).map(id => {
                      const taskLabel: Record<string, string> = {
                        'opening-closing': 'Opening & Closing',
                        'packing-sealing': 'Packing & Sealing',
                        'canvassing': 'Canvassing',
                        'pelayanan-dasar': 'Pelayanan Nasabah',
                        'pelayanan-transaksi': 'Pelayanan Transaksi',
                        'penaksiran': 'Penaksiran',
                      }
                      return (
                        <div key={id} className="flex items-center gap-2.5 py-0.5">
                          <div className="w-4 h-4 rounded border border-[#CBD5E1] flex-shrink-0" />
                          <span className="text-sm text-[#94A3B8]">{taskLabel[id] ?? id}</span>
                        </div>
                      )
                    })}
                    {profile.activeMilestoneIds.length > 4 && (
                      <p className="text-xs text-[#94A3B8] pl-6">+{profile.activeMilestoneIds.length - 4} task lainnya</p>
                    )}
                  </div>
                  <Link to="/fl/checklist" className="w-full h-[38px] px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg flex items-center justify-center transition-colors">
                    Isi Checklist →
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right 1/3 */}
        <div className="space-y-4">
          {/* Progress Belajar + Materi */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <h3 className="font-semibold text-[#0F1729] mb-3">Progress Belajar</h3>

            {/* Day progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#65758B]">Hari ke-{day} dari 14</span>
                <span className="text-xs font-bold text-[#023DFF]">{dayProgress}%</span>
              </div>
              <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#023DFF] rounded-full transition-all" style={{ width: `${dayProgress}%` }} />
              </div>
            </div>

            {(() => {
              const allDone = MILESTONES.every(m => profile.completedMilestoneIds?.includes(m.id))
              if (allDone) {
                return (
                  <div className="bg-[#F0FDF4] rounded-xl p-4 mb-4 text-center">
                    <p className="text-2xl mb-1">🎉</p>
                    <p className="text-sm font-semibold text-[#15803D]">Semua materi sudah dipelajari!</p>
                    <p className="text-xs text-[#15803D]/70 mt-0.5">Kamu sudah menyelesaikan seluruh materi OJT.</p>
                  </div>
                )
              }
              return (
                <>
                  {/* Level 1 */}
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#65758B] mb-2">Level 1 · Hari 1–7</p>
                  <div className="space-y-1.5 mb-3">
                    {MILESTONES.filter(m => m.type === 'minggu1').map(m => {
                      const isCompleted = profile.completedMilestoneIds?.includes(m.id) ?? false
                      const isActive = profile.activeMilestoneIds.includes(m.id)
                      const hasPendingQuiz = !!(m.quiz?.length) && !profile.quizScores?.[m.id] && isActive && !isCompleted
                      return (
                        <div key={m.id} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-[#16A34A]' : 'border border-[#CBD5E1]'}`}>
                            {isCompleted && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <p className={`text-sm ${isCompleted ? 'text-[#94A3B8] line-through' : isActive ? 'text-[#0F1729] font-medium' : 'text-[#65758B]'}`}>{m.name}</p>
                            {hasPendingQuiz && (
                              <span className="flex-shrink-0 text-[9px] bg-[#FEFDEA] text-[#B27202] border border-[#E0A200]/30 px-1.5 py-0.5 rounded font-bold">Mini Quiz menunggu</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="border-t border-dashed border-[#E1E7EF] my-3" />
                  {/* Level 2 — collapsed */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">Level 2 · Hari 8–13</p>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-[#94A3B8] flex-shrink-0">
                      <rect x="4" y="8" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5.5 8V5.5a2.5 2.5 0 0 1 5 0V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </>
              )
            })()}

            <Link to="/fl/milestones" className={`flex items-center justify-center h-[34px] px-3 rounded-lg text-sm font-semibold transition-all ${
              MILESTONES.every(m => profile.completedMilestoneIds?.includes(m.id))
                ? 'border border-[#CBD5E1] text-[#0F1729] hover:border-[#023DFF] hover:bg-[#E5F2FF] hover:text-[#023DFF]'
                : 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
            }`}>
              {MILESTONES.every(m => profile.completedMilestoneIds?.includes(m.id)) ? 'Pelajari Lagi' : 'Kerjakan Sekarang →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, note, colorClass }: {
  label: string; value: string; unit: string; note: string; colorClass: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
      <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-sm text-[#94A3B8]">{unit}</p>
      </div>
      <p className="text-xs text-[#65758B] mt-1">{note}</p>
    </div>
  )
}

function StatusBadge({ status, label, small }: { status: 'success' | 'warning' | 'error' | 'neutral'; label: string; small?: boolean }) {
  const map = {
    success: 'bg-[#F0FDF4] text-[#15803D]',
    warning: 'bg-[#FEFDEA] text-[#B27202]',
    error: 'bg-[#FEF2F2] text-[#B91C1C]',
    neutral: 'bg-[#F1F5F9] text-[#65758B]',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${small ? 'text-[10px]' : 'text-xs'} ${map[status]}`}>
      {label}
    </span>
  )
}

