// 3. 타입과 상수 객체 모두 정의
export type QuizQuestionType = 'multiple_choice' | 'subjective'
export const QuizQuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice' as const,
  SUBJECTIVE: 'subjective' as const,
} as const
