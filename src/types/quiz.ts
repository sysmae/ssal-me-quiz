// types/quiz.ts

import { Database } from '@/utils/supabase/types'

export type QuizUpdateData = Database['public']['Tables']['quizzes']['Update']
export type QuestionUpdateData =
  Database['public']['Tables']['questions']['Update']

export type QuizInsertData = Database['public']['Tables']['quizzes']['Insert']
export type QuestionInsertData =
  Database['public']['Tables']['questions']['Insert']

export type QuizData = Database['public']['Tables']['quizzes']['Row']
export type QuestionData = Database['public']['Tables']['questions']['Row']
