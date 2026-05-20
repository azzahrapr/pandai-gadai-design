import { useNavigate } from 'react-router-dom'

const links = [
  { label: 'Guest Mode', path: '/guest', desc: 'Splash → Login → Homepage' },
  { label: 'Homepage', path: '/home', desc: 'Logged in, verified user' },
  { label: 'Homepage (Unverified)', path: '/unverified', desc: 'Logged in, not yet verified' },
]

export default function PrototypeIndex() {
  const navigate = useNavigate()

  return (
    <div className="w-[375px] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ height: 812 }}>

      {/* Header */}
      <div className="px-6 pt-16 pb-8 border-b border-[#e2e8f0]">
        <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-widest mb-2">Pandai Gadai</p>
        <h1 className="text-[28px] font-bold text-[#020617] leading-8">Prototype Index</h1>
        <p className="text-[14px] text-[#64748b] mt-2">Select a flow to preview.</p>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-3 px-6 pt-6">
        {links.map(({ label, path, desc }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex items-center justify-between w-full border border-[#e2e8f0] rounded-xl px-4 py-4 text-left bg-white hover:border-[#023dff] hover:bg-[#f0f5ff] transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold text-[#020617]">{label}</span>
              <span className="text-[12px] text-[#64748b]">{desc}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#023dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
