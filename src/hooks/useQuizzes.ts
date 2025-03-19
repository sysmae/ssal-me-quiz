// hooks/useQuizzes.ts
import { useQuery } from '@tanstack/react-query'
import {
  fetchQuizzes,
  fetchQuizById,
  fetchPopularQuizzes,
  fetchQuizzesByIds,
} from '@/utils/quizzes'

// 퀴즈 상세 정보 가져오기 훅
export function useQuiz(id: string) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuizById(Number(id)),
    enabled: !!id,
    // 서버에서 미리 가져온 데이터를 사용하도록 설정
    staleTime: Infinity,
    // 캐시된 데이터만 사용하도록 설정
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

// 퀴즈 목록 가져오기 훅
export function useQuizzes(sortBy = 'like_count', searchTerm = '') {
  return useQuery({
    queryKey: ['quizzes', sortBy, searchTerm],
    queryFn: () => fetchQuizzes(sortBy, searchTerm),
    staleTime: 60 * 60 * 1000, // 1시간 동안 신선한 상태 유지
  })
}

// hooks/useQuizzes.ts에 추가할 훅들

// 인기 퀴즈 목록 가져오기 훅 (장기 캐싱)
export function usePopularQuizzes() {
  return useQuery({
    queryKey: ['quizzes', 'popular'],
    queryFn: () => fetchPopularQuizzes(),
    staleTime: 24 * 60 * 60 * 1000, // 24시간 동안 신선한 상태 유지
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7일 동안 캐시 유지
  })
}

// 여러 퀴즈 ID로 데이터 가져오기 (프리페칭에 유용)
export function useQuizzesByIds(ids: number[]) {
  return useQuery({
    queryKey: ['quizzes', 'byIds', ids],
    queryFn: () => fetchQuizzesByIds(ids),
    enabled: ids.length > 0,
    staleTime: 60 * 60 * 1000, // 1시간 동안 신선한 상태 유지
  })
}
