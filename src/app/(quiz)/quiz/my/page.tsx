'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import {
  useCreateEmptyQuizMutation,
  useGetUserQuizzes,
} from '@/hooks/useQuizQueries'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Eye, Edit, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const Page = () => {
  const router = useRouter()
  const createQuizMutation = useCreateEmptyQuizMutation()
  const { data: myQuizzes, isLoading } = useGetUserQuizzes()

  const handleCreateQuiz = async () => {
    try {
      const quizId = await createQuizMutation.mutateAsync()
      router.push(`/quiz/${quizId}/edit`)
    } catch (error) {
      alert('퀴즈 생성 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">내 퀴즈</h1>
        <Button
          onClick={handleCreateQuiz}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          퀴즈 생성
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : myQuizzes && myQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle>{quiz.title || '제목 없음'}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {quiz.description || '설명 없음'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="mr-4">
                    문제 {quiz.questions?.length || 0}개
                  </span>
                  <span>조회 {quiz.view_count || 0}회</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/quiz/${quiz.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    문제 보기
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-indigo-50 text-indigo-500 border-indigo-200 hover:bg-indigo-100"
                  asChild
                >
                  <Link href={`/quiz/${quiz.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="w-full p-12 flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-4 bg-indigo-50 rounded-full">
            <PlusCircle className="h-12 w-12 text-indigo-500" />
          </div>
          <CardTitle className="mb-2">퀴즈가 없습니다</CardTitle>
          <CardDescription className="mb-6">
            첫 번째 퀴즈를 만들어보세요!
          </CardDescription>
          <Button
            onClick={handleCreateQuiz}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            {createQuizMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                퀴즈 생성
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  )
}

export default Page
