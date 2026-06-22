import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Homepage from './Homepage'
import HomepageUnverified from './HomepageUnverified'
import VerifikasiIntro from './VerifikasiIntro'
import VerifikasiForm from './VerifikasiForm'
import VerifikasiSuccess from './VerifikasiSuccess'
import DetailPinjaman from './DetailPinjaman'
import PaymentDetail from './PaymentDetail'
import PoinPandaiVerified from './PoinPandaiVerified'
import PoinPandaiUnverified from './PoinPandaiUnverified'
import PoinPandaiSuccess from './PoinPandaiSuccess'
import SBGDetail from './SBGDetail'
import PinjamanPerpanjang from './PinjamanPerpanjang'
import PinjamanTebus from './PinjamanTebus'
import PinjamanCicil from './PinjamanCicil'
import PinjamanPerpanjangCicil from './PinjamanPerpanjangCicil'
import PostPaymentDetail from './PostPaymentDetail'
import InputPIN from './InputPIN'
import TYPSuccess from './TYPSuccess'
import DaftarPinjaman from './DaftarPinjaman'
import Akun from './Akun'
import GuestSplash from './GuestSplash'
import GuestHomepage from './GuestHomepage'
import GuestCabangList from './GuestCabangList'
import CuanPandai from './CuanPandai'
import SaldoPandai from './SaldoPandai'
import RiwayatPoinPandai from './RiwayatPoinPandai'
import PrototypeIndex from './PrototypeIndex'
import DSTest from './DSTest'
import { InspectProvider } from './InspectContext'
import { InspectPanel } from './InspectPanel'
import { InspectOverlay } from './InspectOverlay'
import SimulasiGadai from './SimulasiGadai'
import SimulasiEstimasi from './SimulasiEstimasi'
import SimulasiPromo from './SimulasiPromo'
import SimulasiSukses from './SimulasiSukses'


function App() {
  return (
    <div className="min-h-screen bg-gray-300 flex items-start justify-center pt-4 pb-8">
      <InspectProvider>
      <div className="flex items-start gap-6">
      <div className="relative">
      <BrowserRouter>
        <div className="flex flex-col items-center gap-4">
        <Routes>
          <Route path="/" element={<PrototypeIndex />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/unverified" element={<HomepageUnverified />} />
          <Route path="/verifikasi" element={<VerifikasiIntro />} />
          <Route path="/verifikasi/form" element={<VerifikasiForm />} />
          <Route path="/verifikasi/success" element={<VerifikasiSuccess />} />
          <Route path="/pinjaman" element={<DaftarPinjaman />} />
          <Route path="/pinjaman/detail" element={<DetailPinjaman />} />
          <Route path="/pinjaman/payment" element={<PaymentDetail />} />
          <Route path="/poin-pandai" element={<PoinPandaiVerified />} />
          <Route path="/poin-pandai/unverified" element={<PoinPandaiUnverified />} />
          <Route path="/poin-pandai/success" element={<PoinPandaiSuccess />} />
          <Route path="/pinjaman/sbg-detail" element={<SBGDetail />} />
          <Route path="/pinjaman/perpanjang" element={<PinjamanPerpanjang />} />
          <Route path="/pinjaman/tebus" element={<PinjamanTebus />} />
          <Route path="/pinjaman/cicil" element={<PinjamanCicil />} />
          <Route path="/pinjaman/perpanjang-cicil" element={<PinjamanPerpanjangCicil />} />
          <Route path="/pinjaman/selesai" element={<PostPaymentDetail />} />
          <Route path="/pinjaman/pin" element={<InputPIN />} />
          <Route path="/payment-success" element={<TYPSuccess />} />
          <Route path="/akun" element={<Akun />} />
          <Route path="/guest" element={<GuestSplash />} />
          <Route path="/guest/login" element={<GuestSplash startAtLogin />} />
          <Route path="/guest/home" element={<GuestHomepage />} />
          <Route path="/guest/cabang" element={<GuestCabangList />} />
          <Route path="/cabang" element={<GuestCabangList />} />
          <Route path="/cuan-pandai" element={<CuanPandai />} />
          <Route path="/saldo-pandai" element={<SaldoPandai />} />
          <Route path="/riwayat-poin-pandai" element={<RiwayatPoinPandai />} />
          <Route path="/ds-test" element={<DSTest />} />
          <Route path="/simulasi" element={<SimulasiGadai />} />
          <Route path="/simulasi/estimasi" element={<SimulasiEstimasi />} />
          <Route path="/simulasi/promo" element={<SimulasiPromo />} />
          <Route path="/simulasi/sukses" element={<SimulasiSukses />} />
        </Routes>
        </div>
      </BrowserRouter>
      <InspectOverlay />
      </div>
      <InspectPanel />
      </div>
      </InspectProvider>
    </div>
  )
}

export default App
