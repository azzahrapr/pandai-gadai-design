import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { FLProfile } from '../../types'

export default function FLDashboard() {
  const { currentUser, getTodayChecklist, getFlScoreBreakdown, getFlChecklists } = useApp()
  const profile = currentUser!.profile as FLProfile
  const day = profile.currentDay
  const todayChecklist = getTodayChecklist(currentUser!.id)
  const scores = getFlScoreBreakdown(currentUser!.id)
  const allChecklists = getFlChecklists(currentUser!.id)
  const dayProgress = Math.round((day / 14) * 100)

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
      {day === 14 && (
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

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#0F1729]">Progress OJT</p>
          <span className="text-sm font-bold text-[#023DFF]">{dayProgress}% ({day}/14 hari)</span>
        </div>
        <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className="h-full bg-[#023DFF] rounded-full transition-all" style={{ width: `${dayProgress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#94A3B8]">
          <span>Milestone Dasar (Hari 1–7)</span>
          <span>Milestone Lanjutan (Hari 8–13)</span>
          <span>Assessment (Hari 14)</span>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Progress Harian" value={scores.dailyProgressScore !== null ? String(scores.dailyProgressScore) : '—'} unit="/100" note={`${scores.daysScored} hari dinilai`} colorClass="text-[#023DFF]" />
        <StatCard label="Penaksiran" value={scores.penaksiranScore !== null ? String(scores.penaksiranScore) : '—'} unit="/100" note={`${scores.penaksiranCount} sesi`} colorClass="text-[#65758B]" />
        <StatCard label="Assessment" value={scores.assessmentScore !== null ? String(scores.assessmentScore) : '—'} unit="/100" note="Hari ke-14" colorClass="text-[#65758B]" />
        <StatCard
          label="Total Score"
          value={scores.totalScore !== null ? String(scores.totalScore) : '—'}
          unit="/100"
          note={scores.totalScore !== null ? (scores.passed ? '✓ Lulus' : '✗ Belum lulus') : 'Menunggu semua nilai'}
          colorClass={scores.totalScore !== null ? (scores.passed ? 'text-[#16A34A]' : 'text-[#DC2626]') : 'text-[#65758B]'}
          highlight={scores.totalScore !== null}
          passed={scores.passed}
        />
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="col-span-2 space-y-4">
          {/* Today checklist */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0F1729]">Checklist Hari Ini</h3>
              <StatusBadge status={checklistStatus.color as any} label={checklistStatus.label} />
            </div>
            {todayChecklist ? (
              <div className="space-y-2">
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
                {todayChecklist.kanitNote && (
                  <div className="mt-3 pt-3 border-t border-[#E1E7EF] bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[#65758B] mb-1">Catatan Kanit</p>
                    <p className="text-sm text-[#0F1729]">"{todayChecklist.kanitNote}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#65758B]">Kamu belum mengisi checklist untuk hari ini.</p>
                <Link to="/fl/checklist" className="h-[38px] px-4 bg-[#023DFF] hover:bg-[#001CDB] text-white font-semibold text-sm rounded-lg flex items-center transition-colors flex-shrink-0">
                  Isi Checklist →
                </Link>
              </div>
            )}
          </div>

          {/* History table */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0F1729]">Riwayat Checklist</h3>
              <Link to="/fl/scores" className="text-sm text-[#023DFF] hover:text-[#001CDB] font-medium">Lihat semua →</Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E1E7EF]">
                  <Th>Hari</Th>
                  <Th>Milestone</Th>
                  <Th>Tanggal</Th>
                  <Th>Status</Th>
                  <Th align="right">Nilai</Th>
                </tr>
              </thead>
              <tbody>
                {allChecklists.slice(-6).reverse().map(cl => (
                  <tr key={cl.id} className="border-b border-[#E1E7EF] last:border-0">
                    <Td><span className="w-6 h-6 bg-[#F1F5F9] rounded-md flex items-center justify-center text-xs font-bold text-[#65758B]">{cl.day}</span></Td>
                    <Td>{cl.milestoneName}</Td>
                    <Td subtle>{cl.date}</Td>
                    <Td>
                      <StatusBadge
                        status={cl.status === 'scored' ? 'success' : cl.status === 'submitted' ? 'warning' : 'neutral'}
                        label={cl.status === 'scored' ? 'Dinilai' : cl.status === 'submitted' ? 'Pending' : 'Draft'}
                        small
                      />
                    </Td>
                    <Td align="right">
                      {cl.kanitScore !== undefined
                        ? <span className={`font-bold ${cl.kanitScore >= 85 ? 'text-[#16A34A]' : cl.kanitScore >= 75 ? 'text-[#B27202]' : 'text-[#DC2626]'}`}>{cl.kanitScore}</span>
                        : <span className="text-[#94A3B8]">—</span>
                      }
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allChecklists.length === 0 && (
              <p className="text-center text-[#65758B] text-sm py-6">Belum ada checklist</p>
            )}
          </div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-4">
          {/* Milestone progress */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <h3 className="font-semibold text-[#0F1729] mb-4">Milestone Aktif</h3>
            <div className="space-y-2">
              {profile.activeMilestoneIds.map((id, i) => {
                const names: Record<string, string> = {
                  'opening-closing': 'Opening & Closing',
                  'packing-sealing': 'Packing & Sealing',
                  'canvassing': 'Canvassing',
                  'pelayanan-dasar': 'Pelayanan Dasar',
                  'pelayanan-transaksi': 'Pelayanan Transaksi',
                  'penaksiran': 'Penaksiran',
                }
                const isLanjutan = id === 'pelayanan-transaksi' || id === 'penaksiran'
                return (
                  <div key={id} className="flex items-center gap-2.5 py-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isLanjutan ? 'bg-[#E5F2FF]' : 'bg-[#F1F5F9]'}`}>
                      <span className={`text-[9px] font-bold ${isLanjutan ? 'text-[#023DFF]' : 'text-[#65758B]'}`}>{i + 1}</span>
                    </div>
                    <p className="text-sm text-[#0F1729] flex-1">{names[id] ?? id}</p>
                    {isLanjutan && <span className="text-[10px] bg-[#E5F2FF] text-[#023DFF] px-1.5 py-0.5 rounded font-semibold">Lanjutan</span>}
                  </div>
                )
              })}
            </div>
            <Link to="/fl/milestones" className="mt-4 flex items-center justify-center h-[30px] px-3 rounded-lg border border-[#CBD5E1] text-[#0F1729] hover:border-[#023DFF] hover:bg-[#E5F2FF] hover:text-[#023DFF] text-sm font-semibold transition-all">
              Lihat materi →
            </Link>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5">
            <h3 className="font-semibold text-[#0F1729] mb-3">Aksi Cepat</h3>
            <div className="space-y-2">
              <QuickLink to="/fl/checklist" label="Isi Checklist Harian" icon="✏️" primary />
              <QuickLink to="/fl/milestones" label="Baca Materi Belajar" icon="📚" />
              <QuickLink to="/fl/scores" label="Lihat Nilai Saya" icon="📊" />
              {day >= 8 && <QuickLink to="/fl/penaksiran" label="Tambah Sesi Penaksiran" icon="⚖️" />}
              {day >= 14 && <QuickLink to="/fl/assessment" label="Kerjakan Assessment" icon="🎓" primary />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, note, colorClass, highlight, passed }: {
  label: string; value: string; unit: string; note: string; colorClass: string; highlight?: boolean; passed?: boolean | null
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${highlight && passed !== null ? (passed ? 'border-[#16A34A]' : 'border-[#DC2626]') : 'border-[#E1E7EF]'}`}>
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

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th className={`text-xs font-semibold text-[#65758B] uppercase tracking-wide pb-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function Td({ children, subtle, align }: { children: React.ReactNode; subtle?: boolean; align?: 'right' }) {
  return (
    <td className={`py-3 text-sm ${subtle ? 'text-[#65758B]' : 'text-[#0F1729]'} ${align === 'right' ? 'text-right' : ''}`}>
      {children}
    </td>
  )
}

function QuickLink({ to, label, icon, primary }: { to: string; label: string; icon: string; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium transition-all ${
        primary
          ? 'bg-[#023DFF] hover:bg-[#001CDB] text-white'
          : 'text-[#0F1729] hover:bg-[#F1F5F9]'
      }`}
    >
      <span>{icon}</span>{label}
    </Link>
  )
}
