// utils/quizzes.ts
import { createClient } from '@/utils/supabase/client'

// 퀴즈 목록 가져오기
export async function fetchQuizzes(sortBy = 'like_count', searchTerm = '') {
  const supabase = createClient()

  let query = supabase.from('quizzes').select('*')

  // 검색어가 있으면 필터링
  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`)
  }

  // 정렬 방식 설정
  const order = sortBy === 'newest' ? 'created_at' : sortBy
  const ascending = sortBy === 'oldest'

  const { data, error } = await query.order(order, { ascending }).limit(20)

  console.log(data)

  if (error) throw error
  return data
}

export async function fetchQuizById(id: number) {
  const supabase = createClient()

  // 퀴즈 정보 가져오기
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select(
      '*, questions:questions(*, alternative_answers:alternative_answers(*))'
    )
    .eq('id', id)
    .single()

  if (quizError) throw quizError

  return quiz
}

// 여러 퀴즈를 한 번에 가져오는 함수 (ID 목록 기반)
export async function fetchQuizzesByIds(ids: number[]) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, description, created_at')
    .in('id', ids)

  if (error) throw error
  return data
}

// 인기 퀴즈 목록 가져오기 (캐싱에 적합)
export async function fetchPopularQuizzes(limit = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, description, like_count')
    .order('like_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// lib/api.ts에 추가
export async function createQuiz(quizData: any) {
  const supabase = createClient()

  // 1. 퀴즈 기본 정보 저장
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      title: quizData.title,
      description: quizData.description,
      created_by: quizData.userId,
      // 기타 필요한 필드들
    })
    .select()
    .single()

  if (quizError) throw quizError

  // 2. 퀴즈 문제들 저장
  if (quizData.questions && quizData.questions.length > 0) {
    const questionsWithQuizId = quizData.questions.map((q: any) => ({
      ...q,
      quiz_id: quiz.id,
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsWithQuizId)

    if (questionsError) throw questionsError
  }

  return quiz
}
