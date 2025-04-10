// types/quiz_attempt.ts

import { Database } from '@/database.types'

export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
export type QuizAttemptQuestion =
  Database['public']['Tables']['quiz_attempt_questions']['Row']

export type QuizAttemptInsertData =
  Database['public']['Tables']['quiz_attempts']['Insert']
export type QuizAttemptQuestionInsertData =
  Database['public']['Tables']['quiz_attempt_questions']['Insert']

export type QuizAttemptQuestionUpdateData =
  Database['public']['Tables']['quiz_attempt_questions']['Update']
export type QuizAttemptUpdateData =
  Database['public']['Tables']['quiz_attempts']['Update']

export type QuizAttemptWithQuestions = QuizAttempt & {
  questions: QuizAttemptQuestion[]
}
export type QuizAttemptWithQuestionsData = QuizAttempt & {
  questions: QuizAttemptQuestionInsertData[]
}
