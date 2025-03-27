import { QuizWithQuestions } from './types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useCreateWrongAnswersCollection } from '@/hooks/useQuizCollectionQueries'
import { useState } from 'react'
import { CheckCircle, XCircle, RefreshCcw, Home, BookOpen } from 'lucide-react'

type ResultScreenProps = {
  quiz: QuizWithQuestions
  score: number
  onRestart: () => void
  attemptId: number | null
  isSaving: boolean
}

export default function ResultScreen({
  quiz,
  score,
  onRestart,
  attemptId,
  isSaving,
}: ResultScreenProps) {
  const [isCollectionCreated, setIsCollectionCreated] = useState(false)
  const {
    mutate: createWrongAnswersCollection,
    isPending: isCreatingCollection,
  } = useCreateWrongAnswersCollection()

  const percentage = Math.round((score / quiz.questions.length) * 100)
  const wrongAnswersCount = quiz.questions.length - score

  const handleCreateWrongAnswersCollection = () => {
    if (!attemptId) return

    createWrongAnswersCollection(
      {
        attemptId,
        name: `오답 노트 - ${quiz.title}`,
      },
      {
        onSuccess: () => {
          setIsCollectionCreated(true)
        },
      }
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-16">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          {isSaving ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
              <h2 className="text-2xl font-bold">결과 저장 중...</h2>
              <p className="text-gray-500 mt-2">잠시만 기다려주세요</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                {percentage >= 80 ? (
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                ) : percentage >= 50 ? (
                  <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-yellow-500" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-16 h-16 text-red-500" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {score}개 맞히셨습니다
              </h2>
              <p className="text-xl mt-2">
                정확도: {percentage}% ({score}/{quiz.questions.length})
              </p>
            </>
          )}
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          {!isSaving && (
            <>
              {/* 점수 그래프 */}
              <div className="w-full max-w-md mb-6">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full ${
                      percentage >= 80
                        ? 'bg-green-500'
                        : percentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-8">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{score}</div>
                  <div className="text-sm text-gray-500">맞은 문제</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{wrongAnswersCount}</div>
                  <div className="text-sm text-gray-500">틀린 문제</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {quiz.questions.length}
                  </div>
                  <div className="text-sm text-gray-500">전체 문제</div>
                </div>
              </div>

              {/* 오답 노트 생성 버튼 (틀린 문제가 있을 경우에만 표시) */}
              {wrongAnswersCount > 0 && attemptId && !isCollectionCreated && (
                <Button
                  onClick={handleCreateWrongAnswersCollection}
                  disabled={isCreatingCollection}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 mb-4"
                >
                  {isCreatingCollection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      오답 노트 생성 중...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      오답 노트 만들기
                    </>
                  )}
                </Button>
              )}

              {isCollectionCreated && (
                <Link href="/my/quiz-collections" className="mb-4">
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-2">
                    <BookOpen className="mr-2 h-4 w-4" />
                    오답 노트 보기
                  </Button>
                </Link>
              )}

              <div className="flex flex-wrap gap-3 w-full max-w-md justify-center">
                <Button
                  onClick={onRestart}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-2"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  다시 도전하기
                </Button>

                {attemptId && (
                  <Link href={`/my/quiz-result/${attemptId}`}>
                    <Button
                      variant="outline"
                      className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 font-bold px-6 py-2"
                    >
                      상세 결과 보기
                    </Button>
                  </Link>
                )}

                <Link href="/">
                  <Button
                    variant="outline"
                    className="border-gray-500 text-gray-500 hover:bg-gray-50 font-bold px-6 py-2"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    홈으로
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>

        {!isSaving && (
          <CardFooter className="flex-col pt-6 border-t">
            <div className="text-center text-sm text-gray-500 mb-4">
              {attemptId
                ? '결과가 저장되었습니다. 마이페이지에서 확인할 수 있습니다.'
                : '로그인하면 결과를 저장하고 오답 노트를 만들 수 있습니다.'}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
