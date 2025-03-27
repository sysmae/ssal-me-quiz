// types/quiz_collection.ts

import { Database } from '@/utils/supabase/types'

export type QuizCollection =
  Database['public']['Tables']['quiz_collections']['Row']
export type QuizCollectionQuestion =
  Database['public']['Tables']['quiz_collection_questions']['Row']
export type QuizCollectionInsertData =
  Database['public']['Tables']['quiz_collections']['Insert']

export type QuizCollectionQuestionInsertData =
  Database['public']['Tables']['quiz_collection_questions']['Insert']
export type QuizCollectionQuestionUpdateData =
  Database['public']['Tables']['quiz_collection_questions']['Update']
export type QuizCollectionUpdateData =
  Database['public']['Tables']['quiz_collections']['Update']

export type QuizCollectionWithQuestions = QuizCollection & {
  questions: QuizCollectionQuestion[]
}
export type QuizCollectionWithQuestionsData = QuizCollection & {
  questions: QuizCollectionQuestionInsertData[]
}
