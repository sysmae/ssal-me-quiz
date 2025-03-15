'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useQuiz } from '@/hooks/useQuizzes'

const QuizDetailPage = () => {
  const params = useParams()
  const id = Number(params.id)
  const [quizState, setQuizState] = useState('start')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState({
    userAnswer: '',
    isCorrect: false,
  })

  const { data: quiz, isLoading, isError } = useQuiz(id)

  // 퀴즈 시작 핸들러
  const handleStartQuiz = () => {
    setQuizState('quiz')
    setCurrentQuestionIndex(0)
    setScore(0)
  }

  // 답변 제출 핸들러
  const handleAnswer = (userAnswer) => {
    if (!quiz) return

    const currentQuestion = quiz.questions[currentQuestionIndex]
    let isCorrect = false

    // 주관식 정답 체크 (대소문자 무시, 공백 제거)
    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedCorrectAnswer = currentQuestion.correct_answer
      .trim()
      .toLowerCase()
    const alternativeAnswers =
      currentQuestion.alternative_answers?.map((alt) =>
        alt.alternative_answer.trim().toLowerCase()
      ) || []

    isCorrect =
      normalizedUserAnswer === normalizedCorrectAnswer ||
      alternativeAnswers.includes(normalizedUserAnswer)

    if (isCorrect) setScore((prev) => prev + 1)

    setCurrentAnswer({
      userAnswer,
      isCorrect,
    })

    setQuizState('feedback')
  }

  // 다음 문제로 이동
  const handleNextQuestion = () => {
    if (!quiz) return

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setQuizState('quiz')
    } else {
      setQuizState('result')
    }
  }

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (isError || !quiz) {
    return <div>오류가 발생했습니다.</div>
  }

  return (
    <div>
      <Navigation />
      <div className="container mx-auto p-4">
        {quizState === 'start' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="my-4">{quiz.description}</p>
            <button
              onClick={handleStartQuiz}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              퀴즈 시작하기
            </button>
          </div>
        )}

        {quizState === 'quiz' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-sm text-gray-500 mb-4">
              {currentQuestionIndex + 1} / {quiz.questions.length}
            </p>
            <h2 className="text-xl font-bold mb-4">
              {quiz.questions[currentQuestionIndex].question_text}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleAnswer(formData.get('answer'))
              }}
            >
              <input
                type="text"
                name="answer"
                className="w-full p-2 border rounded mb-4"
                placeholder="답변을 입력하세요"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                제출하기
              </button>
            </form>
          </div>
        )}

        {quizState === 'feedback' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div
              className={`p-4 rounded mb-4 ${
                currentAnswer.isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <h3 className="font-bold">
                {currentAnswer.isCorrect ? '정답입니다!' : '오답입니다.'}
              </h3>
            </div>
            <p className="mb-2">제출한 답변: {currentAnswer.userAnswer}</p>
            {!currentAnswer.isCorrect && (
              <p className="mb-4">
                정답: {quiz.questions[currentQuestionIndex].correct_answer}
              </p>
            )}
            <button
              onClick={handleNextQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              다음 문제
            </button>
          </div>
        )}

        {quizState === 'result' && (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">퀴즈 결과</h2>
            <p className="text-3xl font-bold text-blue-500 mb-2">
              {score} / {quiz.questions.length}
            </p>
            <p className="mb-4">
              총 {quiz.questions.length}문제 중 {score}문제를 맞추셨습니다!
            </p>
            <button
              onClick={() => setQuizState('start')}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              다시 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizDetailPage
