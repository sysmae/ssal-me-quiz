import { Database } from '@/utils/supabase/types'

// 기본 타입 정의
export type CommentUpdateData =
  Database['public']['Tables']['quiz_comments']['Update']
export type CommentInsertData =
  Database['public']['Tables']['quiz_comments']['Insert']

// 확장된 CommentData 타입 정의
export type CommentData =
  Database['public']['Tables']['quiz_comments']['Row'] & {
    users: {
      id: string
      name: string
      avatar: string | null
    }
    // 계층형 구조를 위한 가상 필드
    replies?: CommentWithReplies[]
  }

// 중첩 댓글을 위한 타입
export type CommentWithReplies = CommentData
