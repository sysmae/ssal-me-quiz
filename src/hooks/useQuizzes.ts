// hooks/useQuizzes.ts
import { useQuery } from '@tanstack/react-query'
import { fetchQuizzes, fetchQuizById } from '@/lib/api'

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
  })
}
