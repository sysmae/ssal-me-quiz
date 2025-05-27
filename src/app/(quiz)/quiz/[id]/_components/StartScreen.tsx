'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link' // Link 추가
import { QuizWithQuestions } from '@/types/quiz'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Eye,
  MessageSquare,
  BookCheck,
  Edit,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react' // Edit, Chevron 아이콘 추가
import LikeButton from './../../_components/LikeCount'
import QuizComment from './QuizComment'
import { useQuizCommentCount } from '@/hooks/useCommentQueries'
import RecommendedQuizzes from '../../_components/RecommendedQuizzes'
import ShareButton from '../../_components/ShareButton'
import QuizModeSelector from './QuizModeSelector'
import { QuizModeType } from '@/constants'
import { createClient } from '@/utils/supabase/client' // Supabase 클라이언트 추가
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

type StartScreenProps = {
  quiz: QuizWithQuestions
  onStart: (questionCount: number, mode: QuizModeType) => void
  quizMode: QuizModeType
  setQuizMode: (mode: QuizModeType) => void
}

// 플래시카드 컴포넌트 구현 (스타일 및 안내문구 개선)
function FlashcardComponent({
  front,
  back,
  onPrev,
  onNext,
  showPrev,
  showNext,
  cardIndex,
  flipped,
  setFlipped,
}: {
  front: string
  back: string
  onPrev?: () => void
  onNext?: () => void
  showPrev?: boolean
  showNext?: boolean
  cardIndex?: number
  flipped: boolean
  setFlipped: (v: boolean) => void
}) {
  // 카드 인덱스가 바뀔 때마다 앞면으로 초기화
  useEffect(() => {
    setFlipped(false)
  }, [cardIndex, setFlipped])

  // 좌우 방향키로 카드 이동
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && showPrev && onPrev) {
        onPrev()
      }
      if (e.key === 'ArrowRight' && showNext && onNext) {
        onNext()
      }
      if (e.key === ' ' || e.key === 'Enter') setFlipped(!flipped)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPrev, onNext, showPrev, showNext, setFlipped])

  return (
    <div
      className="w-96 h-56 perspective-1000 cursor-pointer select-none mx-auto relative"
      onClick={() => setFlipped(!flipped)}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      style={{ outline: 'none' }}
    >
      {/* 좌측 이동 버튼 */}
      {showPrev && (
        <button
          type="button"
          aria-label="이전 카드"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-indigo-100 rounded-full p-2 shadow transition"
          onClick={(e) => {
            e.stopPropagation()
            if (onPrev) onPrev()
          }}
        >
          <ChevronLeft className="w-6 h-6 text-indigo-500" />
        </button>
      )}
      {/* 우측 이동 버튼 */}
      {showNext && (
        <button
          type="button"
          aria-label="다음 카드"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-indigo-100 rounded-full p-2 shadow transition"
          onClick={(e) => {
            e.stopPropagation()
            if (onNext) onNext()
          }}
        >
          <ChevronRight className="w-6 h-6 text-indigo-500" />
        </button>
      )}
      <div
        className={`relative w-full h-full transition-transform duration-500 ease-in-out ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 앞면 */}
        <div
          className="absolute w-full h-full bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col items-center justify-center text-lg font-semibold p-6 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-gray-800 text-center leading-relaxed">
            {front}
          </div>
          <div className="mt-4 text-sm text-gray-400 font-normal">
            클릭 혹은 스페이스바로 답변 확인
          </div>
        </div>
        {/* 뒷면 */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 rounded-2xl shadow-xl flex flex-col items-center justify-center text-lg font-semibold p-6 rotate-y-180 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-indigo-900 text-center leading-relaxed">
            {back}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StartScreen({
  quiz,
  onStart,
  quizMode,
  setQuizMode,
}: StartScreenProps) {
  const { data: commentCount } = useQuizCommentCount(quiz.id)
  const [selectedCount, setSelectedCount] = useState<number>(
    quiz.questions.length
  )
  const [isOwner, setIsOwner] = useState(false) // 소유자 여부 상태 추가
  const [showFlashcardPreview, setShowFlashcardPreview] = useState(false)
  const [flashcardIndex, setFlashcardIndex] = useState(0)
  const [flashcardFlipped, setFlashcardFlipped] = useState(false)
  const supabase = createClient()

  // 현재 사용자가 퀴즈 소유자인지 확인
  useEffect(() => {
    const checkOwnership = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user && quiz.user_id === data.user.id) {
        setIsOwner(true)
      }
    }

    checkOwnership()
  }, [quiz.user_id, supabase.auth]) // supabase.auth 추가

  // 선택 가능한 문제 갯수 옵션 계산
  const questionCountOptions = [5, 10, 20, 30]
    .filter((count) => count <= quiz.questions.length)
    .concat(quiz.questions.length)
    .sort((a, b) => a - b)
    .filter((value, index, self) => self.indexOf(value) === index)

  // 플래시카드 인덱스 변경 시 항상 앞면으로
  const handlePrev = () => {
    if (flashcardFlipped) {
      setFlashcardFlipped(false)
      setTimeout(() => {
        setFlashcardIndex((i) => Math.max(0, i - 1))
      }, 500) // transition duration과 동일하게
    } else {
      setFlashcardIndex((i) => Math.max(0, i - 1))
    }
  }
  const handleNext = () => {
    if (flashcardFlipped) {
      setFlashcardFlipped(false)
      setTimeout(() => {
        setFlashcardIndex((i) => Math.min(quiz.questions.length - 1, i + 1))
      }, 500)
    } else {
      setFlashcardIndex((i) => Math.min(quiz.questions.length - 1, i + 1))
    }
  }

  // 모달 열릴 때 항상 첫 카드 앞면으로
  useEffect(() => {
    if (showFlashcardPreview) {
      setFlashcardIndex(0)
      setFlashcardFlipped(false)
    }
  }, [showFlashcardPreview])

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <div className="relative w-full h-64 overflow-hidden bg-gradient-to-b from-gray-700 to-gray-900">
              {quiz.thumbnail_url ? (
                <Image
                  src={quiz.thumbnail_url}
                  alt={quiz.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/path/to/fallback-image.jpg'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <h3 className="text-white font-bold text-2xl text-center px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {quiz.title.length > 15
                      ? `${quiz.title.substring(0, 15)}...`
                      : quiz.title}
                  </h3>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold dark:text-white">
                  {quiz.title}
                </CardTitle>
                {/* 소유자인 경우 수정 버튼 표시 */}
                {isOwner && (
                  <Button variant="outline" asChild>
                    <Link href={`/quiz/${quiz.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      퀴즈 수정
                    </Link>
                  </Button>
                )}
              </div>
              <CardDescription className="mt-2 dark:text-gray-300">
                {quiz.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 퀴즈 모드 선택기 한 줄 3버튼 통일 스타일 */}
              <div className="mb-6">
                <div className="flex flex-row items-center justify-center gap-3 w-full">
                  <QuizModeSelector
                    quizMode={quizMode}
                    setQuizMode={setQuizMode}
                    onFlashcardClick={() => {
                      setShowFlashcardPreview(true)
                      setFlashcardIndex(0)
                    }}
                  />
                </div>
              </div>
              {/* 문제 갯수 선택 UI */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  문제 갯수 선택
                </h3>
                <div className="flex flex-wrap gap-2">
                  {questionCountOptions.map((count) => (
                    <Button
                      key={count}
                      variant={selectedCount === count ? 'default' : 'outline'}
                      onClick={() => setSelectedCount(count)}
                    >
                      {count === quiz.questions.length
                        ? `전체 (${count} 문제)`
                        : `${count} 문제`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 플래시카드 프리뷰 모달 */}
              <Dialog
                open={showFlashcardPreview}
                onOpenChange={setShowFlashcardPreview}
              >
                <DialogContent
                  className="max-w-2xl w-full p-8 rounded-2xl bg-gradient-to-br from-white via-indigo-50 to-blue-50 shadow-2xl"
                  style={{
                    minHeight: '480px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-indigo-800 mb-2">
                      플래시카드 미리보기
                    </DialogTitle>
                    <div className="mt-4 text-sm text-indigo-500 font-normal text-center">
                      클릭 혹은 스페이스바로 카드를 뒤집을 수 있습니다.
                    </div>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-6 w-full">
                    <FlashcardComponent
                      front={quiz.questions[flashcardIndex]?.question_text}
                      back={
                        quiz.questions[flashcardIndex]?.correct_answer ||
                        '정답 없음'
                      }
                      onPrev={handlePrev}
                      onNext={handleNext}
                      showPrev={flashcardIndex > 0}
                      showNext={flashcardIndex < quiz.questions.length - 1}
                      cardIndex={flashcardIndex}
                      flipped={flashcardFlipped}
                      setFlipped={setFlashcardFlipped}
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-base font-medium text-indigo-700">
                        {flashcardIndex + 1} / {quiz.questions.length}
                      </span>
                    </div>
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        className="mt-4 w-full py-3 text-base font-semibold rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
                      >
                        닫기
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <BookCheck className="h-4 w-4" />
                  <span>{quiz.questions.length ?? 0} 개</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{quiz.view_count ?? 0}회</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>댓글 {commentCount?.count ?? 0}개</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  {/* 작성자 정보 */}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onStart(selectedCount, quizMode)}
                    className="bg-primary hover:bg-primary/90 dark:bg-primary/80 dark:hover:bg-primary/70"
                  >
                    퀴즈 시작하기
                  </Button>
                  <LikeButton quizId={quiz.id} likeCount={quiz.like_count} />
                  <ShareButton />
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-1">
          <RecommendedQuizzes />
        </div>
      </div>

      <div>
        <QuizComment quizId={quiz.id} />
      </div>
    </div>
  )
}
