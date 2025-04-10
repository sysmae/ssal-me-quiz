'use client'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { QuizModeType } from '@/constants'
import { cn } from '@/lib/utils'

type QuizModeProps = {
  quizMode: QuizModeType
  setQuizMode: (mode: QuizModeType) => void
}

export default function QuizModeSelector({
  quizMode,
  setQuizMode,
}: QuizModeProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">
        퀴즈 모드 선택
      </h3>
      <RadioGroup
        value={quizMode}
        onValueChange={(value) => setQuizMode(value as QuizModeType)}
        className="flex flex-col space-y-3"
      >
        <div className="relative">
          <RadioGroupItem
            value={QuizModeType.MIXED}
            id="mixed"
            className="sr-only"
          />
          <label
            htmlFor="mixed"
            className={cn(
              'flex p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              quizMode === QuizModeType.MIXED
                ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30'
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center justify-center mr-3">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  quizMode === QuizModeType.MIXED
                    ? 'border-blue-600 dark:border-blue-500'
                    : 'border-gray-400 dark:border-gray-500'
                )}
              >
                {quizMode === QuizModeType.MIXED && (
                  <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
                )}
              </div>
            </div>
            <div>
              <div className="font-medium">기본 모드</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                객관식/주관식 문제 타입에 맞게 풀기
              </p>
            </div>
          </label>
        </div>

        <div className="relative">
          <RadioGroupItem
            value={QuizModeType.SUBJECTIVE}
            id="subjective"
            className="sr-only"
          />
          <label
            htmlFor="subjective"
            className={cn(
              'flex p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              quizMode === QuizModeType.SUBJECTIVE
                ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30'
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center justify-center mr-3">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  quizMode === QuizModeType.SUBJECTIVE
                    ? 'border-blue-600 dark:border-blue-500'
                    : 'border-gray-400 dark:border-gray-500'
                )}
              >
                {quizMode === QuizModeType.SUBJECTIVE && (
                  <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
                )}
              </div>
            </div>
            <div>
              <div className="font-medium">주관식 모드</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                모든 문제를 주관식으로 풀기
              </p>
            </div>
          </label>
        </div>
      </RadioGroup>
    </div>
  )
}
