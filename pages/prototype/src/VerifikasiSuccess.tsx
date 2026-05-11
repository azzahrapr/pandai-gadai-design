import { useNavigate } from 'react-router-dom'

const imgDate  = "/assets/status-date.svg";
const imgRight = "/assets/status-right.svg";
const imgPanda = "/assets/panda-pose15.png";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="#023dff" strokeWidth="1.5"/>
        <path d="M3 10h18" stroke="#023dff" strokeWidth="1.5"/>
        <path d="M7 14h4M7 17h2" stroke="#023dff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: "Cek status transaksi serta barang gadaimu kapan saja",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#f59e0b" strokeWidth="1.5"/>
        <path d="M12 7v5l3 3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: "Kumpulkan Poin Pandai dan gunakan untuk bayar pinjaman",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12l7 7 7-7" stroke="#023dff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Tarik uang pencairan secara instan ke Saldo Pandai",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="#023dff" strokeWidth="1.5"/>
        <path d="M9 12h6M9 15h4" stroke="#023dff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: "Beli produk digital untuk memenuhi kebutuhan harianmu",
  },
];

export default function VerifikasiSuccess() {
  const navigate = useNavigate()

  return (
    <div className="w-[375px] bg-white flex flex-col overflow-hidden rounded-3xl shadow-2xl" style={{ height: 812 }}>

      {/* Status bar */}
      <div className="flex justify-between items-end px-6 pt-3 pb-1 h-12">
        <img src={imgDate} alt="9:41" className="h-[11px] w-[28px]" />
        <img src={imgRight} alt="" className="h-[11px] w-[67px]" />
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar">

        {/* Hero — blue gradient with card illustration */}
        <div className="relative flex flex-col items-center px-6 pt-8 pb-10"
          style={{ background: "linear-gradient(180deg, #e5f2ff 0%, #cfe7ff 100%)" }}>
          <img src={imgPanda} alt="" className="size-36 object-cover" />

          {/* Simulated Pandai Gadai card */}
          <div className="w-full rounded-2xl overflow-hidden shadow-lg mt-2"
            style={{ background: "linear-gradient(135deg, #023dff 0%, #0038cc 100%)" }}>
            <div className="px-4 py-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 bg-white/20 rounded-full" />
                  <div className="size-8 bg-white/10 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Pandai Gadai</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] text-white/60">Referral: <span className="font-bold text-white">RPK002 ↗</span></p>
                <p className="text-base font-bold text-white tracking-[0.15em]">1234  5678  9000  0000</p>
                <p className="text-[12px] font-medium text-white/80">Azzahra Putri R.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-6 pt-6 pb-8">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-2xl font-bold text-slate-900 leading-8 tracking-[-0.15px]">
              Selamat! Kamu telah terverifikasi
            </p>
            <p className="text-sm text-slate-500 leading-5">
              Sekarang kamu bisa akses semua fitur yang tersedia pada aplikasi
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon, label }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2">
                {icon}
                <p className="text-[12px] font-medium text-slate-700 leading-4">{label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#023dff] rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <span className="text-sm font-medium text-white">Yuk, Telusuri Aplikasinya</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
