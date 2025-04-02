'use client'

import { useCallback, useState } from 'react'
import QuizCard from './_components/QuizCard'
import SearchAndSort from './_components/SearchAndSort'
import { useInfiniteQuizzes } from '@/hooks/useQuizQueries'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

export default function HomePage() {
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
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const { lastElementRef } = useInfiniteScroll(loadMoreQuizzes)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
  }

  // 모든 페이지의 퀴즈를 하나의 배열로 합치기
  const quizzes = data?.pages.flat() || []

  return (
    <div>
      <div className="container mx-auto p-4">
        <SearchAndSort onSearch={handleSearch} onSort={handleSort} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="border rounded-lg h-64 animate-pulse bg-gray-200"
              ></div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center mt-6 text-red-500">
            {error.message || '오류가 발생했습니다.'}
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

            {isFetchingNextPage && (
              <div className="col-span-full flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
