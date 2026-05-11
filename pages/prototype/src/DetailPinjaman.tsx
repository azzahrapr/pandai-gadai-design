import { useNavigate } from 'react-router-dom'

const imgDate     = "/assets/status-date.svg"
const imgRight    = "/assets/status-right.svg"
const imgPoinFill = "/assets/poin-fill.svg"

export default function DetailPinjaman() {
  const navigate = useNavigate()

  return (
    <div className="w-[375px] flex flex-col overflow-hidden rounded-3xl shadow-2xl" style={{ height: 812, background: '#0020e3' }}>

      {/* Status bar */}
      <div className="flex items-end justify-between h-[52px] px-[15px] pb-[9px] bg-white shrink-0">
        <img src={imgDate}  alt="" className="h-[11px]" />
        <img src={imgRight} alt="" className="h-[11px]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between h-[56px] px-4 bg-white border-b border-[#e2e8f0] shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="size-9 flex items-center justify-center -ml-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#020617" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">Detail Pinjaman</h1>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full border border-[#a8cfff] bg-[rgba(229,242,255,0.7)]">
          <img src="/assets/headset-icon.svg" alt="" className="size-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col gap-4 p-4 bg-white overflow-y-auto hide-scrollbar flex-1">

        {/* Deskripsi Transaksi */}
        <div className="rounded-xl border border-[#e6e8eb] shadow-md p-3 flex flex-col gap-4 bg-white">
          <p className="text-[16px] font-bold leading-6 text-[#020617]">Deskripsi Transaksi</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between h-5">
                <span className="text-[14px] text-[#64748b]">Status</span>
                <span className="px-[10px] py-[2px] rounded-full bg-[#023dff] border border-[#f8fafc] text-[12px] font-semibold text-[#f8fafc]">Aktif</span>
              </div>
              <div className="flex items-center justify-between h-5">
                <span className="text-[14px] text-[#64748b]">Nomor SBG</span>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] text-[#020617]">#2000240800002203</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between h-5">
                <span className="text-[14px] text-[#64748b]">Tanggal Pinjaman</span>
                <span className="text-[14px] text-[#020617]">01 Okt 2025</span>
              </div>
              <div className="flex items-center justify-between h-5">
                <span className="text-[14px] text-[#64748b]">Cabang</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[14px] text-[#023dff]">Otista</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#023dff" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-px bg-[#e2e8f0]" />
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0">
                <span className="text-[14px] font-medium text-[#64748b]">Nilai Pinjaman</span>
                <span className="text-[16px] font-bold text-[#020617]">850.000</span>
              </div>
              <div className="flex flex-col gap-0 items-start">
                <span className="text-[14px] font-medium text-[#64748b]">Jatuh Tempo</span>
                <span className="text-[14px] font-medium text-[#ef4444]">01 Nov 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Barang */}
        <div className="rounded-xl border border-[#e6e8eb] shadow-md p-3 flex flex-col gap-3 bg-white">
          <p className="text-[16px] font-bold leading-6 text-[#020617]">Detail Barang</p>
          <div className="flex items-center gap-2">
            <div className="size-11 rounded-full bg-[#cfe7ff] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#023dff" strokeWidth="1.5" strokeLinecap="round">
                <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2"/>
              </svg>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[14px] text-[#64748b]">Elektronik - HP</span>
              <span className="text-[16px] text-[#020617]">APPLE IPHONE PRO MAX 64 GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Poin Pandai banner */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#e5f2ff] shrink-0">
        <img src={imgPoinFill} alt="" className="size-10 shrink-0" />
        <p className="flex-1 min-w-0 text-[14px] text-[#020617] leading-5">
          Kamu punya{' '}
          <span className="font-semibold text-[#b27202]">2.000 Poin Pandai</span>
          . Pakai untuk bayar pinjaman sekarang!
        </p>
      </div>

      {/* Footer */}
      <div className="bg-white pt-4 px-4 shrink-0">
        <button
          onClick={() => navigate('/pinjaman/sbg-detail')}
          className="w-full bg-[#023dff] rounded-[6px] py-[10px] flex items-center justify-center gap-2"
        >
          <span className="text-[14px] font-medium text-[#f8fafc]">Bayar Pinjaman</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div className="flex justify-center py-2 mt-1">
          <div className="w-36 h-[5px] rounded-full bg-black" />
        </div>
      </div>
    </div>
  )
}
