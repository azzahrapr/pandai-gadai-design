import { useNavigate } from 'react-router-dom'

// Local static assets
const imgPattern     = "/assets/bg-pattern.svg";
const imgDate        = "/assets/status-date.svg";
const imgRight       = "/assets/status-right.svg";
const imgPose        = "/assets/panda-pose15.png";
const imgShareIcon   = "/assets/share-icon.svg";
const imgPoinEmas    = "/assets/poin-fill.svg";
const imgSaldoIcon   = "/assets/saldo-icon.svg";
const imgCuanIcon    = "/assets/cuan-icon.svg";
const imgHomeIcon    = "/assets/nav-home-solid.svg";
const imgPoinEmasOutline = "/assets/poin-outline.svg";
const imgSmileIcon   = "/assets/nav-smile.svg";
const imgBanner      = "/assets/banner.jpg";
const imgCarouselDots = "/assets/carousel-indicator.svg";
const imgCalcIcon    = "/assets/calc-icon.svg";
const imgLocationIcon = "/assets/location-icon.svg";
const imgPhoneIcon   = "/assets/phone-icon.svg";
const imgCreditCard  = "/assets/nav-pinjaman-v1.svg";

// ── Quick-action icon assets
const icons = {
  tarikSaldo: {
    vector: "/assets/icon-tarik-v.svg",
    mask:   "/assets/icon-tarik-mask.svg",
    fill:   "/assets/icon-tarik-fill.png",
    vectorInset: "0 5.48% 10.97% 5.48%",
    maskInset:   "8.16% -11.54% -11.91% 7.79%",
    maskPos:     "-11.746px -41.796px",
    maskSize:    "455.859px 512.004px",
  },
  pulsa: {
    vector: "/assets/icon-pulsa-v.svg",
    mask:   "/assets/icon-pulsa-mask.svg",
    fill:   "/assets/icon-pulsa-fill.png",
    vectorInset: "0 4.99% 10.17% 5.18%",
    maskInset:   "-2.42% -24.89% -20.08% 2.39%",
    maskPos:     "14.289px 12.39px",
    maskSize:    "459.938px 512px",
  },
  listrik: {
    vector: "/assets/icon-listrik-v.svg",
    mask:   "/assets/icon-listrik-mask.svg",
    fill:   "/assets/icon-listrik-fill.png",
    vectorInset: "0 5.32% 10.63% 5.32%",
    maskInset:   "14.73% -4.88% -4.73% 14.88%",
    maskPos:     "-48.964px -75.426px",
    maskSize:    "457.566px 512.004px",
  },
  pdam: {
    vector: "/assets/icon-air-v.svg",
    mask:   "/assets/icon-air-mask.svg",
    fill:   "/assets/icon-air-fill.png",
    vectorInset: "0 4.76% 9.53% 4.76%",
    maskInset:   "7.33% -12.7% -12.33% 7.7%",
    maskPos:     "-15.117px -37.521px",
    maskSize:    "463.228px 512.171px",
  },
};

// Render a Figma icon at 48px by scaling the 512px composition
function QuickIcon({ icon }: { icon: typeof icons.tarikSaldo }) {
  const S = 512;
  return (
    <div style={{ width: 48, height: 48, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      <div style={{ transform: `scale(${48 / S})`, transformOrigin: '0 0', width: S, height: S, position: 'absolute' }}>
        {/* Vector (main icon shape) */}
        <div style={{ position: 'absolute', inset: icon.vectorInset }}>
          <img alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} src={icon.vector} />
        </div>
        {/* Masked fill (texture/color overlay) */}
        <div style={{
          position: 'absolute',
          inset: icon.maskInset,
          maskImage: `url('${icon.mask}')`,
          maskSize: icon.maskSize,
          maskPosition: icon.maskPos,
          maskRepeat: 'no-repeat',
          WebkitMaskImage: `url('${icon.mask}')`,
          WebkitMaskSize: icon.maskSize,
          WebkitMaskPosition: icon.maskPos,
          WebkitMaskRepeat: 'no-repeat',
        } as React.CSSProperties}>
          <img alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} src={icon.fill} />
        </div>
      </div>
    </div>
  );
}

function ArrowRightSmall({ className = "size-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none">
      <path d="M4.5 9L7.5 6L4.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AssetCard({ action }: { action: "Bayar" | "Gadai Lagi" }) {
  return (
    <div className="pressable bg-white border border-slate-200 flex h-28 items-center overflow-hidden rounded-2xl shrink-0 w-80">
      <div className="flex flex-col gap-2 flex-1 pl-4 pr-2 py-3 border-r border-slate-200 h-full justify-center">
        <div className="flex flex-col gap-2">
          <img src={imgPhoneIcon} alt="" className="size-6 object-contain" />
          <p className="font-semibold text-sm text-slate-900 leading-4">SAMSUNG GALAXY A52S 6/128GB</p>
        </div>
        {action === "Bayar" && (
          <p className="text-[12px] font-medium text-slate-500">Jatuh tempo 30 Sep 2025</p>
        )}
      </div>
      <div className="flex flex-col w-32 h-full">
        <div className="flex flex-col gap-1 flex-1 px-3 py-2.5 justify-center">
          <p className="text-[12px] font-medium text-slate-800">Nilai Pinjaman</p>
          <p className="text-sm font-semibold text-[#023dff]">Rp 4.500.000</p>
        </div>
        <button className="bg-[#023dff] text-white text-sm font-semibold py-2.5 text-center rounded-br-lg">
          {action}
        </button>
      </div>
    </div>
  );
}

export default function Homepage() {
  const navigate = useNavigate()
  return (
    <div className="w-[375px] bg-slate-50 flex flex-col overflow-hidden rounded-3xl shadow-2xl relative" style={{ height: 812 }}>

      {/* ── Scrollable area (header + body) */}
      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">

      {/* ── Header (blue gradient) */}
      <div className="relative flex flex-col" style={{ background: "linear-gradient(180deg, #023dff 0%, #012599 100%)" }}>
        {/* Background pattern — fix 1: cover full width */}
        <div className="absolute inset-0 overflow-hidden opacity-25 pointer-events-none">
          <img src={imgPattern} alt="" className="w-full h-full object-cover object-left-top" />
        </div>

        {/* Status bar */}
        <div className="flex justify-between items-end px-6 pt-3 pb-1 h-12 relative z-10">
          <img src={imgDate} alt="9:41" className="h-[11px] w-[28px]" />
          <img src={imgRight} alt="" className="h-[11px] w-[67px]" />
        </div>

        {/* Greeting */}
        <div className="flex items-start px-6 py-3 relative z-10">
          <div className="flex flex-col gap-1">
            <p className="text-base text-white">
              <span className="font-normal">Halo, </span>
              <span className="font-semibold text-[#e5f2ff]">Azzahra!</span>
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[12px] text-blue-200">Referral:</span>
              <div className="flex items-center gap-1 bg-[#cfe7ff] px-1.5 rounded-full">
                <span className="text-[12px] font-semibold text-[#023dff]">ABK001</span>
                <img src={imgShareIcon} alt="" className="size-3" />
              </div>
            </div>
          </div>
        </div>

        {/* fix 2: panda behind card — z-[5], card at z-[10] */}
        <img src={imgPose} alt="Panda mascot" className="absolute right-4 top-10 size-[88px] z-[5]" />

        {/* ── Poin Pandai card */}
        <div className="mx-4 rounded-t-2xl overflow-hidden relative z-[10]">
          {/* Gold section */}
          <div className="flex items-center justify-between px-3 py-3"
            style={{ background: "linear-gradient(118deg, #ffaa33 7%, #ffcb3c 21%, #ffcb3c 49%, #ffae28 75%, #fbc63a 98%)" }}>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <img src={imgPoinEmas} alt="" className="size-[18px] object-contain" />
                <span className="text-[12px] font-medium text-[#7e480f]">Poin Pandai</span>
              </div>
              <p className="text-lg font-bold text-black">20.000 poin</p>
            </div>
            {/* fix 3: shimmer animation on Klaim poin button */}
            <div className="relative overflow-hidden bg-[#ffcd05] border border-[#fffdc6] rounded-lg px-3 py-1.5">
              <span className="text-sm font-semibold text-[#492504] relative z-10">Klaim poin</span>
              <div className="shimmer-btn absolute top-[-14px] left-0 w-6 h-16 opacity-60"
                style={{ background: "linear-gradient(266deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)" }} />
            </div>
          </div>

          {/* Dark hook strip */}
          <div className="flex items-center justify-between bg-[#09134e] px-3 py-1.5">
            <span className="text-[12px] font-medium text-[#cfe7ff]">
              Ambil tambahan Poin Pandai s.d 20.000 poin!
            </span>
            <ArrowRightSmall className="size-4 text-[#cfe7ff]" />
          </div>

          {/* Saldo row */}
          <div className="bg-slate-50 flex gap-3 px-3 pt-3 pb-10">
            {/* Saldo Pandai */}
            <div className="bg-white flex-1 rounded-xl p-3 shadow-sm flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <img src={imgSaldoIcon} alt="" className="size-5 object-contain" />
                <span className="text-[12px] font-medium text-slate-700">Saldo Pandai</span>
              </div>
              <p className="text-base font-semibold text-black">Rp3.800.000</p>
              <div className="flex items-center gap-1 text-[#023dff]">
                <span className="text-[12px] font-semibold">Pakai Saldo</span>
                <ArrowRightSmall className="size-3" />
              </div>
            </div>
            {/* Cuan Pandai */}
            <div className="bg-white flex-1 rounded-xl p-3 shadow-sm flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <img src={imgCuanIcon} alt="" className="size-5 object-contain" />
                <span className="text-[12px] font-medium text-slate-700">Cuan Pandai</span>
              </div>
              <p className="text-[12px] font-medium text-slate-500">20+ misi menunggu!</p>
              <div className="flex items-center gap-1 text-[#023dff]">
                <span className="text-[12px] font-semibold">Telusuri Misi</span>
                <ArrowRightSmall className="size-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── White body */}
      <div className="bg-slate-50 flex flex-col flex-1 rounded-t-3xl shadow-[0_-4px_12px_rgba(0,0,0,0.1)] -mt-8 relative z-10">

        {/* Pinjaman Kamu */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">Pinjaman Kamu</p>
            <button className="flex items-center gap-1 text-[12px] font-semibold text-[#023dff]">
              Lihat Semua <ArrowRightSmall className="size-3" />
            </button>
          </div>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1 -mr-4 pr-4">
            <AssetCard action="Bayar" />
            <AssetCard action="Gadai Lagi" />
          </div>
        </div>

        {/* Kirim & Bayar */}
        <div className="flex flex-col gap-3 px-4 pb-4">
          <p className="text-sm font-bold text-slate-900">Kirim & Bayar, Lebih Praktis!</p>

          {/* Quick actions */}
          <div className="flex items-start justify-between">
            {([
              { icon: icons.tarikSaldo, label: "Tarik saldo" },
              { icon: icons.pulsa,      label: "Pulsa/\nPaket Data" },
              { icon: icons.listrik,    label: "Listrik PLN" },
              { icon: icons.pdam,       label: "Tagihan PDAM" },
            ] as const).map(({ icon, label }) => (
              <button key={label} className="flex flex-col items-center gap-2 flex-1 p-2">
                <QuickIcon icon={icon} />
                <span className="text-[12px] font-medium text-slate-900 text-center whitespace-pre-line leading-4">{label}</span>
              </button>
            ))}
          </div>

          {/* Simulasi + Lokasi */}
          <div className="flex gap-2">
            <button className="bg-white border border-slate-200 flex-1 flex items-center gap-2 px-3 py-3 rounded-2xl">
              <img src={imgCalcIcon} alt="" className="size-5 shrink-0 object-contain" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-900">Simulasi Gadai</span>
                <span className="text-[12px] font-medium text-slate-500">Cek nilai taksiran</span>
              </div>
            </button>
            <button className="bg-white border border-slate-200 flex-1 flex items-center gap-2 px-3 py-3 rounded-2xl">
              <img src={imgLocationIcon} alt="" className="size-5 shrink-0 object-contain" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-900">Lokasi Cabang</span>
                <span className="text-[12px] font-medium text-slate-500">Cari yang terdekat</span>
              </div>
            </button>
          </div>
        </div>

        {/* Banner carousel */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          <div className="relative">
            <img src={imgBanner} alt="Banner promo" className="w-full h-[120px] rounded-xl object-cover" />
          </div>
          <img src={imgCarouselDots} alt="" className="h-2 mx-auto" />
        </div>
      </div>

      </div>{/* end scrollable area */}

      {/* ── Klaim Poin strip */}
      <div className="flex items-center gap-2 px-4 py-2"
        style={{ background: "linear-gradient(90deg, #fefdea 10%, #fffcaf 61%, #ffec4f 100%)" }}>
        <div className="flex flex-col flex-1">
          <p className="text-sm font-semibold text-[#492504]">Klaim 4.000 Poin Pandai</p>
          <p className="text-[12px] font-medium text-[#492504]">Pakai poin untuk bayar pinjaman!</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#ffda14] px-3 py-0.5 rounded-full">
            <span className="text-[12px] font-semibold text-slate-900">6 hari 3 jam lagi</span>
          </div>
          <ArrowRightSmall className="size-5 text-[#492504]" />
        </div>
      </div>

      {/* ── Bottom Navbar */}
      <div className="bg-white flex items-center justify-between px-4 pt-4 pb-8">
        {/* Beranda (active) */}
        <button className="flex flex-col items-center gap-1 w-20">
          <img src={imgHomeIcon} alt="" className="size-6 object-contain" />
          <span className="text-[12px] font-bold text-[#001cdb]">Beranda</span>
        </button>

        {/* Pinjaman */}
        <button onClick={() => navigate('/pinjaman/detail')} className="flex flex-col items-center gap-1 w-20 relative">
          <img src={imgCreditCard} alt="" className="size-6 object-contain" />
          <span className="text-[12px] font-bold text-slate-500">Pinjaman</span>
        </button>

        {/* Poin Pandai */}
        <button onClick={() => navigate('/poin-pandai')} className="flex flex-col items-center gap-1 w-20">
          <img src={imgPoinEmasOutline} alt="" className="size-6 object-contain" />
          <span className="text-[12px] font-bold text-slate-500">Poin Pandai</span>
        </button>

        {/* Akun */}
        <button className="flex flex-col items-center gap-1 w-20 relative">
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
  );
}
