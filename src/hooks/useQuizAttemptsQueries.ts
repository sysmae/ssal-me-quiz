import {
  QuizAttemptInsertData,
  QuizAttemptQuestionInsertData,
} from '@/types/quiz_attempt'
import { quizAttempts } from '@/utils/quiz_attempts'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export const useQuizAttemptsQueries = () => {
  const queryClient = useQueryClient()

  // 퀴즈 시도 생성
  const { mutate: createQuizAttempt } = useMutation({
    mutationFn: ({
      quizAttemptData,
      quizAttemptQuestionData,
    }: {
      quizAttemptData: QuizAttemptInsertData
      quizAttemptQuestionData: Omit<
        QuizAttemptQuestionInsertData,
        'attempt_id'
      >[]
    }) =>
      quizAttempts.createAttemptAndQuestions(
        quizAttemptData,
        quizAttemptQuestionData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz_attempts'] })
    },
  })

  // 퀴즈의 총 시도 횟수 가져오기
  const useQuizTotalAttemptCount = (quizId: number) => {
    return useQuery({
      queryKey: ['quiz_total_attempts_count', quizId],
      queryFn: () => quizAttempts.useQuizTotalAttemptCount(quizId),
      staleTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
    })
  }

  // 퀴즈의 모든 점수 데이터 가져오기
  const useQuizScoreData = (quizId: number) => {
    return useQuery({
      queryKey: ['quiz_score_data', quizId],
      queryFn: () => quizAttempts.useQuizScoreData(quizId),
      staleTime: 1000 * 60 * 5,
      enabled: false, // 필요할 때만 실행되도록 기본적으로 비활성화
    })
  }

  return {
    createQuizAttempt,
    useQuizTotalAttemptCount,
    useQuizScoreData,
  }
}
