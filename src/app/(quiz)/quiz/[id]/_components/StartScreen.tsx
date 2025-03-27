// app/quiz/[id]/_components/StartScreen.tsx
'use client'

import { useState } from 'react'
import { QuizWithQuestions } from './types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, MessageSquare, BookCheck } from 'lucide-react'
import LikeButton from './../../_components/LikeCount'
import QuizComment from './QuizComment'
import { useQuizCommentCount } from '@/hooks/useCommentQueries'
import { useQuizAttemptWithSave } from '@/hooks/useQuizAttemptQueries'

type StartScreenProps = {
  quiz: QuizWithQuestions
  onStart: (questions: any[], attemptId: number) => void
}

export default function StartScreen({ quiz, onStart }: StartScreenProps) {
  const { data: commentCount } = useQuizCommentCount(quiz.id)
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<
    number | null
  >(null)
  const { startQuiz, attemptId, isStarting } = useQuizAttemptWithSave()

  // 문제 수 선택 옵션
  const questionOptions = [5, 10, 20, 30]

  // 랜덤 문제 선택 함수
  const getRandomQuestions = (originalQuestions: any[], count: number) => {
    // 원본 배열을 복사하여 섞기
    const shuffled = [...originalQuestions].sort(() => 0.5 - Math.random())
    // 선택한 수만큼 잘라서 반환
    return shuffled.slice(0, count)
  }

  // 선택한 문제 수로 퀴즈 시작
  const handleStartQuiz = async () => {
    try {
      // 문제 수 결정 (선택되지 않았으면 전체 문제)
      const questionCount = selectedQuestionCount || quiz.questions.length

      // 문제 선택
      let selectedQuestions = quiz.questions
      if (
        selectedQuestionCount &&
        selectedQuestionCount < quiz.questions.length
      ) {
        selectedQuestions = getRandomQuestions(
          quiz.questions,
          selectedQuestionCount
        )
      }

      // 퀴즈 시도 생성
      const result = await startQuiz(
        selectedQuestions.length,
        selectedQuestions.map((q) => q.id)
      )

      // 부모 컴포넌트에 선택된 문제와 시도 ID 전달
      onStart(selectedQuestions, result.id)
    } catch (error) {
      console.error('퀴즈 시작 실패:', error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* 위쪽 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 왼쪽 썸네일, 제목, 설명 */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative w-full h-64 overflow-hidden">
              <img
                src={quiz.thumbnail_url ?? ''}
                alt={quiz.title}
                className="w-full h-full object-cover"
              />
            </div>

            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold">
                  {quiz.title}
                </CardTitle>
              </div>
              <CardDescription className="mt-2">
                {quiz.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <BookCheck className="h-4 w-4" />
                  <span>{quiz.questions.length} 개</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{quiz.view_count}회</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>댓글 {commentCount?.count || 0}개</span>
                </div>
              </div>

              {/* 문제 수 선택 영역 */}
              <div className="space-y-4 mt-4 border-t pt-4">
                <h3 className="text-lg font-semibold">
                  풀고 싶은 문제 수를 선택하세요
                </h3>
                <div className="flex flex-wrap gap-3">
                  {questionOptions.map((count) => (
                    <Button
                      key={count}
                      variant={
                        selectedQuestionCount === count ? 'default' : 'outline'
                      }
                      onClick={() => setSelectedQuestionCount(count)}
                      disabled={count > quiz.questions.length}
                    >
                      {count}문제
                    </Button>
                  ))}
                  <Button
                    variant={
                      selectedQuestionCount === null ? 'default' : 'outline'
                    }
                    onClick={() => setSelectedQuestionCount(null)}
                  >
                    전체 ({quiz.questions.length}문제)
                  </Button>
                </div>

                <Button
                  onClick={handleStartQuiz}
                  className="bg-primary hover:bg-primary/90 w-full mt-4"
                  size="lg"
                >
                  퀴즈 시작하기
                </Button>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  {/* 작성자 정보 */}
                </div>
                <div className="flex gap-2">
                  <LikeButton quizId={quiz.id} likeCount={quiz.like_count} />
                  <Button variant="outline" size="sm">
                    공유하기
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* 오른쪽 추천 퀴즈들 */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">추천 퀴즈</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="popular" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="popular">인기</TabsTrigger>
                  <TabsTrigger value="recent">최신</TabsTrigger>
                </TabsList>
                <TabsContent value="popular" className="space-y-4 mt-4">
                  {/* 인기 퀴즈 목록 */}
                </TabsContent>
                <TabsContent value="recent" className="space-y-4 mt-4">
                  {/* 최신 퀴즈 목록 */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div>
        <QuizComment quizId={quiz.id} />
      </div>
    </div>
  )
}
