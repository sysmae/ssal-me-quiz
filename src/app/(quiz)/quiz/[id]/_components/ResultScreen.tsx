import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { QuizWithQuestions } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import QuizComment from './QuizComment'
import RecommendedQuizzes from '../../_components/RecommendedQuizzes'
import ShareButton from '../../_components/ShareButton'
import { useQuizAttemptsQueries } from '@/hooks/useQuizAttemptsQueries'
import ScoreDistributionChart from './ScoreDistributionChart'
import Image from 'next/image'

type ResultScreenProps = {
  quiz: QuizWithQuestions
  onRestart: () => void
  saveQuizResults: () =>
    | { attempt: null }
    | {
        attempt: {
          quizId: number
          correctAnswers: number
          totalQuestions: number
          score: number
          userId: string | null
        }
      }
  selectedCount?: number
}

export default function ResultScreen({
  quiz,
  onRestart,
  saveQuizResults,
  selectedCount,
}: ResultScreenProps) {
  const [attempt, setAttempt] = useState<{
    quizId: number
    correctAnswers: number
    totalQuestions: number
    score: number
    userId: string | null
  } | null>(null)

  const isSaved = useRef(false)
  const { useQuizTotalAttemptCount, useQuizScoreData } =
    useQuizAttemptsQueries()

  const { data: totalAttemptCount = 0, isLoading: isCountLoading } =
    useQuizTotalAttemptCount(quiz.id)

  const {
    data: scoreData = [],
    isLoading: isScoreDataLoading,
    refetch: refetchScoreData,
  } = useQuizScoreData(quiz.id)

  // 결과 저장 및 데이터 로딩
  useEffect(() => {
    if (!isSaved.current) {
      const { attempt } = saveQuizResults()
      setAttempt(attempt)
      isSaved.current = true

      // 결과 저장 후 점수 데이터 다시 가져오기
      refetchScoreData()
    }
  }, [saveQuizResults, refetchScoreData])

  // 로딩 상태 표시
  if (!attempt || isCountLoading || isScoreDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="loader dark:text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-indigo-900 dark:bg-gray-900 flex flex-col items-center justify-start p-4 pt-16">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:w-1/2">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <Image
                    src="/trophy.svg"
                    alt="Trophy"
                    width={96} // 24 * 4 (tailwind 기준)
                    height={96} // 24 * 4 (tailwind 기준)
                    className="rounded-lg"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
                퀴즈 결과
              </h2>

              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                {selectedCount !== undefined ? (
                  <>
                    총 {selectedCount}문제를 선택하셨고,{' '}
                    {attempt.correctAnswers}
                    문제를 맞히셨습니다.
                  </>
                ) : (
                  <>
                    {attempt.totalQuestions}문제 중 {attempt.correctAnswers}
                    문제를 맞히셨습니다.
                  </>
                )}
              </p>

              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                점수: {attempt.score}점
              </p>

              <div className="mb-6">
                <div className="text-md text-gray-700 dark:text-gray-300 mb-2">
                  <p>전체 시도 횟수: {totalAttemptCount}회</p>
                </div>

                {/* 모든 상황에서 그래프 표시 */}
                <ScoreDistributionChart scoreData={scoreData} />
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={onRestart}
                  className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-black dark:text-gray-900 font-bold px-6 py-2"
                >
                  다시 도전하기
                </Button>

                <Link href="/">
                  <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold px-6 py-2">
                    홈으로
                  </Button>
                </Link>

                <ShareButton />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:w-1/2">
            <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
              추천 퀴즈
            </h3>
            <RecommendedQuizzes />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full">
          <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
            댓글
          </h3>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
