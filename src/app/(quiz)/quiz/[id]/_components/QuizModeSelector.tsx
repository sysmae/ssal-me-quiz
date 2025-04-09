'use client'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { QuizQuestionType } from '@/constants'

type QuizModeProps = {
  quizMode: QuizQuestionType
  setQuizMode: (mode: QuizQuestionType) => void
}

export default function QuizModeSelector({
  quizMode,
  setQuizMode,
}: QuizModeProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2 dark:text-white">
        퀴즈 모드 선택
      </h3>
      <RadioGroup
        value={quizMode}
        onValueChange={(value) => setQuizMode(value as QuizQuestionType)}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="mixed" id="mixed" />
          <Label htmlFor="mixed">
            혼합 모드 (객관식/주관식 문제 타입에 맞게 풀기)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={QuizQuestionType.SUBJECTIVE} id="subjective" />
          <Label htmlFor="subjective">
            주관식 모드 (모든 문제를 주관식으로 풀기)
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
