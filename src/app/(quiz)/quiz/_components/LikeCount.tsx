import { useQuizLikeStatus, useToggleQuizLike } from '@/hooks/useQuizQueries'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

interface LikeButtonProps {
  quizId: number
  likeCount: number
}

export default function LikeButton({
  quizId,
  likeCount: initialLikeCount,
}: LikeButtonProps) {
  const supabase = createClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { data: serverIsLiked, isLoading } = useQuizLikeStatus(quizId)
  const toggleLike = useToggleQuizLike(quizId)

  // 낙관적 UI 업데이트를 위한 로컬 상태
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(false)
  const [optimisticLikeCount, setOptimisticLikeCount] =
    useState(initialLikeCount)
  const [isAnimating, setIsAnimating] = useState(false)

  // 서버 데이터로 로컬 상태 초기화
  useEffect(() => {
    if (serverIsLiked !== undefined) {
      setOptimisticIsLiked(serverIsLiked)
    }
  }, [serverIsLiked])

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

    // 낙관적 UI 업데이트
    const newIsLiked = !optimisticIsLiked
    setOptimisticIsLiked(newIsLiked)
    setOptimisticLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    // 애니메이션 효과
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // 실제 API 호출
    toggleLike.mutate()
  }

  // 실제 UI에 표시할 값 (낙관적 업데이트 값 사용)
  const displayIsLiked = optimisticIsLiked
  const displayLikeCount = optimisticLikeCount

  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
        displayIsLiked
          ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
          : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
      } ${isAnimating ? 'scale-110' : 'scale-100'}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={displayIsLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all ${isAnimating ? 'scale-110' : 'scale-100'}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span
        className={`transition-all ${isAnimating ? 'scale-110' : 'scale-100'}`}
      >
        {displayLikeCount}
      </span>
    </button>
  )
}
