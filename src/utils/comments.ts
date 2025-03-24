// utils/comments.ts
import { createClient } from '@/utils/supabase/client'
import {
  CommentData,
  CommentInsertData,
  CommentUpdateData,
} from '@/types/comment'

const supabase = createClient()

export const comments = {
  // 댓글 목록 가져오기
  getByQuizId: async (quizId: number) => {
    const { data, error } = await supabase
      .from('quiz_comments')
      .select(
        `
        *,
        user:user_id (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // 댓글 추가
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
        user:user_id (
          id,
          name,
          avatar_url
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
        user:user_id (
          id,
          name,
          avatar_url
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
    return count || 0
  },
}
