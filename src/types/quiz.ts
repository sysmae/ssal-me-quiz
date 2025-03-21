export interface QuizUpdateData {
  title?: string
  description?: string
  // 기타 업데이트 가능한 필드들
}

export interface QuizCreateData {
  title: string
  description?: string
}

// types/quiz.ts
export interface QuizData {
  title: string
  description?: string
  thumbnail_url?: string
  userId: string
  questions: QuestionData[]
}

export interface QuestionData {
  question_text: string
  correct_answer: string
  alternative_answers?: string[]
  question_type: string // 추가됨
  question_image_url?: string // 추가됨
  order_number: number // order 대신 order_number 사용
}
