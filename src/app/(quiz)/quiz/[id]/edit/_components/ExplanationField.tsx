// ExplanationField.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface ExplanationFieldProps {
  explanation: string | null | undefined
  onChange: (explanation: string | null) => void
}

const ExplanationField: React.FC<ExplanationFieldProps> = ({
  explanation,
  onChange,
}) => {
  // 토글 상태를 별도로 관리
  const [useExplanation, setUseExplanation] = useState<boolean>(!!explanation)
  // 현재 입력된 텍스트를 별도로 관리
  const [explanationText, setExplanationText] = useState<string>(
    explanation || ''
  )

  // 외부에서 explanation이 변경될 때만 상태 업데이트
  useEffect(() => {
    // 외부에서 값이 변경된 경우에만 상태 업데이트
    if (explanation !== undefined && explanation !== null) {
      setExplanationText(explanation)
      setUseExplanation(true)
    } else if (explanation === null) {
      // null로 명시적으로 설정된 경우에만 토글 끄기
      setExplanationText('')
      setUseExplanation(false)
    }
  }, [explanation])

  const handleSwitchChange = (checked: boolean) => {
    setUseExplanation(checked)
    if (checked) {
      // 토글을 켤 때 기존 텍스트가 있으면 그대로 사용, 없으면 빈 문자열
      onChange(explanationText || '')
    } else {
      // 토글을 끌 때만 null로 설정
      onChange(null)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setExplanationText(newText)
    // 토글이 켜져 있는 상태에서만 값 변경 전달
    if (useExplanation) {
      onChange(newText)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="use-explanation" className="text-sm font-medium">
          해설 추가
        </Label>
        <Switch
          id="use-explanation"
          checked={useExplanation}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      {useExplanation && (
        <div className="space-y-2">
          <Label htmlFor="explanation" className="text-sm">
            해설 내용
          </Label>
          <Textarea
            id="explanation"
            placeholder="문제에 대한 해설을 입력하세요..."
            value={explanationText}
            onChange={handleTextChange}
            className="min-h-[100px]"
          />
        </div>
      )}
    </div>
  )
}

export default ExplanationField
