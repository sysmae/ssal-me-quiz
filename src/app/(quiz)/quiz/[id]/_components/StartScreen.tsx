'use client'

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, MessageSquare, BookCheck } from 'lucide-react'
import LikeButton from './../../_components/LikeCount'
import QuizComment from './QuizComment'
import { useQuizCommentCount } from '@/hooks/useCommentQueries'

type StartScreenProps = {
  quiz: QuizWithQuestions
  onStart: () => void
}

export default function StartScreen({ quiz, onStart }: StartScreenProps) {
  const { data: commentCount } = useQuizCommentCount(quiz.id)

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
                <Button
                  onClick={onStart}
                  className="bg-primary hover:bg-primary/90"
                >
                  퀴즈 시작하기
                </Button>
              </div>
              <CardDescription className="mt-2">
                {quiz.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src="https://via.placeholder.com/150"
                          alt="추천 퀴즈"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          인기 퀴즈 {i + 1}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          조회수 {1000 * (i + 1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="recent" className="space-y-4 mt-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src="https://via.placeholder.com/150"
                          alt="추천 퀴즈"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          최신 퀴즈 {i + 1}
                        </h3>
                        <p className="text-xs text-muted-foreground">2일 전</p>
                      </div>
                    </div>
                  ))}
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
