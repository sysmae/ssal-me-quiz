'use client'

import { useQuizQueries } from '@/hooks/useQuizQueries'
import { useState, useEffect } from 'react'
import { QuizData } from '@/types/quiz'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Check, Save } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ThumbnailUploader from './ThumbnailUploader'

// 퀴즈 기본 정보 컴포넌트
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

  const { updateTitle, updateDescription, updatePublished, updateThumbnail } =
    useQuizQueries(quizId)

  // 퀴즈 데이터가 변경될 때마다 로컬 상태 업데이트
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
    if (!title.trim()) return

    setIsSavingTitle(true)
    try {
      await updateTitle(title)
      showMessage('제목이 저장되었습니다.', 'success')
    } catch (error) {
      showMessage('제목 저장 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSavingTitle(false)
    }
  }

  const handleDescriptionSave = async () => {
    setIsSavingDescription(true)
    try {
      await updateDescription(description)
      showMessage('설명이 저장되었습니다.', 'success')
    } catch (error) {
      showMessage('설명 저장 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSavingDescription(false)
    }
  }

  const handlePublish = async () => {
    setIsUpdating(true)
    try {
      // 서버 측 검증이 이루어지므로 단순히 API 호출만 수행
      await updatePublished(!published)

      // API 호출이 성공하면 로컬 상태 업데이트
      setPublished((prev) => !prev)
      showMessage(
        `퀴즈가 ${!published ? '발행' : '발행 취소'}되었습니다.`,
        'success'
      )
    } catch (error) {
      // 서버에서 전달된 오류 메시지 사용
      const errorMessage =
        error instanceof Error
          ? error.message
          : '발행 상태 변경 중 오류가 발생했습니다.'

      showMessage(errorMessage, 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleThumbnailChange = async (url: string) => {
    setIsSavingThumbnail(true)
    try {
      await updateThumbnail(url)
      showMessage('썸네일이 업데이트되었습니다.', 'success')
    } catch (error) {
      showMessage('썸네일 업데이트 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSavingThumbnail(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-indigo-900">퀴즈 기본 정보</h2>
          <div className="flex items-center space-x-2">
            <Label htmlFor="published" className="text-sm font-medium">
              {published ? '발행됨' : '발행 안됨'}
            </Label>
            <Switch
              id="published"
              checked={published}
              onCheckedChange={handlePublish}
              disabled={isUpdating}
            />
          </div>
        </div>

        {saveMessage && (
          <Alert
            className={`${
              messageType === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <AlertDescription>
              {messageType === 'success' && (
                <Check className="h-4 w-4 inline mr-2" />
              )}
              {saveMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>

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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="퀴즈 제목을 입력하세요"
              className="flex-grow"
              disabled={isSavingTitle}
            />
            <Button
              onClick={handleTitleSave}
              className="bg-indigo-500 hover:bg-indigo-600"
              disabled={isSavingTitle || !title.trim()}
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
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="퀴즈에 대한 설명을 입력하세요"
              className="flex-grow resize-none"
              disabled={isSavingDescription}
            />
            <Button
              onClick={handleDescriptionSave}
              className="bg-indigo-500 hover:bg-indigo-600 self-end"
              disabled={isSavingDescription}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSavingDescription ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">퀴즈 썸네일</Label>
          <ThumbnailUploader
            quizId={quizId}
            currentThumbnail={quiz.thumbnail_url || null}
            onThumbnailChange={handleThumbnailChange}
          />
        </div>
      </div>
    </div>
  )
}

export default QuizBasicInfo
