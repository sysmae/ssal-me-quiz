import { QuizUpdateData, QuizCreateData } from '@/types/quiz'
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

  // 퀴즈 제목 업데이트
  const { mutate: updateTitle } = useMutation({
    mutationFn: (title: string) => quizzes.details.update(quizId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    },
  })

  // 퀴즈 설명 업데이트
  const { mutate: updateDescription } = useMutation({
    mutationFn: (description: string) =>
      quizzes.details.update(quizId, { description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    },
  })

  // 퀴즈 삭제
  const { mutate: deleteQuiz } = useMutation({
    mutationFn: () => quizzes.details.delete(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  return {
    quiz,
    updateQuiz,
    updateTitle,
    updateDescription,
    deleteQuiz,
  }
}

// 퀴즈 목록 관련 쿼리 훅
export const useQuizListQueries = () => {
  // 모든 퀴즈 가져오기
  const useGetQuizzes = (sortBy = 'like_count', searchTerm = '') => {
    return useQuery({
      queryKey: ['quizzes', sortBy, searchTerm],
      queryFn: () => quizzes.list.getAll(sortBy, searchTerm),
      staleTime: 60 * 60 * 1000, // 1시간 동안 신선한 상태 유지
    })
  }

  // 인기 퀴즈 가져오기
  const useGetPopularQuizzes = (limit = 10) => {
    return useQuery({
      queryKey: ['quizzes', 'popular', limit],
      queryFn: () => quizzes.list.getPopular(limit),
      staleTime: 24 * 60 * 60 * 1000, // 24시간 동안 신선한 상태 유지
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7일 동안 캐시 유지
    })
  }

  // ID 목록으로 퀴즈 가져오기
  const useGetQuizzesByIds = (ids: number[]) => {
    return useQuery({
      queryKey: ['quizzes', 'byIds', ids],
      queryFn: () => quizzes.list.getByIds(ids),
      enabled: ids.length > 0,
      staleTime: 60 * 60 * 1000, // 1시간 동안 신선한 상태 유지
    })
  }

  return {
    useGetQuizzes,
    useGetPopularQuizzes,
    useGetQuizzesByIds,
  }
}

// 퀴즈 생성 관련 뮤테이션 훅
export const useCreateQuizMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (quizData: QuizCreateData) => quizzes.create(quizData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}

// 퀴즈 생성 관련 뮤테이션 훅 (새로운 방식 추가)
export const useCreateEmptyQuizMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const quizId = await quizzes.createEmptyQuiz() // 기본값으로 퀴즈 생성
      return quizId
    },
    onSuccess: (quizId) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      // 성공적으로 생성되면 해당 ID의 편집 페이지로 이동
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
