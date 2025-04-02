'use client'

import { useReducer, useEffect, useState } from 'react'
import { useQuizQueries, useIncrementQuizView } from '@/hooks/useQuizQueries'
import { quizReducer, initialState, QuizState, QuizAction } from './quizReducer'

import StartScreen from './StartScreen'
import QuizScreen from './QuizScreen'
import FeedbackScreen from './FeedbackScreen'
import ResultScreen from './ResultScreen'

import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

import { useQuizAttemptsQueries } from '@/hooks/useQuizAttemptsQueries'

export default function QuizClient({ id }: { id: string }) {
  const [state, dispatch] = useReducer(quizReducer, initialState)
  const { quiz } = useQuizQueries(Number(id))
  const { mutate: incrementViewCount } = useIncrementQuizView(Number(id))
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const { createQuizAttempt } = useQuizAttemptsQueries()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    fetchUser()
  }, [])

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
    if (!quiz) return
    dispatch({
      type: 'START_QUIZ',
      payload: { quizId: quiz.id, totalQuestions: quiz.questions.length },
    })
  }

  // 답변 제출 핸들러
  const handleAnswer = (userAnswer: string) => {
    if (!quiz) return
    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: {
        userAnswer,
        questionId: quiz.questions[state.currentQuestionIndex].id,
        isCorrect:
          quiz.questions[state.currentQuestionIndex].correct_answer ==
          userAnswer,
      },
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

  // 퀴즈 완료 후 결과 저장 함수
  const saveQuizResults = () => {
    if (!quiz) return { attempt: null }

    try {
      const attemptData = {
        quizId: quiz.id,
        correctAnswers: state.attemptData?.correct_answers || 0,
        totalQuestions: quiz.questions.length,
        score: state.attemptData.score || 0,
        userId: user?.id || null,
      }

      // console.log('퀴즈 시도 데이터:', attemptData)

      createQuizAttempt({
        quizAttemptData: {
          quiz_id: attemptData.quizId,
          user_id: attemptData.userId,
          total_questions: attemptData.totalQuestions,
          correct_answers: attemptData.correctAnswers,
          score: attemptData.score,
        },
        quizAttemptQuestionData: state.questionAnswers.map((question) => ({
          question_id: question.question_id,
          user_answer: question.user_answer,
          is_correct: question.is_correct,
        })),
      })

      // console.log('퀴즈 결과가 성공적으로 저장되었습니다.')
      return { attempt: { ...attemptData } }
    } catch (error) {
      // console.error('퀴즈 결과 저장 중 오류 발생:', error)
      return { attempt: null }
    }
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
            onRestart={handleRestartQuiz}
            saveQuizResults={saveQuizResults}
          />
        )}
      </div>
    </div>
  )
}
