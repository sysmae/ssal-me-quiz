import { QuizWithQuestions } from '@/types/quiz'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

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
                    index < currentQuestionIndex
                      ? 'bg-indigo-500'
                      : index === currentQuestionIndex
                      ? currentAnswer.isCorrect
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <div className="flex flex-col items-center mb-8">
            {currentAnswer.isCorrect ? (
              <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mb-4" />
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              {currentAnswer.isCorrect ? '정답입니다!' : '오답입니다.'}
            </h2>
          </div>

          {currentQuestion.question_image_url && (
            <div className="mb-8 flex justify-center">
              <img
                src={currentQuestion.question_image_url}
                alt="문제 이미지"
                className="w-full max-w-lg h-auto rounded-lg"
              />
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-2">문제</h3>
            <p className="text-xl mb-6">{currentQuestion.question_text}</p>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">제출한 답변</h3>
              <div
                className={`p-4 rounded-lg border ${
                  currentAnswer.isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <p className="text-xl">{currentAnswer.userAnswer}</p>
              </div>
            </div>

            {!currentAnswer.isCorrect && (
              <div>
                <h3 className="text-lg font-semibold mb-2">정답</h3>
                <div className="p-4 rounded-lg border border-green-500 bg-green-50">
                  <p className="text-xl">{currentQuestion.correct_answer}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-6">
          <Button
            onClick={onNext}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg p-6 h-auto rounded-lg w-full max-w-xs"
          >
            {currentQuestionIndex < quiz.questions.length - 1
              ? '다음 문제'
              : '결과 보기'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
