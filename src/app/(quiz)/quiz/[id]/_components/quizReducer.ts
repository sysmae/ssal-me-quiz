// quizReducer.ts

import {
  QuizAttemptInsertData,
  QuizAttemptQuestionInsertData,
} from '@/types/quiz_attempt'

export interface QuizState {
  status: 'start' | 'quiz' | 'feedback' | 'result'
  currentQuestionIndex: number
  currentAnswer: {
    userAnswer: string
    isCorrect: boolean
  }
  attemptData: {
    quiz_id: number
    total_questions: number
    correct_answers: number
    score: number
  }
  questionAnswers: Omit<QuizAttemptQuestionInsertData, 'attempt_id'>[]
}
export type QuizAction =
  | { type: 'START_QUIZ'; payload: { quizId: number; totalQuestions: number } }
  | {
      type: 'SUBMIT_ANSWER'
      payload: { userAnswer: string; questionId: number; isCorrect: boolean }
    }
  | { type: 'NEXT_QUESTION'; payload: { totalQuestions: number } }
  | { type: 'RESTART_QUIZ' }

export const initialState: QuizState = {
  status: 'start',
  currentQuestionIndex: 0,
  currentAnswer: {
    userAnswer: '',
    isCorrect: false,
  },
  attemptData: {
    quiz_id: 0,
    total_questions: 0,
    correct_answers: 0,
    score: 0,
  },
  questionAnswers: [],
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ': {
      const { quizId, totalQuestions } = action.payload
      return {
        ...initialState,
        attemptData: {
          quiz_id: quizId,
          total_questions: totalQuestions,
          correct_answers: 0,
          score: 0,
        },
        status: 'quiz',
      }
    }

    case 'SUBMIT_ANSWER': {
      const { userAnswer, questionId, isCorrect } = action.payload

      // 답변 기록 추가
      const newAnswerRecord = {
        question_id: questionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
      }

      return {
        ...state,
        currentAnswer: {
          userAnswer,
          isCorrect,
        },
        attemptData: {
          ...state.attemptData,
          correct_answers:
            (state.attemptData?.correct_answers || 0) + (isCorrect ? 1 : 0),
        },
        questionAnswers: [...state.questionAnswers, newAnswerRecord],
        status: 'feedback',
      }
    }

    case 'NEXT_QUESTION': {
      const { totalQuestions } = action.payload

      if (state.currentQuestionIndex < totalQuestions - 1) {
        return {
          ...state,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          status: 'quiz',
        }
      } else {
        // 마지막 질문에 도달했을 때 점수 계산
        const finalScore = parseFloat(
          (
            (state.attemptData.correct_answers /
              state.attemptData.total_questions) *
            100
          ).toFixed(2) // 점수 계산 (소수점 2자리까지)
        )
        return {
          ...state,
          attemptData: {
            ...state.attemptData,
            score: finalScore, // 최종 점수 업데이트
          },
          status: 'result',
        }
      }
    }

    case 'RESTART_QUIZ': {
      return initialState
    }

    default:
      return state
  }
}
