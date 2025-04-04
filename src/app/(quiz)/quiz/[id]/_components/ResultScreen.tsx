import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { QuizWithQuestions } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import QuizComment from './QuizComment'

import RecommendedQuizzes from '../../_components/RecommendedQuizzes'
import ShareButton from '../../_components/ShareButton'

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

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-start p-4 pt-16">
      <div className="w-full max-w-5xl">
        {/* 상단 섹션: 결과 요약(왼쪽)과 추천 퀴즈(오른쪽) */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* 왼쪽: 결과 요약 및 버튼 섹션 */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:w-1/2">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <img src="/trophy.svg" alt="Trophy" className="w-24 h-24" />
              </div>

              <h2 className="text-2xl font-bold text-indigo-800 mb-4">
                퀴즈 결과
              </h2>

              <p className="text-lg text-gray-700 mb-2">
                {attempt.totalQuestions}문제 중 {attempt.correctAnswers}문제를
                맞히셨습니다.
              </p>

              <p className="text-lg font-bold text-indigo-600 mb-6">
                점수: {attempt.score}점
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={onRestart}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2"
                >
                  다시 도전하기
                </Button>

                <Link href="/">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2">
                    홈으로
                  </Button>
                </Link>

                <ShareButton />
              </div>
            </div>
          </div>

          {/* 오른쪽: 추천 퀴즈 컴포넌트 */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:w-1/2">
            <h2 className="text-xl font-bold text-indigo-800 mb-4">
              추천 퀴즈
            </h2>
            <RecommendedQuizzes />
          </div>
        </div>

        {/* 하단: 댓글 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-6 w-full">
          <h2 className="text-xl font-bold text-indigo-800 mb-4">댓글</h2>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-500">
              댓글 작성 시 타인을 기분나쁘게 하거나 이용 약관이나 안전에 대한
              문제 조장이 위험할 수 있습니다.
            </p>
          </div>

          <QuizComment quizId={quiz.id} />
        </div>
      </div>
    </div>
  )
}
