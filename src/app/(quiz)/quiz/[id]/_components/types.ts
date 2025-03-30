import { QuizData, QuestionData } from '@/types/quiz'

// 퀴즈 상태 관리를 위한 타입
// export type QuizState = {
//   status: 'start' | 'quiz' | 'feedback' | 'result'
//   currentQuestionIndex: number
//   score: number
//   currentAnswer: {
//     userAnswer: string
//     isCorrect: boolean
//   }
// }

export interface QuizState {
  status: 'start' | 'quiz' | 'feedback' | 'result'
  currentQuestionIndex: number
  score: number
  currentAnswer: {
    userAnswer: string
    isCorrect: boolean
  }
  // 답변 기록 추가
  answerHistory: {
    questionId: number
    userAnswer: string
    isCorrect: boolean
  }[]
}

export type QuizAction =
  | { type: 'START_QUIZ'; payload: { quizId: number } }
  | {
      type: 'SUBMIT_ANSWER'
      payload: { userAnswer: string; quiz: QuizWithQuestions }
    }
  | { type: 'NEXT_QUESTION'; payload: { totalQuestions: number } }
  | { type: 'RESTART_QUIZ' }
  | { type: 'SAVE_ATTEMPT_TO_DB'; payload: { userId?: string } }

// 질문이 포함된 퀴즈 타입
export type QuizWithQuestions = QuizData & {
  questions: QuestionData[]
}
