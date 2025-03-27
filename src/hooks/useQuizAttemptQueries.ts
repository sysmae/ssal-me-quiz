// hooks/useQuizAttemptQueries.ts

import { quizAttempts } from '@/utils/quiz_attempts'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

// 새 퀴즈 시도 생성 훅
export const useCreateQuizAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (totalQuestions: number) =>
      quizAttempts.create.newAttempt(totalQuestions),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizAttempts'] })
      // 새로 생성된 퀴즈 시도 페이지로 이동
      window.location.href = `/quiz-attempt/${data.id}`
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

// 사용자 답변 저장 훅
export const useSaveQuizAnswer = (attemptId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      userAnswer,
    }: {
      questionId: number
      userAnswer: string
    }) => quizAttempts.progress.saveAnswer(attemptId, questionId, userAnswer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizAttempt', attemptId] })
    },
  })
}

// 퀴즈 시도 완료 훅
export const useCompleteQuizAttempt = (attemptId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => quizAttempts.progress.complete(attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizAttempt', attemptId] })
      queryClient.invalidateQueries({ queryKey: ['quizAttempts'] })
      // 결과 페이지로 이동
      window.location.href = `/quiz-result/${attemptId}`
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
