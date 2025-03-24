'utils/likes.ts'
import { QuizUpdateData } from '@/types/quiz'
import { quizzes } from '@/utils/quiz'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export const useQuizQueries = (quizId: number) => {
  const queryClient = useQueryClient()

  // 퀴즈 상세 정보 가져오기
  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizzes.details.get(quizId),
    enabled: !!quizId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  // 퀴즈 정보 업데이트
  const { mutate: updateQuiz } = useMutation({
    mutationFn: (updates: QuizUpdateData) =>
      quizzes.details.update(quizId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    },
  })

  // 퀴즈 제목 업데이트 - updateQuiz를 활용하여 중복 제거
  const updateTitle = (title: string) => updateQuiz({ title })

  // 퀴즈 설명 업데이트 - updateQuiz를 활용하여 중복 제거
  const updateDescription = (description: string) => updateQuiz({ description })

  // 퀴즈 발행 상태 업데이트
  const updatePublished = (published: boolean) => updateQuiz({ published })

  // 퀴즈 좋아요 업데이트
  const updateLikeCount = (likeCount: number) =>
    updateQuiz({ like_count: likeCount })

  // 퀴즈 삭제
  const { mutate: deleteQuiz } = useMutation({
    mutationFn: () => quizzes.details.delete(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      window.location.href = '/quiz'
    },
  })

  return {
    quiz,
    updateQuiz,
    updateTitle,
    updateDescription,
    updatePublished,
    deleteQuiz,
  }
}

// 모든 퀴즈 가져오기 - 개별 훅으로 분리
export const useGetQuizzes = (sortBy = 'like_count', searchTerm = '') => {
  return useQuery({
    queryKey: ['quizzes', sortBy, searchTerm],
    queryFn: () => quizzes.list.getAll(sortBy, searchTerm),
    staleTime: 60 * 60 * 1000, // 1시간 동안 신선한 상태 유지
  })
}

// 사용자의 퀴즈 가져오기 - 개별 훅으로 분리
export const useGetUserQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes', 'user'],
    queryFn: () => quizzes.list.getMyQuizzes(),
    staleTime: 60 * 60 * 1000, // 1시간 동안 신선한 상태 유지
  })
}

// 퀴즈 생성 관련 뮤테이션 훅
export const useCreateEmptyQuizMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const quizId = await quizzes.createEmptyQuiz() // 기본값으로 퀴즈 생성
      return quizId
    },
    onSuccess: (quizId) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      // router 대신 window.location.href 사용
      window.location.href = `/quiz/${quizId}/edit`
    },
  })
}

// 퀴즈 프리페치 함수
export const prefetchQuiz = async (
  queryClient: QueryClient,
  quizId: number
) => {
  await queryClient.prefetchQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizzes.details.get(quizId),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })
}
