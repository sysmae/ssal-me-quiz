'use client'

import { useState } from 'react'
import { Quiz } from '@/lib/schema/quiz'

export default function QuizGeneratorPage() {
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('보통')
  const [questionType, setQuestionType] = useState('혼합')
  const [numQuestions, setNumQuestions] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setQuiz(null)

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          difficulty,
          questionType,
          numQuestions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '퀴즈 생성 중 오류가 발생했습니다.')
      }

      const data = await response.json()
      setQuiz(data)
      setActiveQuestionIndex(0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-6">AI 퀴즈 생성기</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">주제</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="예: 한국 역사, 프로그래밍 기초, 영어 단어 등"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">난이도</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="쉬움">쉬움</option>
              <option value="보통">보통</option>
              <option value="어려움">어려움</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">문제 유형</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="혼합">혼합</option>
              <option value="MULTIPLE_CHOICE">객관식</option>
              <option value="SUBJECTIVE">주관식</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">문제 수</label>
            <input
              type="number"
              min={1}
              max={20}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !subject.trim()}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? '생성 중...' : '퀴즈 생성하기'}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {quiz && quiz.questions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">생성된 퀴즈</h2>
            <div className="text-sm text-gray-500">
              {activeQuestionIndex + 1} / {quiz.questions.length}
            </div>
          </div>

          <div className="mb-4 w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{
                width: `${
                  ((activeQuestionIndex + 1) / quiz.questions.length) * 100
                }%`,
              }}
            ></div>
          </div>

          <div className="mb-6">
            <div className="mb-2 text-sm text-gray-500">
              {quiz.questions[activeQuestionIndex].question_type ===
              'MULTIPLE_CHOICE'
                ? '객관식'
                : '주관식'}
            </div>
            <h3 className="text-lg font-medium mb-4">
              {quiz.questions[activeQuestionIndex].question_text}
            </h3>

            {quiz.questions[activeQuestionIndex].question_type ===
              'MULTIPLE_CHOICE' && (
              <div className="space-y-2 mb-4">
                {quiz.questions[activeQuestionIndex].options?.map(
                  (option, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-md cursor-pointer ${
                        option.is_correct
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {option.option_text}
                      {option.is_correct && (
                        <span className="ml-2 text-green-600 font-medium">
                          ✓ 정답
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {quiz.questions[activeQuestionIndex].question_type ===
              'SUBJECTIVE' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="font-medium text-green-800">정답:</div>
                <div>{quiz.questions[activeQuestionIndex].correct_answer}</div>
              </div>
            )}

            {quiz.questions[activeQuestionIndex].explanation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="font-medium text-blue-800">해설:</div>
                <div className="text-blue-700">
                  {quiz.questions[activeQuestionIndex].explanation}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() =>
                setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))
              }
              disabled={activeQuestionIndex === 0}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              이전
            </button>
            <button
              onClick={() =>
                setActiveQuestionIndex(
                  Math.min(quiz.questions.length - 1, activeQuestionIndex + 1)
                )
              }
              disabled={activeQuestionIndex === quiz.questions.length - 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
