// components/AIQuestionGenerator.tsx
'use client'

import { useState } from 'react'
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

interface AIQuestionGeneratorProps {
  quizId: number
}

export default function AIQuestionGenerator({
  quizId,
}: AIQuestionGeneratorProps) {
  const { quiz } = useQuizQueries(quizId)
  const [difficulty, setDifficulty] = useState('보통')
  const [questionType, setQuestionType] = useState<QuizQuestionType>(
    QuizQuestionType.MULTIPLE_CHOICE
  )
  const [numQuestions, setNumQuestions] = useState(5)

  const { generateAndAddQuestions, isLoading, error, isSuccess } =
    useGenerateQuizQuestions(quizId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quiz) return

    await generateAndAddQuestions({
      quizTitle: quiz.title,
      quizDescription: quiz.description,
      difficulty,
      numQuestions,
      questionType,
    })
  }

  return (
    <div className="w-full p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">AI로 문제 추가하기</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">난이도</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="난이도 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="쉬움">쉬움</SelectItem>
                <SelectItem value="보통">보통</SelectItem>
                <SelectItem value="어려움">어려움</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
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
