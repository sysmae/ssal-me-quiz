// quizReducer.ts

import { QuizState, QuizAction, QuizWithQuestions } from './types'

export const initialState: QuizState = {
  status: 'start',
  currentQuestionIndex: 0,
  score: 0,
  currentAnswer: {
    userAnswer: '',
    isCorrect: false,
  },
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initialState,
        status: 'quiz',
      }

    case 'SUBMIT_ANSWER': {
      const { userAnswer, quiz } = action.payload
      const currentQuestion = quiz.questions[state.currentQuestionIndex]

      // 주관식 정답 체크 (대소문자 무시, 공백 제거)
      const normalizedUserAnswer = userAnswer.trim().toLowerCase()
      const normalizedCorrectAnswer = currentQuestion.correct_answer
        .trim()
        .toLowerCase()
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer

      return {
        ...state,
        status: 'feedback',
        score: isCorrect ? state.score + 1 : state.score,
        currentAnswer: {
          userAnswer,
          isCorrect,
        },
      }
    }

    case 'NEXT_QUESTION': {
      const { totalQuestions } = action.payload

      if (state.currentQuestionIndex < totalQuestions - 1) {
        return {
          ...state,
          status: 'quiz',
          currentQuestionIndex: state.currentQuestionIndex + 1,
        }
      } else {
        return {
          ...state,
          status: 'result',
        }
      }
    }

    case 'RESTART_QUIZ':
      return initialState

    default:
      return state
  }
}
