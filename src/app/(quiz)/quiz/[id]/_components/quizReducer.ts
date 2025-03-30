// quizReducer.ts

import { QuizState, QuizAction, QuizWithQuestions } from './types'

// 상태에 퀴즈 시도 데이터 추가
export const initialState: QuizState = {
  status: 'start',
  currentQuestionIndex: 0,
  score: 0,
  currentAnswer: {
    userAnswer: '',
    isCorrect: false,
  },
  // 사용자 답변 기록 추가
  answerHistory: [],
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ': {
      const { quizId } = action.payload
      return {
        ...initialState,
        status: 'quiz',
      }
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

      // 답변 기록에 현재 답변 추가
      const newAnswerRecord = {
        questionId: currentQuestion.id,
        userAnswer,
        isCorrect,
      }

      return {
        ...state,
        status: 'feedback',
        score: isCorrect ? state.score + 1 : state.score,
        currentAnswer: {
          userAnswer,
          isCorrect,
        },
        // 답변 기록 업데이트
        answerHistory: [...state.answerHistory, newAnswerRecord],
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

    // 퀴즈 시도 데이터를 서버에 저장하는 액션 추가
    case 'SAVE_ATTEMPT_TO_DB': {
      // 이 액션은 상태 변경 없이 저장 작업을 트리거하는 용도로만 사용
      // 실제 저장 로직은 useEffect나 별도 함수에서 처리
      return state
    }

    default:
      return state
  }
}
