import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Login from './pages/Login'
import FLLayout from './pages/fl/FLLayout'
import FLDashboard from './pages/fl/FLDashboard'
import FLMilestones from './pages/fl/FLMilestones'
import FLMilestoneDetail from './pages/fl/FLMilestoneDetail'
import FLChecklist from './pages/fl/FLChecklist'
import FLChecklistDetail from './pages/fl/FLChecklistDetail'
import FLPenaksiran from './pages/fl/FLPenaksiran'
import FLAssessment from './pages/fl/FLAssessment'
import FLScores from './pages/fl/FLScores'
import KanitLayout from './pages/kanit/KanitLayout'
import KanitDashboard from './pages/kanit/KanitDashboard'
import KanitReview from './pages/kanit/KanitReview'
import KanitChecklistDetail from './pages/kanit/KanitChecklistDetail'
import KanitPenaksiran from './pages/kanit/KanitPenaksiran'
import KanitResults from './pages/kanit/KanitResults'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/fl" element={<FLLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FLDashboard />} />
            <Route path="milestones" element={<FLMilestones />} />
            <Route path="milestones/:id" element={<FLMilestoneDetail />} />
            <Route path="checklist" element={<FLChecklist />} />
            <Route path="checklist/:checklistId" element={<FLChecklistDetail />} />
            <Route path="penaksiran" element={<FLPenaksiran />} />
            <Route path="assessment" element={<FLAssessment />} />
            <Route path="scores" element={<FLScores />} />
          </Route>
          <Route path="/kanit" element={<KanitLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<KanitDashboard />} />
            <Route path="review" element={<KanitReview />} />
            <Route path="review/:checklistId" element={<KanitChecklistDetail />} />
            <Route path="penaksiran" element={<KanitPenaksiran />} />
            <Route path="results" element={<KanitResults />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
