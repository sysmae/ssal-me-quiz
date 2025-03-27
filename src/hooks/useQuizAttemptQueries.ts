// hooks/useQuizAttemptQueries.ts

import { quizAttempts } from '@/utils/quiz_attempts'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'

// 퀴즈 시도 생성 및 결과 저장을 통합한 훅 (추가)
export const useQuizAttemptWithSave = () => {
  const queryClient = useQueryClient()
  const createAttemptMutation = useCreateQuizAttempt()
  const saveAnswersMutation = useSaveQuizAnswers()
  const completeAttemptMutation = useCompleteQuizAttempt()

  // 퀴즈 시도 ID 상태
  const [attemptId, setAttemptId] = useState<number | null>(null)

  // 퀴즈 시작 함수
  const startQuiz = async (totalQuestions: number, questionIds?: number[]) => {
    try {
      const result = await createAttemptMutation.mutateAsync({
        totalQuestions,
        questionIds,
      })
      setAttemptId(result.id)
      return result
    } catch (error) {
      console.error('퀴즈 시작 실패:', error)
      throw error
    }
  }

  // 퀴즈 결과 저장 함수
  const saveQuizResults = async (
    answers: Array<{
      questionId: number
      userAnswer: string
      isCorrect: boolean
    }>
  ) => {
    if (!attemptId) throw new Error('퀴즈 시도 ID가 없습니다')

    try {
      // 1. 모든 답변 저장
      await saveAnswersMutation.mutateAsync({
        attemptId,
        answers,
      })

      // 2. 퀴즈 완료 처리
      await completeAttemptMutation.mutateAsync(attemptId)

      return attemptId
    } catch (error) {
      console.error('퀴즈 결과 저장 실패:', error)
      throw error
    }
  }

  return {
    attemptId,
    startQuiz,
    saveQuizResults,
    isStarting: createAttemptMutation.isPending,
    isSaving:
      saveAnswersMutation.isPending || completeAttemptMutation.isPending,
  }
}

// 새 퀴즈 시도 생성 훅 (수정)
export const useCreateQuizAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // 문제 ID 배열도 함께 받아 한 번에 처리
    mutationFn: async ({
      totalQuestions,
      questionIds,
    }: {
      totalQuestions: number
      questionIds?: number[]
    }) => {
      // 1. 퀴즈 시도 생성
      const attempt = await quizAttempts.create.newAttempt(totalQuestions)

      // 2. 문제 ID가 제공된 경우 문제 추가
      if (questionIds && questionIds.length > 0) {
        await quizAttempts.create.addQuestions(attempt.id, questionIds)
      }

      return attempt
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['quizAttempt', data.id],
      })
    },
  })
}

// 퀴즈 시도에 문제 추가 훅
export const useAddQuestionsToAttempt = (attemptId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questionIds: number[]) =>
      quizAttempts.create.addQuestions(attemptId, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizAttempt', attemptId] })
    },
  })
}

// 여러 사용자 답변 한 번에 저장 훅 (추가)
export const useSaveQuizAnswers = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: number
      answers: Array<{
        questionId: number
        userAnswer: string
        isCorrect: boolean
      }>
    }) =>
      // 모든 답변을 Promise.all로 병렬 처리
      Promise.all(
        answers.map((answer) =>
          quizAttempts.progress.saveAnswer(
            attemptId,
            answer.questionId,
            answer.userAnswer,
            answer.isCorrect
          )
        )
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['quizAttempt', variables.attemptId],
      })
    },
  })
}

// 퀴즈 시도 완료 훅
export const useCompleteQuizAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attemptId: number) =>
      quizAttempts.progress.complete(attemptId),
    onSuccess: (_, attemptId) => {
      queryClient.invalidateQueries({ queryKey: ['quizAttempt', attemptId] })
      queryClient.invalidateQueries({ queryKey: ['quizAttempts'] })
    },
  })
}

// 퀴즈 시도 결과 가져오기 훅
export const useQuizAttemptResult = (attemptId: number) => {
  return useQuery({
    queryKey: ['quizAttempt', attemptId],
    queryFn: () => quizAttempts.results.getAttemptResult(attemptId),
    enabled: !!attemptId,
  })
}

// 사용자의 모든 퀴즈 시도 목록 가져오기 훅
export const useUserQuizAttempts = () => {
  return useQuery({
    queryKey: ['quizAttempts'],
    queryFn: () => quizAttempts.results.getUserAttempts(),
  })
}

// 최근 퀴즈 시도 가져오기 훅
export const useRecentQuizAttempts = (limit = 5) => {
  return useQuery({
    queryKey: ['recentQuizAttempts', limit],
    queryFn: () => quizAttempts.results.getRecentAttempts(limit),
  })
}

// 랜덤 문제 가져오기 훅
export const useRandomQuestions = (count: number) => {
  return useQuery({
    queryKey: ['randomQuestions', count],
    queryFn: () => quizAttempts.random.getRandomQuestions(count),
  })
}

// 특정 퀴즈에서 랜덤 문제 가져오기 훅
export const useRandomQuestionsFromQuiz = (quizId: number, count: number) => {
  return useQuery({
    queryKey: ['randomQuestions', quizId, count],
    queryFn: () =>
      quizAttempts.random.getRandomQuestionsFromQuiz(quizId, count),
    enabled: !!quizId,
  })
}
