'use client'

import { useQuizQueries } from '@/hooks/useQuizQueries'
import { useQuestionQueries } from '@/hooks/useQuestionQueries'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionUpdateData } from '@/types/quiz'

import QuizBasicInfo from './_components/QuizBasicInfo'
import QuestionList from './_components/QuestionList'

type Params = {
  id: string
}

interface QuizEditPageProps {
  params: Params
}

// 새 질문 추가 컴포넌트
const CreateQuizComponent: React.FC<{
  quizId: number
  onCreateQuestion: (questionData: {
    quiz_id: number
    question_text: string
    correct_answer: string
    question_type: string
  }) => void
}> = ({ quizId, onCreateQuestion }) => {
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    correct_answer: '',
    question_type: 'short_answer',
  })

  const handleInputChange = (field: string, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question_text || !newQuestion.correct_answer) {
      alert('질문과 정답을 입력해주세요.')
      return
    }

    // quiz_id를 포함하여 질문 데이터 생성
    onCreateQuestion({
      quiz_id: quizId,
      ...newQuestion,
    })

    // 입력 필드 초기화
    setNewQuestion({
      question_text: '',
      correct_answer: '',
      question_type: 'short_answer',
    })
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 질문 추가</h2>
      <form className="space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            질문 내용
          </label>
          <textarea
            value={newQuestion.question_text}
            onChange={(e) => handleInputChange('question_text', e.target.value)}
            required
            className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            정답
          </label>
          <input
            type="text"
            value={newQuestion.correct_answer}
            onChange={(e) =>
              handleInputChange('correct_answer', e.target.value)
            }
            required
            className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-actions flex justify-end">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            질문 추가
          </button>
        </div>
      </form>
    </div>
  )
}

const QuizEditPage: React.FC<QuizEditPageProps> = ({ params }) => {
  const router = useRouter()
  const [quizId, setQuizId] = useState<number | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)

  useEffect(() => {
    if (params.id) {
      setQuizId(Number(params.id))
    }
  }, [params])

  const { quiz, updateQuiz, deleteQuiz } = useQuizQueries(quizId ?? 0)
  const { questionsData, createQuestion, updateQuestion, deleteQuestion } =
    useQuestionQueries(quizId!)

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

  const handleUpdateQuestion = (
    questionId: number,
    questionData: QuestionUpdateData
  ) => {
    try {
      updateQuestion({ questionId, updates: questionData })
      setEditingQuestion(null)
    } catch (error) {
      console.error('질문 업데이트 오류:', error)
      alert('질문 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteQuestion = (questionId: number) => {
    if (
      window.confirm(
        '정말로 이 질문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      try {
        deleteQuestion(questionId)
      } catch (error) {
        console.error('질문 삭제 오류:', error)
        alert('질문 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleCreateQuestion = (questionData: {
    quiz_id: number
    question_text: string
    correct_answer: string
    question_type: string
  }) => {
    try {
      createQuestion(questionData)
    } catch (error) {
      console.error('새 질문 생성 오류:', error)
      alert('새 질문 생성 중 오류가 발생했습니다.')
    }
  }

  if (!quizId) return <p>잘못된 퀴즈 ID입니다.</p>
  if (!quiz) return <p>로딩 중...</p>

  return (
    <div className="quiz-edit-page space-y-6">
      {/* 페이지 헤더 */}
      <div className="page-header flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold">퀴즈 편집</h1>
        <div className="page-actions flex space-x-4">
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            미리보기
          </button>
          <button
            onClick={handleDeleteQuiz}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            퀴즈 삭제
          </button>
        </div>
      </div>

      {/* 퀴즈 기본 정보 */}
      <QuizBasicInfo quizId={quizId} quiz={quiz} />

      {/* 기존 질문 관리 */}
      <div className="questions-section space-y-4">
        <h2 className="text-xl font-bold text-gray-800">퀴즈 질문 관리</h2>
        {questionsData ? (
          <QuestionList
            questions={questionsData}
            editingQuestionId={editingQuestion}
            onEditQuestion={setEditingQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        ) : (
          <p>질문을 불러오는 중...</p>
        )}
      </div>

      {/* 새 질문 추가 */}
      {quizId && (
        <CreateQuizComponent
          quizId={quizId}
          onCreateQuestion={handleCreateQuestion}
        />
      )}
    </div>
  )
}

export default QuizEditPage
