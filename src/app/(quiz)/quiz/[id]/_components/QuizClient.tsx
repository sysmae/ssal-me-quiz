'use client'

import { useReducer } from 'react'
import { useQuizQueries } from '@/hooks/useQuizQueries'
import { quizReducer, initialState } from './quizReducer'
import StartScreen from './StartScreen'
import QuizScreen from './QuizScreen'
import FeedbackScreen from './FeedbackScreen'
import ResultScreen from './ResultScreen'
import { QuizWithQuestions } from './types'

export default function QuizClient({ id }: { id: string }) {
  const [state, dispatch] = useReducer(quizReducer, initialState)
  const { quiz: data } = useQuizQueries(Number(id))

  // 타입 단언: data가 QuizWithQuestions 타입임을 명시
  const quiz = data as QuizWithQuestions | undefined

  // 로딩 및 에러 상태 확인
  const isLoading = !quiz
  const isError = !quiz

  // 퀴즈 시작 핸들러
  const handleStartQuiz = () => {
    dispatch({ type: 'START_QUIZ' })
  }

  // 답변 제출 핸들러
  const handleAnswer = (userAnswer: string) => {
    if (!quiz) return
    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: { userAnswer, quiz },
    })
  }

  // 다음 문제로 이동
  const handleNextQuestion = () => {
    if (!quiz) return
    dispatch({
      type: 'NEXT_QUESTION',
      payload: { totalQuestions: quiz.questions.length },
    })
  }

  // 퀴즈 재시작
  const handleRestartQuiz = () => {
    dispatch({ type: 'RESTART_QUIZ' })
  }

  // 결과 저장 (선택적 기능)
  const saveQuizResult = async () => {
    // 여기에 quiz_results 테이블에 결과를 저장하는 로직을 추가할 수 있습니다
    // 예: Supabase client를 사용하여 결과 저장
  }

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (isError || !quiz) {
    return <div>오류가 발생했습니다.</div>
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        {state.status === 'start' && (
          <StartScreen quiz={quiz} onStart={handleStartQuiz} />
        )}

        {state.status === 'quiz' && (
          <QuizScreen
            quiz={quiz}
            currentQuestionIndex={state.currentQuestionIndex}
            onSubmit={handleAnswer}
          />
        )}

        {state.status === 'feedback' && (
          <FeedbackScreen
            quiz={quiz}
            currentQuestionIndex={state.currentQuestionIndex}
            currentAnswer={state.currentAnswer}
            onNext={handleNextQuestion}
          />
        )}

        {state.status === 'result' && (
          <ResultScreen
            quiz={quiz}
            score={state.score}
            onRestart={handleRestartQuiz}
          />
        )}
      </div>
    </div>
  )
}
