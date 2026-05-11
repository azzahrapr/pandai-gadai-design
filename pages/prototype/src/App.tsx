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
import SBGDetail, { SBGPerpanjang, SBGTebus } from './SBGDetail'

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
          <Route path="/pinjaman/detail" element={<DetailPinjaman />} />
          <Route path="/pinjaman/payment" element={<PaymentDetail />} />
          <Route path="/poin-pandai" element={<PoinPandaiVerified />} />
          <Route path="/poin-pandai/unverified" element={<PoinPandaiUnverified />} />
          <Route path="/poin-pandai/success" element={<PoinPandaiSuccess />} />
          <Route path="/pinjaman/sbg-detail" element={<SBGDetail />} />
          <Route path="/pinjaman/perpanjang" element={<SBGPerpanjang />} />
          <Route path="/pinjaman/tebus" element={<SBGTebus />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
