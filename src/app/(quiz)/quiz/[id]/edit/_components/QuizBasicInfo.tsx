'use client'

import { useQuizQueries } from '@/hooks/useQuizQueries'
import { useState, useEffect, useCallback } from 'react'
import { QuizData } from '@/types/quiz'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Check, Save } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ThumbnailUploader from './ThumbnailUploader'

const QuizBasicInfo = ({
  quizId,
  quiz,
}: {
  quizId: number
  quiz: QuizData
}) => {
  const [title, setTitle] = useState(quiz?.title || '')
  const [description, setDescription] = useState(quiz?.description || '')
  const [saveMessage, setSaveMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [published, setPublished] = useState(quiz?.published || false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [isSavingDescription, setIsSavingDescription] = useState(false)
  const [isSavingThumbnail, setIsSavingThumbnail] = useState(false)
  const [isTitleChanged, setIsTitleChanged] = useState(false)
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false)

  const { updateTitle, updateDescription, updatePublished, updateThumbnail } =
    useQuizQueries(quizId)

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || '')
      setDescription(quiz.description || '')
      setPublished(quiz.published || false)
    }
  }, [quiz])

  const showMessage = (message: string, type: 'success' | 'error') => {
    setMessageType(type)
    setSaveMessage(message)
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleTitleSave = async () => {
    if (!title.trim() || !isTitleChanged) return

    setIsSavingTitle(true)
    try {
      await updateTitle(title)
      showMessage('제목이 저장되었습니다.', 'success')
      setIsTitleChanged(false)
    } catch (error) {
      showMessage('제목 저장 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSavingTitle(false)
    }
  }

  const handleDescriptionSave = async () => {
    if (!isDescriptionChanged) return

    setIsSavingDescription(true)
    try {
      await updateDescription(description)
      showMessage('설명이 저장되었습니다.', 'success')
      setIsDescriptionChanged(false)
    } catch (error) {
      showMessage('설명 저장 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSavingDescription(false)
    }
  }

  const handleSave = useCallback(async () => {
    if (isTitleChanged) {
      await handleTitleSave()
    }
    if (isDescriptionChanged) {
      await handleDescriptionSave()
    }
  }, [
    isTitleChanged,
    isDescriptionChanged,
    handleTitleSave,
    handleDescriptionSave,
  ])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSave])

  // ... (나머지 코드는 그대로 유지)

  return (
    <div className="space-y-6">
      {/* ... (기존 JSX 코드) */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            퀴즈 제목
          </Label>
          <div className="flex space-x-2">
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setIsTitleChanged(true)
              }}
              placeholder="퀴즈 제목을 입력하세요"
              className="flex-grow"
              disabled={isSavingTitle}
            />
            <Button
              onClick={handleTitleSave}
              className="bg-indigo-500 hover:bg-indigo-600"
              disabled={isSavingTitle || !title.trim() || !isTitleChanged}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSavingTitle ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            퀴즈 설명
          </Label>
          <div className="flex flex-col space-y-2">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setIsDescriptionChanged(true)
              }}
              rows={4}
              placeholder="퀴즈에 대한 설명을 입력하세요"
              className="flex-grow resize-none"
              disabled={isSavingDescription}
            />
            <Button
              onClick={handleDescriptionSave}
              className="bg-indigo-500 hover:bg-indigo-600 self-end"
              disabled={isSavingDescription || !isDescriptionChanged}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSavingDescription ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>

        {/* ... (나머지 JSX 코드) */}
      </div>
    </div>
  )
}

export default QuizBasicInfo
