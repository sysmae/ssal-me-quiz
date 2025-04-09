// types/quiz.ts

import { Database } from '@/utils/supabase/types'

export type QuizUpdateData = Database['public']['Tables']['quizzes']['Update']
export type QuestionUpdateData =
  Database['public']['Tables']['quiz_questions']['Update'] & {
    options?: OptionUpdateData[] | OptionInsertData[]
  }

export type QuizInsertData = Database['public']['Tables']['quizzes']['Insert']
export type QuestionInsertData =
  Database['public']['Tables']['quiz_questions']['Insert'] & {
    options?: OptionInsertData[]
  }

export type QuizData = Database['public']['Tables']['quizzes']['Row']

// 옵션 타입 추가
export type OptionData = Database['public']['Tables']['quiz_options']['Row']
export type OptionInsertData =
  Database['public']['Tables']['quiz_options']['Insert']
export type OptionUpdateData =
  Database['public']['Tables']['quiz_options']['Update']

// 질문 타입 확장
export type QuestionData =
  Database['public']['Tables']['quiz_questions']['Row'] & {
    options?: OptionData[]
  }

// 퀴즈 확장 타입
export type QuizWithQuestions = QuizData & {
  questions: QuestionData[]
}
