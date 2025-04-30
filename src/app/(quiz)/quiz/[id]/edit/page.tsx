'use client'

import { useQuizQueries } from '@/hooks/useQuizQueries'
import { useQuestionQueries } from '@/hooks/useQuizQuestionQueries'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionInsertData, QuestionUpdateData } from '@/types/quiz'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Trash2, ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

import QuizBasicInfo from './_components/QuizBasicInfo'
import QuestionManager from './_components/QuestionManager'
import AIQuestionGenerator from './_components/AIQuestionGenerator'
import AIQuestionGeneratorByText from './_components/AIQuestionGeneratorByText'
import AIQuestionGeneratorByPdf from './_components/AIQuestionGeneratorByPdf'

const QuizEditPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter()
  const { id } = use(params)

  const [quizId, setQuizId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      setQuizId(Number(id))
    }
  }, [id])

  // 에러 메시지를 5초 후에 자동으로 제거하는 useEffect
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
      }, 5000) // 5초 후 메시지 제거

      return () => clearTimeout(timer) // 컴포넌트 언마운트 시 타이머 제거
    }
  }, [errorMessage])

  const { quiz, updateQuiz, deleteQuiz } = useQuizQueries(quizId ?? 0)
  const { questionsData, createQuestion, updateQuestion, deleteQuestion } =
    useQuestionQueries(quizId ?? 0)

  const handleDeleteQuiz = async () => {
    if (!quizId) return

    try {
      await deleteQuiz()
      router.push('/quiz')
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('퀴즈 삭제 중 알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const handleUpdateQuestion = (
    questionId: number,
    questionData: QuestionUpdateData
  ) => {
    console.log('Updating question:', questionId, questionData)
    try {
      updateQuestion({ questionId, updates: questionData })
    } catch (error) {
      setErrorMessage('질문 업데이트 중 오류가 발생했습니다.')
      console.error('Error updating question:', error)
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
        setErrorMessage('질문 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleCreateQuestion = (questionData: QuestionInsertData) => {
    try {
      createQuestion(questionData)
    } catch (error) {
      setErrorMessage('새 질문 생성 중 오류가 발생했습니다.')
    }
  }

  if (!quizId)
    return (
      <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">
              퀴즈 내용을 불러오는 중입니다. 잠시만 기다려 주세요...
            </p>
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
            <CardDescription className="text-xs text-gray-500">
              퀴즈의 경우 5개 이상 문제가 있어야 발행할 수 있습니다.
              <br />
              30개 이상의 좋아요와 100회 이상의 조회수가 있는 퀴즈는 삭제할 수
              없습니다.
              <br /> 대신 비공개로 설정할 수 있습니다.
            </CardDescription>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/quiz/${quizId}`)}
                className="bg-indigo-50 text-indigo-500 border-indigo-200 hover:bg-indigo-100"
              >
                <Eye className="mr-2 h-4 w-4" />
                미리보기
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                퀴즈 삭제
              </Button>
            </div>
          </CardHeader>
        </Card>

        {errorMessage && (
          <Alert variant="destructive" className="mb-6 bg-indigo-100">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent>
            <div className="mb-8">
              {quiz && <QuizBasicInfo quizId={quizId} quiz={quiz} />}
            </div>
            <div className="mt-8">
              <AIQuestionGenerator quizId={quizId} />
            </div>
            <div>
              <AIQuestionGeneratorByText quizId={quizId} />
            </div>

            <div>
              <AIQuestionGeneratorByPdf quizId={quizId} />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">질문 관리</h3>
              {questionsData ? (
                <QuestionManager
                  quizId={quizId}
                  questions={questionsData}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>퀴즈 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 퀴즈를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default QuizEditPage
