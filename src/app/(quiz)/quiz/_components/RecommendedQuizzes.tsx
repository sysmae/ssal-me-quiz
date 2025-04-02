'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePopularQuizzes, useRecentQuizzes } from '@/hooks/useQuizQueries'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

interface QuizItemProps {
  id: number
  title: string
  thumbnail_url?: string
  view_count?: number
  created_at?: string
  isPopular?: boolean
}

const QuizItem: React.FC<QuizItemProps> = ({
  id,
  title,
  thumbnail_url,
  view_count,
  created_at,
  isPopular,
}) => (
  <Link href={`/quiz/${id}`} className="block">
    <div className="flex gap-3 items-center hover:bg-gray-50 p-2 rounded-md transition-colors">
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {thumbnail_url ? (
          <Image
            src={thumbnail_url}
            alt={title}
            fill
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 text-center p-1">
            {title.length > 20 ? `${title.substring(0, 20)}...` : title}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <p className="text-xs text-muted-foreground">
          {isPopular
            ? `조회수 ${view_count?.toLocaleString() || 0}`
            : created_at
            ? `${formatDistanceToNow(new Date(created_at), { locale: ko })} 전`
            : '최근 추가됨'}
        </p>
      </div>
    </div>
  </Link>
)

const QuizItemSkeleton = () => (
  <div className="flex gap-3 items-center p-2">
    <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
)

const RecommendedQuizzes: React.FC = () => {
  const { data: popularQuizzes, isLoading: isLoadingPopular } =
    usePopularQuizzes()
  const { data: recentQuizzes, isLoading: isLoadingRecent } = useRecentQuizzes()

  return (
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
            {isLoadingPopular ? (
              Array(3)
                .fill(0)
                .map((_, i) => <QuizItemSkeleton key={i} />)
            ) : popularQuizzes && popularQuizzes.length > 0 ? (
              popularQuizzes.map((quiz) => (
                <QuizItem
                  key={quiz.id}
                  id={quiz.id}
                  title={quiz.title}
                  thumbnail_url={quiz.thumbnail_url ?? ''}
                  view_count={quiz.view_count}
                  isPopular={true}
                />
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                인기 퀴즈가 없습니다
              </p>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4 mt-4">
            {isLoadingRecent ? (
              Array(3)
                .fill(0)
                .map((_, i) => <QuizItemSkeleton key={i} />)
            ) : recentQuizzes && recentQuizzes.length > 0 ? (
              recentQuizzes.map((quiz) => (
                <QuizItem
                  key={quiz.id}
                  id={quiz.id}
                  title={quiz.title}
                  thumbnail_url={quiz.thumbnail_url ?? ''}
                  created_at={quiz.created_at}
                  isPopular={false}
                />
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                최신 퀴즈가 없습니다
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default RecommendedQuizzes
