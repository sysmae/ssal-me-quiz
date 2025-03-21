'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useCreateQuizMutation } from '@/hooks/useQuizQueries'

const Page = () => {
  const router = useRouter()
  const createQuizMutation = useCreateQuizMutation()

  const handleCreateQuiz = async () => {
    try {
      const newQuiz = await createQuizMutation.mutateAsync({
        title: '',
        description: '',
      })
      router.push(`/quiz/create/${newQuiz.id}`)
    } catch (error) {
      console.error('퀴즈 생성 중 오류:', error)
    }
  }

  return (
    <div>
      <button
        onClick={handleCreateQuiz}
        className="block w-full cursor-pointer"
      >
        <div className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex items-center justify-center h-64">
          <span className="text-2xl font-bold">+ 퀴즈 생성</span>
        </div>
      </button>
    </div>
  )
}

export default Page
