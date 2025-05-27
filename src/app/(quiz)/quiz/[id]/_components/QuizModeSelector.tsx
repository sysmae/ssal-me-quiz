'use client'
import { QuizModeType } from '@/constants'
import { cn } from '@/lib/utils'

type QuizModeProps = {
  quizMode: QuizModeType
  setQuizMode: (mode: QuizModeType) => void
  onFlashcardClick?: () => void // 플래시카드 버튼 클릭시 모달 오픈용 콜백
}

export default function QuizModeSelector({
  quizMode,
  setQuizMode,
  onFlashcardClick,
}: QuizModeProps) {
  return (
    <div className="flex flex-row gap-3 w-full justify-center">
      {/* 기본 모드 */}
      <button
        type="button"
        className={cn(
          'flex-1 min-w-[120px] px-6 py-3 rounded-lg font-semibold border-2 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 transition text-base shadow-sm',
          quizMode === QuizModeType.MIXED
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : ''
        )}
        onClick={() => setQuizMode(QuizModeType.MIXED)}
      >
        기본 모드
        <div className="text-xs font-normal text-gray-500 mt-1">
          객관식/주관식 문제 타입에 맞게 풀기
        </div>
      </button>
      {/* 주관식 모드 */}
      <button
        type="button"
        className={cn(
          'flex-1 min-w-[120px] px-6 py-3 rounded-lg font-semibold border-2 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 transition text-base shadow-sm',
          quizMode === QuizModeType.SUBJECTIVE
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : ''
        )}
        onClick={() => setQuizMode(QuizModeType.SUBJECTIVE)}
      >
        주관식 모드
        <div className="text-xs font-normal text-gray-500 mt-1">
          모든 문제를 주관식으로 풀기
        </div>
      </button>
      {/* 플래시카드 모드: 클릭 시 모달 오픈, 선택 상태 스타일 없음 */}
      <button
        type="button"
        className={cn(
          'flex-1 min-w-[120px] px-6 py-3 rounded-lg font-semibold border-2 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 transition text-base shadow-sm'
        )}
        onClick={onFlashcardClick}
      >
        플래시카드 모드
        <div className="text-xs font-normal text-gray-500 mt-1">
          플래시카드로 암기 연습
        </div>
      </button>
    </div>
  )
}
