// hooks/useQuizzes.ts
import { useQuery } from '@tanstack/react-query'
import { fetchQuizzes, fetchQuizById, fetchRandomQuiz } from '@/lib/api'

// 퀴즈 상세 정보 가져오기 훅
export function useQuiz(id: string) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuizById(Number(id)),
    enabled: !!id,
  })
}

// 랜덤 퀴즈 가져오기 훅 (추천 퀴즈용)
export function useRandomQuiz() {
  return useQuery({
    queryKey: ['randomQuiz'],
    queryFn: fetchRandomQuiz,
  })
}

// 퀴즈 목록 가져오기 훅
export function useQuizzes(sortBy = 'like_count', searchTerm = '') {
  return useQuery({
    queryKey: ['quizzes', sortBy, searchTerm],
    queryFn: () => fetchQuizzes(sortBy, searchTerm),
  })
}
