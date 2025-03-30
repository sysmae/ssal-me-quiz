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
      quizAttemptQuestionData: QuizAttemptQuestionInsertData[]
    }) =>
      quizAttempts.createAttemptAndQuestions(
        quizAttemptData,
        quizAttemptQuestionData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz_attempts'] })
    },
  })

  return {
    createQuizAttempt,
  }
}
