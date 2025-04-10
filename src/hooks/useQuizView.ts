// hooks/useQuizView.ts
import { useEffect } from 'react'
import { useIncrementQuizView } from '@/hooks/useQuizQueries'

export function useQuizView(quizId: string, quiz: any) {
  const { mutate: incrementViewCount } = useIncrementQuizView(Number(quizId))

  useEffect(() => {
    if (quiz) {
      incrementViewWithDuplicatePrevention()
    }
  }, [quiz])

  const incrementViewWithDuplicatePrevention = () => {
    const viewedQuizzes = JSON.parse(
      localStorage.getItem('viewedQuizzes') || '{}'
    )
    const lastViewTime = viewedQuizzes[quizId] || 0
    const currentTime = Date.now()

    if (currentTime - lastViewTime > 21600000) {
      incrementViewCount()
      viewedQuizzes[quizId] = currentTime
      localStorage.setItem('viewedQuizzes', JSON.stringify(viewedQuizzes))
    }
  }

  return { incrementViewCount }
}
