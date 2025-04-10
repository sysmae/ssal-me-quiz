// hooks/useGenerateQuizQuestions.ts
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quiz_questions } from '@/utils/quiz_question'
import { QuestionInsertData } from '@/types/quiz'

export const useGenerateQuizQuestions = (quizId: number) => {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI로 문제 생성 요청
  const generateQuestions = async (params: {
    quizTitle: string
    quizDescription: string | null
    difficulty: string
    numQuestions: number
    questionType: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId,
          ...params,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '문제 생성 중 오류가 발생했습니다.')
      }

      const data = await response.json()
      return data.questions as QuestionInsertData[]
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 생성된 문제를 데이터베이스에 추가
  const addQuestionsMutation = useMutation({
    mutationFn: async (questions: QuestionInsertData[]) => {
      const results = []
      for (const question of questions) {
        const newQuestionId = await quiz_questions.create(question)
        results.push(newQuestionId)
      }
      return results
    },
    onSuccess: () => {
      // 퀴즈 문제 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    },
    onError: (error: any) => {
      setError(error.message || '문제 저장 중 오류가 발생했습니다.')
    },
  })

  // 전체 프로세스 실행 함수
  const generateAndAddQuestions = async (params: {
    quizTitle: string
    quizDescription: string | null
    difficulty: string
    numQuestions: number
    questionType: string
  }) => {
    try {
      // 1. AI로 문제 생성
      const generatedQuestions = await generateQuestions(params)

      // 2. 생성된 문제를 데이터베이스에 저장
      return await addQuestionsMutation.mutateAsync(generatedQuestions)
    } catch (err) {
      // 오류는 이미 내부 함수에서 처리됨
      return null
    }
  }

  return {
    generateAndAddQuestions,
    isLoading: isLoading || addQuestionsMutation.isPending,
    error,
    isSuccess: addQuestionsMutation.isSuccess,
  }
}
