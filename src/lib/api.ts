// lib/api.ts
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

// 퀴즈 상세 정보 가져오기
export async function fetchQuizById(id: number) {
  const supabase = createClient()

  // 퀴즈 정보 가져오기
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single()

  if (quizError) throw quizError

  // 퀴즈 문제 가져오기
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', id)
    .order('order_number', { ascending: true })

  if (questionsError) throw questionsError

  // 각 문제의 대체 정답 가져오기
  for (let i = 0; i < questions.length; i++) {
    const { data: alternatives, error: alternativesError } = await supabase
      .from('alternative_answers')
      .select('*')
      .eq('question_id', questions[i].id)

    if (alternativesError) throw alternativesError

    questions[i].alternative_answers = alternatives
  }

  return { ...quiz, questions }
}
