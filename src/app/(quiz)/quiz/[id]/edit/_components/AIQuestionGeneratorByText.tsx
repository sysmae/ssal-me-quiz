// components/AIQuestionGeneratorByText.tsx
'use client'

import { useState, useEffect } from 'react'
import { useGenerateQuizQuestions } from '@/hooks/useGenerateQuizQuestions'
import { useQuizQueries } from '@/hooks/useQuizQueries'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { QuizQuestionType } from '@/constants'
import { Textarea } from '@/components/ui/textarea'

interface AIQuestionGeneratorByTextProps {
  quizId: number
}

export default function AIQuestionGeneratorByText({
  quizId,
}: AIQuestionGeneratorByTextProps) {
  const { quiz } = useQuizQueries(quizId)
  const [questionType, setQuestionType] = useState<QuizQuestionType>(
    QuizQuestionType.MULTIPLE_CHOICE
  )
  const [quizText, setQuizText] = useState('')

  const { generateAndAddQuestionsByText, isLoading, error, isSuccess } =
    useGenerateQuizQuestions(quizId)

  useEffect(() => {
    if (isLoading) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoading])

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quiz) return
    await generateAndAddQuestionsByText({
      quizTitle: quiz.title,
      quizDescription: quiz.description,
      questionType,
      quizText,
    })
  }

  return (
    <div className="w-full p-4 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        텍스트 입력하여 AI로 문제 추가하기
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              문제 유형
            </label>
            <Select
              value={questionType}
              onValueChange={(val) => setQuestionType(val as QuizQuestionType)}
            >
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="문제 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuizQuestionType.MULTIPLE_CHOICE}>
                  객관식
                </SelectItem>
                <SelectItem value={QuizQuestionType.SUBJECTIVE}>
                  주관식
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              문제 포함 텍스트
            </label>
            <Textarea
              className="w-full h-40 border-gray-300 focus:ring-indigo-500 resize-y overflow-auto"
              placeholder="문제를 포함한 텍스트를 입력하세요."
              value={quizText}
              onChange={(e) => setQuizText(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={isLoading || !quiz}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              문제 생성 중...
            </>
          ) : (
            '문제 생성하기'
          )}
        </Button>
      </form>

      {isLoading && (
        <Alert className="mt-6 border-l-4 border-indigo-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          <AlertTitle>생성 중</AlertTitle>
          <AlertDescription>
            문제를 생성하는 중입니다. 페이지를 떠나면 작업이 중단됩니다.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6 border-l-4">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="mt-6 border-l-4 border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>성공</AlertTitle>
          <AlertDescription>문제가 성공적으로 추가되었습니다.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
