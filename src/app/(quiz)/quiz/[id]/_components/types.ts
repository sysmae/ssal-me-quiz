import { QuizData, QuestionData } from '@/types/quiz'

// 퀴즈 상태 관리를 위한 타입
export type QuizState = {
  status: 'start' | 'quiz' | 'feedback' | 'result'
  currentQuestionIndex: number
  score: number
  currentAnswer: {
    userAnswer: string
    isCorrect: boolean
  }
}

// 퀴즈 액션 타입
export type QuizAction =
  | { type: 'START_QUIZ' }
  | {
      type: 'SUBMIT_ANSWER'
      payload: { userAnswer: string; quiz: QuizWithQuestions }
    }
  | { type: 'NEXT_QUESTION'; payload: { totalQuestions: number } }
  | { type: 'RESTART_QUIZ' }

// 질문이 포함된 퀴즈 타입
export type QuizWithQuestions = QuizData & {
  questions: QuestionData[]
}
