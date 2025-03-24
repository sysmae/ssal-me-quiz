import { QuizWithQuestions } from './types'

type StartScreenProps = {
  quiz: QuizWithQuestions
  onStart: () => void
}

export default function StartScreen({ quiz, onStart }: StartScreenProps) {
  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="my-4">
          {quiz.description && <p>{quiz.description}</p>}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>총 {quiz.questions.length}개의 문제로 구성된 퀴즈입니다.</p>
          <p>
            조회수: {quiz.view_count} | 좋아요: {quiz.like_count}
          </p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        퀴즈 시작하기
      </button>
    </>
  )
}
