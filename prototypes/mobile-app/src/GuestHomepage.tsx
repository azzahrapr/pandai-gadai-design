import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const imgDate = "/assets/status-date.svg"
const imgRight = "/assets/status-right.svg"
const imgPoinEmasActive = "/assets/poin-fill-active.svg"
const imgPoinOutline = "/assets/poinemas.outline.png"
const imgCuanIcon = "/assets/icon.cuan-pandai.png"
const imgPoinEmasIcon = "/assets/icon.poin-emas.png"
const imgTransaksiIcon = "/assets/icon.transaksi.png"
const imgHomeVec = "/assets/nav-home-solid.svg"
const imgSmileIcon = "/assets/smile.png"
const imgNavPinjaman = "/assets/credit-card.png"

const howToSteps = [
  {
    num: 1,
    title: 'Visit Cabang Pandai Gadai',
    desc: 'Cuma perlu bawa barang dan KTP kamu.',
    img: '/assets/mi-cabang.png',
  },
  {
    num: 2,
    title: 'Pencairan instan',
    desc: 'Langsung dapat pencairan, lebih hemat lewat Saldo Pandai.',
    img: '/assets/mi-high-disbursement-rate.png',
  },
  {
    num: 3,
    title: 'Tebus, Perpanjang, Cicil Online',
    desc: 'Gak perlu ke cabang. Semua bisa dilakukan lewat aplikasi!',
    img: '/assets/mi-payment.png',
  },
  {
    num: 4,
    title: 'Bayar lewat aplikasi, dapat diskon',
    desc: 'Bayar pinjaman lewat aplikasi, pasti dapat potongan dari Poin Pandai!',
    img: '/assets/mi.discount.png',
  },
]

export default function GuestHomepage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  return (
    <div className="w-[375px] flex flex-col overflow-hidden rounded-3xl shadow-2xl" style={{ height: 812 }}>

      {/* Top section: glass bg */}
      <div
        className="relative shrink-0"
        style={{
          height: 300,
          backgroundImage: "url('/assets/splash-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >

        {/* Content over glass bg */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Status bar */}
          <div className="flex items-end justify-between h-[52px] px-[15px] pb-[9px]">
            <img src={imgDate} alt="" className="h-[11px] w-[28px] shrink-0" />
            <img src={imgRight} alt="" className="h-[11px] w-[67px] shrink-0" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between h-[72px] px-6">
            <div className="flex flex-col">
              <p className="text-[20px] font-semibold text-[#0f1729] leading-[23px]">Halo!</p>
              <p className="text-[12px] text-[#0f1729] leading-4 mt-0.5">Akses semua fitur yuk~</p>
            </div>
            <button
              onClick={() => navigate('/guest/login')}
              className="bg-[#023dff] rounded-[8px] px-4 h-[38px] flex items-center"
            >
              <span className="text-[14px] font-semibold text-white">Masuk</span>
            </button>
          </div>

          {/* Simulator card */}
          <div className="mx-4">
            <div className="bg-white rounded-2xl shadow-md px-4 py-4 flex flex-col gap-3">
              <p className="text-[14px] font-semibold text-[#0f1729]">Masukkan nilai pinjaman yang diinginkan</p>
              <div className="flex border border-[#cbd5e1] rounded-[6px] overflow-hidden">
                <div className="bg-[#f8fafc] px-3 flex items-center shrink-0 border-r border-[#cbd5e1]">
                  <span className="text-[14px] text-[#65758b]">Rp</span>
                </div>
                <input
                  type="text"
                  defaultValue="2.000.000"
                  className="flex-1 px-3 py-3 text-[14px] text-[#64748b] outline-none bg-white"
                />
              </div>
              <button className="flex items-center justify-center gap-1 py-1">
                <span className="text-[14px] font-semibold text-[#0020e3]">Mulai Simulasi</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0020e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-white">

        {/* Branch card */}
        <div className="px-4 pt-4 pb-0">
          <div className="border border-[#e2e8f0] rounded-xl p-3 flex items-center gap-2">
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-semibold text-[#020617]">Bendungan Hilir</span>
                {/* Badge Status — success/light — h-4 fixed height, no vertical padding, matches DSTest */}
                <div className="inline-flex items-center h-4 px-2 bg-[#f0fdf4] border border-[#16a34a] rounded-full shrink-0">
                  <span className="text-[10px] font-bold text-[#15803d] leading-none">Terdekat</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748b" className="shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-[12px] font-medium text-[#64748b]">2,5 km dari lokasimu</span>
              </div>
            </div>
            <button className="bg-[#023dff] rounded-[8px] px-2 h-[30px] flex items-center shrink-0">
              <span className="text-[14px] font-semibold text-white">Buat Janji</span>
            </button>
          </div>
        </div>

        {/* Features strip */}
        <div className="px-4">
          <div className="flex items-stretch py-4 gap-2">
            {/* Cuan Pandai */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1 min-w-0">
              <div className="size-6 overflow-hidden shrink-0">
                <img alt="" className="size-full object-contain" src={imgCuanIcon} />
              </div>
              <p className="text-[12px] font-bold text-[#020617] text-center leading-4">Cuan Pandai</p>
              <p className="text-[10px] text-[#64748b] text-center leading-3">Kerjakan misi, dapatkan diskon tambahan!</p>
            </div>

            <div className="flex items-center justify-center shrink-0 w-0">
              <div className="w-px h-[13px] bg-[#e2e8f0]" />
            </div>

            {/* Poin Pandai */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1 min-w-0">
              <div className="size-6 overflow-hidden shrink-0">
                <img alt="" className="size-full object-contain" src={imgPoinEmasIcon} />
              </div>
              <p className="text-[12px] font-bold text-[#020617] text-center leading-4">Poin Pandai</p>
              <p className="text-[10px] text-[#64748b] text-center leading-3">Kumpulkan poin dan pakai untuk potong biaya gadai</p>
            </div>

            <div className="flex items-center justify-center shrink-0 w-0">
              <div className="w-px h-[13px] bg-[#e2e8f0]" />
            </div>

            {/* Transaksi mudah */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1 min-w-0">
              <div className="size-6 overflow-hidden shrink-0">
                <img alt="" className="size-full object-contain" src={imgTransaksiIcon} />
              </div>
              <p className="text-[12px] font-bold text-[#020617] text-center leading-4">Transaksi mudah</p>
              <p className="text-[10px] text-[#64748b] text-center leading-3">Tebus, perpanjang, cicil pinjaman tanpa perlu ke cabang!</p>
            </div>
          </div>
        </div>

        {/* Cara Gadai section */}
        <div className="px-4 pb-4">
          <p className="text-[16px] font-semibold text-[#020617] mb-4">Cara Gadai?</p>

          {/* Carousel card */}
          <div className="bg-[#f8fafc] rounded-xl px-4 py-3 flex items-center gap-4 h-[102px]">
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              {/* Step counter */}
              <div className="relative inline-flex items-center justify-center size-4 shrink-0">
                <div className="absolute inset-0 rounded-full bg-[#023dff]" />
                <span className="relative text-[10px] font-bold text-white leading-none">{howToSteps[step].num}</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#020617] leading-5">{howToSteps[step].title}</p>
                <p className="text-[12px] font-medium text-[#64748b] leading-4 mt-0.5">{howToSteps[step].desc}</p>
              </div>
            </div>
            <div className="shrink-0 size-16 flex items-center justify-center">
              <img src={howToSteps[step].img} alt="" className="size-16 object-contain" />
            </div>
          </div>

          {/* Dot pagination */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {howToSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  background: i === step ? '#023dff' : '#cbd5e1',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className="bg-white flex items-center justify-between px-4 pt-4 pb-8 shrink-0">
        <button onClick={() => {}} className="flex flex-col items-center gap-1 w-20">
          <div className="size-6 overflow-hidden">
            <img alt="" className="size-full object-contain" src={imgHomeVec} />
          </div>
          <span className="text-[12px] font-bold text-[#023dff]">Beranda</span>
        </button>

        <button onClick={() => navigate('/guest/login')} className="flex flex-col items-center gap-1 w-20">
          <div className="size-6 overflow-hidden">
            <img alt="" className="size-full object-contain" src={imgNavPinjaman} />
          </div>
          <span className="text-[12px] font-bold text-slate-500">Pinjaman</span>
        </button>

        <button onClick={() => navigate('/poin-pandai/unverified')} className="flex flex-col items-center gap-1 w-20">
          <div className="size-6 overflow-hidden">
            <img alt="" className="size-full object-contain" src={imgPoinOutline} />
          </div>
          <span className="text-[12px] font-bold text-slate-500">Poin Pandai</span>
        </button>

        <button onClick={() => navigate('/guest/login')} className="flex flex-col items-center gap-1 w-20">
          <div className="size-6 overflow-hidden">
            <img alt="" className="size-full object-contain" src={imgSmileIcon} />
          </div>
          <span className="text-[12px] font-bold text-slate-500">Akun</span>
        </button>

      </div>
    </div>
  )
}
