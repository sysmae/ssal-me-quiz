import { questions } from '@/utils/question'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { QuestionUpdateData } from '@/types/quiz'

export const useQuestionQueries = (quizId: number) => {
  const queryClient = useQueryClient()

  // 문제 목록 가져오기
  const { data: questionsData } = useQuery({
    queryKey: ['questions', quizId],
    queryFn: () => questions.list.getAll(quizId),
    enabled: !!quizId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  // 문제 정보 업데이트
  const { mutate: updateQuestion } = useMutation({
    mutationFn: (updates: QuestionUpdateData) =>
      questions.details.update(quizId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
    },
  })

  // 문제 삭제
  const { mutate: deleteQuestion } = useMutation({
    mutationFn: (questionId: number) => questions.details.delete(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
    },
  })

  return {
    questionsData,
    updateQuestion,
    deleteQuestion,
  }
}
