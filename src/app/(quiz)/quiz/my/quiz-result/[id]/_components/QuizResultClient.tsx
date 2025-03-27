'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuizAttemptResult } from '@/hooks/useQuizAttemptQueries'
import { useCreateWrongAnswersCollection } from '@/hooks/useQuizCollectionQueries'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Home, RefreshCcw } from 'lucide-react'

export default function QuizResultClient({ id }: { id: string }) {
  const { data, isLoading, isError } = useQuizAttemptResult(Number(id))
  const {
    mutate: createWrongAnswersCollection,
    isPending,
    isSuccess,
  } = useCreateWrongAnswersCollection()
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true)

  const handleCreateWrongAnswersCollection = () => {
    createWrongAnswersCollection({
      attemptId: Number(id),
      name: `오답 노트 - ${new Date().toLocaleDateString()}`,
    })
  }

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">로딩 중...</div>
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto p-4 text-center">
        오류가 발생했습니다.
      </div>
    )
  }

  const { attempt, questions } = data
  const wrongAnswers = questions.filter((q) => !q.is_correct)
  const percentage = Math.round(
    (attempt.correct_answers / attempt.total_questions) * 100
  )

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">퀴즈 결과 상세</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">점수 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {attempt.correct_answers} / {attempt.total_questions}
              </div>
              <div className="text-gray-500">맞은 문제</div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{percentage}%</div>
              <div className="text-gray-500">정확도</div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {wrongAnswers.length}
              </div>
              <div className="text-gray-500">틀린 문제</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mt-8">
            <div
              className={`h-4 rounded-full ${
                percentage >= 80
                  ? 'bg-green-500'
                  : percentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 justify-center">
          {wrongAnswers.length > 0 && !isSuccess && (
            <Button
              onClick={handleCreateWrongAnswersCollection}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? '생성 중...' : '오답 노트 만들기'}
            </Button>
          )}

          {isSuccess && (
            <Link href="/my/quiz-collections">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                오답 노트 보기
              </Button>
            </Link>
          )}

          <Link href="/quiz-start">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
              <RefreshCcw className="mr-2 h-4 w-4" />새 퀴즈 시작하기
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">문제 목록</h2>
        <Button
          variant="outline"
          onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
        >
          {showCorrectAnswers ? '정답 숨기기' : '정답 보기'}
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((item, index) => (
          <Card
            key={item.id}
            className={`border-l-4 ${
              item.is_correct ? 'border-l-green-500' : 'border-l-red-500'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <h3 className="font-semibold">문제 {index + 1}</h3>
                <div
                  className={`flex items-center ${
                    item.is_correct ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.is_correct ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-1" /> 정답
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-1" /> 오답
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{item.question.question_text}</p>

              {item.question.question_image_url && (
                <div className="mb-4">
                  <img
                    src={item.question.question_image_url}
                    alt="문제 이미지"
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">내 답변:</span>
                  <span
                    className={`p-2 rounded ${
                      item.is_correct ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {item.user_answer || '(답변 없음)'}
                  </span>
                </div>

                {(showCorrectAnswers || !item.is_correct) && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">정답:</span>
                    <span className="p-2 rounded bg-green-50">
                      {item.question.correct_answer}
                    </span>
                  </div>
                )}

                {/* {item.question.explanation && (
                  <div className="flex flex-col mt-2">
                    <span className="text-sm text-gray-500">해설:</span>
                    <span className="p-2 rounded bg-blue-50">
                      {item.question.explanation}
                    </span>
                  </div>
                )} */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
