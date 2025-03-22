'use client'
import { useQuizQueries } from '@/hooks/useQuizQueries'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { useRouter } from 'next/navigation'

type Params = {
  id: string
}

// 퀴즈 기본 정보 컴포넌트
const QuizBasicInfo = ({ quizId, quiz }) => {
  const [title, setTitle] = useState(quiz?.title || '')
  const [description, setDescription] = useState(quiz?.description || '')
  const [saveMessage, setSaveMessage] = useState('')
  const { updateTitle, updateDescription } = useQuizQueries(quizId)

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || '')
      setDescription(quiz.description || '')
    }
  }, [quiz])

  const handleTitleSave = () => {
    if (!title.trim()) return

    try {
      updateTitle(title)
      setSaveMessage('제목이 저장되었습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('제목 저장 중 오류 발생:', error)
      setSaveMessage('제목 저장 중 오류가 발생했습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleDescriptionSave = () => {
    try {
      updateDescription(description)
      setSaveMessage('설명이 저장되었습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('설명 저장 중 오류 발생:', error)
      setSaveMessage('설명 저장 중 오류가 발생했습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  return (
    <div>
      <h2>퀴즈 기본 정보</h2>
      <div>
        <label>퀴즈 제목</label>
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="퀴즈 제목을 입력하세요"
          />
          <button onClick={handleTitleSave}>저장</button>
        </div>
      </div>
      <div>
        <label>퀴즈 설명</label>
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="퀴즈에 대한 설명을 입력하세요"
          />
          <button onClick={handleDescriptionSave}>저장</button>
        </div>
      </div>
      {saveMessage && <p>{saveMessage}</p>}
    </div>
  )
}

// 퀴즈 문제 목록 컴포넌트
const QuizQuestionList = ({ quizId, quiz }) => {
  return (
    <div>
      <h2>퀴즈 문제 목록</h2>
      {quiz?.questions?.length > 0 ? (
        <ul>
          {quiz.questions.map((question, index) => (
            <QuizQuestionItem
              key={index}
              question={question}
              index={index}
              quizId={quizId}
            />
          ))}
        </ul>
      ) : (
        <div>
          <p>등록된 문제가 없습니다.</p>
          <button>문제 추가하기</button>
        </div>
      )}
    </div>
  )
}

// 개별 퀴즈 문제 컴포넌트
const QuizQuestionItem = ({ question, index, quizId }) => {
  return (
    <li>
      <div>
        <span>문제 {index + 1}</span>
        <button>편집</button>
        <button>삭제</button>
      </div>
      <p>{question.content || '문제 내용이 없습니다.'}</p>
    </li>
  )
}

interface QuizEditPageProps {
  params: Params
}

// 메인 퀴즈 편집 페이지 컴포넌트
const QuizEditPage: React.FC<QuizEditPageProps> = ({ params }) => {
  const router = useRouter()
  const [quizId, setQuizId] = useState<number | null>(null)

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const resolvedParams = await params
        if (resolvedParams.id) {
          setQuizId(Number(resolvedParams.id))
        }
      } catch (error) {
        console.error('파라미터 처리 중 오류:', error)
      }
    }
    fetchParams()
  }, [params])

  const { quiz, deleteQuiz } = useQuizQueries(quizId ?? 0)

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

  if (!quizId || !quiz) return <p>로딩 중...</p>

  return (
    <div>
      <h1>퀴즈 편집</h1>
      <button onClick={() => router.push(`/quiz/${quizId}/view`)}>
        미리보기
      </button>
      <button onClick={handleDeleteQuiz}>퀴즈 삭제</button>
      <QuizBasicInfo quizId={quizId} quiz={quiz} />
      <QuizQuestionList quizId={quizId} quiz={quiz} />
    </div>
  )
}

export default QuizEditPage
