// utils/quiz.ts
import { createClient } from '@/utils/supabase/client'
import { QuizData, QuizInsertData, QuizUpdateData } from '@/types/quiz'

const supabase = createClient()

export const quizzes = {
  // 썸네일 관련 기능 추가
  thumbnails: {
    // 이미지 업로드 및 URL 반환
    uploadThumbnail: async (file: File) => {
      try {
        // 사용자 인증 확인
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('사용자 인증이 필요합니다.')
        }

        console.log('인증된 사용자:', user.id)
        console.log(
          '파일 업로드 시작:',
          file.name,
          'Size:',
          file.size,
          'Type:',
          file.type
        )

        // 파일 크기 제한 확인 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('파일 크기는 5MB 이하여야 합니다.')
        }

        // 파일 확장자 추출 및 유효성 검사
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        if (
          !fileExt ||
          !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)
        ) {
          throw new Error(
            '지원되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 허용)'
          )
        }

        // 고유한 파일명 생성
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`
        const filePath = `quiz-thumbnails/${fileName}`

        // Supabase Storage에 파일 업로드
        console.log('Supabase Storage 업로드 시작:', filePath)

        // 업로드 시도
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('quiz-assets')
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: '3600',
          })

        if (uploadError) {
          console.error(
            'Supabase Storage 업로드 오류:',
            JSON.stringify(uploadError)
          )
          throw new Error(`파일 업로드 실패: ${uploadError.message}`)
        }

        // 업로드된 파일의 공개 URL 가져오기
        const { data: urlData } = supabase.storage
          .from('quiz-assets')
          .getPublicUrl(filePath)

        return urlData.publicUrl
      } catch (error) {
        console.error('썸네일 업로드 실패:', error)
        // 사용자에게 더 친숙한 오류 메시지 제공
        if (error instanceof Error) {
          throw new Error(`썸네일 업로드 실패: ${error.message}`)
        } else {
          throw new Error('썸네일 업로드 중 알 수 없는 오류가 발생했습니다.')
        }
      }
    },
    // 썸네일 삭제 (필요시 사용)
    deleteThumbnail: async (url: string) => {
      try {
        console.log('썸네일 삭제 시작:', url)

        // URL에서 파일 경로 추출
        const urlObj = new URL(url)
        const pathSegments = urlObj.pathname.split('/')
        const bucketName = pathSegments[pathSegments.length - 2]
        const fileName = pathSegments[pathSegments.length - 1]
        const filePath = `quiz-thumbnails/${fileName}`
        console.log('삭제할 파일 경로:', filePath)

        // Supabase Storage에서 파일 삭제
        const { data, error } = await supabase.storage
          .from('quiz-assets')
          .remove([filePath])

        if (error) {
          console.error('Supabase Storage 삭제 오류:', error)
          throw error
        }

        console.log('삭제 성공:', data)
        return true
      } catch (error) {
        console.error('썸네일 삭제 실패:', error)
        throw error
      }
    },
  },
  // 퀴즈 목록 관련 기능
  list: {
    getAll: async (
      sortBy = 'like_count',
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
        .select('*, questions:quiz_questions(*)')
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

  // 조회수 관련 기능 추가
  views: {
    // 조회수 증가
    incrementViewCount: async (quizId: number) => {
      try {
        // 현재 조회수 가져오기
        const { data: quizData, error: fetchError } = await supabase
          .from('quizzes')
          .select('view_count')
          .eq('id', quizId)
          .single()

        if (fetchError) throw fetchError

        // 조회수 증가
        const newViewCount = (quizData.view_count || 0) + 1
        const { data, error: updateError } = await supabase
          .from('quizzes')
          .update({ view_count: newViewCount })
          .eq('id', quizId)
          .select('view_count')
          .single()

        if (updateError) throw updateError
        return data.view_count
      } catch (error) {
        console.error('조회수 증가 실패:', error)
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
