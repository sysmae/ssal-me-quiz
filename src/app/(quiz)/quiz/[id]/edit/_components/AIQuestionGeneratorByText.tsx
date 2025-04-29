// components/AIQuestionGeneratorByText.tsx
'use client'

import { useState, useEffect } from 'react'
import { useGenerateQuizQuestions } from '@/hooks/useGenerateQuizQuestions'
import { useQuizQueries } from '@/hooks/useQuizQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface AIQuestionGeneratorByTextProps {
  quizId: number
}

export default function AIQuestionGeneratorByText({
  quizId,
}: AIQuestionGeneratorByTextProps) {
  const { quiz } = useQuizQueries(quizId)
  // const [difficulty, setDifficulty] = useState('보통')
  const [questionType, setQuestionType] = useState<QuizQuestionType>(
    QuizQuestionType.MULTIPLE_CHOICE
  )
  // const [numQuestions, setNumQuestions] = useState(5)
  const [quizText, setQuizText] = useState('')

  const {
    generateAndAddQuestions,
    generateAndAddQuestionsByText,
    isLoading,
    error,
    isSuccess,
  } = useGenerateQuizQuestions(quizId)

  // beforeunload 이벤트 리스너 추가
  useEffect(() => {
    // 생성 중일 때만 경고창 표시
    if (isLoading) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoading])

  // beforeunload 이벤트 핸들러
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // 표준 방식으로 경고창 트리거
    e.preventDefault()

    // 레거시 브라우저 지원을 위한 returnValue 설정
    e.returnValue = ''

    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quiz) return

    // await generateAndAddQuestions({
    //   quizTitle: quiz.title,
    //   quizDescription: quiz.description,
    //   difficulty,
    //   numQuestions,
    //   questionType,
    // })
    // console.log(`${quiz.title}`)
    // console.log(`${quiz.description}`)
    // console.log(`${questionType}`)
    console.log(`${quizText}`)
    await generateAndAddQuestionsByText({
      quizTitle: quiz.title,
      quizDescription: quiz.description,
      questionType,
      quizText,
    })
  }

  return (
    <div className="w-full p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">AI로 문제 추가하기</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">문제 유형</label>
            <Select
              value={questionType}
              onValueChange={(value) =>
                setQuestionType(value as QuizQuestionType)
              }
            >
              <SelectTrigger>
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

          {/* <div className="space-y-2">
            <label className="text-sm font-medium">문제 수(1~10개)</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={numQuestions === 0 ? '' : numQuestions}
              onChange={(e) => {
                const value = e.target.value
                setNumQuestions(value === '' ? 0 : Number(value))
              }}
            />
          </div> */}

          {/* 문제를 포함한 텍스트 */}
          <div>
            <label className="text-sm font-medium">문제 포함 텍스트</label>
            <Input
              type="text"
              placeholder="문제를 포함한 텍스트를 입력하세요."
              value={quizText}
              onChange={(e) => setQuizText(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !quiz}>
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
        <Alert className="mt-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>생성 중</AlertTitle>
          <AlertDescription>
            문제를 생성하는 중입니다. 페이지를 떠나면 작업이 중단됩니다.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="mt-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>성공</AlertTitle>
          <AlertDescription>문제가 성공적으로 추가되었습니다.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
