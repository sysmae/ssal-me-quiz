import { createClient } from '@/utils/supabase/client'
import {
  CommentData,
  CommentInsertData,
  CommentWithReplies,
} from '@/types/comment'

const supabase = createClient()

export const comments = {
  // 댓글 목록 가져오기 (계층형 구조로 변환)
  getByQuizId: async (quizId: number) => {
    const { data, error } = await supabase
      .from('quiz_comments')
      .select(
        `
        *,
        users:user_id (
          id,
          name,
          avatar
        )
      `
      )
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // 계층형 구조로 변환
    const commentMap = new Map<number, CommentWithReplies>()
    const rootComments: CommentWithReplies[] = []

    // 모든 댓글을 Map에 저장
    data.forEach((comment: CommentData) => {
      const commentWithReplies = {
        ...comment,
        replies: [],
      }
      commentMap.set(comment.id, commentWithReplies)
    })

    // 부모-자식 관계 설정
    data.forEach((comment: CommentData) => {
      if (comment.parent_id === null) {
        // 최상위 댓글
        rootComments.push(commentMap.get(comment.id)!)
      } else {
        // 답글
        const parentComment = commentMap.get(comment.parent_id)
        if (parentComment && parentComment.replies) {
          parentComment.replies.push(commentMap.get(comment.id)!)
        }
      }
    })

    return rootComments
  },

  // 댓글 추가 (최상위 댓글 또는 답글)
  add: async (commentData: CommentInsertData) => {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('로그인이 필요합니다')

    const { data, error } = await supabase
      .from('quiz_comments')
      .insert({
        ...commentData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        users:user_id (
          id,
          name,
          avatar
        )
      `
      )
      .single()

    if (error) throw error
    return data
  },

  // 댓글 수정
  update: async (id: number, content: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('로그인이 필요합니다')

    const { data, error } = await supabase
      .from('quiz_comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId) // 자신의 댓글만 수정 가능
      .select(
        `
        *,
        users:user_id (
          id,
          name,
          avatar
        )
      `
      )
      .single()

    if (error) throw error
    return data
  },

  // 댓글 삭제
  delete: async (id: number) => {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('로그인이 필요합니다')

    const { error } = await supabase
      .from('quiz_comments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // 자신의 댓글만 삭제 가능

    if (error) throw error
    return true
  },

  // 댓글 개수 가져오기
  getCountByQuizId: async (quizId: number) => {
    const { count, error } = await supabase
      .from('quiz_comments')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', quizId)

    if (error) throw error
    return { count: count || 0 }
  },
}
