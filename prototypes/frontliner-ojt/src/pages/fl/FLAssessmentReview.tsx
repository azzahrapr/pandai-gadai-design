import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ASSESSMENT_QUESTIONS } from '../../data/mockData'

export default function FLAssessmentReview() {
  const { currentUser, getFlAssessment } = useApp()
  const assessment = getFlAssessment(currentUser!.id)

  if (!assessment) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-[#65758B]">Assessment belum dikerjakan.</p>
          <Link to="/fl/assessment" className="text-[#023DFF] text-sm mt-2 inline-block">← Kembali ke Assessment</Link>
        </div>
      </div>
    )
  }

  const mcqCorrect = ASSESSMENT_QUESTIONS.reduce((count, q) => {
    const ans = assessment.answers.find(a => a.questionId === q.id)
    return count + (ans?.answer === q.options[q.correctIndex] ? 1 : 0)
  }, 0)
  const mcqTotal = ASSESSMENT_QUESTIONS.length

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-2">
        <Link to="/fl/assessment" className="text-sm text-[#65758B] hover:text-[#023DFF] transition-colors">← Assessment</Link>
      </div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729]">Review Jawaban</h1>
          <p className="text-[#65758B] text-sm mt-1">Assessment Akhir OJT</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black text-[#15803D]">{mcqCorrect}/{mcqTotal}</p>
            <p className="text-xs text-[#15803D]/70">soal benar</p>
          </div>
          <div className="bg-[#F1F5F9] rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black text-[#0F1729]">{Math.round((mcqCorrect / mcqTotal) * 100)}%</p>
            <p className="text-xs text-[#65758B]">akurasi</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl">
        {ASSESSMENT_QUESTIONS.map((q, idx) => {
          const ans = assessment.answers.find(a => a.questionId === q.id)
          const selectedOption = ans?.answer ?? ''
          const correctOption = q.options[q.correctIndex]
          const isCorrect = selectedOption === correctOption

          return (
            <div key={q.id} className={`bg-white rounded-xl border p-5 ${isCorrect ? 'border-[#16A34A]/30' : 'border-[#DC2626]/30'}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${isCorrect ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-[#0F1729]">{q.question}</p>
                <span className={`ml-auto flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${isCorrect ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                  {isCorrect ? '✓ Benar' : '✗ Salah'}
                </span>
              </div>
              <div className="space-y-2 pl-9">
                {q.options.map((opt, oIdx) => {
                  const isSelected = opt === selectedOption
                  const isCorrectOpt = oIdx === q.correctIndex
                  let cls = 'border-[#E1E7EF] text-[#65758B]'
                  if (isCorrectOpt) cls = 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                  else if (isSelected && !isCorrectOpt) cls = 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'

                  return (
                    <div key={oIdx} className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${cls}`}>
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                        isCorrectOpt ? 'border-[#16A34A] bg-[#16A34A] text-white' :
                        isSelected ? 'border-[#DC2626] bg-[#DC2626] text-white' :
                        'border-[#CBD5E1] text-[#94A3B8]'
                      }`}>{String.fromCharCode(65 + oIdx)}</span>
                      <span className="flex-1">{opt}</span>
                      {isCorrectOpt && <span className="text-[10px] font-semibold text-[#16A34A] ml-auto flex-shrink-0">Jawaban benar</span>}
                      {isSelected && !isCorrectOpt && <span className="text-[10px] font-semibold text-[#DC2626] ml-auto flex-shrink-0">Jawabanmu</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
