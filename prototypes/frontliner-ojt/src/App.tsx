import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Login from './pages/Login'
import FLLayout from './pages/fl/FLLayout'
import FLDashboard from './pages/fl/FLDashboard'
import FLMilestones from './pages/fl/FLMilestones'
import FLMilestoneDetail from './pages/fl/FLMilestoneDetail'
import FLChecklist from './pages/fl/FLChecklist'
import FLChecklistDetail from './pages/fl/FLChecklistDetail'
import FLTaskDetail from './pages/fl/FLTaskDetail'
import FLPenaksiran from './pages/fl/FLPenaksiran'
import FLAssessment from './pages/fl/FLAssessment'
import FLAssessmentReview from './pages/fl/FLAssessmentReview'
import FLScores from './pages/fl/FLScores'
import KanitLayout from './pages/kanit/KanitLayout'
import KanitDashboard from './pages/kanit/KanitDashboard'
import KanitChecklistDetail from './pages/kanit/KanitChecklistDetail'
import KanitPenaksiran from './pages/kanit/KanitPenaksiran'
import KanitResults from './pages/kanit/KanitResults'
import KanitFinalEval from './pages/kanit/KanitFinalEval'
import KanitReviewProgress from './pages/kanit/KanitReviewProgress'
import KanitTaskHistory from './pages/kanit/KanitTaskHistory'

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
            <Route path="checklist/task/:taskId" element={<FLTaskDetail />} />
            <Route path="checklist/:checklistId" element={<FLChecklistDetail />} />
            <Route path="penaksiran" element={<FLPenaksiran />} />
            <Route path="assessment" element={<FLAssessment />} />
            <Route path="assessment/review" element={<FLAssessmentReview />} />
            <Route path="scores" element={<FLScores />} />
          </Route>
          <Route path="/kanit" element={<KanitLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<KanitDashboard />} />
            <Route path="review-progress" element={<KanitReviewProgress />} />
            <Route path="review/:checklistId" element={<KanitChecklistDetail />} />
            <Route path="task-history/:flId/:taskKey" element={<KanitTaskHistory />} />
            <Route path="penaksiran" element={<KanitPenaksiran />} />
            <Route path="results" element={<KanitResults />} />
            <Route path="final-eval/:flId" element={<KanitFinalEval />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
