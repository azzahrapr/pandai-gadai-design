import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES, DAILY_TASKS } from '../../data/mockData'
import type { FLProfile, TaskConfirmation, DailyChecklist } from '../../types'

const MAX_QUIZ_ATTEMPTS = 2

// A quiz is "resolved" (won't block a module's status any further) once passed, or once
// the one-retry allowance is used up without passing. Mirrors FLMilestones.tsx/
// KanitReviewProgress.tsx's isQuizResolved exactly.
function isQuizResolved(score: number | undefined, attemptsUsed: number): boolean {
  return score !== undefined && (score >= 75 || attemptsUsed >= MAX_QUIZ_ATTEMPTS)
}

// Submission-level review status — Lulus/Tidak Lulus/Perlu Direview for ONE session or
// confirmation. Deliberately a separate vocabulary from the module-level status below
// (Terkunci/Lulus/Tidak Lulus/Terlambat/Aktif/Belum dimulai) — a module can be "Aktif"
// overall while one of its individual sessions is still "Perlu Direview".
type Verdict = 'lulus' | 'tidak-lulus' | 'perlu-direview'

// dd Mon yyyy, hh.mm — same format FLMilestoneDetail.tsx's own Riwayat Latihan sheet uses.
function formatSubmittedAt(iso: string): string {
  const d = new Date(iso)
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${d.getDate()} ${mo[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
}

function VerdictBadge({ verdict, size = 'sm' }: { verdict: Verdict; size?: 'sm' | 'md' }) {
  const sizeCls = size === 'md' ? 'text-xs px-3 py-1' : 'text-[10px] px-2 py-0.5'
  if (verdict === 'lulus') return <span className={`flex-shrink-0 font-semibold rounded-full bg-[#F0FDF4] border border-[#16A34A]/30 text-[#15803D] ${sizeCls}`}>Lulus</span>
  if (verdict === 'tidak-lulus') return <span className={`flex-shrink-0 font-semibold rounded-full bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] ${sizeCls}`}>Tidak Lulus</span>
  return <span className={`flex-shrink-0 font-semibold rounded-full bg-[#FEFDEA] border border-[#E0A200]/30 text-[#B27202] ${sizeCls}`}>Perlu Direview</span>
}

// pending (perlu-direview) sorts before everything else; ties don't matter here since the
// caller applies a date tiebreaker next.
function verdictSortWeight(v: Verdict): number {
  return v === 'perlu-direview' ? 0 : 1
}

function ExpandChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`flex-shrink-0 text-[#CBD5E1] transition-transform duration-200 ${expanded ? '-rotate-90' : 'rotate-90'}`}>
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function KanitFeedbackBox({ note }: { note: string }) {
  return (
    <div className="flex items-start gap-2 bg-[#FEFDEA] border border-[#E0A200]/30 rounded-lg px-3 py-2.5">
      <div className="w-3.5 h-3.5 rounded-full bg-[#E0A200] flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M3 1.5v2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/><circle cx="3" cy="4.5" r="0.5" fill="white"/></svg>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-[#B27202] uppercase tracking-wide mb-0.5">Feedback Kanit</p>
        <p className="text-xs text-[#92400E] italic leading-relaxed">"{note}"</p>
      </div>
    </div>
  )
}

export default function KanitTaskHistory() {
  const { flId, taskKey } = useParams<{ flId: string; taskKey: string }>()
  const navigate = useNavigate()
  const { getFlChecklists, getUserById, getItemConfirmations } = useApp()

  const decodedKey = decodeURIComponent(taskKey ?? '')
  const flUser = flId ? getUserById(flId) : undefined
  const flProfile = flUser?.profile as FLProfile | undefined
  const milestone = MILESTONES.find(m => m.id === decodedKey)
  const isIndividual = milestone?.submissionType === 'individual'
  const hasQuiz = !!milestone?.quiz?.length

  const [activeTab, setActiveTab] = useState<'latihan' | 'quiz'>('latihan')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function confirmationVerdict(c: TaskConfirmation): Verdict {
    if (c.kanitPassed === true) return 'lulus'
    if (c.kanitPassed === false) return 'tidak-lulus'
    return 'perlu-direview'
  }

  function sessionVerdict(cl: DailyChecklist, score: number | null): Verdict {
    if (cl.status !== 'scored') return 'perlu-direview'
    return score !== null && score >= 75 ? 'lulus' : 'tidak-lulus'
  }

  // ── Individual-type (essay/discounter) modules — grouped module→latihan→sesi, exactly
  // like FLMilestoneDetail.tsx's own "Riwayat Latihan" bottom sheet (itemHistory), just
  // rendered as a page instead of a modal and with Lulus/Tidak Lulus/Perlu Direview labels
  // instead of FL's "⏳ Menunggu Kanit" (that copy makes sense from the FL's point of view,
  // not the kanit's — they ARE the one who needs to review it). Within each latihan,
  // sessions are numbered chronologically (oldest = Sesi 1) but DISPLAYED with pending
  // ones first, newest-submitted first after that — the kanit's own attention should land
  // on what still needs a decision, not necessarily the oldest one.
  const itemHistory = isIndividual && flId
    ? milestone!.checklistItems
        .map(item => {
          const chrono = getItemConfirmations(flId, milestone!.id, item.id)
            .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
          const confirmations = chrono
            .map((c, idx) => ({ c, sessionNumber: idx + 1, verdict: confirmationVerdict(c) }))
            .sort((a, b) => verdictSortWeight(a.verdict) - verdictSortWeight(b.verdict) || b.c.submittedAt.localeCompare(a.c.submittedAt))
          return { item, confirmations }
        })
        .filter(g => g.confirmations.length > 0)
    : []

  // ── Checklist/session-type modules — flat per-session list (no item-name grouping layer,
  // same as FLMilestoneDetail.tsx's own non-individual history branch). Same
  // chronological-number-but-pending-first-display treatment as itemHistory above.
  const allChecklists = flId ? getFlChecklists(flId) : []
  const historySessions = !isIndividual
    ? allChecklists
        .filter(cl => (cl.status === 'submitted' || cl.status === 'scored') && (cl.tasks?.some(t => t.taskId === decodedKey) || cl.milestoneName === decodedKey))
        .sort((a, b) => a.day - b.day || (a.submittedAt ?? '').localeCompare(b.submittedAt ?? ''))
        .map((cl, idx) => {
          const score = cl.tasks?.find(t => t.taskId === decodedKey)?.kanitScore ?? cl.kanitScore ?? null
          return { cl, sessionNumber: idx + 1, score, verdict: sessionVerdict(cl, score) }
        })
        .sort((a, b) => verdictSortWeight(a.verdict) - verdictSortWeight(b.verdict) || (b.cl.submittedAt ?? '').localeCompare(a.cl.submittedAt ?? '') || b.cl.day - a.cl.day)
    : []

  const taskDef = DAILY_TASKS.find(t => t.id === decodedKey)
  const taskName = milestone?.name
    ?? taskDef?.name
    ?? historySessions[0]?.cl.tasks?.find(t => t.taskId === decodedKey)?.taskName
    ?? historySessions[0]?.cl.milestoneName
    ?? decodedKey

  // ── Mini Quiz — the data model only ever stores the latest attempt (score, answers,
  // attempt count), not a per-attempt log, so this shows current state rather than a true
  // attempt-by-attempt history.
  const quizScore = milestone?.id ? flProfile?.quizScores?.[milestone.id] : undefined
  const quizAttemptsUsed = milestone?.id ? (flProfile?.quizAttempts?.[milestone.id] ?? 0) : 0
  const quizAnswers = milestone?.id ? (flProfile?.quizAnswers?.[milestone.id] ?? {}) : {}
  const quizPassing = quizScore !== undefined && quizScore >= 75
  const quizResolved = isQuizResolved(quizScore, quizAttemptsUsed)

  if (!flId || !flUser) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#65758B]">OJT tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 text-sm text-[#023DFF] hover:underline">← Kembali</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#65758B] mb-6">
        <button onClick={() => navigate(-1)} className="hover:text-[#023DFF] transition-colors flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Kembali
        </button>
        <span>/</span>
        <span className="text-[#0F1729]">{taskName}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1729]">{taskName}</h1>
      </div>

      {/* Riwayat Latihan / Mini Quiz tabs — only worth splitting when there's actually a quiz */}
      {hasQuiz && (
        <div className="flex border-b border-[#E1E7EF] mb-6">
          <button
            onClick={() => setActiveTab('latihan')}
            className={`flex-1 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${activeTab === 'latihan' ? 'border-[#0F1729] text-[#0F1729]' : 'border-transparent text-[#94A3B8] hover:text-[#65758B]'}`}
          >
            Riwayat Latihan
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${activeTab === 'quiz' ? 'border-[#0F1729] text-[#0F1729]' : 'border-transparent text-[#94A3B8] hover:text-[#65758B]'}`}
          >
            Mini Quiz
          </button>
        </div>
      )}

      {activeTab === 'latihan' && (
        !isIndividual && (
          <>
            {/* Per-session cards */}
            {historySessions.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E1E7EF] p-12 text-center">
                <p className="text-[#94A3B8] text-sm">Belum ada riwayat untuk modul ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historySessions.map(({ cl, sessionNumber, verdict }) => {
                  const taskRecord = cl.tasks?.find(t => t.taskId === decodedKey)
                  const kanitNote = taskRecord?.kanitNote ?? cl.kanitNote
                  const completedIds = taskRecord?.completedItemIds ?? []
                  const reflection = taskRecord?.reflection
                  const isExpanded = expandedIds.has(cl.id)
                  return (
                    <div key={cl.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                      <button
                        onClick={() => toggleExpanded(cl.id)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] flex items-center gap-3 text-left hover:bg-[#F1F5F9] transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white border border-[#E1E7EF] flex items-center justify-center text-xs font-bold text-[#65758B] flex-shrink-0">
                          {sessionNumber}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#0F1729]">Sesi {sessionNumber}</p>
                          <p className="text-xs text-[#65758B]">{cl.date}</p>
                        </div>
                        <VerdictBadge verdict={verdict} />
                        <ExpandChevron expanded={isExpanded} />
                      </button>
                      {isExpanded && (
                        <div className="border-t border-[#E1E7EF] px-4 py-3 space-y-4">
                          {taskDef && taskDef.items.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-semibold text-[#65758B] uppercase tracking-wide">
                                Checklist ({completedIds.length}/{taskDef.items.length})
                              </p>
                              {taskDef.items.map(item => {
                                const done = completedIds.includes(item.id)
                                return (
                                  <div key={item.id} className="flex items-start gap-2.5">
                                    <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center ${done ? 'bg-[#023DFF]' : 'bg-[#F1F5F9] border border-[#CBD5E1]'}`}>
                                      {done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <p className={`text-xs leading-snug ${done ? 'text-[#0F1729]' : 'text-[#94A3B8]'}`}>{item.text}</p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          {kanitNote && <KanitFeedbackBox note={kanitNote} />}
                          {reflection && (
                            <div>
                              <p className="text-[10px] font-semibold text-[#65758B] uppercase tracking-wide mb-1">Refleksi</p>
                              <p className="text-xs text-[#0F1729] italic leading-relaxed">"{reflection}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )
      )}

      {activeTab === 'latihan' && isIndividual && (
        itemHistory.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-12 text-center">
            <p className="text-[#94A3B8] text-sm">Belum ada riwayat untuk modul ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itemHistory.map(({ item, confirmations }) => (
              <div key={item.id} className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E1E7EF] flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#0F1729] leading-snug">{item.text}</p>
                  <span className="flex-shrink-0 text-xs text-[#94A3B8] tabular-nums">{confirmations.length}/{item.target ?? 1} latihan</span>
                </div>
                <div className="divide-y divide-[#F1F5F9]">
                  {confirmations.map(({ c: conf, sessionNumber, verdict }) => {
                    const isExpanded = expandedIds.has(conf.id)
                    return (
                      <div key={conf.id}>
                        <button
                          onClick={() => toggleExpanded(conf.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0F1729]">Sesi {sessionNumber}</p>
                            <p className="text-[10px] text-[#94A3B8] tabular-nums mt-0.5">{formatSubmittedAt(conf.submittedAt)}</p>
                          </div>
                          <VerdictBadge verdict={verdict} />
                          <ExpandChevron expanded={isExpanded} />
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-3 pt-1 space-y-1.5">
                            {conf.nomorSbg && (
                              <p className="text-xs text-[#65758B]">Nomor SBG: <span className="text-[#0F1729] font-medium">{conf.nomorSbg}</span></p>
                            )}
                            {conf.nomorBox && conf.nomorBox.length > 0 && (
                              <p className="text-xs text-[#65758B]">Nomor Box: <span className="text-[#0F1729] font-medium">{conf.nomorBox.join(', ')}</span></p>
                            )}
                            {conf.catatan && (
                              <p className="text-xs text-[#65758B]">Refleksi: <span className="text-[#0F1729] italic">"{conf.catatan}"</span></p>
                            )}
                            {conf.kanitNote && <div className="mt-1.5"><KanitFeedbackBox note={conf.kanitNote} /></div>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'quiz' && hasQuiz && (
        quizScore === undefined ? (
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-12 text-center">
            <p className="text-[#94A3B8] text-sm">Peserta belum mengerjakan mini quiz untuk modul ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Same card structure as FLMilestoneDetail.tsx's own submitted-quiz card
                (quizCard) — kanit only views, so no "Coba Lagi"/"Lihat Jawaban" button and
                no retry-warning banner, even while a retry is still available to the FL. */}
            <div className={`bg-white rounded-xl border p-4 ${quizPassing ? 'border-[#E1E7EF]' : 'border-[#DC2626]/40'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${quizPassing ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'}`}>📝</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0F1729] text-sm">Mini Quiz</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold ${quizPassing ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{quizScore}/100</span>
                    <span className={`inline-flex items-center h-4 px-2 rounded-full text-[10px] font-bold border ${
                      quizPassing ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]' : 'bg-[#FEF2F2] border-[#DC2626]/50 text-[#DC2626]'
                    }`}>
                      {quizPassing ? 'Lulus' : quizResolved ? 'Tidak Lulus' : 'Belum Lulus'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {milestone!.quiz!.map((q, idx) => {
                const selected = quizAnswers[q.id]
                return (
                  <div key={q.id} className="bg-white rounded-xl border border-[#E1E7EF] p-5">
                    <p className="text-sm font-semibold text-[#0F1729] mb-3">{idx + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        let cls = 'border-[#E1E7EF] text-[#94A3B8]'
                        if (oIdx === q.correctIndex) cls = 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                        else if (selected === oIdx) cls = 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                        return (
                          <div key={oIdx} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm ${cls}`}>
                            <span className="w-5 h-5 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {oIdx === q.correctIndex && <span className="text-[10px] font-semibold text-[#16A34A] flex-shrink-0">Jawaban benar</span>}
                            {selected === oIdx && oIdx !== q.correctIndex && <span className="text-[10px] font-semibold text-[#DC2626] flex-shrink-0">Jawaban peserta</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}
    </div>
  )
}
