import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { QuizWithQuestions } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import QuizComment from './QuizComment'
import RecommendedQuizzes from '../../_components/RecommendedQuizzes'
import ShareButton from '../../_components/ShareButton'
import { useQuizAttemptsQueries } from '@/hooks/useQuizAttemptsQueries'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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
  const { getQuizTotalAttemptCount, getQuizScoreData } =
    useQuizAttemptsQueries()

  const { data: totalAttemptCount = 0, isLoading: isCountLoading } =
    getQuizTotalAttemptCount(quiz.id)

  const {
    data: scoreData = [],
    isLoading: isScoreDataLoading,
    refetch: refetchScoreData,
  } = getQuizScoreData(quiz.id)

  useEffect(() => {
    if (!isSaved.current) {
      const { attempt } = saveQuizResults()
      setAttempt(attempt)
      isSaved.current = true
    }
  }, [saveQuizResults])

  useEffect(() => {
    if (totalAttemptCount >= 5) {
      refetchScoreData()
    }
    console.log(totalAttemptCount)
  }, [totalAttemptCount, refetchScoreData])

  const calculateScoreStats = (scores: number[]) => {
    if (!scores.length)
      return { average: 0, median: 0, bins: [], binLabels: [] }

    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length

    const sortedScores = [...scores].sort((a, b) => a - b)
    const median =
      sortedScores.length % 2 === 0
        ? (sortedScores[sortedScores.length / 2 - 1] +
            sortedScores[sortedScores.length / 2]) /
          2
        : sortedScores[Math.floor(sortedScores.length / 2)]

    const min = 0
    const max = 100
    const binSize = 5
    const binCount = Math.ceil((max - min) / binSize) + 1

    const bins = Array(binCount).fill(0)
    const binLabels = Array(binCount)
      .fill(0)
      .map((_, i) => {
        if (i === binCount - 1) return '100'
        return `${min + i * binSize}~${min + (i + 1) * binSize - 1}`
      })

    scores.forEach((score) => {
      if (score === 100) {
        bins[binCount - 1]++
      } else {
        const binIndex = Math.floor(score / binSize)
        if (binIndex >= 0 && binIndex < binCount - 1) {
          bins[binIndex]++
        }
      }
    })

    return { average, median, bins, binLabels, min, max }
  }

  const scoreStats = calculateScoreStats(scoreData)

  const chartData = scoreStats.binLabels.map((label, index) => ({
    range: label,
    frequency: scoreStats.bins[index],
  }))

  const chartConfig = {
    frequency: {
      label: '빈도',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  if (
    !attempt ||
    isCountLoading ||
    (totalAttemptCount > 5 && isScoreDataLoading)
  ) {
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
                <img src="/trophy.svg" alt="Trophy" className="w-24 h-24" />
              </div>

              <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
                퀴즈 결과
              </h2>

              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                {selectedCount !== undefined ? (
                  <>
                    총 {quiz.questions.length}문제 중 {selectedCount}문제를
                    선택하셨고, {attempt.correctAnswers}문제를 맞히셨습니다.
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

              {totalAttemptCount >= 5 && (
                <div className="mb-6">
                  <div className="text-md text-gray-700 dark:text-gray-300 mb-2">
                    <p>전체 시도 횟수: {totalAttemptCount}회</p>
                    <p>평균 점수: {scoreStats.average.toFixed(2)}점</p>
                    <p>중앙값 점수: {scoreStats.median.toFixed(2)}점</p>
                  </div>

                  <ChartContainer config={chartConfig} className="h-64 w-full">
                    <BarChart accessibilityLayer data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="range"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <YAxis
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <ChartTooltip
                        content={(props) => {
                          if (!props.active || !props.payload?.length)
                            return null

                          const modifiedPayload = props.payload.map((item) => ({
                            ...item,
                            value:
                              typeof item.value === 'number'
                                ? `${item.value}명`
                                : item.value,
                          }))

                          return (
                            <ChartTooltipContent
                              active={props.active}
                              payload={modifiedPayload}
                              label={props.label}
                              labelFormatter={(label) => `점수 범위: ${label}`}
                            />
                          )
                        }}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="frequency"
                        fill="var(--color-frequency)"
                        radius={4}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              )}

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
