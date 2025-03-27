import { quiz_questions } from '@/utils/quiz_questions'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { QuestionInsertData, QuestionUpdateData } from '@/types/quiz'

export const useQuizQuestionQueries = (quizId: number) => {
  const queryClient = useQueryClient()

  // 문제 목록 가져오기
  const { data: quiz_questionsData } = useQuery({
    queryKey: ['quiz_questions', quizId],
    queryFn: () => quiz_questions.list.getAll(quizId),
    enabled: !!quizId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  // 문제 생성
  const { mutate: createQuestion } = useMutation({
    mutationFn: (question: QuestionInsertData) =>
      quiz_questions.create(question),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quiz_questions', quizId],
      })
    },
  })

  // 문제 정보 업데이트
  const { mutate: updateQuestion } = useMutation({
    mutationFn: ({
      questionId,
      updates,
    }: {
      questionId: number
      updates: QuestionUpdateData
    }) => quiz_questions.details.update(questionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quiz_questions', quizId],
      })
    },
  })

  // 문제 삭제
  const { mutate: deleteQuestion } = useMutation({
    mutationFn: (questionId: number) =>
      quiz_questions.details.delete(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz_questions', quizId] })
    },
  })

  return {
    quiz_questionsData,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  }
}
