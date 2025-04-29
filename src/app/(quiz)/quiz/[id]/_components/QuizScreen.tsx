import { QuizWithQuestions } from '@/types/quiz'
import { FormEvent, useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine, ArrowRight, Brain } from 'lucide-react'
import TextWithCodeBlock from './TextWithCodeBlock'

import Image from 'next/image'

interface QuizScreenProps {
  quiz: QuizWithQuestions
  currentQuestionIndex: number
  selectedQuestions: number[] // 선택된 문제 인덱스 배열 추가
  onSubmit: (userAnswer: string) => void
}

export default function QuizScreen({
  quiz,
  currentQuestionIndex,
  selectedQuestions, // 추가된 props
  onSubmit,
}: QuizScreenProps) {
  // 선택된 문제 인덱스를 사용하여 실제 문제 가져오기
  const actualQuestionIndex = selectedQuestions[currentQuestionIndex]
  const currentQuestion = quiz.questions[actualQuestionIndex]

  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
    setInputValue('') // 새 문제가 표시될 때 입력값 초기화
  }, [currentQuestionIndex])

  // 엔터 키 이벤트 핸들러 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault()
        onSubmit(inputValue)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [inputValue, onSubmit])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const answer = formData.get('answer') as string | null
    if (answer !== null && answer.trim()) {
      onSubmit(answer)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="shadow-lg border-2 overflow-hidden">
          <CardHeader className="pb-2 px-6">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-700">
                문제 {currentQuestionIndex + 1} / {selectedQuestions.length}
              </p>
              <div className="flex space-x-2">
                {Array.from({ length: selectedQuestions.length }).map(
                  (_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8 }}
                      animate={{
                        scale: index === currentQuestionIndex ? 1.2 : 1,
                        backgroundColor:
                          index < currentQuestionIndex
                            ? '#6366f1'
                            : index === currentQuestionIndex
                            ? '#4f46e5'
                            : '#d1d5db',
                      }}
                      className="w-3 h-3 rounded-full"
                    />
                  )
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`question-${currentQuestionIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center mb-6"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="mb-4"
                >
                  <Brain className="w-16 h-16 text-indigo-500" />
                </motion.div>

                {/* <motion.h2
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold mb-6 text-center"
                >
                  {currentQuestion.question_text}
                </motion.h2> */}
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold mb-6 text-center "
                >
                  <TextWithCodeBlock content={currentQuestion.question_text} />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {currentQuestion.question_image_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 flex justify-center"
              >
                <div className="relative w-full max-w-md h-auto">
                  <Image
                    src={currentQuestion.question_image_url}
                    alt="문제 이미지"
                    layout="responsive"
                    width={500} // 이미지의 기본 너비
                    height={300} // 이미지의 기본 높이
                    className="rounded-lg shadow-sm"
                  />
                </div>
              </motion.div>
            )}

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <div className="flex flex-col gap-5">
                <div className="relative">
                  <PenLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                  <Input
                    ref={inputRef}
                    type="text"
                    name="answer"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="답변을 입력하세요"
                    required
                    className="flex-grow text-lg p-6 pl-12 h-auto rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl p-5 h-auto rounded-lg w-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  제출하기
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.form>
          </CardContent>

          <CardFooter className="justify-center pt-2 pb-6 px-6">
            <p className="text-sm text-gray-500 text-center">
              답변을 입력한 후 엔터 키를 누르거나 제출 버튼을 클릭하세요
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
