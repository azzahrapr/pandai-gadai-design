import { useParams, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { AssessmentReviewView } from '../fl/FLAssessmentReview'

export default function KanitAssessmentReview() {
  const { flId } = useParams<{ flId: string }>()
  const { getUserById } = useApp()
  const flUser = flId ? getUserById(flId) : undefined

  if (!flId || !flUser) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#65758B]">OJT tidak ditemukan</p>
          <Link to="/kanit/results" className="mt-4 inline-flex items-center gap-2 text-sm text-[#023DFF] hover:underline">← Nilai Akhir</Link>
        </div>
      </div>
    )
  }

  return (
    <AssessmentReviewView
      flId={flId}
      backTo={`/kanit/results?flId=${flId}`}
      backLabel="← Nilai Akhir"
      subtitle={`Ujian Akhir OJT · ${flUser.name}`}
    />
  )
}
