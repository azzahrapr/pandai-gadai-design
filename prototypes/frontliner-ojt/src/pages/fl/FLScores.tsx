import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ASSESSMENT_QUESTIONS, MILESTONES, getEffectiveTarget, KKM_LATIHAN, KKM_UJIAN_AKHIR } from '../../data/mockData'
import type { FLProfile } from '../../types'
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

export default function FLScores() {
  const { currentUser, getFlScoreBreakdown, getFlChecklists, getFlAssessment, getFlFinalEvaluation, getItemConfirmations, level2Unlocks } = useApp()
  const profile = currentUser!.profile as FLProfile
  const scores = getFlScoreBreakdown(currentUser!.id)
  const allChecklists = getFlChecklists(currentUser!.id)
  const scoredChecklists = allChecklists.filter(c => c.status === 'scored')
  const assessment = getFlAssessment(currentUser!.id)
  const finalEval = getFlFinalEvaluation(currentUser!.id)
  const [selectedCard, setSelectedCard] = useState<'daily' | 'assessment' | 'evaluasi'>('daily')

  const mcqCorrect = assessment ? ASSESSMENT_QUESTIONS.reduce((count, q) => {
    const ans = assessment.answers.find(a => a.questionId === q.id)
    return count + (ans?.answer === q.options[q.correctIndex] ? 1 : 0)
  }, 0) : 0

  // A verdict only exists once the module is finished (lulus) or the whole OJT program
  // has ended (day 13) while it's still incomplete — otherwise it's still undecided ("-").
  function moduleVerdict(milestoneId: string): 'lulus' | 'tidak-lulus' | null {
    if (isMilestoneCompleted(milestoneId)) return 'lulus'
    return profile.currentDay >= 13 ? 'tidak-lulus' : null
  }

  function carriedOverFor(milestoneId: string): boolean {
    return level2Unlocks[currentUser!.id]?.moduleDecisions?.[milestoneId]?.action === 'carry-over'
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
    if (profile.completedMilestoneIds?.includes(milestoneId)) return true
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (!milestone) return false
    const expectedForPass = getModuleExpectedForPass(milestoneId)
    const actualReviewed = milestone.submissionType === 'individual'
      ? milestone.checklistItems.reduce((sum, item) =>
          sum + getItemConfirmations(currentUser!.id, milestoneId, item.id).filter(c => c.kanitPassed === true).length, 0
        )
      : PENAKSIRAN_MILESTONE_IDS.has(milestoneId)
        ? scoredChecklists.filter(cl => cl.milestoneId === milestoneId).length
        : scoredChecklists.filter(cl => cl.tasks?.some(t => t.taskId === milestoneId)).length
    if (actualReviewed < expectedForPass) return false
    if (milestone.quiz?.length) return profile.quizScores?.[milestoneId] !== undefined
    return true
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
        <h1 className="text-2xl font-bold text-[#0F1729]">Nilai Saya</h1>
      </div>

      <div className="space-y-4">
        {/* Status Kelulusan — only once the rapot akhir is actually filled in (see
            KanitResults.tsx for the matching note on why this isn't just
            scores.passed !== null — fail-fast can flag "Tidak Lulus" from just one
            component before the kanit has even weighed in). */}
        {finalEval && (
          <StatusKelulusanCard passed={scores.passed} />
        )}

        {/* 3-card grid — Latihan, Ujian Akhir, Evaluasi Akhir (kanit), each its own gate.
            Every card hides its score AND its note entirely while still pending — no
            "Belum tersedia"/"Belum diisi" filler text, just the dash + Menunggu badge. */}
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
                      to={`/fl/milestones/${m.id}`}
                      state={{ openHistory: true }}
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

          {selectedCard === 'assessment' && (
            <div className="p-5">
              {!assessment ? (
                (() => {
                  const locked = profile.currentDay < 13
                  if (locked) {
                    return (
                      <div className="flex items-center gap-3 py-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">🔒</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0F1729]">Ujian Akhir Belum Dikerjakan</p>
                          <p className="text-xs text-[#94A3B8] mt-0.5 truncate">Ujian dibuka pada {formatAssessmentUnlockDate(profile.startDate)}</p>
                        </div>
                      </div>
                    )
                  }
                  // Unlocked and actionable — back to the plain compact row (the blue
                  // full card read too heavy for this context) but borrowing the
                  // dashboard alert's copy instead of the shorter placeholder text.
                  return (
                    <div className="py-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">🎓</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0F1729]">Ujian Akhir OJT siap dikerjakan!</p>
                          <p className="text-xs text-[#65758B] mt-0.5">Kamu sudah mencapai hari akhir training. Selesaikan ujian akhir untuk mendapatkan penilaian akhir.</p>
                        </div>
                      </div>
                      <Link
                        to="/fl/assessment"
                        className="w-full flex items-center justify-center h-9 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg transition-colors"
                      >
                        Mulai Sekarang →
                      </Link>
                    </div>
                  )
                })()
              ) : (
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
                    to="/fl/assessment"
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
                    <p className="text-sm font-semibold text-[#0F1729]">Menunggu Evaluasi Sikap Kerja</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Kanit belum mengisi evaluasi akhir untuk kamu.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`rounded-lg px-4 py-3 ${finalEval.recommendation === 'lulus' ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#65758B] mb-1">Feedback Kanit</p>
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
