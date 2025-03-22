'use client'

import { useQuizQueries } from '@/hooks/useQuizQueries'
import { useState, useEffect } from 'react'

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

export default QuizBasicInfo
