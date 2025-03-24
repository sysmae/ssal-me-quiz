// components/LikeButton.tsx
import { useQuizLikeStatus, useToggleQuizLike } from '@/hooks/useQuizQueries'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

interface LikeButtonProps {
  quizId: number
  likeCount: number
}

export default function LikeButton({ quizId, likeCount }: LikeButtonProps) {
  const supabase = createClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { data: isLiked, isLoading } = useQuizLikeStatus(quizId)
  const toggleLike = useToggleQuizLike(quizId)

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      setIsLoggedIn(!!data.user)
    }
    checkAuth()
  }, [supabase])

  const handleLikeClick = async () => {
    if (!isLoggedIn) {
      alert('좋아요를 누르려면 로그인이 필요합니다.')
      return
    }

    toggleLike.mutate()
  }

  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoading || toggleLike.isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
        isLiked ? 'bg-pink-100 text-pink-600' : 'bg-gray-100'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span>{likeCount}</span>
    </button>
  )
}
