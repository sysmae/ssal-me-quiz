// SubjectiveQuestionManager.tsx
'use client'

import React, { useState } from 'react'
import { QuestionInsertData, QuestionUpdateData } from '@/types/quiz'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, X, PlusCircle } from 'lucide-react'
import { QuizQuestionType } from '@/constants/index'
import ExplanationField from './ExplanationField'

interface SubjectiveQuestionManagerProps {
  quizId: number
  onCreateQuestion?: (questionData: QuestionInsertData) => void
  onUpdateQuestion?: (
    questionId: number,
    questionData: QuestionUpdateData
  ) => void
  editingState?: boolean
  existingQuestion?: QuestionUpdateData & { id: number }
  onCancelEdit?: () => void
}

const SubjectiveQuestionManager: React.FC<SubjectiveQuestionManagerProps> = ({
  quizId,
  onCreateQuestion,
  onUpdateQuestion,
  editingState = false,
  existingQuestion,
  onCancelEdit,
}) => {
  const [questionText, setQuestionText] = useState(
    existingQuestion?.question_text || ''
  )
  const [correctAnswer, setCorrectAnswer] = useState(
    existingQuestion?.correct_answer || ''
  )
  const [explanation, setExplanation] = useState<string | null>(
    existingQuestion?.explanation || null
  )

  const handleSave = () => {
    if (!questionText.trim() || !correctAnswer.trim()) {
      alert('질문과 정답을 입력해주세요.')
      return
    }

    if (editingState && existingQuestion && onUpdateQuestion) {
      onUpdateQuestion(existingQuestion.id, {
        ...existingQuestion,
        question_text: questionText,
        correct_answer: correctAnswer,
        explanation: explanation,
      })
      if (onCancelEdit) onCancelEdit()
    } else if (onCreateQuestion) {
      onCreateQuestion({
        quiz_id: quizId,
        question_text: questionText,
        correct_answer: correctAnswer,
        question_type: QuizQuestionType.SUBJECTIVE,
        explanation: explanation,
      })
      setQuestionText('')
      setCorrectAnswer('')
      setExplanation('')
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="question-text">질문</Label>
            <Textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="질문을 입력하세요"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="correct-answer">정답</Label>
            <Input
              id="correct-answer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="정답을 입력하세요"
              className="mt-1"
            />
          </div>

          {/* 해설 필드 추가 */}
          <ExplanationField
            explanation={explanation}
            onChange={setExplanation}
          />

          <div className="flex justify-end space-x-2">
            {editingState && onCancelEdit && (
              <Button variant="outline" onClick={onCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            )}
            <Button onClick={handleSave} className="bg-indigo-500 text-white">
              {editingState ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  질문 추가
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubjectiveQuestionManager
