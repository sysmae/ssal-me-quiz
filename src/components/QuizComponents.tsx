// components/QuizComponents.tsx
import React, { useState, useEffect } from 'react'

// 퀴즈 문제 타입 정의
interface QuestionOption {
  id: number
  option_text: string
  is_correct: boolean
}

interface AlternativeAnswer {
  id: number
  alternative_answer: string
}

interface Question {
  id: number
  question_text: string
  question_type: 'multiple_choice' | 'short_answer'
  correct_answer: string
  question_options?: QuestionOption[]
  alternative_answers?: AlternativeAnswer[]
}

// QuizQuestion 컴포넌트 props 타입
interface QuizQuestionProps {
  question: Question
  onAnswer: (answer: string) => void
}

// AnswerFeedback 컴포넌트 props 타입
interface AnswerFeedbackProps {
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
  onNext: () => void
}

// QuizResult 컴포넌트 props 타입
interface QuizResultProps {
  score: number
  totalQuestions: number
  onRestart: () => void
}

// 퀴즈 문제 컴포넌트
export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
}) => {
  const [answer, setAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  // 컴포넌트가 마운트될 때마다 선택된 옵션 초기화
  useEffect(() => {
    setSelectedOption(null)
    setAnswer('')
  }, [question])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAnswer(answer)
    setAnswer('')
  }

  const handleOptionClick = (option: string, index: number) => {
    setSelectedOption(index)
    // 약간의 지연 후 답변 제출 (사용자가 선택을 확인할 시간 제공)
    setTimeout(() => {
      onAnswer(option)
    }, 500)
  }

  // 객관식 문제인지 확인
  const isMultipleChoice =
    question.question_type === 'multiple_choice' &&
    question.question_options &&
    question.question_options.length > 0

  if (!question) {
    return <div className="text-center">문제를 불러오는 중...</div>
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">{question.question_text}</h2>

      {isMultipleChoice ? (
        <div className="space-y-3">
          {question?.question_options?.map((option, index) => (
            <button
              key={option.id || index}
              className={`w-full text-left p-3 border rounded-lg transition-colors ${
                selectedOption === index
                  ? 'bg-blue-100 border-blue-500'
                  : 'hover:bg-blue-50'
              }`}
              onClick={() => handleOptionClick(option.option_text, index)}
              disabled={selectedOption !== null}
            >
              {option.option_text}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답변을 입력하세요"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            제출하기
          </button>
        </form>
      )}
    </div>
  )
}

// 정답 피드백 컴포넌트
export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  correctAnswer,
  userAnswer,
  onNext,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <div
        className={`text-center p-4 rounded-lg mb-4 ${
          isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        <h3
          className={`text-xl font-bold ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isCorrect ? '정답입니다! 👏' : '오답입니다 😢'}
        </h3>
      </div>

      <div className="mb-6">
        <p className="font-medium">제출한 답변:</p>
        <p className={`p-2 rounded ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
          {userAnswer}
        </p>
      </div>

      {!isCorrect && (
        <div className="mb-6">
          <p className="font-medium">정답:</p>
          <p className="p-2 bg-green-50 rounded">{correctAnswer}</p>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        다음 문제
      </button>
    </div>
  )
}

// 퀴즈 결과 컴포넌트
export const QuizResult: React.FC<QuizResultProps> = ({
  score,
  totalQuestions,
  onRestart,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100)

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">퀴즈 결과</h2>
      <div className="mb-6">
        <p className="text-3xl font-bold text-blue-500">
          {score} / {totalQuestions}
        </p>
        <p className="text-lg text-gray-600">정답률: {percentage}%</p>
      </div>

      <p className="mb-6">
        총 {totalQuestions}문제 중 {score}문제를 맞추셨습니다!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRestart}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시작하기
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          홈으로 가기
        </button>
      </div>
    </div>
  )
}

// 진행 상태 표시 컴포넌트
interface ProgressBarProps {
  current: number
  total: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = (current / total) * 100

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div
        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}
