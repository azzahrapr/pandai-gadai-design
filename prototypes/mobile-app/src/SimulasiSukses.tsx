import { useNavigate, useLocation } from 'react-router-dom'

const imgDate    = "/assets/status-date.svg"
const imgRight   = "/assets/status-right.svg"
const imgContactCs = "https://www.figma.com/api/mcp/asset/fc927073-a217-45ab-a84e-c879d70af702"
const imgBg        = "https://www.figma.com/api/mcp/asset/ca668d77-3b54-4219-a033-58db55df9269"

export default function SimulasiSukses() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { item?: string; category?: string } | null
  const category = state?.category ?? ''

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start relative rounded-3xl shadow-2xl overflow-hidden" style={{ width: 375, height: 812 }}>

      {/* Header */}
      <div className="bg-white border-b border-[#e1e6ef] flex flex-col h-[96px] items-start shrink-0 w-full">
        <div className="flex-1 min-h-px relative w-full">
          <div className="absolute inset-0 overflow-clip flex items-end justify-between px-[15px] pb-[9px]">
            <img src={imgDate} alt="" className="h-[11px]" />
            <img src={imgRight} alt="" className="h-[11px]" />
          </div>
        </div>
        <div className="bg-white flex h-[56px] items-center justify-between px-[16px] shrink-0 w-full">
          <div className="flex gap-[8px] items-center">
            <button onClick={() => navigate(-1)} className="block overflow-clip relative shrink-0 size-[24px]">
              <svg className="absolute inset-0" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#020617" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="font-bold leading-[32px] text-[#0f172a] text-[20px] whitespace-nowrap">Simulasi Gadai</p>
          </div>
          <div className="backdrop-blur-[6px] bg-[#e5f2ff] border border-[#a8cfff] flex gap-[4px] items-center justify-center px-[10px] py-[4px] rounded-[1000px] shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#001cdb" className="shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
            <p className="font-normal leading-[16px] text-[#001cdb] text-[12px] text-center whitespace-nowrap">Panduan</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#e5f2ff] flex flex-1 flex-col gap-[24px] items-center min-h-0 px-[16px] py-[32px] relative w-full overflow-y-auto hide-scrollbar pb-[136px]">
        {/* Decorative background */}
        <div className="absolute left-0 size-[375px] top-[16px] pointer-events-none">
          <img alt="" className="absolute block inset-0 max-w-none size-full object-cover" src={imgBg} />
        </div>

        {/* Illustration */}
        <img src={imgContactCs} alt="" className="relative shrink-0 size-[148px] object-contain" />

        {/* Title */}
        <div className="flex flex-col gap-[4px] items-center relative shrink-0 text-[#0f1729] text-center w-full">
          <div className="font-semibold leading-[0] text-[18px] w-full">
            <p className="leading-[28px]">Terima kasih sudah memilih</p>
            <p className="leading-[28px]">Pandai Gadai!</p>
          </div>
          <p className="font-normal leading-[20px] text-[14px] w-full">
            Tim kami akan segera menghubungi kamu.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[rgba(255,255,255,0.7)] border border-[#e1e7ef] flex flex-col gap-[12px] items-center p-[16px] relative rounded-[12px] shrink-0 w-full">
          <div className="flex flex-col gap-[4px] items-start w-full">
            <p className="font-semibold leading-[22px] text-[#0f1729] text-[14px] w-full">
              Mau cair hari ini? Langsung ke cabang aja!
            </p>
            <p className="font-normal leading-[16px] text-[#65758b] text-[12px] w-full">
              {category.startsWith('BPKB')
                ? 'Tinggal bawa BPKB & KTP, petugas kami akan melayani kamu 😊'
                : 'Tinggal bawa barang & KTP, petugas kami akan melayani kamu 😊'}
            </p>
          </div>
          <div
            onClick={() => navigate('/cabang')}
            className="bg-white border border-[#e1e7ef] flex gap-[4px] items-center px-[12px] py-[8px] rounded-[8px] shrink-0 w-full cursor-pointer"
          >
            <div className="flex h-[58px] items-start shrink-0">
              <div className="flex items-center py-[4px] shrink-0">
                <img src="/assets/chips/icon/fi/outline/marker.png" alt="" className="size-[16px]" />
              </div>
            </div>
            <div className="flex flex-1 flex-row items-center self-stretch">
              <div className="flex flex-1 flex-col gap-[2px] h-full items-start justify-center min-w-px relative">
                <div className="flex gap-[4px] items-center shrink-0">
                  <p className="font-semibold leading-[22px] text-[#020617] text-[14px] whitespace-nowrap">Pandai Gadai Bintaro</p>
                  <div className="bg-[#f0fdf4] border border-[#16a34a] flex gap-[4px] items-center overflow-clip px-[8px] py-[2px] rounded-[9999px] shrink-0">
                    <p className="font-bold leading-[12px] text-[#15803d] text-[10px] text-center whitespace-nowrap">Terdekat</p>
                  </div>
                </div>
                <p className="font-normal leading-[0] overflow-hidden text-[12px] text-[#65758b] text-ellipsis whitespace-nowrap">
                  <span className="font-bold leading-[16px]">2,5 km</span>
                  <span className="leading-[16px]"> dari lokasimu</span>
                </p>
                <p className="font-normal leading-[16px] overflow-hidden text-[12px] text-[#65758b] text-ellipsis whitespace-nowrap">
                  Buka setiap hari (09:00 - 21:00)
                </p>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M9 18l6-6-6-6" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="absolute bottom-0 flex flex-col items-start left-0 w-[375px]">
        <div className="bg-white border-t border-[#e1e7ef] flex flex-col gap-[12px] items-center justify-center overflow-clip pb-[24px] pt-[16px] px-[16px] shrink-0 w-full">
          <button
            onClick={() => window.open('https://maps.app.goo.gl/aXvs1R3j2mcr5iPb7', '_blank')}
            className="bg-[#023dff] flex gap-[4px] h-[44px] items-center justify-center px-[16px] py-[8px] rounded-[8px] shrink-0 w-full"
          >
            <p className="font-semibold leading-[22px] text-white text-[14px] whitespace-nowrap">Lihat Cabang</p>
          </button>
          <button
            onClick={() => navigate('/guest/home')}
            className="bg-white border border-[#cbd5e1] flex gap-[4px] h-[44px] items-center justify-center px-[16px] py-[8px] rounded-[8px] shrink-0 w-full"
          >
            <p className="font-semibold leading-[22px] text-[#0f1729] text-[14px] whitespace-nowrap">Keluar</p>
          </button>
        </div>
      </div>

    </div>
  )
}
