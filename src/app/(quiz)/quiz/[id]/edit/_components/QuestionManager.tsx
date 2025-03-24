'use client'

import React, { useState } from 'react'
import {
  QuestionData,
  QuestionInsertData,
  QuestionUpdateData,
} from '@/types/quiz'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, Save, X, PlusCircle } from 'lucide-react'

interface QuestionManagerProps {
  quizId: number
  questions: QuestionData[]
  onUpdateQuestion: (
    questionId: number,
    questionData: QuestionUpdateData
  ) => void
  onDeleteQuestion: (questionId: number) => void
  onCreateQuestion: (questionData: QuestionInsertData) => void
}

const QuestionManager: React.FC<QuestionManagerProps> = ({
  quizId,
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  onCreateQuestion,
}) => {
  // 각 질문별 수정 상태 관리
  const [editingStates, setEditingStates] = useState<Record<number, boolean>>(
    {}
  )

  // 수정 중인 질문 데이터 관리
  const [editFormData, setEditFormData] = useState<
    Record<number, QuestionUpdateData>
  >({})

  // 새 질문 데이터
  const [newQuestion, setNewQuestion] = useState<QuestionInsertData>({
    quiz_id: quizId,
    question_text: '',
    correct_answer: '',
    question_type: 'short_answer',
  })

  // 질문 수정 모드 토글
  const toggleEditMode = (question: QuestionData) => {
    const questionId = question.id
    setEditingStates((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))

    if (!editingStates[questionId]) {
      // 수정 모드로 전환할 때 현재 질문 데이터로 폼 초기화
      setEditFormData((prev) => ({
        ...prev,
        [questionId]: {
          id: questionId,
          question_text: question.question_text,
          correct_answer: question.correct_answer,
          quiz_id: question.quiz_id,
        },
      }))
    }
  }

  // 수정 폼 데이터 변경 처리
  const handleEditFormChange = (
    questionId: number,
    field: string,
    value: string
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }))
  }

  // 질문 수정 제출
  const handleUpdateSubmit = (questionId: number) => {
    if (editFormData[questionId]) {
      onUpdateQuestion(questionId, editFormData[questionId])
      setEditingStates((prev) => ({
        ...prev,
        [questionId]: false,
      }))
    }
  }

  // 새 질문 입력 처리
  const handleNewQuestionChange = (field: string, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 새 질문 추가
  const handleAddQuestion = () => {
    if (!newQuestion.question_text || !newQuestion.correct_answer) {
      alert('질문과 정답을 모두 입력해주세요.')
      return
    }

    onCreateQuestion(newQuestion)

    // 입력 필드 초기화
    setNewQuestion({
      quiz_id: quizId,
      question_text: '',
      correct_answer: '',
      question_type: 'short_answer',
    })
  }

  return (
    <div>
      {/* 새 질문 추가 카드 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">새 질문 추가</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-question">질문</Label>
              <Textarea
                id="new-question"
                value={newQuestion.question_text}
                onChange={(e) =>
                  handleNewQuestionChange('question_text', e.target.value)
                }
                placeholder="질문을 입력하세요"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-answer">정답</Label>
              <Input
                id="new-answer"
                value={newQuestion.correct_answer}
                onChange={(e) =>
                  handleNewQuestionChange('correct_answer', e.target.value)
                }
                placeholder="정답을 입력하세요"
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleAddQuestion}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              질문 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 질문 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.length > 0 ? (
          questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-4">
                {editingStates[question.id] ? (
                  // 수정 모드
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`question-${question.id}`}>질문</Label>
                      <Textarea
                        id={`question-${question.id}`}
                        value={
                          editFormData[question.id]?.question_text ||
                          question.question_text
                        }
                        onChange={(e) =>
                          handleEditFormChange(
                            question.id,
                            'question_text',
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`answer-${question.id}`}>정답</Label>
                      <Input
                        id={`answer-${question.id}`}
                        value={
                          editFormData[question.id]?.correct_answer ||
                          question.correct_answer
                        }
                        onChange={(e) =>
                          handleEditFormChange(
                            question.id,
                            'correct_answer',
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleEditMode(question)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        취소
                      </Button>
                      <Button
                        onClick={() => handleUpdateSubmit(question.id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 보기 모드
                  <div>
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-500 mb-1">
                        질문
                      </h4>
                      <p>{question.question_text}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-500 mb-1">
                        정답
                      </h4>
                      <p className="font-medium">{question.correct_answer}</p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEditMode(question)}
                        className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteQuestion(question.id)}
                        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 mb-2">아직 등록된 질문이 없습니다.</p>
            <p className="text-gray-500">
              위 폼을 사용하여 새 질문을 추가해보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionManager
