'use client'

import React, { useState } from 'react'
import {
  QuestionData,
  QuestionInsertData,
  QuestionUpdateData,
} from '@/types/quiz'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MultipleChoiceManager from './MultipleChoiceManager'
import SubjectiveQuestionManager from './SubjectiveQuestionManager'
import { QuizQuestionType } from '@/constants'

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
  const [editingStates, setEditingStates] = useState<Record<number, boolean>>(
    {}
  )
  const [newQuestionType, setNewQuestionType] = useState<QuizQuestionType>(
    QuizQuestionType.SUBJECTIVE
  )

  const toggleEditMode = (question: QuestionData) => {
    setEditingStates((prev) => ({
      ...prev,
      [question.id]: !prev[question.id],
    }))
  }

  // 정렬된 질문 배열 생성 (ID 기준 오름차순)
  const sortedQuestions = [...questions].sort((a, b) => a.id - b.id)

  return (
    <div>
      {/* 새 질문 추가 섹션 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">새 질문 추가</h3>
          <div className="space-y-4">
            <Tabs
              value={newQuestionType}
              onValueChange={(value) =>
                setNewQuestionType(value as QuizQuestionType)
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={QuizQuestionType.SUBJECTIVE}>
                  주관식
                </TabsTrigger>
                <TabsTrigger value={QuizQuestionType.MULTIPLE_CHOICE}>
                  객관식
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {newQuestionType === QuizQuestionType.SUBJECTIVE ? (
              <SubjectiveQuestionManager
                quizId={quizId}
                onCreateQuestion={onCreateQuestion}
              />
            ) : (
              <MultipleChoiceManager
                quizId={quizId}
                onCreateQuestion={onCreateQuestion}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 기존 질문 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedQuestions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4">
              {editingStates[question.id] ? (
                question.question_type === QuizQuestionType.SUBJECTIVE ? (
                  <SubjectiveQuestionManager
                    quizId={quizId}
                    onUpdateQuestion={onUpdateQuestion}
                    editingState={true}
                    existingQuestion={question}
                    onCancelEdit={() => toggleEditMode(question)}
                  />
                ) : (
                  <MultipleChoiceManager
                    quizId={quizId}
                    onUpdateQuestion={onUpdateQuestion}
                    editingState={true}
                    existingQuestion={question}
                    onCancelEdit={() => toggleEditMode(question)}
                  />
                )
              ) : (
                <div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {question.question_type === QuizQuestionType.SUBJECTIVE
                        ? '주관식'
                        : '객관식'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-500 mb-1">
                      질문
                    </h4>
                    <p>{question.question_text}</p>
                  </div>
                  {question.question_type === QuizQuestionType.SUBJECTIVE && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-500 mb-1">
                        정답
                      </h4>
                      <p className="font-medium">{question.correct_answer}</p>
                    </div>
                  )}
                  {question.question_type ===
                    QuizQuestionType.MULTIPLE_CHOICE &&
                    question.options && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-gray-500 mb-1">
                          선택지
                        </h4>
                        <ul className="space-y-1">
                          {question.options.map((opt, idx) => (
                            <li
                              key={idx}
                              className={`pl-2 ${
                                opt.is_correct ? 'font-bold text-green-600' : ''
                              }`}
                            >
                              {opt.is_correct && '✓ '}
                              {opt.option_text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {/* 해설 표시 추가 */}
                  {question.explanation && (
                    <div className="mb-4 mt-2 p-3 bg-blue-50 rounded-md">
                      <h4 className="font-medium text-sm text-blue-700 mb-1">
                        해설
                      </h4>
                      <p className="text-sm text-blue-900">
                        {question.explanation}
                      </p>
                    </div>
                  )}
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
        ))}
      </div>
    </div>
  )
}

export default QuestionManager
