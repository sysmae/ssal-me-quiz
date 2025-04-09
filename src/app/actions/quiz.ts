'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { QuizUpdateData } from '@/types/quiz'

// 퀴즈 업데이트
export async function updateQuiz(id: number, updates: QuizUpdateData) {
  // 함수 내부에서 클라이언트 생성
  const supabase = await createClient()

  // published 상태를 변경하려는 경우 문제 수 검증 추가
  if (updates.published !== undefined && updates.published === true) {
    // 현재 퀴즈의 문제 수 조회
    const { data: questionData, error: questionError } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact' })
      .eq('quiz_id', id)

    if (questionError) throw questionError

    // 문제 수가 5개 미만인 경우 에러 발생
    if (!questionData || questionData.length < 5) {
      throw new Error(
        '퀴즈는 최소 5개 이상의 문제가 있어야 공개할 수 있습니다.'
      )
    }
  }

  const { data, error } = await supabase
    .from('quizzes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // 해당 퀴즈 페이지 리밸리데이트
  revalidatePath(`/quiz/${id}`)

  return data
}

// 퀴즈 삭제 함수 수정
export async function deleteQuiz(id: number) {
  const supabase = await createClient()

  // 먼저 퀴즈의 중요도 지표 확인 (좋아요 수, 조회수)
  const { data: quizData, error: quizError } = await supabase
    .from('quizzes')
    .select('like_count, view_count, published')
    .eq('id', id)
    .single()

  if (quizError) throw quizError

  // 중요 퀴즈 기준 설정
  const LIKE_THRESHOLD = 30 // 좋아요 30개 이상
  const VIEW_THRESHOLD = 100 // 조회수 100회 이상

  // 중요 퀴즈인 경우 삭제 불가, 오류 메시지 반환
  if (
    quizData.like_count >= LIKE_THRESHOLD ||
    quizData.view_count >= VIEW_THRESHOLD
  ) {
    throw new Error(
      `이 퀴즈는 ${quizData.like_count}개의 좋아요와 ${quizData.view_count}회의 조회수가 있어 삭제할 수 없습니다. 대신 비공개로 설정할 수 있습니다.`
    )
  }

  // 중요하지 않은 퀴즈는 정상적으로 삭제 진행
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) throw error

  // 퀴즈 목록 페이지 리밸리데이트
  revalidatePath('/quiz')

  return { success: true }
}

// 빈 퀴즈 생성
export async function createEmptyQuiz() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('User not found')

  const userId = userData.user.id

  // 기본값으로 퀴즈 생성
  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert({
      title: '새 퀴즈',
      description: '',
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error

  // 퀴즈 목록 페이지 리밸리데이트
  revalidatePath('/quiz')

  return quiz.id
}

// 좋아요 추가
export async function addLike(quizId: number) {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('User not found')

  const userId = userData.user.id

  // 1. 좋아요 추가
  const { error: likeError } = await supabase.from('quiz_likes').upsert({
    user_id: userId,
    quiz_id: quizId,
  })

  if (likeError) throw likeError

  // 2. 좋아요 카운트 증가
  try {
    const { data, error } = await supabase.rpc('add_quiz_like', {
      quiz_id: quizId,
    })

    if (error) throw error

    // 해당 퀴즈 페이지 리밸리데이트
    revalidatePath(`/quiz/${quizId}`)

    return data
  } catch (error) {
    throw error
  }
}

// 좋아요 제거
export async function removeLike(quizId: number) {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('User not found')

  const userId = userData.user.id

  // 1. 좋아요 삭제
  const { error: unlikeError } = await supabase
    .from('quiz_likes')
    .delete()
    .eq('user_id', userId)
    .eq('quiz_id', quizId)

  if (unlikeError) throw unlikeError

  // 2. 좋아요 카운트 감소
  try {
    const { data, error } = await supabase.rpc('remove_quiz_like', {
      quiz_id: quizId,
    })

    if (error) throw error

    // 해당 퀴즈 페이지 리밸리데이트
    revalidatePath(`/quiz/${quizId}`)

    return data
  } catch (error) {
    throw error
  }
}

// 썸네일 업로드 함수
export async function uploadThumbnail(file: File) {
  const supabase = await createClient()

  try {
    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('사용자 인증이 필요합니다.')
    }

    // 파일 크기 제한 확인 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('파일 크기는 5MB 이하여야 합니다.')
    }

    // 파일 확장자 추출 및 유효성 검사
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
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
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('quiz-assets')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      })

    if (uploadError) {
      throw new Error(`파일 업로드 실패: ${uploadError.message}`)
    }

    // 업로드된 파일의 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('quiz-assets')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`썸네일 업로드 실패: ${error.message}`)
    } else {
      throw new Error('썸네일 업로드 중 알 수 없는 오류가 발생했습니다.')
    }
  }
}

// 썸네일 삭제 함수
export async function deleteThumbnail(thumbnail_url: string, quizId: number) {
  const supabase = await createClient()

  try {
    // 퀴즈의 썸네일 URL을 null로 업데이트
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ thumbnail_url: null })
      .eq('id', quizId)

    if (updateError) {
      throw new Error(`퀴즈 업데이트 실패: ${updateError.message}`)
    }

    // URL에서 파일 경로 추출
    const urlObj = new URL(thumbnail_url)
    const pathSegments = urlObj.pathname.split('/')
    const fileName = pathSegments[pathSegments.length - 1]
    const filePath = `quiz-thumbnails/${fileName}`

    // Supabase Storage에서 파일 삭제
    const { error: removeError } = await supabase.storage
      .from('quiz-assets')
      .remove([filePath])

    if (removeError) {
      throw new Error(`썸네일 삭제 실패: ${removeError.message}`)
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`썸네일 삭제 실패: ${error.message}`)
    } else {
      throw new Error('썸네일 삭제 중 알 수 없는 오류가 발생했습니다.')
    }
  }
}
