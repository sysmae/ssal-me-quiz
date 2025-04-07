// utils/quiz.ts
import { createClient } from '@/utils/supabase/client'
import { QuizData, QuizInsertData, QuizUpdateData } from '@/types/quiz'
import {
  updateQuiz,
  deleteQuiz,
  createEmptyQuiz,
  addLike,
  removeLike,
  deleteThumbnail,
  uploadThumbnail,
} from '@/app/actions/quiz'

const supabase = createClient()

export const quizzes = {
  // 썸네일 관련 기능 추가
  thumbnails: {
    // 이미지 업로드 및 URL 반환
    uploadThumbnail: async (file: File): Promise<string> => {
      return uploadThumbnail(file)
    },

    // 새로운 deleteThumbnail 메소드
    deleteThumbnail: async (thumbnail_url: string, quizId: number) => {
      deleteThumbnail(thumbnail_url, quizId)
    },
  },

  // 퀴즈 목록 관련 기능
  list: {
    getAll: async (
      sortBy = 'view_count',
      searchTerm = '',
      page = 0,
      pageSize = 9
    ) => {
      const startIndex = page * pageSize

      let query = supabase
        .from('quizzes')
        .select('*')
        .filter('published', 'eq', true)

      // 검색어가 있으면 필터링
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`)
      }

      // 정렬 방식 설정
      let order
      let ascending = false

      switch (sortBy) {
        case 'newest':
          order = 'created_at'
          ascending = false
          break
        case 'oldest':
          order = 'created_at'
          ascending = true
          break
        case 'view_count':
          order = 'view_count'
          ascending = false
          break
        case 'like_count':
        default:
          order = 'like_count'
          ascending = false
      }

      const { data, error } = await query
        .order(order, { ascending })
        .range(startIndex, startIndex + pageSize - 1)

      if (error) throw error
      return data
    },

    // 공개된 퀴즈만 가져오는 함수 추가
    getPublished: async (id: number) => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*, questions:quiz_questions(*)')
          .eq('id', id)
          .eq('published', true)
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('공개된 퀴즈 조회 실패:', error)
        return null
      }
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
        .select('*, questions:quiz_questions(*)')
        .eq('user_id', userId)

      if (error) throw error
      return data
    },
  },

  // 퀴즈 상세 관련 기능
  details: {
    get: async (id: number) => {
      try {
        // 먼저 퀴즈를 가져옵니다
        const { data: quiz, error: fetchError } = await supabase
          .from('quizzes')
          .select('*, questions:quiz_questions(*)')
          .eq('id', id)
          .single()

        if (fetchError) {
          window.location.href = '/quiz'
          return
        }

        if (!quiz) {
          window.location.href = '/quiz'
          return
        }

        // 공개된 퀴즈는 인증 없이 바로 반환
        if (quiz.published) {
          return quiz
        }

        // 비공개 퀴즈는 사용자 인증 필요
        const { data, error } = await supabase.auth.getUser()

        // 인증 에러 발생 시 리다이렉트
        if (error) {
          window.location.href = '/quiz'
          return
        }

        const userId = data.user?.id

        if (!userId) {
          window.location.href = '/quiz'
          return
        }

        // 소유권 확인
        if (quiz.user_id !== userId) {
          window.location.href = '/quiz'
          return
        }

        return quiz
      } catch (error) {
        window.location.href = '/quiz'
        return
      }
    },

    update: async (id: number, updates: QuizUpdateData) => {
      return updateQuiz(id, updates)
    },

    delete: async (id: number) => {
      return deleteQuiz(id)
    },
  },

  // + 버튼 클릭 시 기본값으로 퀴즈 생성
  createEmptyQuiz: async () => {
    return createEmptyQuiz()
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
      return addLike(quizId)
    },

    // 좋아요 취소
    removeLike: async (quizId: number) => {
      return removeLike(quizId)
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

  // 조회수 관련 기능 추가
  views: {
    // 조회수 증가
    incrementViewCount: async (quizId: number) => {
      try {
        const { data, error } = await supabase.rpc('increment_view_count', {
          quiz_id: quizId,
        })

        if (error) throw error
        return data
      } catch (error) {
        throw error
      }
    },

    // 조회수 조회
    getViewCount: async (quizId: number) => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('view_count')
        .eq('id', quizId)
        .single()

      if (error) throw error
      return data.view_count || 0
    },
  },
}
