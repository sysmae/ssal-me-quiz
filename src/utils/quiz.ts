// utils/quizzes.ts
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export const quizzes = {
  // 퀴즈 목록 관련 기능
  list: {
    getAll: async (sortBy = 'like_count', searchTerm = '') => {
      let query = supabase.from('quizzes').select('*')

      // 검색어가 있으면 필터링
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`)
      }

      // 정렬 방식 설정
      const order = sortBy === 'newest' ? 'created_at' : sortBy
      const ascending = sortBy === 'oldest'

      const { data, error } = await query.order(order, { ascending }).limit(20)

      if (error) throw error
      return data
    },

    getPopular: async (limit = 10) => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description, like_count')
        .order('like_count', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    },

    getByIds: async (ids: number[]) => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description, created_at')
        .in('id', ids)

      if (error) throw error
      return data
    },
  },

  // 퀴즈 상세 관련 기능
  details: {
    get: async (id: number) => {
      const { data, error } = await supabase
        .from('quizzes')
        .select(
          '*, questions:questions(*, alternative_answers:alternative_answers(*))'
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    update: async (id: number, updates: any) => {
      const { data, error } = await supabase
        .from('quizzes')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    delete: async (id: number) => {
      const { error } = await supabase.from('quizzes').delete().eq('id', id)
      if (error) throw error
    },
  },

  // 퀴즈 생성 기능
  create: async (quizData: any) => {
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
  },

  // 문제 관련 기능도 추가할 수 있음
  questions: {
    // 문제 추가, 수정, 삭제 등의 기능
  },
}
