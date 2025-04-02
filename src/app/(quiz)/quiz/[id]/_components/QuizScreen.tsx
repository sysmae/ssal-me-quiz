import { QuizWithQuestions } from '@/types/quiz'
import { FormEvent } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-16">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-base font-medium text-gray-700">
              {currentQuestionIndex + 1} / {quiz.questions.length}
            </p>
            <div className="flex space-x-2">
              {Array.from({ length: quiz.questions.length }).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentQuestionIndex
                      ? 'bg-indigo-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {currentQuestion.question_text}
          </h2>
          {currentQuestion.question_image_url && (
            <div className="mb-10 flex justify-center">
              <img
                src={currentQuestion.question_image_url}
                alt="문제 이미지"
                className="w-full max-w-lg h-auto rounded-lg"
              />
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                name="answer"
                placeholder="답변을 입력하세요"
                required
                className="flex-grow text-lg p-6 h-auto rounded-lg"
              />
              <Button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg p-6 h-auto rounded-lg"
              >
                제출하기
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
