'use client'

import { useReducer, useEffect } from 'react'
import { useQuizQueries, useIncrementQuizView } from '@/hooks/useQuizQueries'
import { quizReducer, initialState } from './quizReducer'
import StartScreen from './StartScreen'
import QuizScreen from './QuizScreen'
import FeedbackScreen from './FeedbackScreen'
import ResultScreen from './ResultScreen'
import { QuizWithQuestions } from './types'

export default function QuizClient({ id }: { id: string }) {
  const [state, dispatch] = useReducer(quizReducer, initialState)
  const { quiz: data } = useQuizQueries(Number(id))
  const { mutate: incrementViewCount } = useIncrementQuizView(Number(id))

  // 타입 단언: data가 QuizWithQuestions 타입임을 명시
  const quiz = data as QuizWithQuestions | undefined

  // 로딩 및 에러 상태 확인
  const isLoading = !quiz
  const isError = !quiz

  // 페이지 접속 시 조회수 증가
  useEffect(() => {
    if (quiz) {
      incrementViewWithDuplicatePrevention()
    }
  }, [quiz])

  // 중복 조회수 방지를 위한 함수
  const incrementViewWithDuplicatePrevention = () => {
    // 로컬 스토리지에서 최근 조회 기록 확인
    const viewedQuizzes = JSON.parse(
      localStorage.getItem('viewedQuizzes') || '{}'
    )
    const lastViewTime = viewedQuizzes[id] || 0
    const currentTime = Date.now()

    // 6시간(21600000ms) 내에 조회한 적이 없으면 조회수 증가
    if (currentTime - lastViewTime > 21600000) {
      incrementViewCount()

      // 최근 조회 시간 업데이트
      viewedQuizzes[id] = currentTime
      localStorage.setItem('viewedQuizzes', JSON.stringify(viewedQuizzes))
    }
  }

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
