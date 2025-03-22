'use client'
import { useState } from 'react'
import { QuestionUpdateData } from '@/types/quiz'
import Image from 'next/image'

interface Question {
  correct_answer: string
  id: number
  order_number: number
  question_image_url: string | null
  question_text: string
  question_type: string
  quiz_id: number | null
}

interface QuestionListProps {
  questions: Question[]
  editingQuestionId: number | null
  onEditQuestion: (questionId: number | null) => void
  onUpdateQuestion: (questionData: QuestionUpdateData) => void
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

  const handleEditClick = (question: Question) => {
    onEditQuestion(question.id)
    setEditFormData({
      id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      correct_answer: question.correct_answer,
      order_number: question.order_number,
      question_image_url: question.question_image_url,
      quiz_id: question.quiz_id,
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
      onUpdateQuestion(editFormData)
      setEditFormData(null)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 이미지 업로드 로직 구현
    // 실제 구현에서는 파일을 서버에 업로드하고 URL을 받아와야 합니다
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // 임시 URL 생성 (실제 구현에서는 서버에 업로드 후 URL을 받아와야 함)
      const tempUrl = URL.createObjectURL(file)
      handleFormChange('question_image_url', tempUrl)
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
                  <label>질문 순서</label>
                  <input
                    type="number"
                    value={editFormData?.order_number || 0}
                    onChange={(e) =>
                      handleFormChange('order_number', Number(e.target.value))
                    }
                    required
                  />
                </div>
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
                  <label>질문 유형</label>
                  <select
                    value={editFormData?.question_type || ''}
                    onChange={(e) =>
                      handleFormChange('question_type', e.target.value)
                    }
                    required
                  >
                    <option value="multiple_choice">객관식</option>
                    <option value="true_false">참/거짓</option>
                    <option value="short_answer">주관식</option>
                  </select>
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
                <div className="form-group">
                  <label>이미지</label>
                  {editFormData?.question_image_url && (
                    <div className="image-preview">
                      <img
                        src={editFormData.question_image_url}
                        alt="질문 이미지"
                        width={200}
                        height={150}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
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
                <div className="question-header">
                  <span className="question-number">
                    {question.order_number}번
                  </span>
                  <span className="question-type">
                    {question.question_type === 'multiple_choice'
                      ? '객관식'
                      : question.question_type === 'true_false'
                      ? '참/거짓'
                      : question.question_type === 'short_answer'
                      ? '주관식'
                      : '기타'}
                  </span>
                </div>
                <div className="question-content">
                  <p>{question.question_text}</p>
                  {question.question_image_url && (
                    <div className="question-image">
                      <img
                        src={question.question_image_url}
                        alt="질문 이미지"
                        width={200}
                        height={150}
                      />
                    </div>
                  )}
                </div>
                <div className="question-answer">
                  <strong>정답:</strong> {question.correct_answer}
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
