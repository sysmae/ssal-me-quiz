'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PlusCircle, Trash2, CheckCircle, Save, X } from 'lucide-react'
import {
  OptionInsertData,
  QuestionInsertData,
  QuestionUpdateData,
} from '@/types/quiz'
import { QuizQuestionType } from '@/constants'
import { Card, CardContent } from '@/components/ui/card'

interface MultipleChoiceManagerProps {
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

const MultipleChoiceManager: React.FC<MultipleChoiceManagerProps> = ({
  quizId,
  onCreateQuestion,
  onUpdateQuestion,
  editingState = false,
  existingQuestion,
  onCancelEdit,
}) => {
  const defaultOptions = [
    {
      option_text: '',
      is_correct: false,
      question_id: existingQuestion?.id || 0, // 기본값 0 설정
    },
    {
      option_text: '',
      is_correct: false,
      question_id: existingQuestion?.id || 0, // 기본값 0 설정
    },
  ]

  const [options, setOptions] = useState<OptionInsertData[]>(
    existingQuestion?.options?.length
      ? existingQuestion.options.map((opt) => ({
          ...opt,
          option_text: opt.option_text || '', // 기본값 설정
          question_id: opt.question_id ?? existingQuestion.id, // 기본값 설정
        }))
      : defaultOptions
  )
  const [questionText, setQuestionText] = useState(
    existingQuestion?.question_text || ''
  )

  // 선택지 추가
  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        option_text: '',
        is_correct: false,
        question_id: existingQuestion?.id || 0,
      },
    ])
  }

  // 선택지 제거
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
  }

  // 선택지 텍스트 변경
  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index].option_text = text
    setOptions(newOptions)
  }

  // 정답 설정
  const handleSetCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }))
    setOptions(newOptions)
  }

  // 폼 초기화
  const resetForm = () => {
    setOptions(defaultOptions)
    setQuestionText('')
  }

  // 저장 처리
  const handleSave = () => {
    // 유효성 검사
    if (!questionText.trim()) {
      alert('문제를 입력해주세요.')
      return
    }

    if (!options.some((opt) => opt.option_text.trim())) {
      alert('최소 하나 이상의 선택지를 입력해주세요.')
      return
    }

    if (!options.some((opt) => opt.is_correct)) {
      alert('정답을 최소 하나 선택해주세요.')
      return
    }

    if (editingState && existingQuestion && onUpdateQuestion) {
      const validOptions = options.map((opt) => ({
        ...opt,
        option_text: opt.option_text || '', // 기본값 설정
        question_id: existingQuestion.id,
      }))

      onUpdateQuestion(existingQuestion.id, {
        question_text: questionText,
        question_type: QuizQuestionType.MULTIPLE_CHOICE,
        correct_answer:
          validOptions.find((opt) => opt.is_correct)?.option_text || '',
        options: validOptions,
      })
      if (onCancelEdit) onCancelEdit()
    } else if (onCreateQuestion) {
      // 문제 생성
      onCreateQuestion({
        quiz_id: quizId,
        question_text: questionText,
        question_type: QuizQuestionType.MULTIPLE_CHOICE,
        correct_answer:
          options.find((opt) => opt.is_correct)?.option_text || '',
        options: options,
      })
      // 폼 초기화
      resetForm()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>문제</Label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="문제를 입력하세요"
          className="mt-1"
        />
      </div>

      <div>
        <Label>선택지 관리</Label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleSetCorrect(index)}
              className={`p-2 rounded-md ${
                option.is_correct
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="h-5 w-5" />
            </button>
            <Input
              value={option.option_text}
              onChange={(e) => handleOptionTextChange(index, e.target.value)}
              placeholder={`선택지 ${index + 1}`}
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(index)}
                className="text-red-500 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          onClick={handleAddOption}
          variant="outline"
          className="w-full mt-2"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          선택지 추가
        </Button>
      </div>

      {/* 저장/취소 버튼 */}
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
  )
}

export default MultipleChoiceManager
