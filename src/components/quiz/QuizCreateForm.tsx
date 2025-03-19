'use client'
import React, { useState } from 'react'

export const QuizCreateForm = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('questions', questions)
    try {
      console.log(formData.get('title'))
      console.log(formData.get('description'))
      console.log(formData.get('questions'))
    } catch (error) {
      console.error('퀴즈 생성 중 오류 발생:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">제목</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="questions">질문들 (JSON 형식)</label>
        <textarea
          id="questions"
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          required
        />
      </div>
      <button type="submit">퀴즈 생성</button>
    </form>
  )
}
