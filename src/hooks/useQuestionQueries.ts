import { questions } from '@/utils/question'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { QuestionInsertData, QuestionUpdateData } from '@/types/quiz'

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

  // 문제 생성
  const { mutate: createQuestion } = useMutation({
    mutationFn: (question: QuestionInsertData) => questions.create(question),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['questions', quizId],
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
    }) => questions.details.update(questionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['questions', quizId],
      })
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
    createQuestion,
    updateQuestion,
    deleteQuestion,
  }
}
