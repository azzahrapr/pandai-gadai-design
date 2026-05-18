import { useNavigate } from 'react-router-dom'

const imgDate = "/assets/status-date.svg"
const imgRight = "/assets/status-right.svg"
const imgLogo = "/assets/splash-screen-mascot.png"
const imgOJK = "/assets/ojk-badge.png"

export default function GuestSplash() {
  const navigate = useNavigate()

  return (
    <div
      className="w-[375px] overflow-hidden rounded-3xl shadow-2xl relative cursor-pointer"
      style={{
        height: 812,
        backgroundColor: 'rgba(70,150,248,0.3)',
        backgroundImage: "url('/assets/glass-bg.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '-212px -135px',
        backgroundSize: '774px 857px',
      }}
      onClick={() => navigate('/guest/login')}
    >

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Status bar */}
        <div className="flex items-end justify-between h-[52px] px-[15px] pb-[9px] shrink-0">
          <img src={imgDate} alt="" className="h-[11px]" />
          <img src={imgRight} alt="" className="h-[11px]" />
        </div>

        {/* Logo centered */}
        <div className="flex-1 flex items-center justify-center">
          <img src={imgLogo} alt="Pandai Gadai" style={{ width: 220 }} />
        </div>

        {/* OJK badge */}
        <div className="flex items-center gap-3 px-5 pb-4 shrink-0">
          <img src={imgOJK} alt="OJK" className="h-11 shrink-0" />
          <p className="text-[12px] text-[#1e3a5f] leading-4">
            Pandai Gadai telah berizin dan diawasi langsung oleh Otoritas Jasa Keuangan
          </p>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center py-2 shrink-0">
          <div className="w-36 h-[5px] rounded-full bg-black" />
        </div>
      </div>
    </div>
  )
}
