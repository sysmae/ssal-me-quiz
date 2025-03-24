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
import { Eye, MessageSquare, Clock, ThumbsUp } from 'lucide-react'
import LikeButton from './../../_components/LikeCount'

type StartScreenProps = {
  quiz: QuizWithQuestions
  onStart: () => void
}

export default function StartScreen({ quiz, onStart }: StartScreenProps) {
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
                  <Clock className="h-4 w-4" />
                  <span>약 {quiz.questions.length * 2}분</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{quiz.view_count}회</span>
                </div>
                {/* 좋아요 아이콘과 카운트 부분 제거 */}
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {/* <span>댓글 {quiz.comments?.length || 0}개</span> */}
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  {/* <Avatar className="h-8 w-8">
                    <AvatarImage src={quiz.author?.avatar_url} />
                    <AvatarFallback>
                      {quiz.author?.name?.substring(0, 2) || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {quiz.author?.name || '익명'}
                  </span> */}
                </div>
                <div className="flex gap-2">
                  {/* 기존 좋아요 버튼을 LikeButton 컴포넌트로 대체 */}
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

      {/* 아래쪽 댓글 섹션 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {/* 댓글 {quiz.comments?.length || 0}개 */}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="border rounded-lg overflow-hidden">
                  <textarea
                    className="w-full p-3 resize-none focus:outline-none"
                    rows={3}
                    placeholder="댓글을 작성해주세요..."
                  />
                  <div className="bg-muted/20 p-2 flex justify-end">
                    <Button size="sm">댓글 작성</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 댓글 목록 (예시) */}
            {[1, 2].map((_, i) => (
              <div key={i} className="flex gap-3 pt-4 border-t">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                  />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">사용자 {i + 1}</span>
                    <span className="text-xs text-muted-foreground">
                      {i + 1}일 전
                    </span>
                  </div>
                  <p className="mt-1 text-sm">
                    이 퀴즈 정말 재미있어요! 많이 배울 수 있었습니다.
                  </p>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      <span>좋아요 {5 * (i + 1)}</span>
                    </button>
                    <button className="hover:text-foreground">답글 달기</button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">
              더 보기
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
