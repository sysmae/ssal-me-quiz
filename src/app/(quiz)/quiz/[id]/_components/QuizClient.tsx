'use client'

import { useReducer, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizQueries, useIncrementQuizView } from '@/hooks/useQuizQueries'
import { quizReducer, initialState } from './quizReducer'
import StartScreen from './StartScreen'
import QuizScreen from './QuizScreen'
import FeedbackScreen from './FeedbackScreen'
import ResultScreen from './ResultScreen'
import { QuizWithQuestions } from './types'
import { useQuizAttemptWithSave } from '@/hooks/useQuizAttemptQueries'

export default function QuizClient({ id }: { id: string }) {
  const router = useRouter()
  const [state, dispatch] = useReducer(quizReducer, initialState)
  const { quiz: data } = useQuizQueries(Number(id))
  const { mutate: incrementViewCount } = useIncrementQuizView(Number(id))
  const [currentQuiz, setCurrentQuiz] = useState<QuizWithQuestions | null>(null)

  // 사용자 답변 저장을 위한 상태
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      questionId: number
      userAnswer: string
      isCorrect: boolean
    }>
  >([])

  // 퀴즈 시도 관련 훅
  const { attemptId, saveQuizResults, isSaving } = useQuizAttemptWithSave()

  // 타입 단언: data가 QuizWithQuestions 타입임을 명시
  const quiz = data as QuizWithQuestions | undefined

  // 로딩 및 에러 상태 확인
  const isLoading = !quiz
  const isError = !quiz

  // 페이지 접속 시 조회수 증가
  useEffect(() => {
    if (quiz) {
      incrementViewWithDuplicatePrevention()
      setCurrentQuiz(quiz) // 초기 퀴즈 데이터 설정
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

  const handleStartQuiz = (selectedQuestions: any[], newAttemptId: number) => {
    // 현재 퀴즈 설정
    setCurrentQuiz({
      ...quiz!,
      questions: selectedQuestions,
    })

    // 사용자 답변 초기화
    setUserAnswers([])

    dispatch({ type: 'START_QUIZ' })
  }

  // 답변 제출 핸들러
  const handleAnswer = (userAnswer: string) => {
    if (!currentQuiz) return

    const currentQuestion = currentQuiz.questions[state.currentQuestionIndex]

    // 정답 확인 (대소문자 무시, 공백 제거)
    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedCorrectAnswer = currentQuestion.correct_answer
      .trim()
      .toLowerCase()
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer

    // 로컬 상태에 답변 저장
    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        userAnswer,
        isCorrect,
      },
    ])

    // 답변 제출
    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: { userAnswer, quiz: currentQuiz },
    })
  }

  // 다음 문제로 이동
  const handleNextQuestion = () => {
    if (!currentQuiz) return
    dispatch({
      type: 'NEXT_QUESTION',
      payload: { totalQuestions: currentQuiz.questions.length },
    })
  }

  // 퀴즈 재시작
  const handleRestartQuiz = () => {
    dispatch({ type: 'RESTART_QUIZ' })
  }

  // 결과 저장 및 결과 페이지로 이동
  const handleSaveResults = async () => {
    if (!attemptId || !currentQuiz || userAnswers.length === 0) return

    try {
      // 퀴즈 결과 저장
      const savedAttemptId = await saveQuizResults(userAnswers)

      // 결과 페이지로 이동
      router.push(`/my/quiz-result/${savedAttemptId}`)
    } catch (error) {
      console.error('결과 저장 실패:', error)
    }
  }

  // 모든 문제를 풀었을 때 결과 저장
  useEffect(() => {
    if (state.status === 'result' && attemptId && userAnswers.length > 0) {
      handleSaveResults()
    }
  }, [state.status, attemptId, userAnswers.length])

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (isError || !quiz) {
    return <div>오류가 발생했습니다.</div>
  }

  return (
    <div className="container mx-auto p-4">
      {state.status === 'start' && (
        <StartScreen quiz={quiz} onStart={handleStartQuiz} />
      )}

      {state.status === 'quiz' && currentQuiz && (
        <QuizScreen
          quiz={currentQuiz}
          currentQuestionIndex={state.currentQuestionIndex}
          onSubmit={handleAnswer}
        />
      )}

      {state.status === 'feedback' && currentQuiz && (
        <FeedbackScreen
          quiz={currentQuiz}
          currentQuestionIndex={state.currentQuestionIndex}
          currentAnswer={state.currentAnswer}
          onNext={handleNextQuestion}
        />
      )}

      {state.status === 'result' && currentQuiz && (
        <ResultScreen
          quiz={currentQuiz}
          score={state.score}
          onRestart={handleRestartQuiz}
          attemptId={attemptId}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
