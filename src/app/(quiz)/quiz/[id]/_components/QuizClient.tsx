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
import { QuizQuestionType } from '@/constants'
import MultipleChoiceQuizScreen from './MultipleChoiceQuizScreen'

export default function QuizClient({ id }: { id: string }) {
  const [state, dispatch] = useReducer(quizReducer, initialState)
  const { quiz } = useQuizQueries(Number(id))
  const { mutate: incrementViewCount } = useIncrementQuizView(Number(id))
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const { createQuizAttempt } = useQuizAttemptsQueries()

  // 선택된 문제들을 저장할 상태 추가
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  // 퀴즈 모드 상태 추가 - QuizQuestionType 타입 사용
  const [quizMode, setQuizMode] = useState<QuizQuestionType>(
    QuizQuestionType.SUBJECTIVE
  )
  // 기존 코드 유지
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
    // 기존 코드 유지
    const viewedQuizzes = JSON.parse(
      localStorage.getItem('viewedQuizzes') || '{}'
    )
    const lastViewTime = viewedQuizzes[id] || 0
    const currentTime = Date.now()

    if (currentTime - lastViewTime > 21600000) {
      incrementViewCount()
      viewedQuizzes[id] = currentTime
      localStorage.setItem('viewedQuizzes', JSON.stringify(viewedQuizzes))
    }
  }

  // 랜덤하게 문제 선택하는 함수
  const getRandomQuestions = (
    totalCount: number,
    selectCount: number
  ): number[] => {
    // Fisher-Yates 셔플 알고리즘 사용
    const indices = Array.from({ length: totalCount }, (_, i) => i)
    for (let i = totalCount - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices.slice(0, selectCount)
  }

  // 현재 문제의 타입 확인
  const getCurrentQuestionType = () => {
    if (!quiz || selectedQuestions.length === 0) return null

    const actualQuestionIndex = selectedQuestions[state.currentQuestionIndex]
    const currentQuestion = quiz.questions[actualQuestionIndex]
    return currentQuestion.question_type
  }

  // 퀴즈 시작 핸들러 수정
  const handleStartQuiz = (questionCount: number) => {
    if (!quiz) return

    // 선택한 갯수만큼 랜덤하게 문제 선택
    const randomIndices = getRandomQuestions(
      quiz.questions.length,
      questionCount
    )
    setSelectedQuestions(randomIndices)

    // 선택한 문제 갯수를 total_questions로 설정
    dispatch({
      type: 'START_QUIZ',
      payload: { quizId: quiz.id, totalQuestions: questionCount },
    })
  }

  // 답변 제출 핸들러 수정
  const handleAnswer = (userAnswer: string) => {
    if (!quiz) return

    // 선택된 문제 인덱스를 사용하여 실제 문제 가져오기
    const actualQuestionIndex = selectedQuestions[state.currentQuestionIndex]
    const currentQuestion = quiz.questions[actualQuestionIndex]

    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: {
        userAnswer,
        questionId: currentQuestion.id,
        isCorrect: currentQuestion.correct_answer === userAnswer,
      },
    })
  }

  // 다음 문제로 이동 핸들러 수정
  const handleNextQuestion = () => {
    if (!quiz) return

    // 선택한 문제 갯수를 totalQuestions로 전달
    dispatch({
      type: 'NEXT_QUESTION',
      payload: { totalQuestions: selectedQuestions.length },
    })
  }

  // 퀴즈 재시작
  const handleRestartQuiz = () => {
    setSelectedQuestions([])
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
        totalQuestions: selectedQuestions.length, // 선택한 문제 갯수 사용
        score: state.attemptData.score || 0,
        userId: user?.id || null,
      }

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

      return { attempt: { ...attemptData } }
    } catch (error) {
      return { attempt: null }
    }
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        {state.status === 'start' && (
          <StartScreen
            quiz={quiz}
            onStart={handleStartQuiz}
            quizMode={quizMode}
            setQuizMode={setQuizMode}
          />
        )}

        {state.status === 'quiz' && (
          <>
            {quizMode === QuizQuestionType.SUBJECTIVE ? (
              // 주관식 모드: 모든 문제를 주관식으로 표시
              <QuizScreen
                quiz={quiz}
                currentQuestionIndex={state.currentQuestionIndex}
                selectedQuestions={selectedQuestions}
                onSubmit={handleAnswer}
              />
            ) : // 혼합 모드: 문제 타입에 따라 다른 컴포넌트 표시
            getCurrentQuestionType() === QuizQuestionType.MULTIPLE_CHOICE ? (
              <MultipleChoiceQuizScreen
                quiz={quiz}
                currentQuestionIndex={state.currentQuestionIndex}
                selectedQuestions={selectedQuestions}
                onSubmit={handleAnswer}
              />
            ) : (
              <QuizScreen
                quiz={quiz}
                currentQuestionIndex={state.currentQuestionIndex}
                selectedQuestions={selectedQuestions}
                onSubmit={handleAnswer}
              />
            )}
          </>
        )}

        {state.status === 'feedback' && (
          <FeedbackScreen
            quiz={quiz}
            currentQuestionIndex={state.currentQuestionIndex}
            selectedQuestions={selectedQuestions}
            currentAnswer={state.currentAnswer}
            onNext={handleNextQuestion}
          />
        )}

        {state.status === 'result' && (
          <ResultScreen
            quiz={quiz}
            onRestart={handleRestartQuiz}
            saveQuizResults={saveQuizResults}
            selectedCount={selectedQuestions.length}
          />
        )}
      </div>
    </div>
  )
}
