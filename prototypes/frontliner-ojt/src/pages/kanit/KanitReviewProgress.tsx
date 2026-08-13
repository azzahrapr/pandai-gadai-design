import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { ModuleDecision } from '../../context/AppContext'
import { MILESTONES, getEffectiveTarget } from '../../data/mockData'
import type { KanitProfile, FLProfile, DailyChecklist, ExtensionRequest } from '../../types'
import { Toast } from '../../components/Toast'

const PENAKSIRAN_MILESTONE_IDS = ['penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb']
const MAX_QUIZ_ATTEMPTS = 2

// A quiz is "resolved" (won't block a module's "Lulus" status any further) once
// passed, or once the one-retry allowance has been used up without passing. Mirrors
// FLMilestones.tsx's isQuizResolved exactly, so both sides agree on when a quiz stops
// being the blocker.
function isQuizResolved(quizScore: number | undefined, attemptsUsed: number): boolean {
  return quizScore !== undefined && (quizScore >= 75 || attemptsUsed >= MAX_QUIZ_ATTEMPTS)
}

const MILESTONE_TASK_MAP: Record<string, string[]> = {
  'closing-cabang': ['closing-cabang'],
  'opening-cabang': ['opening-cabang'],
  'personal-grooming': ['personal-grooming'],
  'personal-grooming-l2': ['personal-grooming-l2'],
  'pengenalan-produk': ['pengenalan-produk'],
  'canvassing': ['canvassing'],
  'cash-management': ['cash-management'],
  'sop-administrasi': ['sop-administrasi'],
  'packing-sealing': ['packing-sealing'],
  'offloading': ['offloading'],
  'pelayanan-nasabah': ['pelayanan-nasabah'],
  'pelayanan-nasabah-transaksi': ['pelayanan-nasabah-transaksi'],
  'customer-service-wa': ['customer-service-wa'],
  'penaksiran-elektronik': ['penaksiran-elektronik'],
  'penaksiran-emas': ['penaksiran-emas'],
  'penaksiran-bpkb': ['penaksiran-bpkb'],
}

const CARRY_OVER_REASONS = [
  { id: 'cuti', label: 'Cuti' },
  { id: 'sakit', label: 'Sakit' },
  { id: 'darurat', label: 'Kondisi Darurat' },
  { id: 'lainnya', label: 'Lainnya' },
]

export default function KanitReviewProgress() {
  const {
    currentUser, getFlUsers, getFlChecklists, getItemConfirmations,
    scoreChecklist, scoreChecklistTasks,
    level2Unlocks, unlockLevel2,
    extensionRequests, respondExtension,
    getFlScoreBreakdown, getFlFinalEvaluation,
  } = useApp()
  const profile = currentUser!.profile as KanitProfile
  const flUsers = getFlUsers().filter(u => profile.flIds.includes(u.id))

  // Pending TaskConfirmations for individual-type ("essay"/discounter) modules — same
  // notion of "pending" as checklist-based ones (kanitPassed never set), just scoped to
  // active-and-not-yet-completed individual milestones so an already-`completedMilestoneIds`
  // module's stale unreviewed confirmations don't resurface as if newly pending.
  function getPendingConfirmationCount(flId: string): number {
    const fp = flUsers.find(u => u.id === flId)?.profile as FLProfile | undefined
    if (!fp) return 0
    return MILESTONES
      .filter(m => m.submissionType === 'individual' && fp.activeMilestoneIds.includes(m.id) && !fp.completedMilestoneIds?.includes(m.id))
      .reduce((sum, m) => sum + m.checklistItems.reduce((s, item) =>
        s + getItemConfirmations(flId, m.id, item.id).filter(c => c.kanitPassed === undefined).length, 0), 0)
  }

  function hasPendingReview(flId: string): boolean {
    return getFlChecklists(flId).some(c => c.status === 'submitted') || getPendingConfirmationCount(flId) > 0
  }

  // "Ready for evaluasi" — same condition KanitResults.tsx uses to show its own "Isi
  // Rapot Akhir" banner (Latihan & Ujian Akhir both scored). Mirrored here so this page
  // can surface the same banner the moment there's nothing left to review/study — see
  // its render site below for the full "nothing pending, nothing late" gate.
  function readyForEvaluasi(flId: string): boolean {
    const s = getFlScoreBreakdown(flId)
    return s.dailyProgressScore !== null && s.assessmentScore !== null
  }

  const [searchParams] = useSearchParams()
  const [selectedFlId, setSelectedFlId] = useState<string>(() => {
    const fromUrl = searchParams.get('flId')
    if (fromUrl && flUsers.some(u => u.id === fromUrl)) return fromUrl
    const withPending = flUsers.find(u => hasPendingReview(u.id))
    return withPending?.id ?? flUsers[0]?.id ?? ''
  })
  const [pesertaSheetOpen, setPesertaSheetOpen] = useState(false)
  // Defaults to whichever tab is actually actionable for the initially-selected FL —
  // "Menunggu Review" if they have anything pending, else "Progress Belajar" — unless a
  // caller explicitly asked for one via ?tab=, which always wins (e.g. KanitDashboard's
  // "Buka Akses Materi" link always wants ?tab=progress regardless of pending review).
  // A Level-1-lateness FL always opens on Progress Belajar — that banner needs the kanit's
  // attention before anything else, even if the same FL also has pending reviews (Sari is
  // both at once: 2 pending confirmations AND several late Level 1 modules).
  const [contentTab, setContentTab] = useState<'review' | 'progress'>(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'progress' || tabParam === 'review') return tabParam
    if (needsLevel2Unlock(selectedFlId)) return 'progress'
    return hasPendingReview(selectedFlId) ? 'review' : 'progress'
  })

  // Extension requests state
  const [extNotes, setExtNotes] = useState<Record<string, string>>({})

  // Progress Belajar state
  const [showUnlockForm, setShowUnlockForm] = useState(false)
  const [moduleDecisions, setModuleDecisions] = useState<Record<string, { action: 'carry-over' | 'close' | null; reason?: string; note?: string }>>({})
  // Toast + highlight shown right after "Ambil Tindakan" is confirmed — covers both
  // outcomes (carry-over moves the module's card into Level 2 immediately, close just
  // marks it Tidak Lulus in place), so this calls out what just happened and, for
  // carry-over specifically, scrolls the moved card(s) into view.
  const [actionToast, setActionToast] = useState<string | null>(null)
  const [justCarriedOverIds, setJustCarriedOverIds] = useState<string[]>([])

  const selectedFl = flUsers.find(u => u.id === selectedFlId)
  const flProfile = selectedFl?.profile as FLProfile | undefined

  // --- Review helpers ---
  const checklists = getFlChecklists(selectedFlId)
  const pending = checklists.filter(c => c.status === 'submitted')

  // Groups pending checklists by module (not by day) — a module can have more than one
  // pending session piled up across days, and each group is reviewed on its own page
  // (see KanitReviewLatihan.tsx) rather than expanded inline here. Key scheme matches
  // the per-module task-history page linked from Progress Belajar's module cards below
  // (taskId for new-format checklists, milestoneName for legacy items-format) so both
  // features stay consistent about what "a module" means.
  function pendingModuleKey(cl: DailyChecklist): string {
    return cl.tasks?.[0]?.taskId ?? cl.milestoneName ?? cl.milestoneId ?? cl.id
  }
  // No more checklist-vs-confirmation split here — both kinds share one URL scheme
  // (/kanit/review-latihan/:flId/:moduleKey) and KanitReviewLatihan.tsx itself decides
  // which content to render based on the module's submissionType. The key is a milestone
  // id for confirmation-type groups (see below) and taskId/milestoneName/milestoneId/id
  // for checklist-type ones — both resolve correctly through that one route.
  type PendingGroup = { key: string; moduleName: string; count: number; earliestDay: number; earliestDate: string }
  const pendingModuleGroups: PendingGroup[] = (() => {
    const map = new Map<string, PendingGroup>()
    pending.forEach(cl => {
      const key = pendingModuleKey(cl)
      const moduleName = MILESTONES.find(m => m.id === key)?.name ?? cl.tasks?.[0]?.taskName ?? cl.milestoneName ?? key
      const existing = map.get(key)
      if (!existing) {
        map.set(key, { key, moduleName, count: 1, earliestDay: cl.day, earliestDate: cl.date })
      } else {
        existing.count++
        if (cl.day < existing.earliestDay) { existing.earliestDay = cl.day; existing.earliestDate = cl.date }
      }
    })

    // Individual-type ("essay"/discounter) modules — pending TaskConfirmations, grouped
    // per module (not per checklistItem) so the card/page title reads as a module name,
    // same as the checklist-based groups above. A module can have several checklistItems
    // ("latihan") pending at once, and each of those can itself have more than one pending
    // submission — all of that is reviewed together on one page (see itemHistory in
    // FLMilestoneDetail.tsx for the equivalent module→latihan→sesi grouping shown on the
    // FL side).
    if (flProfile) {
      MILESTONES
        .filter(m => m.submissionType === 'individual' && flProfile.activeMilestoneIds.includes(m.id) && !flProfile.completedMilestoneIds?.includes(m.id))
        .forEach(m => {
          const modulePending = m.checklistItems.flatMap(item =>
            getItemConfirmations(selectedFlId, m.id, item.id).filter(c => c.kanitPassed === undefined)
          )
          if (modulePending.length === 0) return
          const earliest = modulePending.reduce((min, c) => c.day < min.day ? c : min, modulePending[0])
          map.set(m.id, {
            key: m.id,
            moduleName: m.name,
            count: modulePending.length,
            earliestDay: earliest.day,
            earliestDate: earliest.submittedAt.slice(0, 10),
          })
        })
    }

    return Array.from(map.values()).sort((a, b) => a.earliestDay - b.earliestDay)
  })()

  // --- Progress helpers ---
  // Ported from FLMilestones.tsx's getMilestoneProgress/isMilestoneCompleted so the
  // Kanit side computes module status identically to what the FL themselves sees —
  // same individual-vs-session submissionType handling, same PENAKSIRAN/quiz rules.
  // Generalized to take an flId (Kanit views many FLs) instead of reading currentUser.
  function getMilestoneProgress(flId: string, milestoneId: string): { actual: number; expected: number; isStarted: boolean; isCompleted: boolean } {
    const fp = flUsers.find(u => u.id === flId)?.profile as FLProfile | undefined
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    const carriedOver = carriedOverFor(flId, milestoneId)
    if (fp?.completedMilestoneIds?.includes(milestoneId)) {
      const expected = milestone?.submissionType === 'individual'
        ? milestone.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).attempts, 0)
        : getEffectiveTarget(milestone ?? {}, carriedOver).attempts
      return { actual: expected, expected, isStarted: true, isCompleted: true }
    }
    if (milestone?.submissionType === 'individual') {
      const actual = milestone.checklistItems.reduce((sum, item) =>
        sum + getItemConfirmations(flId, milestoneId, item.id).filter(c => c.kanitPassed !== false).length, 0)
      const actualReviewed = milestone.checklistItems.reduce((sum, item) =>
        sum + getItemConfirmations(flId, milestoneId, item.id).filter(c => c.kanitPassed === true).length, 0)
      const expected = milestone.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).attempts, 0)
      const expectedForPass = milestone.checklistItems.reduce((sum, item) => sum + getEffectiveTarget(item, carriedOver).forPass, 0)
      return { actual, expected, isStarted: actual > 0, isCompleted: actualReviewed >= expectedForPass }
    }
    const { attempts: expected, forPass: expectedForPass } = milestone ? getEffectiveTarget(milestone, carriedOver) : { attempts: 2, forPass: 2 }
    const checklists = getFlChecklists(flId)
    const submittedChecklists = checklists.filter(c => c.status === 'submitted' || c.status === 'scored')
    const scoredChecklists = checklists.filter(c => c.status === 'scored')
    let actual: number
    let actualReviewed: number
    if (PENAKSIRAN_MILESTONE_IDS.includes(milestoneId)) {
      actual = submittedChecklists.filter(cl => cl.milestoneId === milestoneId).length
      actualReviewed = scoredChecklists.filter(cl => cl.milestoneId === milestoneId).length
    } else {
      const taskIds = MILESTONE_TASK_MAP[milestoneId] ?? []
      actual = taskIds.length > 0 ? submittedChecklists.filter(cl => cl.tasks?.some(t => taskIds.includes(t.taskId))).length : 0
      actualReviewed = taskIds.length > 0 ? scoredChecklists.filter(cl => cl.tasks?.some(t => taskIds.includes(t.taskId))).length : 0
    }
    return { actual, expected, isStarted: actual > 0, isCompleted: actualReviewed >= expectedForPass }
  }

  function isMilestoneCompleted(flId: string, milestoneId: string): boolean {
    const fp = flUsers.find(u => u.id === flId)?.profile as FLProfile | undefined
    const { isCompleted } = getMilestoneProgress(flId, milestoneId)
    const checklistDone = fp?.completedMilestoneIds?.includes(milestoneId)
      || (MILESTONE_TASK_MAP[milestoneId]?.length ? isCompleted : false)
    if (!checklistDone) return false
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (milestone?.quiz?.length) return isQuizResolved(fp?.quizScores?.[milestoneId], fp?.quizAttempts?.[milestoneId] ?? 0)
    return true
  }

  // A kanit can explicitly close a Level 1 module instead of carrying it over — that's
  // an immediate, final "Tidak Lulus", independent of the day-13 program-end fallback.
  function moduleClosedByKanit(flId: string, milestoneId: string): boolean {
    return level2Unlocks[flId]?.moduleDecisions?.[milestoneId]?.action === 'close'
  }

  function carriedOverFor(flId: string, milestoneId: string): boolean {
    return level2Unlocks[flId]?.moduleDecisions?.[milestoneId]?.action === 'carry-over'
  }

  // "Tidak Lulus" — either kanit explicitly closed it, or the whole program ended (day
  // 13) while the completion target was never met. Mutually exclusive with completed.
  function isModuleFailed(flId: string, flProfile: FLProfile, milestoneId: string, isLocked: boolean): boolean {
    if (isLocked || isMilestoneCompleted(flId, milestoneId)) return false
    return moduleClosedByKanit(flId, milestoneId) || flProfile.currentDay >= 13
  }

  function needsLevel2Unlock(flId: string): boolean {
    const fp = flUsers.find(u => u.id === flId)?.profile as FLProfile | undefined
    if (!fp || fp.currentDay < 8 || level2Unlocks[flId]) return false
    const level1 = MILESTONES.filter(m => m.type === 'minggu1' && fp.activeMilestoneIds.includes(m.id))
    return !level1.every(m => isMilestoneCompleted(flId, m.id))
  }

  // Kept short and independent from the toast's own (longer) auto-dismiss timer — the
  // highlight ring is just a "look here" cue for the scroll landing, not something that
  // needs to stay lit for as long as the toast message itself.
  const CARRY_OVER_HIGHLIGHT_MS = 1200

  function handleUnlock() {
    if (!selectedFlId) return
    const decisions = Object.entries(moduleDecisions)
    const carriedIds = decisions.filter(([, d]) => d.action === 'carry-over').map(([id]) => id)
    const closedIds = decisions.filter(([, d]) => d.action === 'close').map(([id]) => id)
    unlockLevel2(selectedFlId, moduleDecisions as Record<string, ModuleDecision>)
    setShowUnlockForm(false)
    setModuleDecisions({})
    setContentTab('progress')

    // One toast covering whichever outcome(s) actually happened — a kanit can mix
    // "Lanjutkan" and "Tutup Modul" decisions across modules in the same confirm.
    const messages: string[] = []
    if (carriedIds.length > 0) messages.push(`${carriedIds.length} modul berhasil dilanjutkan ke Level 2`)
    if (closedIds.length > 0) messages.push(`${closedIds.length} modul berhasil ditutup`)
    if (messages.length > 0) setActionToast(messages.join(', ') + '.')

    if (carriedIds.length > 0) {
      setJustCarriedOverIds(carriedIds)
      setTimeout(() => setJustCarriedOverIds([]), CARRY_OVER_HIGHLIGHT_MS)
      // Wait for the modal-close + tab-switch render to settle before scrolling.
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.getElementById('carry-over-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 50)
      })
    }
  }

  // Derived progress state for selected FL
  const unlock = level2Unlocks[selectedFlId]
  const level1Milestones = flProfile ? MILESTONES.filter(m => m.type === 'minggu1' && flProfile.activeMilestoneIds.includes(m.id)) : []
  const allLevel1Done = level1Milestones.every(m => isMilestoneCompleted(selectedFlId, m.id))
  // The specific late Level 1 modules driving needsLevel2Unlock(selectedFlId) — surfaced in the
  // top-of-page banner below (was previously just a generic "some module" message) and
  // reused by the Buka Akses modal so both agree on exactly which modules need a decision.
  const incompleteL1Modules = level1Milestones.filter(m => !isMilestoneCompleted(selectedFlId, m.id))
  // Same "Terlambat" window FLMilestones.tsx uses: day >= 7 (last Level-1 day), Level 1
  // not fully done yet, and kanit hasn't already decided each late module's fate.
  const needsKanitApproval = (flProfile?.currentDay ?? 0) >= 7 && !allLevel1Done && !unlock

  function switchFl(flId: string) {
    setSelectedFlId(flId)
    setContentTab(needsLevel2Unlock(flId) ? 'progress' : (hasPendingReview(flId) ? 'review' : 'progress'))
    setShowUnlockForm(false)
    setModuleDecisions({})
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1729]">Review Progress OJT</h1>
      </div>

      {/* Pilih peserta — fullwidth field, opens a bottom sheet to pick */}
      <button
        onClick={() => setPesertaSheetOpen(true)}
        className="w-full flex items-center justify-between gap-3 bg-white border border-[#E1E7EF] rounded-xl px-4 py-3 text-left mb-6 hover:border-[#023DFF] transition-colors"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-0.5">Pilih peserta</p>
          {selectedFl && flProfile ? (() => {
            const totalPending = pending.length + getPendingConfirmationCount(selectedFlId)
            return (
              <p className="text-sm font-bold text-[#0F1729] truncate">
                {selectedFl.name} — Hari {flProfile.currentDay}{totalPending > 0 ? ` (${totalPending} pending)` : ''}
              </p>
            )
          })() : (
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
                const pend = getFlChecklists(fl.id).filter(c => c.status === 'submitted').length
                const pendExt = extensionRequests.filter(r => r.flId === fl.id && r.type === 'daily-redo' && r.status === 'pending').length
                const total = pend + pendExt + getPendingConfirmationCount(fl.id)
                const isSelected = fl.id === selectedFlId
                return (
                  <button
                    key={fl.id}
                    onClick={() => { switchFl(fl.id); setPesertaSheetOpen(false) }}
                    className={`w-full min-h-11 flex items-center justify-between gap-3 px-5 py-2.5 text-left transition-colors ${isSelected ? 'bg-[#E5F2FF]' : 'hover:bg-[#F8FAFC]'}`}
                  >
                    <div className="min-w-0">
                      {/* DS List label = Body 2 (14px Regular) — color + the trailing
                          checkmark carry the "selected" signal, not extra boldness. */}
                      <p className={`text-sm font-normal truncate ${isSelected ? 'text-[#023DFF]' : 'text-[#0F1729]'}`}>{fl.name}</p>
                      {total > 0 && <p className="text-xs text-[#65758B] mt-0.5">{total} pending review</p>}
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

      {/* Level 1 lateness banner — surfaced at the very top, visible regardless of which
          content tab is active, since it needs the kanit's attention the moment they open
          this FL's review. contentTab's own init (above) already forces Progress Belajar
          open whenever this banner shows, so the module list right below is one scroll away. */}
      {selectedFl && flProfile && needsLevel2Unlock(selectedFlId) && (
        <div className="bg-[#FEFDEA] border border-[#E0A200] rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-bold text-[#B27202]">{incompleteL1Modules.length} modul Level 1 tidak selesai</p>
              <p className="text-xs text-[#B27202]/80 mt-0.5">OJT tidak menyelesaikan {incompleteL1Modules.length} modul tepat waktu. Ambil tindakan untuk tiap modul yang terlambat.</p>
            </div>
          </div>
          <button onClick={() => setShowUnlockForm(true)} className="flex-shrink-0 h-9 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors">Ambil Tindakan →</button>
        </div>
      )}

      {/* Isi Rapot Akhir banner — reused verbatim from KanitResults.tsx's own banner
          (same copy, same style, same destination), surfaced here too and placed above
          the tabs so it's the very first thing the kanit sees once there's genuinely
          nothing left to review or study for this FL (no pending review, no late Level 1
          modules awaiting a decision) but Rapot Akhir hasn't been filled in yet — e.g.
          Dewi, who's fully done and just waiting on the kanit. Without this, the kanit
          would land on two empty tabs with no clear next step. */}
      {selectedFl && flProfile && readyForEvaluasi(selectedFlId) && !getFlFinalEvaluation(selectedFlId)
        && !hasPendingReview(selectedFlId) && !needsLevel2Unlock(selectedFlId) && (
        <div className="bg-[#023DFF] rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
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

      {selectedFl && (
        <div>
            {/* Content tabs */}
            <div className="flex border-b border-[#E1E7EF] mb-6">
              <button
                onClick={() => setContentTab('review')}
                className={`flex-1 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${
                  contentTab === 'review'
                    ? 'border-[#0F1729] text-[#0F1729]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#65758B]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  Review Latihan
                  {pendingModuleGroups.length > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-[#DC2626] text-white">
                      {pendingModuleGroups.length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setContentTab('progress')}
                className={`flex-1 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${
                  contentTab === 'progress'
                    ? 'border-[#0F1729] text-[#0F1729]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#65758B]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  Progress Belajar
                  {needsLevel2Unlock(selectedFlId) && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-[#DC2626] text-white">
                      1
                    </span>
                  )}
                </span>
              </button>
            </div>
            {contentTab === 'review' && (
            <div className="space-y-4">
            {pendingModuleGroups.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <p className="text-sm font-semibold text-[#0F1729]">Menunggu Review ({pendingModuleGroups.length})</p>
                </div>
                <div className="space-y-3">
                  {pendingModuleGroups.map(group => (
                    <Link
                      key={group.key}
                      to={`/kanit/review-latihan/${selectedFlId}/${encodeURIComponent(group.key)}`}
                      className="flex items-center justify-between gap-3 bg-white rounded-xl border border-[#E1E7EF] p-5 hover:border-[#023DFF]/40 hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0F1729]">{group.moduleName}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center h-4 px-2 rounded-full text-[10px] font-bold leading-none bg-[#FEFDEA] border border-[#E0A200] text-[#B27202]">{group.count} pending review</span>
                          <span className="text-xs text-[#65758B]">{group.earliestDate}</span>
                        </div>
                      </div>
                      <svg className="flex-shrink-0 text-[#CBD5E1] group-hover:text-[#023DFF] transition-colors" width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-6 text-center">
                <span className="text-2xl">✅</span>
                <p className="font-semibold text-[#15803D] mt-2 text-sm">Tidak ada latihan pending untuk {selectedFl.name.split(' ')[0]}</p>
              </div>
            )}

            </div>
            )}
            {contentTab === 'progress' && flProfile && (
              <div className="space-y-8 mt-6">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-5 w-1 rounded-full bg-[#65758B] flex-shrink-0" />
                    <h2 className="text-base font-bold text-[#0F1729]">Level 1</h2>
                    <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Hari 1–7</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MILESTONES.filter(m => m.type === 'minggu1' && flProfile.activeMilestoneIds.includes(m.id) && !carriedOverFor(selectedFlId, m.id))
                      .map(m => {
                        const progress = getMilestoneProgress(selectedFlId, m.id)
                        const completed = isMilestoneCompleted(selectedFlId, m.id)
                        const failed = isModuleFailed(selectedFlId, flProfile, m.id, false)
                        const late = !failed && !completed && needsKanitApproval && !m.noRemedial
                        return { m, progress, completed, failed, late }
                      })
                      // Late modules float to the top — they're what the kanit came here to
                      // act on. Stable sort keeps everything else in its original order.
                      .sort((a, b) => Number(b.late) - Number(a.late))
                      .map(({ m, progress, completed, failed, late }) => (
                        <MilestoneProgressCard key={m.id} name={m.name} to={`/kanit/task-history/${selectedFlId}/${encodeURIComponent(m.id)}`} progress={progress} isCompleted={completed} isFailed={failed} isLate={late} hasQuiz={!!m.quiz?.length} quizDone={isQuizResolved(flProfile.quizScores?.[m.id], flProfile.quizAttempts?.[m.id] ?? 0)} />
                      ))}
                  </div>
                </section>
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-5 w-1 rounded-full bg-[#023DFF] flex-shrink-0" />
                    <h2 className="text-base font-bold text-[#0F1729]">Level 2</h2>
                    <span className="text-xs text-[#023DFF] bg-[#E5F2FF] px-2 py-0.5 rounded-full">Hari 8–13</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      // Carried-over Level 1 modules effectively become Level 2 modules —
                      // their startDate/deadline now follow Level 2's window — so their
                      // cards move here instead of staying in the Level 1 grid above. Shown
                      // first so they're easy to spot right after a carry-over decision.
                      const carriedOverL1 = MILESTONES.filter(m => m.type === 'minggu1' && flProfile.activeMilestoneIds.includes(m.id) && carriedOverFor(selectedFlId, m.id))
                      const level2All = [...carriedOverL1, ...MILESTONES.filter(m => m.type === 'minggu2')]
                      return level2All.map((m, idx) => {
                        // Level 2 unlocks purely on day ≥ 8 — a late/undecided Level 1 module
                        // must never block it (that's what the top-of-page banner is for:
                        // deciding each late module's own fate, independent of Level 2 access).
                        const isLocked = flProfile.currentDay < 8
                        const progress = getMilestoneProgress(selectedFlId, m.id)
                        const completed = isMilestoneCompleted(selectedFlId, m.id)
                        const failed = isModuleFailed(selectedFlId, flProfile, m.id, isLocked)
                        const isActive = flProfile.activeMilestoneIds.includes(m.id)
                        const isCarriedOver = idx < carriedOverL1.length
                        return (
                          <MilestoneProgressCard
                            key={m.id}
                            anchorId={isCarriedOver && idx === 0 ? 'carry-over-anchor' : undefined}
                            name={m.name}
                            to={`/kanit/task-history/${selectedFlId}/${encodeURIComponent(m.id)}`}
                            progress={progress}
                            isCompleted={completed}
                            isFailed={failed}
                            hasQuiz={!!m.quiz?.length}
                            quizDone={isQuizResolved(flProfile.quizScores?.[m.id], flProfile.quizAttempts?.[m.id] ?? 0)}
                            isLocked={isLocked}
                            isActive={isActive}
                            justCarriedOver={justCarriedOverIds.includes(m.id)}
                          />
                        )
                      })
                    })()}
                  </div>
                </section>
              </div>
            )}
        </div>
      )}

      {/* Buka Akses modal */}
      {showUnlockForm && flProfile && (() => {
        const incompleteMods = incompleteL1Modules
        const canConfirm = incompleteMods.every(m => {
          const d = moduleDecisions[m.id]
          if (!d || !d.action) return false
          if (d.action === 'carry-over' && !d.reason) return false
          if (d.action === 'carry-over' && d.reason === 'lainnya' && !d.note?.trim()) return false
          return true
        })
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) { setShowUnlockForm(false); setModuleDecisions({}) } }}>
            <div className="bg-white rounded-t-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="px-4 sm:px-6 py-5 border-b border-[#E1E7EF] flex items-start justify-between gap-3 flex-shrink-0">
                <div>
                  <p className="text-base font-bold text-[#0F1729]">Ambil Tindakan</p>
                  <p className="text-xs text-[#65758B] mt-0.5">Tentukan tindakan untuk setiap modul Level 1 yang belum selesai.</p>
                </div>
                <button onClick={() => { setShowUnlockForm(false); setModuleDecisions({}) }} className="text-[#94A3B8] hover:text-[#65758B] transition-colors flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[#E1E7EF]">
                {incompleteMods.map(m => {
                  const d = moduleDecisions[m.id] ?? { action: null }
                  return (
                    <div key={m.id} className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-3 sm:gap-6">
                      {/* Left: module name */}
                      <div className="sm:w-36 sm:flex-shrink-0 pt-0.5">
                        <p className="text-sm font-semibold text-[#0F1729] leading-snug">{m.name}</p>
                      </div>
                      {/* Right: radio + conditional content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-6 mb-3">
                          {([
                            { action: 'carry-over' as const, label: 'Lanjutkan' },
                            { action: 'close' as const, label: 'Tutup Modul' },
                          ]).map(opt => {
                            const isSelected = d.action === opt.action
                            return (
                              <button
                                key={opt.action}
                                onClick={() => setModuleDecisions(prev => ({
                                  ...prev,
                                  [m.id]: opt.action === 'carry-over'
                                    ? { action: 'carry-over', reason: prev[m.id]?.reason, note: prev[m.id]?.note }
                                    : { action: 'close' },
                                }))}
                                className="flex items-center gap-2 group"
                              >
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-[#023DFF]' : 'border-[#CBD5E1] group-hover:border-[#023DFF]'}`}>
                                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#023DFF]" />}
                                </span>
                                <span className={`text-sm transition-colors ${isSelected ? 'text-[#0F1729] font-medium' : 'text-[#0F1729] group-hover:text-[#023DFF]'}`}>{opt.label}</span>
                              </button>
                            )
                          })}
                        </div>
                        {d.action === 'close' && (
                          <div className="bg-[#FEF2F2] border border-[#DC2626]/30 rounded-lg px-3 py-2.5 flex items-start gap-2 mb-3">
                            <span className="text-sm flex-shrink-0 mt-px">⚠</span>
                            <p className="text-xs text-[#B91C1C]">Modul ini akan langsung ditutup dan ditandai Tidak Lulus, terlepas dari progress latihan yang sudah dikerjakan.</p>
                          </div>
                        )}
                        {d.action === 'carry-over' && (
                          <div className="space-y-2">
                            <div className="bg-[#EFF6FF] border border-[#023DFF]/20 rounded-lg px-3 py-2.5 flex items-start gap-2">
                              <div className="w-[14px] h-[14px] rounded-full bg-[#023DFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                  <path d="M4 3.5v3" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                                  <circle cx="4" cy="2" r="0.6" fill="white"/>
                                </svg>
                              </div>
                              <p className="text-xs text-[#023DFF]">Modul akan dibuka kembali dan peserta bisa melanjutkan latihan hingga hari terakhir OJT.</p>
                            </div>
                            <p className="text-xs font-semibold text-[#65758B]">Alasan modul belum selesai*</p>
                            <div className="flex flex-wrap gap-2">
                              {CARRY_OVER_REASONS.map(r => (
                                <button
                                  key={r.id}
                                  onClick={() => setModuleDecisions(prev => ({ ...prev, [m.id]: { ...prev[m.id], action: 'carry-over', reason: r.id, note: r.id !== 'lainnya' ? undefined : prev[m.id]?.note } }))}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${d.reason === r.id ? 'bg-[#023DFF] text-white border-[#023DFF]' : 'bg-white text-[#65758B] border-[#E1E7EF] hover:border-[#023DFF] hover:text-[#023DFF]'}`}
                                >
                                  {r.label}
                                </button>
                              ))}
                            </div>
                            {d.reason === 'lainnya' && (
                              <textarea
                                value={d.note ?? ''}
                                onChange={e => setModuleDecisions(prev => ({ ...prev, [m.id]: { ...prev[m.id], action: 'carry-over', reason: 'lainnya', note: e.target.value } }))}
                                placeholder="Jelaskan alasannya..."
                                rows={2}
                                className="w-full border border-[#CBD5E1] focus:border-[#023DFF] rounded-lg px-3 py-2 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none resize-none transition-colors"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="px-6 py-4 border-t border-[#E1E7EF] flex items-center justify-end gap-3 bg-[#F8FAFC]">
                <button onClick={() => { setShowUnlockForm(false); setModuleDecisions({}) }} className="h-[38px] px-4 rounded-lg text-sm font-semibold text-[#023DFF] hover:bg-[#E5F2FF] transition-colors">Batal</button>
                <button
                  disabled={!canConfirm}
                  onClick={handleUnlock}
                  className={`h-[38px] px-4 rounded-lg text-sm font-semibold transition-all ${canConfirm ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white' : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'}`}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {actionToast && (
        <Toast
          message={actionToast}
          type="general"
          onDismiss={() => setActionToast(null)}
        />
      )}
    </div>
  )
}

function MilestoneProgressCard({ name, to, progress, isCompleted, isFailed, isLate, hasQuiz, quizDone, isLocked, isActive, anchorId, justCarriedOver }: {
  name: string
  to?: string
  progress: { actual: number; expected: number; isStarted: boolean; isCompleted: boolean }
  isCompleted: boolean
  isFailed?: boolean
  isLate?: boolean
  hasQuiz: boolean
  quizDone: boolean
  isLocked?: boolean
  isActive?: boolean
  anchorId?: string
  // True only in the brief window right after the carry-over decision was confirmed —
  // drives the temporary highlight ring the toast's auto-scroll lands on.
  justCarriedOver?: boolean
}) {
  const displayActual = isLocked ? 0 : isCompleted ? progress.expected : Math.min(progress.actual, progress.expected)
  const pct = isLocked ? 0 : isCompleted ? 100 : Math.min(100, progress.expected > 0 ? (progress.actual / progress.expected) * 100 : 0)
  // Same 5-state vocabulary (+ Terkunci) as FLMilestones.tsx's MilestoneCard: Terkunci >
  // Lulus > Tidak Lulus > Terlambat > Aktif > Belum dimulai — kept in that priority order.
  const showInProgress = !isLocked && progress.isStarted && !isCompleted
  const statusLabel = isLocked ? '🔒 Terkunci'
    : isCompleted ? 'Lulus'
    : isFailed ? 'Tidak Lulus'
    : isLate ? '⚠️ Terlambat'
    : showInProgress ? 'Aktif'
    : 'Belum dimulai'
  const statusColor = isLocked ? 'bg-[#F1F5F9] text-[#94A3B8]'
    : isCompleted ? 'bg-[#F0FDF4] text-[#15803D]'
    : (isFailed || isLate) ? 'bg-[#FEF2F2] text-[#B91C1C]'
    : showInProgress ? 'bg-[#E5F2FF] text-[#023DFF]'
    : 'bg-[#F1F5F9] text-[#65758B]'
  const clickable = !!to && !isLocked

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#0F1729] leading-snug min-w-0">{name}</p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
          {clickable && (
            <svg className="text-[#CBD5E1]" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-[#65758B] mb-1.5">
          <span>Latihan</span>
          <span className="font-semibold text-[#0F1729] tabular-nums">{displayActual}/{progress.expected}</span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {hasQuiz && (
        <div className="flex items-center gap-2 text-xs">
          <span>{quizDone ? '✅' : '🔒'}</span>
          <span className={quizDone ? 'text-[#15803D]' : 'text-[#94A3B8]'}>{quizDone ? 'Mini Quiz selesai' : 'Mini Quiz belum dikerjakan'}</span>
        </div>
      )}
    </>
  )

  // duration-150 (instead of the default transition-all/300ms) so the ring snaps in and
  // back out quickly — it's a brief "look here" cue, not something that should feel like
  // it's slowly fading in.
  const highlightClass = justCarriedOver ? 'ring-2 ring-[#023DFF] ring-offset-2' : ''

  if (clickable) {
    return (
      <Link id={anchorId} to={to!} className={`block bg-white rounded-xl border border-[#E1E7EF] p-4 space-y-3 transition-all duration-150 hover:border-[#023DFF]/30 hover:bg-[#F8FAFC] ${highlightClass}`}>
        {content}
      </Link>
    )
  }
  return (
    <div id={anchorId} className={`bg-white rounded-xl border border-[#E1E7EF] p-4 space-y-3 transition-all duration-150 ${isLocked ? 'opacity-50' : ''} ${highlightClass}`}>
      {content}
    </div>
  )
}
