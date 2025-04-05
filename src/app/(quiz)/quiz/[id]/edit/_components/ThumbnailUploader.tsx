'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { quizzes } from '@/utils/quiz'

interface ThumbnailUploaderProps {
  quizId: number
  currentThumbnail: string | null
  onThumbnailChange: (url: string) => void
}

const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({
  quizId,
  currentThumbnail,
  onThumbnailChange,
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentThumbnail)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 유형 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    try {
      setUploading(true)

      // 로컬 미리보기 생성
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Supabase에 업로드
      const thumbnailUrl = await quizzes.thumbnails.uploadThumbnail(file)

      // 업로드 성공 시 부모 컴포넌트에 URL 전달
      onThumbnailChange(thumbnailUrl)

      // 로컬 URL 해제
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(thumbnailUrl)
    } catch (error) {
      // 더 구체적인 오류 메시지 표시
      let errorMessage = '썸네일 업로드 중 오류가 발생했습니다.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      alert(errorMessage)

      // 미리보기 초기화
      setPreviewUrl(currentThumbnail)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveThumbnail = async () => {
    if (confirm('썸네일을 삭제하시겠습니까?')) {
      try {
        // 현재 썸네일이 있는 경우에만 삭제 작업 수행
        if (currentThumbnail) {
          setUploading(true)
          // TODO: Supabase 스토리지에서 실제 파일 삭제
          await quizzes.thumbnails.deleteThumbnail(currentThumbnail, quizId)

          // 썸네일 URL 초기화
          setPreviewUrl(null)
        }

        // UI 상태 업데이트
        setPreviewUrl(null)
        onThumbnailChange('')
      } catch (error) {
        let errorMessage = '썸네일 삭제 중 오류가 발생했습니다.'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        alert(errorMessage)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <Label htmlFor="thumbnail" className="mb-2">
              퀴즈 썸네일
            </Label>

            {previewUrl ? (
              <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="퀴즈 썸네일"
                  fill
                  style={{ objectFit: 'contain' }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={handleRemoveThumbnail}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-md flex flex-col items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  썸네일 이미지가 없습니다
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            <Label
              htmlFor="thumbnail"
              className="w-full flex items-center justify-center p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? '업로드 중...' : '썸네일 업로드'}
            </Label>
            <p className="text-xs text-gray-500 text-center">
              권장 크기: 1200 x 630px (16:9 비율), 최대 5MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ThumbnailUploader
