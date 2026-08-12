import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MILESTONES, getEffectiveTarget, ASSESSMENT_QUESTIONS, KKM_LATIHAN, KKM_UJIAN_AKHIR } from '../../data/mockData'
import type { KanitProfile, FLProfile } from '../../types'
import { StatusKelulusanCard } from '../../components/StatusKelulusanCard'

const PENAKSIRAN_MILESTONE_IDS = new Set(['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb'])

function formatAssessmentUnlockDate(startDate: string): string {
  const d = new Date(startDate)
  d.setDate(d.getDate() + 12)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function componentStatus(p: boolean | null): 'lulus' | 'tidak-lulus' | 'menunggu' {
  return p === true ? 'lulus' : p === false ? 'tidak-lulus' : 'menunggu'
}

function statusLabel(p: boolean | null): string {
  return p === true ? 'Lulus' : p === false ? 'Tidak Lulus' : 'Menunggu'
}

export default function KanitResults() {
  const { currentUser, getFlUsers, getFlScoreBreakdown, getFlAssessment, getFlChecklists, getFlFinalEvaluation, getItemConfirmations, level2Unlocks } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  // "Ready for evaluasi" — Latihan & Ujian Akhir both scored, so there's something
  // meaningful for the kanit to look at (and, on the results page below, act on).
  function readyForEvaluasi(flId: string): boolean {
    const s = getFlScoreBreakdown(flId)
    return s.dailyProgressScore !== null && s.assessmentScore !== null
  }

  const [searchParams] = useSearchParams()
  const [selectedFlId, setSelectedFlId] = useState<string>(() => {
    const fromUrl = searchParams.get('flId')
    if (fromUrl && flUsers.some(u => u.id === fromUrl)) return fromUrl
    const withAll = flUsers.find(u => readyForEvaluasi(u.id))
    return withAll?.id ?? flUsers.find(u => u.id === 'fl-001')?.id ?? flUsers[0]?.id ?? ''
  })
  const [pesertaSheetOpen, setPesertaSheetOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<'daily' | 'assessment' | 'evaluasi'>('daily')

  const selectedFl = flUsers.find(u => u.id === selectedFlId)
  const selectedFlProfile = selectedFl?.profile as FLProfile | undefined
  const scores = getFlScoreBreakdown(selectedFlId)
  const assessment = getFlAssessment(selectedFlId)
  const scoredChecklists = getFlChecklists(selectedFlId).filter(c => c.status === 'scored')
  const finalEval = getFlFinalEvaluation(selectedFlId)

  const mcqCorrect = assessment ? ASSESSMENT_QUESTIONS.reduce((count, q) => {
    const ans = assessment.answers.find(a => a.questionId === q.id)
    return count + (ans?.answer === q.options[q.correctIndex] ? 1 : 0)
  }, 0) : 0

  // Ported from FLScores.tsx's own moduleVerdict/isMilestoneCompleted, generalized to take
  // the selected FL instead of currentUser — same rule: a verdict only exists once the
  // module is finished (lulus) or the whole OJT program ended (day 13) while still
  // incomplete, otherwise it's still undecided ("—").
  function carriedOverFor(milestoneId: string): boolean {
    return level2Unlocks[selectedFlId]?.moduleDecisions?.[milestoneId]?.action === 'carry-over'
  }
  function getModuleExpectedForPass(milestoneId: string): number {
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (!milestone) return 0
    const carriedOver = carriedOverFor(milestoneId)
    return milestone.submissionType === 'individual'
      ? milestone.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).forPass, 0)
      : getEffectiveTarget(milestone, carriedOver).forPass
  }
  function isMilestoneCompleted(milestoneId: string): boolean {
    if (selectedFlProfile?.completedMilestoneIds?.includes(milestoneId)) return true
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (!milestone) return false
    const expectedForPass = getModuleExpectedForPass(milestoneId)
    const actualReviewed = milestone.submissionType === 'individual'
      ? milestone.checklistItems.reduce((sum, item) =>
          sum + getItemConfirmations(selectedFlId, milestoneId, item.id).filter(c => c.kanitPassed === true).length, 0
        )
      : PENAKSIRAN_MILESTONE_IDS.has(milestoneId)
        ? scoredChecklists.filter(cl => cl.milestoneId === milestoneId).length
        : scoredChecklists.filter(cl => cl.tasks?.some(t => t.taskId === milestoneId)).length
    if (actualReviewed < expectedForPass) return false
    if (milestone.quiz?.length) return selectedFlProfile?.quizScores?.[milestoneId] !== undefined
    return true
  }
  function moduleVerdict(milestoneId: string): 'lulus' | 'tidak-lulus' | null {
    if (isMilestoneCompleted(milestoneId)) return 'lulus'
    return (selectedFlProfile?.currentDay ?? 0) >= 13 ? 'tidak-lulus' : null
  }
  // The Latihan score is a running average over whatever's been scored SO FAR — showing
  // it (and its Lulus/Tidak Lulus verdict) before every module's own status has actually
  // come out would be premature and could flip later as more modules get scored. Only
  // reveal it once every module has a real verdict (same "—" vs lulus/tidak-lulus rule
  // the Ringkasan per Modul list below already uses).
  const allModulesDecided = MILESTONES.every(m => moduleVerdict(m.id) !== null)
  const latihanRevealed = allModulesDecided && scores.dailyProgressScore !== null

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729]">Nilai Akhir</h1>
      </div>

      {/* Pilih peserta — fullwidth field, opens a bottom sheet (same pattern as Review Progress) */}
      <button
        onClick={() => setPesertaSheetOpen(true)}
        className="w-full flex items-center justify-between gap-3 bg-white border border-[#E1E7EF] rounded-xl px-4 py-3 text-left mb-6 hover:border-[#023DFF] transition-colors"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-0.5">Pilih peserta</p>
          {selectedFl ? (
            <p className="text-sm font-bold text-[#0F1729] truncate">{selectedFl.name}</p>
          ) : (
            <p className="text-sm font-bold text-[#94A3B8]">Belum ada peserta</p>
          )}
        </div>
        <svg className="flex-shrink-0 text-[#94A3B8]" width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Pilih peserta — bottom sheet */}
      {pesertaSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) setPesertaSheetOpen(false) }}>
          <div className="bg-white rounded-t-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
            {/* Drag handle — part of the DS Bottom Sheet's documented anatomy
                (handle → title → body → actions), was missing entirely before. */}
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-[#E1E7EF]" />
            </div>
            <div className="px-5 py-4 border-b border-[#E1E7EF] flex items-center justify-between flex-shrink-0">
              <p className="text-sm font-bold text-[#0F1729]">Pilih Peserta</p>
              <button onClick={() => setPesertaSheetOpen(false)} className="text-[#94A3B8] hover:text-[#65758B] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-[#E1E7EF]">
              {flUsers.map(fl => {
                const flScores = getFlScoreBreakdown(fl.id)
                const isSelected = fl.id === selectedFlId
                return (
                  <button
                    key={fl.id}
                    onClick={() => { setSelectedFlId(fl.id); setPesertaSheetOpen(false) }}
                    className={`w-full min-h-11 flex items-center justify-between gap-3 px-5 py-2.5 text-left transition-colors ${isSelected ? 'bg-[#E5F2FF]' : 'hover:bg-[#F8FAFC]'}`}
                  >
                    <div className="min-w-0">
                      {/* DS List label = Body 2 (14px Regular) — color + the trailing
                          checkmark carry the "selected" signal, not extra boldness. */}
                      <p className={`text-sm font-normal truncate ${isSelected ? 'text-[#023DFF]' : 'text-[#0F1729]'}`}>{fl.name}</p>
                      {flScores.passed !== null && (
                        <p className={`text-xs mt-0.5 ${flScores.passed ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>{statusLabel(flScores.passed)}</p>
                      )}
                    </div>
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

      {selectedFl && selectedFlProfile && (
        <div className="space-y-4">
          {/* Isi/Lihat Evaluasi — a banner above Status Kelulusan rather than a small action
              button below it, so it actually gets noticed once Latihan & Ujian Akhir are
              both in. Explains WHY the kanit needs to act — Evaluasi Akhir is now one of
              the 3 pass/fail components, not an optional add-on. */}
          {readyForEvaluasi(selectedFlId) && !finalEval && (
            <div className="bg-[#023DFF] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📋</div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">Isi Rapot Akhir</p>
                  <p className="text-blue-100 text-xs mt-0.5">Lengkapi untuk menentukan kelulusan OJT, termasuk sikap & soft skills.</p>
                </div>
              </div>
              <Link to={`/kanit/final-eval/${selectedFlId}`} className="flex-shrink-0 bg-white text-[#023DFF] font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-center">
                Isi Rapot Akhir →
              </Link>
            </div>
          )}
          {/* No "rapot akhir sudah diisi" banner once it's filled in — removing it lets
              the kanit's eye go straight to Status Kelulusan below instead of a redundant
              confirmation. The Sikap Kerja detail panel's own "Edit Evaluasi →" link was
              also removed (2026-08-10 follow-up) — once submitted, there's no in-UI path
              back to `/kanit/final-eval/:flId` from this page anymore; that's intentional
              per explicit request, not an oversight. */}

          {/* Status Kelulusan — only once the rapot akhir is actually filled in. Without
              it, the overall gate can look prematurely "Tidak Lulus" the moment just one
              of the other 2 components fails (fail-fast), even though the kanit hasn't
              weighed in yet — so this deliberately requires finalEval to exist, not just
              scores.passed !== null. */}
          {finalEval && (
            <StatusKelulusanCard passed={scores.passed} />
          )}

          {/* 3-card grid — Latihan, Ujian Akhir, Evaluasi Akhir (kanit). Each card hides
              its score AND its note entirely while still pending — no "Belum tersedia"/
              "Belum diisi" filler text, just the dash + Menunggu badge. */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <ScoreCard label="Latihan" status={latihanRevealed ? componentStatus(scores.latihanPassed) : 'menunggu'} score={latihanRevealed ? scores.dailyProgressScore : null} note={latihanRevealed ? `Min. lulus ${KKM_LATIHAN}` : undefined} isActive={selectedCard === 'daily'} onClick={() => setSelectedCard('daily')} />
            <ScoreCard label="Ujian Akhir" status={componentStatus(scores.ujianPassed)} score={scores.assessmentScore} note={assessment ? `Min. lulus ${KKM_UJIAN_AKHIR}` : undefined} isActive={selectedCard === 'assessment'} onClick={() => setSelectedCard('assessment')} />
            <ScoreCard label="Sikap Kerja" status={componentStatus(scores.evaluasiPassed)} score={null} note={finalEval ? 'Min. lulus' : undefined} isActive={selectedCard === 'evaluasi'} onClick={() => setSelectedCard('evaluasi')} />
          </div>

          {/* Detail panel */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
            {selectedCard === 'daily' && (
              <div className="p-5">
                <h3 className="text-sm text-[#65758B] mb-4">Ringkasan per Modul</h3>
                <div className="divide-y divide-[#F1F5F9]">
                  {MILESTONES.map(m => {
                    const verdict = moduleVerdict(m.id)
                    return (
                      <Link
                        key={m.id}
                        to={`/kanit/task-history/${selectedFlId}/${encodeURIComponent(m.id)}`}
                        className="flex items-center gap-3 py-3 -mx-2 px-2 rounded-lg hover:bg-[#F8FAFC] transition-colors group"
                      >
                        <p className="flex-1 min-w-0 text-sm font-semibold text-[#0F1729] truncate">{m.name}</p>
                        {verdict ? (
                          <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            verdict === 'lulus' ? 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D]' : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
                          }`}>
                            {verdict === 'lulus' ? 'Lulus' : 'Tidak Lulus'}
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-sm text-[#CBD5E1]">—</span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-[#CBD5E1] group-hover:text-[#023DFF] transition-colors">
                          <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Ujian Akhir — same detail as FLScores.tsx's own assessment panel; kanit sees
                the full score breakdown and can drill into the per-question review, just
                like the peserta themselves can. */}
            {selectedCard === 'assessment' && (
              <div className="p-5">
                {!assessment ? (() => {
                  const locked = selectedFlProfile.currentDay < 13
                  return (
                    <div className="flex items-center gap-3 py-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">{locked ? '🔒' : '⏳'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F1729]">Ujian Akhir Belum Dikerjakan</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5 truncate">
                          {locked ? `Ujian dibuka pada ${formatAssessmentUnlockDate(selectedFlProfile.startDate)}` : 'Peserta belum mengerjakan ujian akhir.'}
                        </p>
                      </div>
                    </div>
                  )
                })() : (
                  <>
                    <div className="divide-y divide-[#F1F5F9] mb-4">
                      <div className="flex items-center justify-between py-3">
                        <p className="text-sm font-semibold text-[#0F1729]">Total Nilai</p>
                        <span className="text-sm font-bold text-[#023DFF]">{assessment.mcqScore ?? Math.round((mcqCorrect / ASSESSMENT_QUESTIONS.length) * 100)}/100</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <p className="text-sm font-semibold text-[#0F1729]">Jawaban Benar</p>
                        <span className="text-sm font-bold text-[#0F1729]">{mcqCorrect}/{ASSESSMENT_QUESTIONS.length}</span>
                      </div>
                    </div>
                    <Link
                      to={`/kanit/assessment-review/${selectedFlId}`}
                      className="flex items-center justify-center h-9 bg-white border border-[#CBD5E1] text-[#0F1729] text-sm font-semibold rounded-lg hover:bg-[#E5F2FF] hover:text-[#023DFF] hover:border-[#023DFF] transition-colors"
                    >
                      Lihat Jawaban →
                    </Link>
                  </>
                )}
              </div>
            )}

            {selectedCard === 'evaluasi' && (
              <div className="p-5">
                {!finalEval ? (
                  <div className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">⏳</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F1729]">Evaluasi Sikap Kerja</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Evaluasi dibuka pada {formatAssessmentUnlockDate(selectedFlProfile.startDate)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`rounded-lg px-4 py-3 ${finalEval.recommendation === 'lulus' ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#65758B] mb-1">Feedback</p>
                      <p className={`text-sm italic leading-relaxed ${finalEval.recommendation === 'lulus' ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>"{finalEval.feedback}"</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#65758B] uppercase tracking-wide mb-2">Soft Skills & Attitude</p>
                      <div className="space-y-1.5">
                        {finalEval.softSkills.map(s => (
                          <div key={s.skill} className="flex items-center justify-between text-sm">
                            <span className="text-[#65758B]">{s.skill}</span>
                            <span className="font-semibold text-[#0F1729]">{s.score}/5</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-sm pt-1.5 mt-1.5 border-t border-[#F1F5F9]">
                          <span className="text-[#65758B] font-semibold">Attitude & Kedisiplinan</span>
                          <span className="font-semibold text-[#0F1729]">{finalEval.attitudeScore}/5</span>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-1.5 mt-1.5 border-t border-[#F1F5F9]">
                          <span className="text-[#0F1729] font-bold">Total Nilai</span>
                          <span className="font-bold text-[#023DFF]">
                            {((finalEval.softSkills.reduce((sum, s) => sum + s.score, 0) + finalEval.attitudeScore) / (finalEval.softSkills.length + 1)).toFixed(1)}/5
                          </span>
                        </div>
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

function ScoreCard({ label, status, score, note, isActive, onClick }: {
  label: string; status: 'lulus' | 'tidak-lulus' | 'menunggu'; score: number | null; note?: string; isActive: boolean; onClick: () => void
}) {
  const scoreColor = score === null ? 'text-[#CBD5E1]' : 'text-[#023DFF]'
  const statusBadge = status === 'lulus'
    ? { bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]', label: 'Lulus' }
    : status === 'tidak-lulus'
      ? { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', label: 'Tidak Lulus' }
      : { bg: 'bg-[#F1F5F9]', text: 'text-[#65758B]', label: 'Menunggu' }
  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col text-left rounded-xl px-2.5 sm:px-4 py-3 sm:py-4 transition-all ${
        isActive ? 'bg-white border-2 border-[#023DFF]' : 'bg-white border border-[#E1E7EF] hover:border-[#94A3B8]'
      }`}
    >
      <p className={`text-xs font-semibold mb-2 truncate ${isActive ? 'text-[#023DFF]' : 'text-[#65758B]'}`}>{label}</p>
      <p className={`text-2xl sm:text-3xl font-black mb-1 ${scoreColor}`}>{score ?? '—'}</p>
      <span className={`self-start inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ${note ? 'mb-1' : ''} ${statusBadge.bg} ${statusBadge.text}`}>{statusBadge.label}</span>
      {note && <p className="text-[11px] text-[#94A3B8]">{note}</p>}
    </button>
  )
}
