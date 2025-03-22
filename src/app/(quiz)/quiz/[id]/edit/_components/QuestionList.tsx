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
    <div className="question-list">
      {questions.length === 0 ? (
        <p>등록된 질문이 없습니다.</p>
      ) : (
        questions.map((question) => (
          <div key={question.id} className="question-card">
            {editingQuestionId === question.id ? (
              <form onSubmit={handleSubmit} className="question-edit-form">
                <div className="form-group">
                  <label>질문 내용</label>
                  <textarea
                    value={editFormData?.question_text || ''}
                    onChange={(e) =>
                      handleFormChange('question_text', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>정답</label>
                  <input
                    type="text"
                    value={editFormData?.correct_answer || ''}
                    onChange={(e) =>
                      handleFormChange('correct_answer', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit">저장</button>
                  <button type="button" onClick={() => onEditQuestion(null)}>
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="question-answer">
                  <strong>정답:</strong> {question.correct_answer}
                  <p>{question.question_text}</p>
                </div>
                <div className="question-actions">
                  <button onClick={() => handleEditClick(question)}>
                    수정
                  </button>
                  <button onClick={() => onDeleteQuestion(question.id)}>
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
