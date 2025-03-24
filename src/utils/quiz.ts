// utils/quiz.ts
import { createClient } from '@/utils/supabase/client'
import { QuizData, QuizInsertData, QuizUpdateData } from '@/types/quiz'

const supabase = createClient()

export const quizzes = {
  // 퀴즈 목록 관련 기능
  list: {
    getAll: async (sortBy = 'like_count', searchTerm = '') => {
      let query = supabase
        .from('quizzes')
        .select('*')
        .filter('published', 'eq', true) // 공개된 퀴즈만 가져오기

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
        .filter('published', 'eq', true) // 공개된 퀴즈만 가져오기
        .order('like_count', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    },

    getMyQuizzes: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      const { data, error } = await supabase
        .from('quizzes')
        .select('*, questions:questions(*)')
        .eq('created_by', userId)

      if (error) throw error
      return data
    },
  },
  // 퀴즈 상세 관련 기능
  details: {
    get: async (id: number) => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, questions:questions(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    update: async (id: number, updates: QuizUpdateData) => {
      const { data, error } = await supabase
        .from('quizzes')
        .update({ ...updates, updated_at: new Date().toISOString() })
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

  // + 버튼 클릭 시 기본값으로 퀴즈 생성
  createEmptyQuiz: async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not found')

    // Step 1: 기본값으로 퀴즈 생성
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        title: '새 퀴즈', // 기본 제목
        description: '', // 초기 설명은 빈 값
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error

    // Step 2: 생성된 ID 반환 (페이지 이동 시 사용)
    return quiz.id
  },

  // 좋아요 관련 기능 추가
  likes: {
    // 사용자가 퀴즈에 좋아요를 눌렀는지 확인
    checkUserLike: async (quizId: number) => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) return false

      const { data, error } = await supabase
        .from('quiz_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .maybeSingle()

      if (error) throw error
      return !!data
    },

    // 좋아요 추가
    addLike: async (quizId: number) => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      // 1. 현재 좋아요 수 조회
      const { data: quizData, error: fetchError } = await supabase
        .from('quizzes')
        .select('like_count')
        .eq('id', quizId)
        .single()

      if (fetchError) throw fetchError

      // 2. 좋아요 추가
      const { error: likeError } = await supabase.from('quiz_likes').upsert({
        user_id: userId,
        quiz_id: quizId,
      })

      if (likeError) throw likeError

      // 3. 좋아요 카운트 증가
      const newLikeCount = (quizData.like_count || 0) + 1
      const { data, error: updateError } = await supabase
        .from('quizzes')
        .update({ like_count: newLikeCount })
        .eq('id', quizId)
        .select('like_count')
        .single()

      if (updateError) throw updateError
      return data.like_count
    },

    // 좋아요 취소
    removeLike: async (quizId: number) => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      // 1. 현재 좋아요 수 조회
      const { data: quizData, error: fetchError } = await supabase
        .from('quizzes')
        .select('like_count')
        .eq('id', quizId)
        .single()

      if (fetchError) throw fetchError

      // 2. 좋아요 삭제
      const { error: unlikeError } = await supabase
        .from('quiz_likes')
        .delete()
        .eq('user_id', userId)
        .eq('quiz_id', quizId)

      if (unlikeError) throw unlikeError

      // 3. 좋아요 카운트 감소 (0 미만으로 내려가지 않도록)
      const newLikeCount = Math.max(0, (quizData.like_count || 0) - 1)
      const { data, error: updateError } = await supabase
        .from('quizzes')
        .update({ like_count: newLikeCount })
        .eq('id', quizId)
        .select('like_count')
        .single()

      if (updateError) throw updateError
      return data.like_count
    },

    // 퀴즈 좋아요 수 조회
    getLikeCount: async (quizId: number) => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('like_count')
        .eq('id', quizId)
        .single()

      if (error) throw error
      return data.like_count
    },
  },
}
