import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const imgDate            = "/assets/status-date.svg"
const imgRight           = "/assets/status-right.svg"
const imgHomeOutline     = "/assets/nav-home-outline.svg"
const imgCreditCard      = "/assets/nav-credit-v2b.svg"
const imgPoinEmasOutline = "/assets/nav-poin-outline.svg"
const imgSmileIcon       = "/assets/nav-smile.svg"

type TabType = 'semua' | 'aktif' | 'riwayat'

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#023dff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3"/>
    </svg>
  )
}

function TVIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#023dff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="15" rx="2"/>
      <polyline points="17 2 12 7 7 2"/>
    </svg>
  )
}

function WatchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#023dff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="6"/>
      <polyline points="12 9 12 12 13.5 13.5"/>
      <path d="M16 5.5l-.5-3.5H8.5L8 5.5M8 18.5l.5 3.5h7l.5-3.5"/>
    </svg>
  )
}

function LoanCardPrimary({ onBayar }: { onBayar: () => void }) {
  return (
    <div className="bg-white border border-[#f9fafb] rounded-[20px] shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)] flex flex-col gap-3 p-3 w-full shrink-0">
      <div className="flex items-start justify-between h-9">
        <div className="flex flex-col justify-center">
          <p className="text-[12px] font-medium text-[#64748b]">No. SBG</p>
          <p className="text-[12px] font-medium text-[#020617]">#2000240800002203</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[12px] font-medium text-[#64748b] text-right">Jatuh Tempo</p>
          <p className="text-[14px] font-semibold text-[#ef4444]">1 Hari Lagi</p>
        </div>
      </div>
      <div className="h-px bg-[#e2e8f0] w-full" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <div className="size-6 bg-[#cfe7ff] rounded-full flex items-center justify-center shrink-0">
            <PhoneIcon />
          </div>
          <p className="text-[14px] font-semibold text-[#020617] flex-1">SAMSUNG GALAXY A52S 6/128GB</p>
        </div>
        <div className="flex items-end justify-between">
          <div className="pl-1 flex flex-col gap-0.5">
            <p className="text-[12px] font-medium text-[#64748b]">Nilai Pinjaman</p>
            <p className="text-[18px] font-bold text-[#020617]">850.000</p>
          </div>
          <button
            onClick={onBayar}
            className="bg-[#023dff] px-4 py-2 h-[38px] rounded-[8px] flex items-center justify-center"
          >
            <span className="text-[14px] font-semibold text-white">Bayar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

interface LoanCardSecondaryProps {
  product: string
  icon: React.ReactNode
  sisaPembayaran: string
}

function LoanCardSecondary({ product, icon, sisaPembayaran }: LoanCardSecondaryProps) {
  return (
    <div className="bg-white border border-[#f9fafb] rounded-[20px] shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)] flex flex-col gap-3 p-3 w-full shrink-0">
      <div className="flex items-start h-9">
        <div className="flex flex-col justify-center">
          <p className="text-[12px] font-medium text-[#64748b]">No. SBG</p>
          <p className="text-[12px] font-medium text-[#020617]">#2000240800002203</p>
        </div>
      </div>
      <div className="h-px bg-[#f8fafc] w-full" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <div className="size-6 bg-[#cfe7ff] rounded-full flex items-center justify-center shrink-0">
            {icon}
          </div>
          <p className="text-[14px] font-semibold text-[#020617] flex-1 overflow-hidden"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
            {product}
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div className="pl-1 flex flex-col gap-0.5">
            <p className="text-[12px] font-medium text-[#64748b]">Sisa Pembayaran</p>
            <p className="text-[18px] font-bold text-[#020617]">{sisaPembayaran}</p>
          </div>
          <button className="bg-white border border-[#cbd5e1] px-4 py-2 h-[38px] rounded-[8px] flex items-center justify-center shrink-0">
            <span className="text-[14px] font-semibold text-[#0f1729]">Lihat detail</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DaftarPinjaman() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('semua')

  const tabs: { key: TabType; label: string }[] = [
    { key: 'semua',   label: 'Semua'   },
    { key: 'aktif',   label: 'Aktif'   },
    { key: 'riwayat', label: 'Riwayat' },
  ]

  return (
    <div className="w-[375px] bg-white flex flex-col overflow-hidden rounded-3xl shadow-2xl" style={{ height: 812 }}>

      {/* Status bar */}
      <div className="flex items-end justify-between h-[52px] px-[15px] pb-[9px] bg-white shrink-0">
        <img src={imgDate} alt="" className="h-[11px]" />
        <img src={imgRight} alt="" className="h-[11px]" />
      </div>

      {/* Header */}
      <div className="bg-white border-b border-[#e2e8f0] flex flex-col gap-2 px-4 pb-3 pt-2 shrink-0">
        <div className="h-10 flex items-center">
          <h1 className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">Pinjaman</h1>
        </div>
        <div className="flex gap-2">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`h-8 px-3 rounded-full text-[14px] font-semibold transition-colors ${
                activeTab === key
                  ? 'bg-[#e5f2ff] border border-[#023dff] text-[#023dff]'
                  : 'bg-white border border-[#cbd5e1] text-[#0f1729]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 flex flex-col gap-[10px]">
        <LoanCardPrimary onBayar={() => navigate('/pinjaman/detail')} />
        <LoanCardSecondary
          product="Samsung 4K Crystal UHD Smart TV"
          icon={<TVIcon />}
          sisaPembayaran="Rp1.350.000"
        />
        <LoanCardSecondary
          product="Garmin Fenix 8 Sapphire AMOLED Jam Tangan GPS Multisport - Garansi Resmi 2 Tahun"
          icon={<WatchIcon />}
          sisaPembayaran="Rp699.000"
        />
      </div>

      {/* Bottom navbar */}
      <div className="bg-white flex items-center justify-between px-4 pt-4 pb-8 shrink-0">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 w-20">
          <img src={imgHomeOutline} alt="" className="size-6 object-contain" />
          <span className="text-[12px] font-bold text-slate-500">Beranda</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-20">
          <img src={imgCreditCard} alt="" className="size-6 object-contain" />
          <span className="text-[12px] font-bold text-[#001cdb]">Pinjaman</span>
        </button>
        <button onClick={() => navigate('/poin-pandai')} className="flex flex-col items-center gap-1 w-20">
          <img src={imgPoinEmasOutline} alt="" className="size-6 object-contain" />
          <span className="text-[12px] font-bold text-slate-500">Poin Pandai</span>
        </button>
        <button onClick={() => navigate('/akun')} className="flex flex-col items-center gap-1 w-20 relative">
          <div className="relative">
            <img src={imgSmileIcon} alt="" className="size-6 object-contain" />
            <div className="absolute -top-2 left-3 bg-red-600 text-white text-[10px] font-bold px-1 rounded-full min-w-[18px] text-center leading-[15px]">
              99+
            </div>
          </div>
          <span className="text-[12px] font-bold text-slate-500">Akun</span>
        </button>
      </div>
    </div>
  )
}
