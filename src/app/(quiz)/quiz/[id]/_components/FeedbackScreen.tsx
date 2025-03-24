import { QuizWithQuestions } from './types'

type FeedbackScreenProps = {
  quiz: QuizWithQuestions
  currentQuestionIndex: number
  currentAnswer: {
    userAnswer: string
    isCorrect: boolean
  }
  onNext: () => void
}

export default function FeedbackScreen({
  quiz,
  currentQuestionIndex,
  currentAnswer,
  onNext,
}: FeedbackScreenProps) {
  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div
        className={`p-4 rounded mb-4 ${
          currentAnswer.isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        <h3 className="font-bold">
          {currentAnswer.isCorrect ? '정답입니다!' : '오답입니다.'}
        </h3>
      </div>
      <p className="mb-2">제출한 답변: {currentAnswer.userAnswer}</p>
      {!currentAnswer.isCorrect && (
        <p className="mb-4">정답: {currentQuestion.correct_answer}</p>
      )}
      <button
        onClick={onNext}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        다음 문제
      </button>
    </div>
  )
}
