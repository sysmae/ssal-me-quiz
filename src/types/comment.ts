import { Database } from '@/utils/supabase/types'

export type CommentUpdateData =
  Database['public']['Tables']['quiz_comments']['Update']
export type CommentInsertData =
  Database['public']['Tables']['quiz_comments']['Insert']
export type CommentData = Database['public']['Tables']['quiz_comments']['Row']
