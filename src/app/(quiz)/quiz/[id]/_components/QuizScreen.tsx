import { QuizWithQuestions } from './types'
import { FormEvent } from 'react'

type QuizScreenProps = {
  quiz: QuizWithQuestions
  currentQuestionIndex: number
  onSubmit: (answer: string) => void
}

export default function QuizScreen({
  quiz,
  currentQuestionIndex,
  onSubmit,
}: QuizScreenProps) {
  const currentQuestion = quiz.questions[currentQuestionIndex]

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const answer = formData.get('answer') as string | null
    if (answer !== null) {
      onSubmit(answer)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <p className="text-sm text-gray-500 mb-4">
        {currentQuestionIndex + 1} / {quiz.questions.length}
      </p>
      <h2 className="text-xl font-bold mb-4">
        {currentQuestion.question_text}
      </h2>
      {currentQuestion.question_image_url && (
        <div className="mb-4">
          <img
            src={currentQuestion.question_image_url}
            alt="문제 이미지"
            className="max-w-full rounded"
          />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="answer"
          className="w-full p-2 border rounded mb-4"
          placeholder="답변을 입력하세요"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          제출하기
        </button>
      </form>
    </div>
  )
}
