// hooks/useQuizGame.ts
import { useState, useReducer, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  quizReducer,
  initialState,
} from '../app/(quiz)/quiz/[id]/_components/quizReducer'
import { useQuizAttemptsQueries } from '@/hooks/useQuizAttemptsQueries'
import { QuizModeType, QuizQuestionType } from '@/constants'
import { User } from '@supabase/supabase-js'
import { QuizWithQuestions } from '@/types/quiz'

export function useQuizGame(quizId: number, quiz: QuizWithQuestions) {
  const [state, dispatch] = useReducer(quizReducer, initialState)
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [quizMode, setQuizMode] = useState<QuizModeType>(QuizModeType.MIXED)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const { createQuizAttempt } = useQuizAttemptsQueries()

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    fetchUser()
  }, [])

  // 랜덤 문제 선택 함수
  const getRandomQuestions = (
    totalCount: number,
    selectCount: number
  ): number[] => {
    const indices = Array.from({ length: totalCount }, (_, i) => i)
    for (let i = totalCount - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices.slice(0, selectCount)
  }

  // 퀴즈 시작 핸들러
  const handleStartQuiz = (questionCount: number) => {
    if (!quiz) return

    const randomIndices = getRandomQuestions(
      quiz.questions.length,
      questionCount
    )
    setSelectedQuestions(randomIndices)

    dispatch({
      type: 'START_QUIZ',
      payload: { quizId, totalQuestions: questionCount },
    })
  }

  // 답변 제출 핸들러
  const handleAnswer = (userAnswer: string) => {
    if (!quiz) return

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

  // 다음 문제로 이동
  const handleNextQuestion = () => {
    if (!quiz) return

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

  // 현재 문제 타입 확인
  const getCurrentQuestionType = () => {
    if (!quiz || selectedQuestions.length === 0) return null

    const actualQuestionIndex = selectedQuestions[state.currentQuestionIndex]
    const currentQuestion = quiz.questions[actualQuestionIndex]
    return currentQuestion.question_type
  }

  // 결과 저장
  const saveQuizResults = () => {
    if (!quiz) return { attempt: null }

    try {
      const attemptData = {
        quizId,
        correctAnswers: state.attemptData?.correct_answers || 0,
        totalQuestions: selectedQuestions.length,
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

  return {
    state,
    selectedQuestions,
    quizMode,
    setQuizMode,
    handleStartQuiz,
    handleAnswer,
    handleNextQuestion,
    handleRestartQuiz,
    getCurrentQuestionType,
    saveQuizResults,
  }
}
