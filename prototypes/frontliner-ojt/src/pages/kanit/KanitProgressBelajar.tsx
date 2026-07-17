import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { MILESTONES } from '../../data/mockData'
import type { FLProfile } from '../../types'

const MILESTONE_TASK_MAP: Record<string, string[]> = {
  'opening-closing': ['opening', 'closing'],
  'canvassing': ['canvassing'],
  'pelayanan-dasar': ['pelayanan-dasar'],
  'pelayanan-transaksi': ['pelayanan-transaksi'],
  'penaksiran': ['penaksiran-elektronik'],
  'packing-sealing': ['packing-sealing'],
}

const MILESTONE_EXPECTED_COUNT: Record<string, number> = {
  'opening-closing': 13,
  'packing-sealing': 4,
  'canvassing': 2,
  'pelayanan-dasar': 6,
  'pelayanan-transaksi': 6,
  'penaksiran': 6,
}

const UNLOCK_REASONS = [
  { id: 'sakit', label: 'Sakit' },
  { id: 'cuti', label: 'Cuti' },
  { id: 'darurat', label: 'Kondisi Darurat' },
  { id: 'performa', label: 'Performa Baik' },
  { id: 'lainnya', label: 'Lainnya' },
]

export default function KanitProgressBelajar() {
  const { getFlUsers, getFlChecklists, level2Unlocks, unlockLevel2, currentUser } = useApp()
  const flUsers = getFlUsers()
  const [selectedFlId, setSelectedFlId] = useState<string>(flUsers[0]?.id ?? '')
  const [showUnlockForm, setShowUnlockForm] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [customNote, setCustomNote] = useState('')

  const selectedFl = flUsers.find(u => u.id === selectedFlId)
  const profile = selectedFl?.profile as FLProfile | undefined

  function getMilestoneProgress(flId: string, milestoneId: string) {
    const submitted = getFlChecklists(flId).filter(c => c.status === 'submitted' || c.status === 'scored')
    const taskIds = MILESTONE_TASK_MAP[milestoneId] ?? []
    const expected = MILESTONE_EXPECTED_COUNT[milestoneId] ?? 14
    const actual = taskIds.length > 0
      ? submitted.filter(cl => cl.tasks?.some(t => taskIds.includes(t.taskId))).length
      : 0
    return { actual, expected, isStarted: actual > 0, isComplete: actual >= expected }
  }

  function isMilestoneCompleted(flId: string, milestoneId: string): boolean {
    const flProfile = flUsers.find(u => u.id === flId)?.profile as FLProfile | undefined
    if (flProfile?.completedMilestoneIds?.includes(milestoneId)) return true
    const { isComplete } = getMilestoneProgress(flId, milestoneId)
    if (!isComplete) return false
    const milestone = MILESTONES.find(m => m.id === milestoneId)
    if (milestone?.quiz?.length) return flProfile?.quizScores?.[milestoneId] !== undefined
    return true
  }

  function getFlSummary(flId: string) {
    const flProfile = flUsers.find(u => u.id === flId)?.profile as FLProfile | undefined
    if (!flProfile) return { completed: 0, total: 0, needsUnlock: false }
    const activeMilestones = MILESTONES.filter(m => flProfile.activeMilestoneIds.includes(m.id))
    const completed = activeMilestones.filter(m => isMilestoneCompleted(flId, m.id)).length
    const level1Milestones = MILESTONES.filter(m => m.type === 'minggu1' && flProfile.activeMilestoneIds.includes(m.id))
    const allLevel1Done = level1Milestones.every(m => isMilestoneCompleted(flId, m.id))
    const needsUnlock = flProfile.currentDay >= 8 && !allLevel1Done && !level2Unlocks[flId]
    return { completed, total: activeMilestones.length, needsUnlock }
  }

  function handleUnlock() {
    if (!selectedFlId || !selectedReason) return
    const note = selectedReason === 'lainnya' ? customNote : undefined
    unlockLevel2(selectedFlId, { [selectedFlId]: { action: 'carry-over', reason: selectedReason } })
    setShowUnlockForm(false)
    setSelectedReason('')
    setCustomNote('')
  }

  const minggu1 = MILESTONES.filter(m => m.type === 'minggu1')
  const minggu2 = MILESTONES.filter(m => m.type === 'minggu2')
  const unlock = selectedFlId ? level2Unlocks[selectedFlId] : undefined
  const level1Milestones = profile ? MILESTONES.filter(m => m.type === 'minggu1' && profile.activeMilestoneIds.includes(m.id)) : []
  const allLevel1Done = level1Milestones.every(m => isMilestoneCompleted(selectedFlId, m.id))
  const isDay8Plus = (profile?.currentDay ?? 0) >= 8
  const level2NeedsUnlock = isDay8Plus && !allLevel1Done && !unlock

  return (
    <div className="flex h-screen overflow-hidden">
      {/* FL list */}
      <div className="w-64 flex-shrink-0 border-r border-[#E1E7EF] bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-[#E1E7EF]">
          <h2 className="text-sm font-bold text-[#0F1729]">OJT Frontliner</h2>
          <p className="text-xs text-[#65758B] mt-0.5">{flUsers.length} peserta aktif</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {flUsers.map(fl => {
            const { completed, total, needsUnlock } = getFlSummary(fl.id)
            const flProfile = fl.profile as FLProfile
            const isSelected = fl.id === selectedFlId
            return (
              <button
                key={fl.id}
                onClick={() => { setSelectedFlId(fl.id); setShowUnlockForm(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected ? 'bg-[#E5F2FF]' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isSelected ? 'bg-[#023DFF] text-white' : 'bg-[#F1F5F9] text-[#65758B]'
                }`}>
                  {fl.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-[#023DFF]' : 'text-[#0F1729]'}`}>{fl.name}</p>
                    {needsUnlock && (
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] flex-shrink-0" title="Perlu unlock Level 2" />
                    )}
                  </div>
                  <p className="text-xs text-[#65758B]">Hari {flProfile.currentDay} · {completed}/{total} modul</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto p-8">
        {!profile ? (
          <div className="flex items-center justify-center h-full text-[#65758B]">Pilih OJT dari daftar kiri.</div>
        ) : (
          <>
            {/* FL header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#023DFF]/10 flex items-center justify-center text-[#023DFF] font-black text-base flex-shrink-0">
                {selectedFl!.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0F1729]">{selectedFl!.name}</h1>
                <p className="text-sm text-[#65758B]">{profile.branch} · Hari {profile.currentDay}/14 · {profile.id.toUpperCase()}</p>
              </div>
            </div>

            {/* Level 1 */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-5 w-1 rounded-full bg-[#65758B] flex-shrink-0" />
                <h2 className="text-base font-bold text-[#0F1729]">Level 1</h2>
                <span className="text-xs text-[#65758B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Hari 1–7</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {minggu1.filter(m => profile.activeMilestoneIds.includes(m.id)).map(m => {
                  const progress = getMilestoneProgress(selectedFlId, m.id)
                  const completed = isMilestoneCompleted(selectedFlId, m.id)
                  return (
                    <MilestoneProgressCard
                      key={m.id}
                      name={m.name}
                      progress={progress}
                      isCompleted={completed}
                      hasQuiz={!!m.quiz?.length}
                      quizDone={profile.completedMilestoneIds?.includes(m.id) || (profile.quizScores?.[m.id] !== undefined)}
                    />
                  )
                })}
              </div>
            </section>

            {/* Level 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-5 w-1 rounded-full bg-[#023DFF] flex-shrink-0" />
                <h2 className="text-base font-bold text-[#0F1729]">Level 2</h2>
                <span className="text-xs text-[#023DFF] bg-[#E5F2FF] px-2 py-0.5 rounded-full">Hari 8–13</span>
              </div>

              {unlock ? (
                /* Already unlocked */
                <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-5 mb-4 flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">🔓</span>
                  <div>
                    <p className="text-sm font-bold text-[#15803D]">Akses Level 2 sudah dibuka</p>
                    <p className="text-xs text-[#15803D]/80 mt-0.5">
                      Akses dibuka dengan keputusan per-modul.
                    </p>
                    <p className="text-xs text-[#15803D]/60 mt-0.5">Dibuka oleh {currentUser?.name}</p>
                  </div>
                </div>
              ) : level2NeedsUnlock && !showUnlockForm ? (
                /* Needs unlock — prompt */
                <div className="bg-[#FEFDEA] border border-[#E0A200] rounded-xl p-5 mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-[#B27202]">Ada modul Level 1 yang belum selesai</p>
                      <p className="text-xs text-[#B27202]/80 mt-0.5">OJT ini sudah masuk hari ke-{profile.currentDay} tapi belum menyelesaikan semua checklist Level 1. Kamu bisa buka akses Level 2 secara manual jika ada alasan khusus.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUnlockForm(true)}
                    className="flex-shrink-0 h-9 px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Buka Akses →
                  </button>
                </div>
              ) : showUnlockForm ? (
                /* Unlock form */
                <div className="bg-white border border-[#E1E7EF] rounded-xl p-5 mb-4">
                  <p className="text-sm font-bold text-[#0F1729] mb-1">Buka Akses Level 2</p>
                  <p className="text-xs text-[#65758B] mb-4">Pilih alasan pembukaan akses. Alasan ini akan tercatat di sistem.</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {UNLOCK_REASONS.map(r => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReason(r.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          selectedReason === r.id
                            ? 'bg-[#023DFF] text-white border-[#023DFF]'
                            : 'bg-white text-[#65758B] border-[#E1E7EF] hover:border-[#023DFF] hover:text-[#023DFF]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  {selectedReason === 'lainnya' && (
                    <textarea
                      value={customNote}
                      onChange={e => setCustomNote(e.target.value)}
                      placeholder="Jelaskan alasannya di sini..."
                      rows={3}
                      className="w-full border border-[#CBD5E1] rounded-lg px-4 py-3 text-sm text-[#0F1729] placeholder:text-[#94A3B8] outline-none focus:border-[#023DFF] resize-none mb-4"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      disabled={!selectedReason || (selectedReason === 'lainnya' && !customNote.trim())}
                      onClick={handleUnlock}
                      className={`h-9 px-5 rounded-lg text-sm font-semibold transition-all ${
                        selectedReason && (selectedReason !== 'lainnya' || customNote.trim())
                          ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
                          : 'bg-[#E1E7EF] text-[#94A3B8] cursor-not-allowed'
                      }`}
                    >
                      Konfirmasi
                    </button>
                    <button
                      onClick={() => { setShowUnlockForm(false); setSelectedReason(''); setCustomNote('') }}
                      className="h-9 px-4 rounded-lg text-sm text-[#65758B] hover:bg-[#F1F5F9] transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Level 2 module grid */}
              {(profile.currentDay >= 8 || unlock) && (
                <div className="grid grid-cols-2 gap-4">
                  {minggu2.filter(m => profile.activeMilestoneIds.includes(m.id)).map(m => {
                    const progress = getMilestoneProgress(selectedFlId, m.id)
                    const completed = isMilestoneCompleted(selectedFlId, m.id)
                    return (
                      <MilestoneProgressCard
                        key={m.id}
                        name={m.name}
                        progress={progress}
                        isCompleted={completed}
                        hasQuiz={!!m.quiz?.length}
                        quizDone={profile.completedMilestoneIds?.includes(m.id) || (profile.quizScores?.[m.id] !== undefined)}
                      />
                    )
                  })}
                </div>
              )}

              {!unlock && profile.currentDay < 8 && (
                <div className="bg-[#F8FAFC] border border-[#E1E7EF] rounded-xl p-5 flex items-center gap-3 text-[#94A3B8]">
                  <span className="text-xl">🔒</span>
                  <p className="text-sm">Level 2 terbuka di hari ke-8.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function MilestoneProgressCard({
  name, progress, isCompleted, hasQuiz, quizDone,
}: {
  name: string
  progress: { actual: number; expected: number; isStarted: boolean; isComplete: boolean }
  isCompleted: boolean
  hasQuiz: boolean
  quizDone: boolean
}) {
  const pct = Math.min(100, progress.expected > 0 ? (progress.actual / progress.expected) * 100 : 0)
  const statusLabel = isCompleted ? 'Selesai' : progress.isStarted ? 'Aktif' : 'Belum dimulai'
  const statusColor = isCompleted
    ? 'bg-[#F0FDF4] text-[#15803D]'
    : progress.isStarted
      ? 'bg-[#E5F2FF] text-[#023DFF]'
      : 'bg-[#F1F5F9] text-[#65758B]'

  return (
    <div className="bg-white rounded-xl border border-[#E1E7EF] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#0F1729] leading-snug">{name}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor}`}>{statusLabel}</span>
      </div>

      <div>
        <div className="flex justify-between text-xs text-[#65758B] mb-1.5">
          <span>Checklist</span>
          <span className="font-semibold text-[#0F1729] tabular-nums">{Math.min(progress.actual, progress.expected)}/{progress.expected}</span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#16A34A]' : 'bg-[#023DFF]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {hasQuiz && (
        <div className="flex items-center gap-2 text-xs">
          <span>{quizDone ? '✅' : '🔒'}</span>
          <span className={quizDone ? 'text-[#15803D]' : 'text-[#94A3B8]'}>
            {quizDone ? 'Mini Quiz selesai' : 'Mini Quiz belum dikerjakan'}
          </span>
        </div>
      )}
    </div>
  )
}
