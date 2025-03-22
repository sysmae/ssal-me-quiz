'use client'
import { useQuizQueries } from '@/hooks/useQuizQueries'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import QuizBasicInfo from './_components/QuizBasicInfo'

type Params = {
  id: string
}

interface QuizEditPageProps {
  params: Params
}

const QuizEditPage: React.FC<QuizEditPageProps> = ({ params }) => {
  const router = useRouter()
  const [quizId, setQuizId] = useState<number | null>(null)

  useEffect(() => {
    if (params.id) {
      setQuizId(Number(params.id))
    }
  }, [params])

  const { quiz, updateQuiz, deleteQuiz } = useQuizQueries(quizId ?? 0)

  const handleDeleteQuiz = () => {
    if (!quizId) return

    if (
      window.confirm(
        '정말로 이 퀴즈를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      try {
        deleteQuiz()
        router.push('/quiz')
      } catch (error) {
        console.error('퀴즈 삭제 오류:', error)
        alert('퀴즈 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  if (!quizId) return <p>잘못된 퀴즈 ID입니다.</p>
  if (!quiz) return <p>로딩 중...</p>

  return (
    <div className="quiz-edit-page">
      <div className="page-header">
        <h1>퀴즈 편집</h1>
        <div className="page-actions">
          <button onClick={() => router.push(`/quiz/${quizId}`)}>
            미리보기
          </button>
          <button onClick={handleDeleteQuiz} className="delete-btn">
            퀴즈 삭제
          </button>
        </div>
      </div>
      <QuizBasicInfo quizId={quizId} quiz={quiz} />
    </div>
  )
}

export default QuizEditPage
