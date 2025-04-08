import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type QuizCardProps = {
  id: string
  title: string
  description: string
  thumbnail: string
}

const ThumbnailCard = ({ title }: { title: string }) => {
  // 글자수 제한 (15자 이상이면 자르기)
  const displayTitle =
    title.length > 15 ? `${title.substring(0, 15)}...` : title

  return (
    <div className="relative w-full h-48 overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-700 to-gray-900">
      {/* 텍스트 영역 */}
      <div className="text-center px-4">
        <h3 className="text-white font-bold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {displayTitle}
        </h3>
      </div>
    </div>
  )
}

const QuizCard: React.FC<QuizCardProps> = ({
  id,
  title,
  description,
  thumbnail,
}) => {
  return (
    <Link href={`/quiz/${id}`} className="block">
      <Card className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative w-full h-48">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
          ) : (
            <ThumbnailCard title={title} />
          )}
        </div>
        <CardContent>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-gray-600 line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default QuizCard
