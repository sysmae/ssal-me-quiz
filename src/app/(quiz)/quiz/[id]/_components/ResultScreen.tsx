import { QuizWithQuestions } from './types'

type ResultScreenProps = {
  quiz: QuizWithQuestions
  score: number
  onRestart: () => void
}

export default function ResultScreen({
  quiz,
  score,
  onRestart,
}: ResultScreenProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">퀴즈 결과</h2>
      <p className="text-3xl font-bold text-blue-500 mb-2">
        {score} / {quiz.questions.length}
      </p>
      <p className="mb-4">
        총 {quiz.questions.length}문제 중 {score}문제를 맞추셨습니다!
      </p>
      <button
        onClick={onRestart}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        다시 시작하기
      </button>
    </div>
  )
}
