import { useCallback, useEffect, useRef, useState } from 'react'
import { QuizWithQuestions } from '@/types/quiz'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import QuizComment from './QuizComment'
import {
  QuizAttempt,
  QuizAttemptInsertData,
  QuizAttemptQuestionUpdateData,
} from '@/types/quiz_attempt'

type ResultScreenProps = {
  quiz: QuizWithQuestions
  onRestart: () => void
  saveQuizResults: () =>
    | {
        attempt: null
      }
    | {
        attempt: {
          quizId: number
          correctAnswers: number
          totalQuestions: number
          score: number
          userId: string | null
        }
      }
}

export default function ResultScreen({
  quiz,
  onRestart,
  saveQuizResults,
}: ResultScreenProps) {
  const [attempt, setAttempt] = useState<{
    quizId: number
    correctAnswers: number
    totalQuestions: number
    score: number
    userId: string | null
  } | null>(null)

  const isSaved = useRef(false)

  useEffect(() => {
    if (!isSaved.current) {
      const { attempt } = saveQuizResults()
      setAttempt(attempt)
      isSaved.current = true
    }
  }, [saveQuizResults])

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader">Loading...</div>
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-start p-4 pt-16">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/trophy.svg" alt="Trophy" className="w-24 h-24" />
          </div>

          <p className="text-lg text-gray-300 mt-2">
            {attempt.totalQuestions}문제 중 {attempt.correctAnswers}문제를
            맞히셨습니다.
          </p>

          <p className="text-lg text-gray-300 mt-2">점수: {attempt.score}점</p>
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          <div className="flex gap-3 w-full max-w-md justify-center">
            <Button
              onClick={onRestart}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2"
            >
              다시 도전하기
            </Button>

            <Button
              variant="outline"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-2"
            >
              다시보기
            </Button>

            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100 text-black font-bold px-6 py-2"
            >
              홈으로
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex-col">
          {/* 댓글 섹션은 기존 코드와 동일하게 유지 */}
          <div className="w-full mt-8 border-t pt-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-500">
                댓글 작성 시 타인을 기분나쁘게 하거나 이용 약관이나 안전에 대한
                문제 조장이 위험할 수 있습니다.
              </p>
            </div>
            <QuizComment quizId={quiz.id} />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
