'use client'
import { QuizWithQuestions } from '@/types/quiz'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'

interface MultipleChoiceQuizScreenProps {
  quiz: QuizWithQuestions
  currentQuestionIndex: number
  selectedQuestions: number[]
  onSubmit: (userAnswer: string) => void
}

export default function MultipleChoiceQuizScreen({
  quiz,
  currentQuestionIndex,
  selectedQuestions,
  onSubmit,
}: MultipleChoiceQuizScreenProps) {
  const actualQuestionIndex = selectedQuestions[currentQuestionIndex]
  const currentQuestion = quiz.questions[actualQuestionIndex]
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [options, setOptions] = useState<any[]>([])
  const supabase = createClient()

  // 객관식 옵션 가져오기
  const fetchOptions = useCallback(async () => {
    const { data, error } = await supabase
      .from('quiz_options')
      .select('*')
      .eq('question_id', currentQuestion.id)

    if (error) {
      console.error('옵션 가져오기 오류:', error)
      return
    }

    setOptions(data || [])
  }, [supabase, currentQuestion.id])

  // 문제가 바뀌면 선택 초기화 및 옵션 가져오기
  useEffect(() => {
    setSelectedOption(null)
    fetchOptions()
  }, [currentQuestionIndex, currentQuestion.id, fetchOptions])

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit(selectedOption)
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
        <Card className="shadow-lg border-2 overflow-hidden dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-2 px-6">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
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

                <motion.h2
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold mb-6 text-center dark:text-white"
                >
                  {currentQuestion.question_text}
                </motion.h2>
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
                    width={500}
                    height={300}
                    className="rounded-lg shadow-sm"
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <RadioGroup
                value={selectedOption || ''}
                onValueChange={setSelectedOption}
                className="space-y-4"
              >
                {options.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 border-2 ${
                      selectedOption === option.option_text
                        ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-700'
                    } rounded-lg p-4 hover:border-indigo-300 transition-all dark:hover:border-indigo-600 cursor-pointer`}
                    onClick={() => setSelectedOption(option.option_text)}
                  >
                    <RadioGroupItem
                      value={option.option_text}
                      id={`option-${option.id}`}
                      className="dark:border-gray-500"
                    />
                    <Label
                      htmlFor={`option-${option.id}`}
                      className="flex-grow text-lg cursor-pointer dark:text-gray-200"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl p-5 h-auto rounded-lg w-full mt-6 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 dark:bg-indigo-700 dark:hover:bg-indigo-800"
              >
                제출하기
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </CardContent>

          <CardFooter className="justify-center pt-2 pb-6 px-6">
            <p className="text-sm text-gray-500 text-center dark:text-gray-400">
              답변을 선택한 후 제출 버튼을 클릭하세요
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
