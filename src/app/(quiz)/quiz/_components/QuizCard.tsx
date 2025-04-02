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

const QuizCard: React.FC<QuizCardProps> = ({
  id,
  title,
  description,
  thumbnail,
}) => {
  return (
    <Link href={`/quiz/${id}`} className="block">
      <Card className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-contain"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-center px-2 line-clamp-2">
              {title.length > 20 ? `${title.substring(0, 20)}...` : title}
            </span>
          </div>
        )}
        <CardContent>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-gray-600 line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default QuizCard
