// app/(quiz)/quiz/QuizClientPage.tsx (클라이언트 컴포넌트)
'use client'

import { useCallback, useState } from 'react'
import QuizCard from './_components/QuizCard'
import SearchAndSort from './_components/SearchAndSort'
import { useInfiniteQuizzes } from '@/hooks/useQuizQueries'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

export default function QuizClientPage() {
  const [sortBy, setSortBy] = useState('like_count')
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuizzes(sortBy, searchTerm)

  const loadMoreQuizzes = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const { lastElementRef } = useInfiniteScroll(loadMoreQuizzes)

  const quizzes = data?.pages.flat() || []

  return (
    <div className="container mx-auto p-4">
      <SearchAndSort onSearch={setSearchTerm} onSort={setSortBy} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="border rounded-lg h-64 animate-pulse bg-gray-200"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center mt-6 text-red-500">
          {error?.message || '데이터 로딩 오류'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              ref={index === quizzes.length - 1 ? lastElementRef : null}
            >
              <QuizCard
                id={quiz.id.toString()}
                title={quiz.title}
                description={quiz.description ?? ''}
                thumbnail={quiz.thumbnail_url ?? ''}
              />
            </div>
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="col-span-full flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
    </div>
  )
}
