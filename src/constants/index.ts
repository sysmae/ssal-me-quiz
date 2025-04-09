export type QuizQuestionType = 'multiple_choice' | 'subjective'
export const QuizQuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice' as const,
  SUBJECTIVE: 'subjective' as const,
} as const
