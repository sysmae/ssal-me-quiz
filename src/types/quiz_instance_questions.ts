// types/quiz_instance_questions.ts

import { Database } from '@/utils/supabase/types'

export type QuizInstanceQuestion =
  Database['public']['Tables']['quiz_instance_questions']['Row']
export type QuizInstanceQuestionInsertData =
  Database['public']['Tables']['quiz_instance_questions']['Insert']
export type QuizInstanceQuestionUpdateData =
  Database['public']['Tables']['quiz_instance_questions']['Update']
