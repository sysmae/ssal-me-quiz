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
  const { updateTitle, updateDescription, updatePublished, updateThumbnail } =
    useQuizQueries(quizId)

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || '')
      setDescription(quiz.description || '')
      setPublished(quiz.published || false)
    }
  }, [quiz])

  const handleTitleSave = () => {
    if (!title.trim()) return

    try {
      updateTitle(title)
      setMessageType('success')
      setSaveMessage('제목이 저장되었습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setMessageType('error')
      setSaveMessage('제목 저장 중 오류가 발생했습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleDescriptionSave = () => {
    try {
      updateDescription(description)
      setMessageType('success')
      setSaveMessage('설명이 저장되었습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setMessageType('error')
      setSaveMessage('설명 저장 중 오류가 발생했습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handlePublish = () => {
    try {
      updatePublished(!published)
      setPublished((prev) => !prev)
      setMessageType('success')
      setSaveMessage(`퀴즈가 ${!published ? '발행' : '발행 취소'}되었습니다.`)
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setMessageType('error')
      setSaveMessage('발행 상태 변경 중 오류가 발생했습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleThumbnailChange = (url: string) => {
    try {
      updateThumbnail(url)
      setMessageType('success')
      setSaveMessage('썸네일이 업데이트되었습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setMessageType('error')
      setSaveMessage('썸네일 업데이트 중 오류가 발생했습니다.')
      setTimeout(() => setSaveMessage(''), 3000)
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
            />
            <Button
              onClick={handleTitleSave}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <Save className="h-4 w-4 mr-2" />
              저장
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
            />
            <Button
              onClick={handleDescriptionSave}
              className="bg-indigo-500 hover:bg-indigo-600 self-end"
            >
              <Save className="h-4 w-4 mr-2" />
              저장
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
