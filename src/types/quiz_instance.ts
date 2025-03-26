// types/quiz_instance.ts

import { Database } from '@/utils/supabase/types'

export type QuizInstanceUpdateData =
  Database['public']['Tables']['quiz_instances']['Update']
export type QuizInstanceInsertData =
  Database['public']['Tables']['quiz_instances']['Insert']
export type QuizInstance = Database['public']['Tables']['quiz_instances']['Row']
