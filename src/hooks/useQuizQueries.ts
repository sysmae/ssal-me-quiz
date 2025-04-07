// hooks/useQuizQueries.ts

import { QuizUpdateData } from '@/types/quiz'
import { quizzes } from '@/utils/quiz'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useInfiniteQuery } from '@tanstack/react-query'

// 인기 퀴즈 가져오기 (조회수 기준)
export const usePopularQuizzes = (limit = 3) => {
  return useQuery({
    queryKey: ['popularQuizzes', limit],
    queryFn: () => quizzes.list.getAll('view_count', '', 0, limit),
    staleTime: 24 * 60 * 60 * 1000, // 1일 동안 신선한 상태 유지
  })
}

// 최신 퀴즈 가져오기 (생성일 기준)
export const useRecentQuizzes = (limit = 3) => {
  return useQuery({
    queryKey: ['recentQuizzes', limit],
    queryFn: () => quizzes.list.getAll('newest', '', 0, limit),
    staleTime: 24 * 60 * 60 * 1000, // 1일 동안 신선한 상태 유지
  })
}

// 무한 스크롤을 위한 퀴즈 목록 가져오기
export const useInfiniteQuizzes = (sortBy = 'view_count', searchTerm = '') => {
  return useInfiniteQuery({
    queryKey: ['infiniteQuizzes', sortBy, searchTerm],
    queryFn: ({ pageParam = 0 }) =>
      quizzes.list.getAll(sortBy, searchTerm, pageParam, 9),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 0 ? undefined : allPages.length
    },
    staleTime: 60 * 60 * 1000, // 60분 동안 신선한 상태 유지
  })
}

export const useQuizQueries = (quizId: number) => {
  const queryClient = useQueryClient()

  // 퀴즈 상세 정보 가져오기
  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizzes.details.get(quizId),
    enabled: !!quizId,
    staleTime: 60 * 60 * 1000,
    gcTime: 1000 * 60 * 30,
  })

  // 퀴즈 정보 업데이트 - mutateAsync 사용
  const { mutateAsync: updateQuiz } = useMutation({
    mutationFn: (updates: QuizUpdateData) =>
      quizzes.details.update(quizId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    },
  })

  // Promise를 반환하는 함수로 변경
  const updateTitle = async (title: string) => await updateQuiz({ title })

  const updateDescription = async (description: string) =>
    await updateQuiz({ description })

  const updatePublished = async (published: boolean) =>
    await updateQuiz({ published })

  const updateThumbnail = async (thumbnailUrl: string) =>
    await updateQuiz({ thumbnail_url: thumbnailUrl })

  // 퀴즈 삭제 - 마찬가지로 mutateAsync 사용
  const { mutateAsync: deleteQuiz } = useMutation({
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
    updateThumbnail,
    deleteQuiz,
  }
}

// 모든 퀴즈 가져오기 - 개별 훅으로 분리
export const useGetQuizzes = (sortBy = 'like_count', searchTerm = '') => {
  return useQuery({
    queryKey: ['quizzes', sortBy, searchTerm],
    queryFn: async () => await quizzes.list.getAll(sortBy, searchTerm),
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

// 공개된 퀴즈 정보 가져오기 (메타데이터용)
export const usePublishedQuizQuery = (quizId: number) => {
  return useQuery({
    queryKey: ['publishedQuiz', quizId],
    queryFn: () => quizzes.list.getPublished(quizId),
    enabled: !!quizId,
  })
}

// 메타데이터용 퀴즈 정보 가져오기
export const getPublishedQuizForMetadata = async (id: number) => {
  return await quizzes.list.getPublished(id)
}

// 서버 컴포넌트에서 사용할 prefetch 함수
export const prefetchPublishedQuiz = async (
  queryClient: QueryClient,
  quizId: number
) => {
  return queryClient.prefetchQuery({
    queryKey: ['publishedQuiz', quizId],
    queryFn: () => quizzes.list.getPublished(quizId),
    staleTime: 60 * 60 * 1000, // 1시간
  })
}

// 좋아요 상태 확인 훅
export const useQuizLikeStatus = (quizId: number) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'liked'],
    queryFn: () => quizzes.likes.checkUserLike(quizId),
    enabled: !!quizId,
  })
}

// 좋아요 토글 훅
export const useToggleQuizLike = (quizId: number) => {
  const queryClient = useQueryClient()
  const { data: isLiked } = useQuizLikeStatus(quizId)

  return useMutation({
    mutationFn: async () => {
      if (isLiked) {
        return quizzes.likes.removeLike(quizId)
      } else {
        return quizzes.likes.addLike(quizId)
      }
    },
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId, 'liked'] })
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}

// 조회수 증가 훅
export const useIncrementQuizView = (quizId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => quizzes.views.incrementViewCount(quizId),
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    },
  })
}

// 조회수 조회 훅
export const useQuizViewCount = (quizId: number) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'views'],
    queryFn: () => quizzes.views.getViewCount(quizId),
    enabled: !!quizId,
  })
}
