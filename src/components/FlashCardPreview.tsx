import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const sampleFlashCards = [
  {
    id: 1,
    front: 'React에서 useState는 무엇인가요?',
    back: '컴포넌트의 상태를 관리하기 위한 React Hook입니다. 상태값과 상태를 변경하는 함수를 반환합니다.',
  },
  {
    id: 2,
    front: 'JavaScript의 클로저란?',
    back: '함수가 선언될 때의 렉시컬 환경을 기억하는 함수입니다. 외부 함수의 변수에 접근할 수 있습니다.',
  },
  {
    id: 3,
    front: 'CSS Flexbox의 주요 속성은?',
    back: 'display: flex, justify-content, align-items, flex-direction 등이 있습니다.',
  },
]

export default function FlashCardPreview() {
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const nextCard = () => {
    setIsFlipped(false)
    setCurrentCard((prev) => (prev + 1) % sampleFlashCards.length)
  }

  const prevCard = () => {
    setIsFlipped(false)
    setCurrentCard(
      (prev) => (prev - 1 + sampleFlashCards.length) % sampleFlashCards.length
    )
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="perspective-1000">
        <motion.div
          className="relative w-full h-64 cursor-pointer"
          onClick={flipCard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCard}-${isFlipped}`}
              className="absolute inset-0 w-full h-full"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {isFlipped
                      ? sampleFlashCards[currentCard].back
                      : sampleFlashCards[currentCard].front}
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    {isFlipped ? '답변' : '질문'} • 클릭하여 뒤집기
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-6">
        <motion.button
          onClick={prevCard}
          className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
        </motion.button>

        <div className="flex space-x-2">
          {sampleFlashCards.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentCard ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: index === currentCard ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        <motion.button
          onClick={nextCard}
          className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-600" />
        </motion.button>
      </div>

      {/* Quick Action Button */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.button
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          플래시 카드 만들기
        </motion.button>
      </motion.div>
    </div>
  )
}
