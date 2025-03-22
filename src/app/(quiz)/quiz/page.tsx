'use client'

import { useState } from 'react'
import QuizCard from '@/components/quiz/QuizCard'
import SearchAndSort from '@/components/quiz/SearchAndSort'
import { useGetQuizzes } from '@/hooks/useQuizQueries'

export default function HomePage() {
  const [sortBy, setSortBy] = useState('like_count')
  const [searchTerm, setSearchTerm] = useState('')

  // useQuizzes 대신 useQuizListQueries().getQuizzes 사용
  const {
    data: quizzes,
    isLoading,
    isError,
    error,
  } = useGetQuizzes(sortBy, searchTerm)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
  }

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
            {quizzes?.map((quiz) => (
              <QuizCard
                key={quiz.id}
                id={quiz.id.toString()}
                title={quiz.title}
                description={quiz.description ?? ''}
                thumbnail={quiz.thumbnail_url ?? ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
