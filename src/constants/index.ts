export type QuizQuestionType = 'multiple_choice' | 'subjective'
export const QuizQuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice' as const,
  SUBJECTIVE: 'subjective' as const,
} as const

export type QuizModeType = 'mixed' | 'subjective'
export const QuizModeType = {
  MIXED: 'mixed' as const,
  SUBJECTIVE: 'subjective' as const,
} as const
