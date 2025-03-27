'use client'

import { useQuizQueries } from '@/hooks/useQuizQueries'
import { useQuizQuestionQueries } from '@/hooks/useQuizQuestionQueries'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionInsertData, QuestionUpdateData } from '@/types/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Trash2, ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

import QuizBasicInfo from './_components/QuizBasicInfo'
import QuestionManager from './_components/QuestionManager'

const QuizEditPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter()
  // React.use()를 사용하여 params Promise를 unwrap
  const { id } = use(params)

  const [quizId, setQuizId] = useState<number | null>(null)

  useEffect(() => {
    if (id) {
      setQuizId(Number(id))
    }
  }, [id])

  const { quiz, updateQuiz, deleteQuiz } = useQuizQueries(quizId ?? 0)
  const { quiz_questionsData, createQuestion, updateQuestion, deleteQuestion } =
    useQuizQuestionQueries(quizId ?? 0)

  const handleDeleteQuiz = () => {
    if (!quizId) return

    if (
      window.confirm(
        '정말로 이 퀴즈를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      try {
        deleteQuiz()
        router.push('/quiz')
      } catch (error) {
        console.error('퀴즈 삭제 오류:', error)
        alert('퀴즈 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleUpdateQuestion = (
    questionId: number,
    quiz_questionsData: QuestionUpdateData
  ) => {
    try {
      updateQuestion({ questionId, updates: quiz_questionsData })
    } catch (error) {
      console.error('질문 업데이트 오류:', error)
      alert('질문 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteQuestion = (questionId: number) => {
    if (
      window.confirm(
        '정말로 이 질문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      try {
        deleteQuestion(questionId)
      } catch (error) {
        console.error('질문 삭제 오류:', error)
        alert('질문 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleCreateQuestion = (quiz_questionsData: QuestionInsertData) => {
    try {
      createQuestion(quiz_questionsData)
    } catch (error) {
      console.error('새 질문 생성 오류:', error)
      alert('새 질문 생성 중 오류가 발생했습니다.')
    }
  }

  if (!quizId)
    return (
      <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">잘못된 퀴즈 ID입니다.</p>
            <Button
              className="w-full mt-4"
              onClick={() => router.push('/quiz')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              퀴즈 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )

  if (!quiz)
    return (
      <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-4xl">
        {/* 페이지 헤더 */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl font-bold">퀴즈 편집</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/quiz/${quizId}`)}
                className="bg-indigo-50 text-indigo-500 border-indigo-200 hover:bg-indigo-100"
              >
                <Eye className="mr-2 h-4 w-4" />
                미리보기
              </Button>
              <Button variant="destructive" onClick={handleDeleteQuiz}>
                <Trash2 className="mr-2 h-4 w-4" />
                퀴즈 삭제
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>퀴즈 정보 및 질문 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">기본 정보</h3>
              {quiz && <QuizBasicInfo quizId={quizId} quiz={quiz} />}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">질문 관리</h3>
              {quiz_questionsData ? (
                <QuestionManager
                  quizId={quizId}
                  questions={quiz_questionsData}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onCreateQuestion={handleCreateQuestion}
                />
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default QuizEditPage
