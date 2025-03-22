'use client'

import { useState } from 'react'
import { QuestionInsertData } from '@/types/quiz'

// 새 질문 추가 컴포넌트
const QuestionCreate: React.FC<{
  quizId: number
  onCreateQuestion: (questionData: QuestionInsertData) => void
}> = ({ quizId, onCreateQuestion }) => {
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    correct_answer: '',
    question_type: 'short_answer',
  })

  const handleInputChange = (field: string, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question_text || !newQuestion.correct_answer) {
      alert('질문과 정답을 입력해주세요.')
      return
    }

    // quiz_id를 포함하여 질문 데이터 생성
    onCreateQuestion({
      quiz_id: quizId,
      ...newQuestion,
    })

    // 입력 필드 초기화
    setNewQuestion({
      question_text: '',
      correct_answer: '',
      question_type: 'short_answer',
    })
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 질문 추가</h2>
      <form className="space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            질문 내용
          </label>
          <textarea
            value={newQuestion.question_text}
            onChange={(e) => handleInputChange('question_text', e.target.value)}
            required
            className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            정답
          </label>
          <input
            type="text"
            value={newQuestion.correct_answer}
            onChange={(e) =>
              handleInputChange('correct_answer', e.target.value)
            }
            required
            className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-actions flex justify-end">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            질문 추가
          </button>
        </div>
      </form>
    </div>
  )
}

export default QuestionCreate
