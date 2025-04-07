'use client'
import { useState } from 'react'
import Image from 'next/image'
import { QuizWithQuestions } from '@/types/quiz'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, MessageSquare, BookCheck } from 'lucide-react'
import LikeButton from './../../_components/LikeCount'
import QuizComment from './QuizComment'
import { useQuizCommentCount } from '@/hooks/useCommentQueries'
import RecommendedQuizzes from '../../_components/RecommendedQuizzes'
import ShareButton from '../../_components/ShareButton'

type StartScreenProps = {
  quiz: QuizWithQuestions
  onStart: (questionCount: number) => void // 문제 갯수를 전달하도록 수정
}

export default function StartScreen({ quiz, onStart }: StartScreenProps) {
  const { data: commentCount } = useQuizCommentCount(quiz.id)
  const [selectedCount, setSelectedCount] = useState<number>(
    quiz.questions.length
  ) // 기본값은 전체 문제

  // 선택 가능한 문제 갯수 옵션 계산
  const questionCountOptions = [5, 10, 20, 30]
    .filter((count) => count <= quiz.questions.length)
    .concat(quiz.questions.length)
    .sort((a, b) => a - b)
    .filter((value, index, self) => self.indexOf(value) === index) // 중복 제거

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* 기존 코드 유지 */}
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
            </div>{' '}
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold dark:text-white">
                  {quiz.title}
                </CardTitle>
              </div>
              <CardDescription className="mt-2 dark:text-gray-300">
                {quiz.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 문제 갯수 선택 UI 추가 */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">문제 갯수 선택</h3>
                <div className="flex flex-wrap gap-2">
                  {questionCountOptions.map((count) => (
                    <Button
                      key={count}
                      variant={selectedCount === count ? 'default' : 'outline'}
                      onClick={() => setSelectedCount(count)}
                    >
                      {count === quiz.questions.length
                        ? `전체 (${count})`
                        : count}
                    </Button>
                  ))}
                </div>
              </div>

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
                    onClick={() => onStart(selectedCount)}
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

        {/* 오른쪽 추천 퀴즈들 */}
        <div className="md:col-span-1">
          <RecommendedQuizzes />
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div>
        <QuizComment quizId={quiz.id} />
      </div>
    </div>
  )
}
