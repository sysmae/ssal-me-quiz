import React from 'react'
import Link from 'next/link'

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
      <div className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">이미지 없음</span>
          </div>
        )}
        <div className="p-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default QuizCard
