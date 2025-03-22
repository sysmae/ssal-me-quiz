'use client'
import { useState } from 'react'
import { QuestionUpdateData, QuestionData } from '@/types/quiz'

interface QuestionListProps {
  questions: QuestionData[]
  editingQuestionId: number | null
  onEditQuestion: (questionId: number | null) => void
  onUpdateQuestion: (
    questionId: number,
    questionData: QuestionUpdateData
  ) => void
  onDeleteQuestion: (questionId: number) => void
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  editingQuestionId,
  onEditQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) => {
  const [editFormData, setEditFormData] = useState<QuestionUpdateData | null>(
    null
  )

  const handleEditClick = (question: QuestionData) => {
    onEditQuestion(question.id)
    setEditFormData({
      id: question.id,
      question_text: question.question_text,
      correct_answer: question.correct_answer,
      quiz_id: question.quiz_id,
      // question_type: 'short_answer',
    })
  }

  const handleFormChange = (field: string, value: any) => {
    if (!editFormData) return
    setEditFormData({
      ...editFormData,
      [field]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editFormData) {
      onUpdateQuestion(editFormData.id!, editFormData)
      setEditFormData(null)
    }
  }
  return (
    <div className="question-list space-y-4">
      {questions.length === 0 ? (
        <p className="text-gray-500 text-center">등록된 질문이 없습니다.</p>
      ) : (
        questions.map((question) => (
          <div
            key={question.id}
            className="question-card border rounded-lg p-4 bg-white shadow-md"
          >
            {editingQuestionId === question.id ? (
              <form
                onSubmit={handleSubmit}
                className="question-edit-form space-y-4"
              >
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700">
                    질문 내용
                  </label>
                  <textarea
                    value={editFormData?.question_text || ''}
                    onChange={(e) =>
                      handleFormChange('question_text', e.target.value)
                    }
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
                    value={editFormData?.correct_answer || ''}
                    onChange={(e) =>
                      handleFormChange('correct_answer', e.target.value)
                    }
                    required
                    className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="form-actions flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditQuestion(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="question-answer mb-4">
                  <strong className="text-gray-700">정답:</strong>{' '}
                  <span className="text-gray-900">
                    {question.correct_answer}
                  </span>
                  <p className="mt-2 text-gray-700">{question.question_text}</p>
                </div>
                <div className="question-actions flex space-x-2">
                  <button
                    onClick={() => handleEditClick(question)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(question.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
}
export default QuestionList
