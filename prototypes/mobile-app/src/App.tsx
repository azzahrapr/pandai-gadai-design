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
import GuestLogin from './GuestLogin'
import GuestHomepage from './GuestHomepage'
import DSTest from './DSTest'

function App() {
  return (
    <div className="min-h-screen bg-gray-300 flex items-start justify-center py-8">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
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
          <Route path="/guest/login" element={<GuestLogin />} />
          <Route path="/guest/home" element={<GuestHomepage />} />
          <Route path="/ds-test" element={<DSTest />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
