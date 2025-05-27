'use client'

import React from 'react'
import { useGetLikedQuizzes } from '@/hooks/useQuizQueries'
import QuizCard from '../_components/QuizCard'

const Page = () => {
  const { data: quizzes, isLoading, isError, error } = useGetLikedQuizzes()

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">찜한 퀴즈</h2>
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
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {quizzes.map((quiz: any) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id.toString()}
              title={quiz.title}
              description={quiz.description ?? ''}
              thumbnail={quiz.thumbnail_url ?? ''}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-6 text-gray-500">
          찜한 퀴즈가 없습니다.
        </div>
      )}
    </div>
  )
}

export default Page
