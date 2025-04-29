'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quiz_questions } from '@/utils/quiz_question'
import { QuestionInsertData } from '@/types/quiz'
import { generateQuizQuestions } from '@/app/actions/generate-quiz-questions'
import { generateQuizQuestionsByText } from '@/app/actions/generate-quiz-questions-by-text'
import { generateQuizQuestionsByPdf } from '@/app/actions/generate-quiz-questions-by-pdf'

export const useGenerateQuizQuestions = (quizId: number) => {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

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
      queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      setIsSuccess(true)
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
      setIsLoading(true)
      setError(null)
      setIsSuccess(false)

      // 서버 액션을 호출하여 AI로 문제 생성
      const generatedQuestions = await generateQuizQuestions({
        quizId,
        ...params,
      })

      // 생성된 문제를 데이터베이스에 저장
      await addQuestionsMutation.mutateAsync(generatedQuestions)

      return true
    } catch (err: any) {
      setError(err.message || '문제 생성 중 오류가 발생했습니다.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // 텍스트로 퀴즈 정보 받아서 문제 생성
  const generateAndAddQuestionsByText = async (params: {
    quizTitle: string
    quizDescription: string | null
    questionType: string
    quizText: string
  }) => {
    try {
      setIsLoading(true)
      setError(null)
      setIsSuccess(false)

      // 서버 액션을 호출하여 AI로 문제 생성
      const generatedQuestions = await generateQuizQuestionsByText({
        quizId,
        ...params,
      })

      // 생성된 문제를 데이터베이스에 저장
      await addQuestionsMutation.mutateAsync(generatedQuestions)

      return true
    } catch (err: any) {
      setError(err.message || '문제 생성 중 오류가 발생했습니다.')
      return false
    } finally {
      setIsLoading(false)
    }
  }
  // PDF로 퀴즈 정보 받아서 문제 생성
  const generateAndAddQuestionsByPdf = async (params: {
    quizTitle: string
    quizDescription: string | null
    questionType: string
    file: Blob
  }) => {
    try {
      setIsLoading(true)
      setError(null)
      setIsSuccess(false)

      // 서버 액션을 호출하여 AI로 문제 생성
      const generatedQuestions = await generateQuizQuestionsByPdf({
        quizId,
        ...params,
      })

      // 생성된 문제를 데이터베이스에 저장
      await addQuestionsMutation.mutateAsync(generatedQuestions)

      return true
    } catch (err: any) {
      setError(err.message || '문제 생성 중 오류가 발생했습니다.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateAndAddQuestions,
    generateAndAddQuestionsByText,
    generateAndAddQuestionsByPdf,
    isLoading: isLoading || addQuestionsMutation.isPending,
    error,
    isSuccess,
  }
}
