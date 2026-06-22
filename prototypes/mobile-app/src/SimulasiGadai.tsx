import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { InspectLabel } from './InspectLabel'

const imgDate  = "/assets/status-date.svg"
const imgRight = "/assets/status-right.svg"

// Safety shield icon parts (Cortes DS: IconFilled/safety)
const imgShield0 = "https://www.figma.com/api/mcp/asset/68617ea3-3ef5-4be9-b990-51fb3bd19774"
const imgShield1 = "https://www.figma.com/api/mcp/asset/05aeb3be-0237-46e9-9574-e020680b17a9"
const imgShield2 = "https://www.figma.com/api/mcp/asset/81b4f28c-c5d1-436a-afd2-78bec06437cf"
const imgShield3 = "https://www.figma.com/api/mcp/asset/9bfa73f6-512d-4fcf-9546-d58d7544d341"
const imgShield4 = "https://www.figma.com/api/mcp/asset/768d716a-2a0d-4c27-8ed2-246be07a326a"
const imgShield5 = "https://www.figma.com/api/mcp/asset/7ae43fb0-41de-4b15-8127-0ab608014176"
const imgShield6 = "https://www.figma.com/api/mcp/asset/9f29c296-b1ee-41e9-8198-2c4ac3ee3cd5"
const imgShield7 = "https://www.figma.com/api/mcp/asset/e949c865-f20d-4d96-a514-b11bfe1f77d8"

const C = '#023dff'
const SW = { stroke: C, strokeWidth: '1.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }

const imgPromoIcon = "https://www.figma.com/api/mcp/asset/a37ccae0-abe3-4f17-8f55-d0c09ff0aa90"

const CATEGORIES = {
  Elektronik: [
    { label: 'Handphone', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="18" r="0.8" fill={C} stroke="none"/></svg> },
    { label: 'Laptop', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M1 21h22"/></svg> },
    { label: 'TV', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M8 21h8M12 19v2"/></svg> },
    { label: 'Smartwatch', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 7V5h6v2M9 17v2h6v-2"/></svg> },
    { label: 'Game Console', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><path d="M10.5 5h3a5.5 5.5 0 0 1 5.5 5.5v3A5.5 5.5 0 0 1 13.5 19h-3A5.5 5.5 0 0 1 5 13.5v-3A5.5 5.5 0 0 1 10.5 5z"/><path d="M6 12h4m-2-2v4"/><circle cx="16" cy="11" r="0.8" fill={C} stroke="none"/><circle cx="18" cy="13" r="0.8" fill={C} stroke="none"/></svg> },
    { label: 'Kamera', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
  ],
  Emas: [
    { label: 'Logam Mulia', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><path d="M12 3 2 9l10 12 10-12-10-6z"/><path d="M2 9h20M7 9 12 3M17 9 12 3"/></svg> },
    { label: 'Perhiasan', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><circle cx="12" cy="14" r="6"/><path d="M9 5h6l2 3H7l2-3z"/></svg> },
  ],
  BPKB: [
    { label: 'BPKB Motor', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><circle cx="5.5" cy="16.5" r="2.5"/><circle cx="18.5" cy="16.5" r="2.5"/><path d="M8 16.5h4l3-6h3l2 3"/><path d="M7 8h3l1.5 2.5"/></svg> },
    { label: 'BPKB Mobil', icon: <svg width="16" height="16" viewBox="0 0 24 24" {...SW}><path d="M5 12 6.7 7.6A2 2 0 0 1 8.6 6h6.8a2 2 0 0 1 1.9 1.6L19 12"/><path d="M3 12h18v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg> },
  ],
}

const ITEMS: Record<string, string[]> = {
  'Handphone': [
    'iPhone 17 Pro Max 512GB',
    'iPhone 17 Air Sky Blue 256GB',
    'iPhone 16 Pro 128GB',
    'iPhone 16 256GB',
    'Samsung Galaxy S25 Ultra 512GB',
    'Samsung Galaxy S25+ 256GB',
    'Samsung Galaxy Z Fold 6 512GB',
    'Samsung Galaxy A55 5G 256GB',
    'Google Pixel 9 Pro 256GB',
    'Xiaomi 15 Pro 512GB',
    'OPPO Find X8 Pro 256GB',
    'Vivo X200 Pro 512GB',
  ],
  'Laptop': [
    'MacBook Pro 16" M4 Pro 512GB',
    'MacBook Air 15" M3 256GB',
    'MacBook Air 13" M2 256GB',
    'ASUS ROG Zephyrus G14 2024',
    'ASUS VivoBook 16X OLED i7',
    'Dell XPS 15 i7-13700H 32GB',
    'Lenovo ThinkPad X1 Carbon Gen 12',
    'Lenovo IdeaPad Slim 5 OLED',
    'HP Spectre x360 14" i7 512GB',
    'Acer Swift Go 14 OLED',
    'Microsoft Surface Pro 11',
    'MSI Prestige 14 AI EVO',
  ],
  'TV': [
    'Samsung Neo QLED 4K 65"',
    'Samsung The Frame 55"',
    'LG OLED C3 55"',
    'LG OLED evo G3 65"',
    'Sony Bravia XR A95L 65"',
    'Sony Bravia 7 75"',
    'TCL QLED 4K 75"',
    'Hisense U8K Mini-LED 65"',
    'Xiaomi TV A Pro 55"',
    'Polytron PLD 43V1550',
  ],
  'Smartwatch': [
    'Apple Watch Series 10 45mm',
    'Apple Watch Ultra 2 49mm',
    'Samsung Galaxy Watch 7 44mm',
    'Samsung Galaxy Watch Ultra 47mm',
    'Garmin Fenix 8 Pro 51mm',
    'Garmin Forerunner 965',
    'Huawei Watch GT 4 Pro 46mm',
    'Xiaomi Watch 2 Pro',
  ],
  'Game Console': [
    'PlayStation 5 Slim Disc Edition',
    'PlayStation 5 Digital Edition',
    'Xbox Series X 1TB',
    'Xbox Series S 512GB',
    'Nintendo Switch OLED',
    'Nintendo Switch Lite',
    'Steam Deck OLED 512GB',
    'Steam Deck 64GB',
  ],
  'Kamera': [
    'Sony Alpha 7 IV',
    'Sony Alpha 7C II',
    'Canon EOS R6 Mark II',
    'Canon EOS R50',
    'Nikon Z8',
    'Nikon Zfc',
    'Fujifilm X-T5',
    'Fujifilm X100VI',
    'GoPro Hero 13 Black',
    'DJI Osmo Pocket 3',
  ],
  'Logam Mulia': [
    'Antam 1 gram',
    'Antam 2 gram',
    'Antam 5 gram',
    'Antam 10 gram',
    'Antam 25 gram',
    'Antam 50 gram',
    'Antam 100 gram',
    'UBS 1 gram',
    'UBS 5 gram',
    'UBS 10 gram',
  ],
  'Perhiasan': [
    'Gelang Emas 22K 10 gram',
    'Gelang Emas 22K 15 gram',
    'Cincin Berlian 0.5 karat',
    'Cincin Berlian 1 karat',
    'Kalung Emas 750 15 gram',
    'Kalung Emas 22K 10 gram',
    'Anting Emas 22K 3 gram',
  ],
  'BPKB Motor': [
    'Honda Beat 2022',
    'Honda Beat 2023',
    'Honda Vario 160 2023',
    'Honda PCX 160 2023',
    'Honda ADV 160 2022',
    'Yamaha NMAX 2023',
    'Yamaha Aerox 2022',
    'Yamaha Mio M3 2021',
    'Kawasaki Ninja ZX-6R 2022',
    'Vespa Sprint 150 2022',
    'Suzuki NEX II 2022',
    'Suzuki Satria F150 2021',
  ],
  'BPKB Mobil': [
    'Toyota Avanza 1.5 G 2022',
    'Toyota Fortuner 4x2 VRZ 2021',
    'Toyota Kijang Innova Zenix 2023',
    'Honda Brio RS CVT 2023',
    'Honda HR-V SE 2022',
    'Honda CR-V Turbo 2022',
    'Daihatsu Xenia 1.3 R 2022',
    'Suzuki Ertiga GX 2023',
    'Mitsubishi Xpander Cross 2022',
    'Hyundai Creta Prime 2023',
  ],
}

function IconSafety() {
  return (
    <div className="overflow-clip relative shrink-0 size-[40px]">
      <div className="absolute" style={{ inset: '10% 19.68% 15.5% 11.72%' }}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShield0} />
      </div>
      <div className="absolute" style={{ inset: '24.2% 19.68% 15.5% 27.87%' }}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShield1} />
      </div>
      <div className="absolute" style={{ inset: '18.28% 53.98% 52.58% 19.35%' }}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShield2} />
      </div>
      <div className="absolute" style={{ inset: '18.28% 27.3% 52.58% 46.02%' }}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShield3} />
      </div>
      <div className="absolute" style={{ inset: '47.42% 29.31% 23.78% 46.02%' }}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShield4} />
      </div>
      <div className="absolute" style={{ inset: '47.42% 53.98% 23.78% 21.36%' }}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShield5} />
      </div>
      <div className="absolute" style={{ inset: '35.37% 38.91% 41.67% 32.15%' }}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShield6} />
      </div>
      <div className="absolute" style={{ bottom: '15.74%', left: '50%', right: '3.75%', top: '47.5%' }}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShield7} />
      </div>
    </div>
  )
}

export default function SimulasiGadai() {
  const navigate = useNavigate()
  const location = useLocation()
  const locState = location.state as { category?: string; openCategorySheet?: boolean } | null
  const initialCategory: string = locState?.category ?? 'Handphone'
  const [showSheet, setShowSheet] = useState(locState?.openCategorySheet ?? false)
  const [showSearchSheet, setShowSearchSheet] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [pendingCategory, setPendingCategory] = useState(initialCategory)
  const [searchValue, setSearchValue] = useState('')
  const [sheetSearch, setSheetSearch] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [bpkbPlat, setBpkbPlat] = useState('')
  const [bpkbPajak, setBpkbPajak] = useState('')
  const [showPlatSheet, setShowPlatSheet] = useState(false)
  const [showPajakSheet, setShowPajakSheet] = useState(false)
  const [showKotaSheet, setShowKotaSheet] = useState(false)
  const [kota, setKota] = useState('')

  const isBPKB = selectedCategory === 'BPKB Motor' || selectedCategory === 'BPKB Mobil'
  const allItems = ITEMS[selectedCategory] ?? []
  const sheetItems = sheetSearch.trim()
    ? allItems.filter(i => i.toLowerCase().includes(sheetSearch.toLowerCase()))
    : allItems

  function openSearchSheet() {
    setSheetSearch('')
    setShowSearchSheet(true)
  }

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
            <InspectLabel label="Heading 5" tokens={['font: Geist Bold 20px / lh 32px', 'color: text/primary · #0f172a']}>
              <p className="font-bold leading-[32px] text-[#0f172a] text-[20px] whitespace-nowrap">Simulasi Gadai</p>
            </InspectLabel>
          </div>
          <div className="backdrop-blur-[6px] bg-[#e5f2ff] border border-[#a8cfff] flex gap-[4px] items-center justify-center px-[10px] py-[4px] rounded-[1000px] shrink-0">
            <div className="overflow-clip relative shrink-0 size-[12px]">
              <svg className="absolute inset-0" width="12" height="12" viewBox="0 0 24 24" fill="#001cdb">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
            </div>
            <p className="font-normal leading-[16px] text-[#001cdb] text-[12px] text-center whitespace-nowrap">Panduan</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-[8px] items-start overflow-y-auto hide-scrollbar flex-1 min-h-0 w-full pb-[121px]">


        {/* BPKB Banner */}
        {isBPKB && (
          <div className="bg-[#e5f2ff] flex gap-[8px] items-center justify-center px-[24px] py-[12px] shrink-0 w-full">
            <div className="flex flex-1 flex-col items-start justify-center min-w-px">
              <p className="font-semibold leading-[22px] text-[14px] text-[#0f1729]">
                Gadai {selectedCategory === 'BPKB Motor' ? 'motor' : 'mobil'} dengan{' '}
                <span className="text-[#001cdb]">BPKB Instan</span>
              </p>
              <p className="font-normal leading-[16px] text-[12px] text-[#0f1729]">
                Tanpa survei &amp; BI checking, duit langsung cair!
              </p>
            </div>
            <img src="/assets/base.payment-cash.png" alt="" className="size-[40px] shrink-0 object-contain" />
          </div>
        )}

        {/* Pilih Barang */}
        <div className="bg-white flex flex-col gap-[8px] items-start p-[16px] shrink-0 w-full">
          <div className="flex items-center shrink-0 w-full">
            <p className="font-semibold leading-[22px] text-[14px] text-black whitespace-nowrap">Pilih Barang</p>
          </div>
          <div className="bg-white border border-[#e1e7ef] flex flex-col items-start rounded-[12px] shrink-0 w-full">
            <InspectLabel label="Category Header" tokens={['bg: color/bg-subtle · #f8fafc', 'border: color/border-subtle · #e1e7ef']} className="w-full">
            <div className="bg-[#f8fafc] border border-[#e1e7ef] flex flex-col items-start overflow-clip px-[16px] py-[12px] rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full">
              <div className="flex items-center justify-between shrink-0 w-full">
                <div className="flex flex-col items-start justify-center shrink-0 whitespace-nowrap">
                  <p className="font-normal leading-[16px] text-[#65758b] text-[12px]">Kategori Barang</p>
                  <p className="font-semibold leading-[22px] text-[#0f1729] text-[14px]">{selectedCategory}</p>
                </div>
                <button onClick={() => { setPendingCategory(selectedCategory); setShowSheet(true) }} className="flex gap-[4px] h-[24px] items-center justify-center px-[8px] py-[4px] rounded-[8px] shrink-0">
                  <p className="font-semibold leading-[22px] text-[#023dff] text-[14px] whitespace-nowrap">Ubah</p>
                </button>
              </div>
            </div>
            </InspectLabel>
            {isBPKB ? (
              <div className="flex flex-col gap-[10px] items-start p-[12px] shrink-0 w-full">
                <div className="flex flex-col gap-[4px] w-full">
                  <div
                    onClick={openSearchSheet}
                    className={`border flex gap-[8px] items-center px-[12px] py-[12px] rounded-[6px] shrink-0 w-full cursor-pointer ${submitted && !searchValue ? 'border-[#ef4444]' : 'border-[#cbd5e1]'}`}
                  >
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7.5" stroke="#65758b" strokeWidth="1.5"/>
                      <path d="M20.5 20.5l-4.5-4.5" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className={`flex-1 font-normal leading-[21px] min-w-px overflow-hidden text-[14px] text-ellipsis whitespace-nowrap ${searchValue ? 'text-[#0f1729]' : 'text-[#94a3b8]'}`}>
                      {searchValue || `Cari nama ${selectedCategory === 'BPKB Mobil' ? 'mobil' : 'motor'}...`}
                    </span>
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {submitted && !searchValue && (
                    <p className="font-normal leading-[16px] text-[#ef4444] text-[12px]">Pilih nama barang terlebih dahulu</p>
                  )}
                </div>
                <div className="flex flex-col gap-[4px] w-full">
                  <div
                    onClick={() => setShowPlatSheet(true)}
                    className={`border flex gap-[8px] items-center px-[12px] py-[12px] rounded-[6px] shrink-0 w-full cursor-pointer ${submitted && !bpkbPlat ? 'border-[#ef4444]' : 'border-[#cbd5e1]'}`}
                  >
                    <span className={`flex-1 font-normal leading-[20px] text-[14px] ${bpkbPlat ? 'text-[#0f1729]' : 'text-[#94a3b8]'}`}>{bpkbPlat || 'Plat kendaraan'}</span>
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {submitted && !bpkbPlat && (
                    <p className="font-normal leading-[16px] text-[#ef4444] text-[12px]">Plat kendaraan wajib dipilih</p>
                  )}
                </div>
                <div className="flex flex-col gap-[4px] w-full">
                  <div
                    onClick={() => setShowPajakSheet(true)}
                    className={`border flex gap-[8px] items-center px-[12px] py-[12px] rounded-[6px] shrink-0 w-full cursor-pointer ${submitted && !bpkbPajak ? 'border-[#ef4444]' : 'border-[#cbd5e1]'}`}
                  >
                    <span className={`flex-1 font-normal leading-[20px] text-[14px] ${bpkbPajak ? 'text-[#0f1729]' : 'text-[#94a3b8]'}`}>{bpkbPajak || 'Status pajak'}</span>
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {submitted && !bpkbPajak && (
                    <p className="font-normal leading-[16px] text-[#ef4444] text-[12px]">Status pajak wajib dipilih</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-[6px] items-start p-[16px] shrink-0 w-full">
                <div className="flex flex-col items-start gap-[4px] shrink-0 w-full">
                  <InspectLabel label="Text Field · Search" tokens={['border: color/border-default · #cbd5e1', 'radius: 6px', 'padding: 12px']} className="w-full">
                  <div
                    onClick={openSearchSheet}
                    className={`border flex gap-[8px] items-center px-[12px] py-[12px] rounded-[6px] shrink-0 w-full cursor-pointer ${submitted && !searchValue ? 'border-[#ef4444]' : 'border-[#cbd5e1]'}`}
                  >
                    <div className="overflow-clip relative shrink-0 size-[16px]">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="7.5" stroke="#65758b" strokeWidth="1.5"/>
                        <path d="M20.5 20.5l-4.5-4.5" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className={`flex-1 font-normal leading-[21px] min-w-px overflow-hidden text-[14px] text-ellipsis whitespace-nowrap ${searchValue ? 'text-[#0f1729]' : 'text-[#94a3b8]'}`}>
                      {searchValue || 'Cari nama barang...'}
                    </span>
                    {searchValue && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setSearchValue('') }}
                        className="overflow-clip relative shrink-0 size-[16px]"
                      >
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  </InspectLabel>
                  {submitted && !searchValue && (
                    <p className="font-normal leading-[16px] text-[#ef4444] text-[12px]">Pilih nama barang terlebih dahulu</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-[2px] items-start pb-[16px] px-[16px] shrink-0 w-full">
              <p className="font-normal leading-[16px] min-w-full text-[12px] text-black w-min">Barangmu tidak ada di daftar? Kami bisa bantu!</p>
              <div className="flex items-center shrink-0">
                <p className="font-bold leading-[16px] text-[#023dff] text-[12px] whitespace-nowrap">Chat kami di Whatsapp</p>
                <div className="overflow-clip relative shrink-0 size-[14px]">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none" stroke="#023dff" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Isi Data Diri */}
        <div className="bg-white flex flex-col gap-[12px] items-start p-[16px] shrink-0 w-full">
          <div className="flex flex-col gap-[4px] items-start justify-center shrink-0 text-black w-full">
            <p className="font-semibold leading-[22px] text-[14px] whitespace-nowrap">Isi Data Diri</p>
            <p className="font-normal leading-[16px] min-w-full text-[12px] w-min">Isi data diri untuk melihat perkiraan harga. Data kamu dijamin aman!</p>
          </div>
          <div className="bg-white flex flex-col gap-[4px] items-start shrink-0 w-full">
            <InspectLabel label="Text Field · Default" tokens={['border: color/border-default · #cbd5e1', 'font: Body 2 · 14px Regular', 'radius: 6px', 'padding: 12px']} className="w-full">
            <div className={`border flex gap-[8px] items-center px-[12px] py-[12px] rounded-[6px] shrink-0 w-full ${submitted && !name.trim() ? 'border-[#ef4444]' : 'border-[#cbd5e1]'}`}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkap"
                className="flex-1 font-normal leading-[20px] min-w-px text-[#0f1729] text-[14px] outline-none bg-transparent"
              />
              {name && (
                <button onClick={() => setName('')} className="overflow-clip relative shrink-0 size-[16px]">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            </InspectLabel>
            {submitted && !name.trim() && (
              <p className="font-normal leading-[16px] text-[#ef4444] text-[12px]">Nama lengkap wajib diisi</p>
            )}
          </div>
          <div className="bg-white flex flex-col gap-[4px] items-start shrink-0 w-full">
            <InspectLabel label="Text Field · Default" tokens={['border: color/border-default · #cbd5e1', 'font: Body 2 · 14px Regular', 'radius: 6px', 'padding: 12px']} className="w-full">
            <div className={`border flex gap-[8px] items-center px-[12px] py-[12px] rounded-[6px] shrink-0 w-full ${submitted && !phone.trim() ? 'border-[#ef4444]' : 'border-[#cbd5e1]'}`}>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Nomor HP"
                className="flex-1 font-normal leading-[20px] min-w-px text-[#0f1729] text-[14px] outline-none bg-transparent"
              />
              {phone && (
                <button onClick={() => setPhone('')} className="overflow-clip relative shrink-0 size-[16px]">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            </InspectLabel>
            {submitted && !phone.trim() && (
              <p className="font-normal leading-[16px] text-[#ef4444] text-[12px]">Nomor HP wajib diisi</p>
            )}
          </div>
          {isBPKB && (
            <div className="bg-white flex flex-col gap-[4px] items-start shrink-0 w-full">
              <div
                onClick={() => setShowKotaSheet(true)}
                className={`border flex gap-[8px] items-center px-[12px] py-[12px] rounded-[6px] shrink-0 w-full cursor-pointer ${submitted && !kota ? 'border-[#ef4444]' : 'border-[#cbd5e1]'}`}
              >
                <span className={`flex-1 font-normal leading-[20px] text-[14px] ${kota ? 'text-[#0f1729]' : 'text-[#94a3b8]'}`}>{kota || 'Domisili'}</span>
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {submitted && !kota && (
                <p className="font-normal leading-[16px] text-[#ef4444] text-[12px]">Domisili wajib dipilih</p>
              )}
            </div>
          )}
        </div>

        {/* Card Info */}
        {!isBPKB && (
        <div className="bg-white flex flex-col items-start p-[16px] shrink-0 w-full">
          <div className="bg-[#ebf5ff] border border-[#f1f3f9] flex flex-col items-start p-[12px] rounded-[8px] shrink-0 w-full">
            <div className="flex gap-[8px] items-center shrink-0 w-[316px]">
              <IconSafety />
              <div className="flex flex-col h-[32px] items-start shrink-0 w-[197px]">
                <p className="font-normal leading-[16px] text-[#5f6c85] text-[12px] w-[268px]">
                  Gak perlu BI Checking. Datang ke cabang, uang langsung cair.
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

      </div>

      {/* Sticky footer */}
      <div className="absolute bottom-0 flex flex-col items-start left-0 w-[375px]">
        {!['BPKB Motor', 'BPKB Mobil'].includes(selectedCategory) && <div className="bg-[#d3f1d4] flex gap-[8px] h-[45px] items-center px-[16px] py-[8px] rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full">
          <div className="overflow-clip relative shrink-0 size-[16px]">
            <div className="absolute" style={{ inset: '2.87% 2.71% 2.71% 2.87%' }}>
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPromoIcon} />
            </div>
          </div>
          <p className="font-normal leading-[16px] text-[#28832d] text-[12px] w-[313px]">Ada bonus Rp100rb untuk gadai pertama!</p>
        </div>}
        <div className="bg-white flex flex-col items-center justify-center overflow-clip pb-[24px] pt-[8px] px-[16px] shrink-0 w-full">
          <InspectLabel label="Button · Primary" tokens={['bg: color/primary · #023dff', 'font: Body 2 SemiBold · 14px', 'height: 44px', 'radius: 8px']} className="w-full">
          <button
            onClick={() => {
              setSubmitted(true)
              const bpkbFieldsValid = !isBPKB || (bpkbPlat && bpkbPajak && kota)
              if (searchValue && name.trim() && phone.trim() && bpkbFieldsValid) navigate('/simulasi/estimasi', { state: { item: searchValue, category: selectedCategory, bpkbPlat, bpkbPajak } })
            }}
            className="bg-[#023dff] flex gap-[4px] h-[44px] items-center justify-center px-[16px] py-[8px] rounded-[8px] shrink-0 w-full"
          >
            <p className="font-semibold leading-[22px] text-white text-[14px] whitespace-nowrap">Lihat Estimasi Pinjaman</p>
          </button>
          </InspectLabel>
        </div>
      </div>

      {/* Domisili bottom sheet */}
      {showKotaSheet && (
        <div className="absolute inset-0 bg-[rgba(15,17,41,0.7)] z-10" onClick={() => setShowKotaSheet(false)}>
          <div
            className="absolute bottom-0 bg-white drop-shadow-[0px_10px_7.5px_rgba(0,0,0,0.1),0px_4px_3px_rgba(0,0,0,0.1)] flex flex-col rounded-tl-[8px] rounded-tr-[8px] w-[375px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-[16px] items-start px-[16px] pb-[12px] pt-[12px] shrink-0">
              <div className="flex items-center justify-center w-full">
                <div className="bg-[#e1e7ef] h-[8px] rounded-[9999px] w-[100px]" />
              </div>
              <div className="flex gap-[8px] items-center w-full">
                <p className="flex-1 font-semibold leading-[28px] text-[#0f1729] text-[18px]">Pilih domisili</p>
                <button onClick={() => setShowKotaSheet(false)} className="overflow-clip relative shrink-0 size-[16px]">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#0f1729" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="min-h-0 overflow-y-auto hide-scrollbar" style={{ maxHeight: 320 }}>
              {['Bekasi', 'Bogor', 'Depok', 'Jakarta', 'Karawang', 'Tangerang / Tangerang Selatan', 'Lainnya'].map((opt, idx, arr) => (
                <div key={opt}>
                  <button onClick={() => { setKota(opt); setShowKotaSheet(false) }} className="flex items-center gap-[8px] min-h-[40px] px-[16px] py-[8px] w-full text-left">
                    <span className={`flex-1 font-normal leading-[20px] text-[14px] ${kota === opt ? 'text-[#023dff] font-semibold' : 'text-[#0f1729]'}`}>{opt}</span>
                    {kota === opt && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <path d="M5 12l5 5L20 7" stroke="#023dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  {idx < arr.length - 1 && <div className="h-[1px] bg-[#f1f5f9] mx-[16px]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plat bottom sheet */}
      {showPlatSheet && (
        <div className="absolute inset-0 bg-[rgba(15,17,41,0.7)] z-10" onClick={() => setShowPlatSheet(false)}>
          <div
            className="absolute bottom-0 bg-white drop-shadow-[0px_10px_7.5px_rgba(0,0,0,0.1),0px_4px_3px_rgba(0,0,0,0.1)] flex flex-col rounded-tl-[8px] rounded-tr-[8px] w-[375px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-[16px] items-start px-[16px] pb-[12px] pt-[12px] shrink-0">
              <div className="flex items-center justify-center w-full">
                <div className="bg-[#e1e7ef] h-[8px] rounded-[9999px] w-[100px]" />
              </div>
              <div className="flex gap-[8px] items-center w-full">
                <p className="flex-1 font-semibold leading-[28px] text-[#0f1729] text-[18px]">Plat Kendaraan</p>
                <button onClick={() => setShowPlatSheet(false)} className="overflow-clip relative shrink-0 size-[16px]">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#0f1729" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="min-h-0 overflow-y-auto hide-scrollbar" style={{ maxHeight: 280 }}>
              {['Plat B', 'Plat F', 'Plat T', 'Plat Lainnya'].map((opt, idx, arr) => (
                <div key={opt}>
                  <button onClick={() => { setBpkbPlat(opt); setShowPlatSheet(false) }} className="flex items-center gap-[8px] min-h-[40px] px-[16px] py-[8px] w-full text-left">
                    <span className={`flex-1 font-normal leading-[20px] text-[14px] ${bpkbPlat === opt ? 'text-[#023dff] font-semibold' : 'text-[#0f1729]'}`}>{opt}</span>
                    {bpkbPlat === opt && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <path d="M5 12l5 5L20 7" stroke="#023dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  {idx < arr.length - 1 && <div className="h-[1px] bg-[#f1f5f9] mx-[16px]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pajak bottom sheet */}
      {showPajakSheet && (
        <div className="absolute inset-0 bg-[rgba(15,17,41,0.7)] z-10" onClick={() => setShowPajakSheet(false)}>
          <div
            className="absolute bottom-0 bg-white drop-shadow-[0px_10px_7.5px_rgba(0,0,0,0.1),0px_4px_3px_rgba(0,0,0,0.1)] flex flex-col rounded-tl-[8px] rounded-tr-[8px] w-[375px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-[16px] items-start px-[16px] pb-[12px] pt-[12px] shrink-0">
              <div className="flex items-center justify-center w-full">
                <div className="bg-[#e1e7ef] h-[8px] rounded-[9999px] w-[100px]" />
              </div>
              <div className="flex gap-[8px] items-center w-full">
                <p className="flex-1 font-semibold leading-[28px] text-[#0f1729] text-[18px]">Status Pajak</p>
                <button onClick={() => setShowPajakSheet(false)} className="overflow-clip relative shrink-0 size-[16px]">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#0f1729" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="min-h-0 overflow-y-auto hide-scrollbar" style={{ maxHeight: 280 }}>
              {['Pajak Hidup', 'Pajak Mati Maks. 6 Bulan', 'Pajak Mati Lebih 6 Bulan'].map((opt, idx, arr) => (
                <div key={opt}>
                  <button onClick={() => { setBpkbPajak(opt); setShowPajakSheet(false) }} className="flex items-center gap-[8px] min-h-[40px] px-[16px] py-[8px] w-full text-left">
                    <span className={`flex-1 font-normal leading-[20px] text-[14px] ${bpkbPajak === opt ? 'text-[#023dff] font-semibold' : 'text-[#0f1729]'}`}>{opt}</span>
                    {bpkbPajak === opt && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <path d="M5 12l5 5L20 7" stroke="#023dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  {idx < arr.length - 1 && <div className="h-[1px] bg-[#f1f5f9] mx-[16px]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SKU search bottom sheet */}
      {showSearchSheet && (
        <div className="absolute inset-0 bg-[rgba(15,17,41,0.7)] z-10" onClick={() => setShowSearchSheet(false)}>
          <div
            className="absolute bottom-0 bg-white drop-shadow-[0px_10px_7.5px_rgba(0,0,0,0.1),0px_4px_3px_rgba(0,0,0,0.1)] flex flex-col rounded-tl-[8px] rounded-tr-[8px] w-[375px]"
            style={{ maxHeight: '80%' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar + header */}
            <div className="flex flex-col gap-[16px] items-start px-[16px] pb-[12px] pt-[12px] shrink-0">
              <div className="flex items-center justify-center w-full">
                <div className="bg-[#e1e7ef] h-[8px] rounded-[9999px] w-[100px]" />
              </div>
              <div className="flex gap-[8px] items-center w-full">
                <p className="flex-1 font-semibold leading-[28px] text-[#0f1729] text-[18px]">
                  Pilih tipe/brand {selectedCategory.toLowerCase()}
                </p>
                <button onClick={() => setShowSearchSheet(false)} className="overflow-clip relative shrink-0 size-[16px]">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#0f1729" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <div className="border border-[#cbd5e1] flex gap-[8px] items-center px-[12px] py-[12px] rounded-[6px] w-full">
                <div className="overflow-clip relative shrink-0 size-[16px]">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7.5" stroke="#65758b" strokeWidth="1.5"/>
                    <path d="M20.5 20.5l-4.5-4.5" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <input
                  autoFocus
                  type="text"
                  value={sheetSearch}
                  onChange={e => setSheetSearch(e.target.value)}
                  placeholder={`Cari tipe/brand ${selectedCategory.toLowerCase()}`}
                  className="flex-1 font-normal leading-[21px] min-w-px text-[14px] text-[#0f1729] outline-none bg-transparent placeholder-[#94a3b8]"
                />
                {sheetSearch && (
                  <button onClick={() => setSheetSearch('')} className="overflow-clip relative shrink-0 size-[16px]">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="#65758b" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Item list */}
            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pb-[24px]">
              {sheetItems.map((item, idx) => (
                <div key={item}>
                  <button
                    onClick={() => { setSearchValue(item); setShowSearchSheet(false) }}
                    className="flex items-center gap-[8px] min-h-[40px] px-[16px] py-[8px] w-full text-left"
                  >
                    <span className={`flex-1 font-normal leading-[20px] text-[14px] ${searchValue === item ? 'text-[#023dff] font-semibold' : 'text-[#0f1729]'}`}>{item}</span>
                    {searchValue === item && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <path d="M5 12l5 5L20 7" stroke="#023dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  {idx < sheetItems.length - 1 && (
                    <div className="h-[1px] bg-[#f1f5f9] mx-[16px]" />
                  )}
                </div>
              ))}
              {sheetItems.length === 0 && (
                <div className="flex flex-col gap-[16px] items-center px-[16px] py-[12px] w-full">
                  {isBPKB && (
                    <div className="bg-[#e5f2ff] border border-[#e8ebed] flex gap-[8px] items-start overflow-clip p-[12px] rounded-[8px] w-full">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#023dff" className="shrink-0 mt-[2px]">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                      </svg>
                      <p className="flex-1 font-normal leading-[18px] text-[12px] text-[#65758b]">
                        Brand {selectedCategory === 'BPKB Mobil' ? 'mobil' : 'motor'} ini hanya dapat diproses melalui{' '}
                        <button onClick={() => window.open('https://tally.so/r/OD4rLk', '_blank')} className="font-bold text-[#023dff]">Cek BPKB Survei →</button>
                      </p>
                    </div>
                  )}
                  <img src="/assets/spot.empty-transaction.png" alt="" className="size-[128px] object-contain" />
                  <div className="flex flex-col gap-[4px] items-center w-full">
                    <p className="font-semibold leading-[23px] text-[16px] text-black text-center">Barang tidak ditemukan</p>
                    <p className="font-normal leading-[16px] text-[12px] text-black text-center">Coba cek brand lain, atau hubungi CS kami untuk info lebih lanjut.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hubungi CS button — only when empty state is showing */}
            {sheetItems.length === 0 && (
              <div className="flex flex-col items-start px-[16px] pb-[24px] pt-[8px] shrink-0">
                <button
                  onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                  className="bg-[#023dff] flex gap-[4px] h-[38px] items-center justify-center px-[16px] py-[8px] rounded-[8px] w-full"
                >
                  <p className="font-semibold leading-[22px] text-white text-[14px] whitespace-nowrap">Hubungi CS</p>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category bottom sheet */}
      {showSheet && (
        <div className="absolute inset-0 bg-[rgba(15,17,41,0.7)]" onClick={() => setShowSheet(false)}>
          <div
            className="absolute bottom-0 bg-white drop-shadow-[0px_10px_7.5px_rgba(0,0,0,0.1),0px_4px_3px_rgba(0,0,0,0.1)] flex flex-col items-center pb-[16px] pt-[12px] rounded-tl-[8px] rounded-tr-[8px] w-[375px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-[24px] items-center shrink-0 w-full">
              <div className="flex flex-col gap-[16px] items-center shrink-0 w-full">
                <div className="flex flex-col gap-[16px] items-center px-[16px] shrink-0 w-full">
                  <div className="flex flex-col items-center shrink-0 w-full">
                    <div className="bg-[#e1e7ef] h-[8px] rounded-[9999px] shrink-0 w-[100px]" />
                  </div>
                  <div className="flex gap-[8px] items-center shrink-0 w-full">
                    <p className="flex-1 font-semibold leading-[28px] min-w-px text-[#0f1729] text-[18px]">Pilih barang</p>
                    <button onClick={() => setShowSheet(false)} className="overflow-clip relative shrink-0 size-[16px]">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="#0f1729" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-[0px] items-start shrink-0 w-full max-h-[400px] overflow-y-auto">
                  <div className="bg-white flex flex-col items-center px-[16px] shrink-0 w-full">
                    <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
                      {Object.entries(CATEGORIES).map(([group, items]) => (
                        <div key={group} className="flex flex-col gap-[16px] items-start shrink-0 w-full">
                          <p className="font-semibold leading-[22px] text-[#65758b] text-[14px] whitespace-nowrap">{group}</p>
                          <div className="flex flex-wrap gap-[8px] items-start shrink-0 w-full">
                            {items.map(item => (
                              <button
                                key={item.label}
                                onClick={() => setPendingCategory(item.label)}
                                className={`flex gap-[8px] h-[40px] items-center justify-start px-[12px] py-[6px] rounded-[8px] shrink-0 border ${
                                  pendingCategory === item.label
                                    ? 'bg-[#e5f2ff] border-[#023dff]'
                                    : 'bg-white border-[#cbd5e1]'
                                }`}
                                style={{ width: '167.5px' }}
                              >
                                <div className="flex gap-[4px] items-center shrink-0">
                                  <div className="shrink-0 size-[16px] flex items-center justify-center">
                                    {item.icon}
                                  </div>
                                  <p className={`font-semibold leading-[22px] text-[14px] whitespace-nowrap ${
                                    pendingCategory === item.label ? 'text-[#023dff]' : 'text-[#0f1729]'
                                  }`}>{item.label}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[8px] items-end justify-center px-[16px] shrink-0 w-full">
                <button
                  onClick={() => { setSelectedCategory(pendingCategory); setSearchValue(''); setShowSheet(false) }}
                  className="bg-[#023dff] flex gap-[4px] h-[38px] items-center justify-center px-[16px] py-[8px] rounded-[8px] shrink-0 w-full"
                >
                  <p className="font-semibold leading-[22px] text-white text-[14px] whitespace-nowrap">Lanjutkan</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
