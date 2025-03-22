'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import {
  useCreateEmptyQuizMutation,
  useGetUserQuizzes,
} from '@/hooks/useQuizQueries'
import Link from 'next/link'

const Page = () => {
  const router = useRouter()
  const createQuizMutation = useCreateEmptyQuizMutation()
  const { data: myQuizzes } = useGetUserQuizzes()

  const handleCreateQuiz = async () => {
    try {
      const quizId = await createQuizMutation.mutateAsync()
      router.push(`/quiz/${quizId}/edit`)
    } catch (error) {
      console.error('퀴즈 생성 중 오류:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">내 퀴즈</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myQuizzes ? (
          myQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex justify-between">
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    문제 보기
                  </Link>
                  <Link
                    href={`/quiz/${quiz.id}/edit`}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    수정
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full">로딩 중...</p>
        )}
        <button
          onClick={handleCreateQuiz}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex items-center justify-center h-64 col-span-full"
        >
          <span className="text-2xl font-bold text-gray-600 hover:text-gray-800 transition-colors">
            + 퀴즈 생성
          </span>
        </button>
      </div>
    </div>
  )
}

export default Page
