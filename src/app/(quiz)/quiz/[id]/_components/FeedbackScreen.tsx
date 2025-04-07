import { QuizWithQuestions } from '@/types/quiz'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type FeedbackScreenProps = {
  quiz: QuizWithQuestions
  currentQuestionIndex: number
  selectedQuestions: number[] // 선택된 문제 인덱스 배열 추가
  currentAnswer: {
    userAnswer: string
    isCorrect: boolean
  }
  onNext: () => void
}

export default function FeedbackScreen({
  quiz,
  currentQuestionIndex,
  selectedQuestions, // 추가된 props
  currentAnswer,
  onNext,
}: FeedbackScreenProps) {
  // 선택된 문제 인덱스를 사용하여 실제 문제 가져오기
  const actualQuestionIndex = selectedQuestions[currentQuestionIndex]
  const currentQuestion = quiz.questions[actualQuestionIndex]

  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [userFeedback, setUserFeedback] = useState<string | null>(null)

  useEffect(() => {
    // 엔터 키 이벤트 핸들러 추가
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onNext])

  // 버튼에 자동 포커스
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.focus()
    }
    // 새 문제가 표시될 때 설명 초기화
    setShowExplanation(false)
    setUserFeedback(null)
  }, [currentQuestionIndex])

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
                            ? currentAnswer.isCorrect
                              ? '#22c55e'
                              : '#ef4444'
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
                key={`feedback-${currentQuestionIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center mb-6"
              >
                {currentAnswer.isCorrect ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <XCircle className="w-16 h-16 text-red-500 mb-3" />
                  </motion.div>
                )}
                <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">
                  {currentAnswer.isCorrect ? '정답입니다!' : '오답입니다.'}
                </h2>
                <p className="text-gray-600 text-center dark:text-gray-300">
                  {currentAnswer.isCorrect
                    ? '잘하셨습니다! 다음 문제로 계속 진행해보세요.'
                    : '괜찮습니다. 아래 정답을 확인해보세요.'}
                </p>
              </motion.div>
            </AnimatePresence>

            <Tabs defaultValue="answer" className="w-full">
              <TabsContent value="answer" className="pt-2">
                <div className="p-5 rounded-lg mb-6 max-h-[400px] overflow-y-auto dark:bg-gray-700/20">
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                    문제
                  </h3>
                  <p className="text-xl mb-4 dark:text-white">
                    {currentQuestion.question_text}
                  </p>

                  {currentQuestion.question_image_url && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={currentQuestion.question_image_url}
                        alt="문제 이미지"
                        className="w-full max-w-md h-auto rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start gap-4 mt-6">
                    <div className="flex-1 min-w-[200px] w-full">
                      <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                        제출한 답변
                      </h3>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`p-4 rounded-lg border-2 ${
                          currentAnswer.isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:text-green-200'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-200'
                        }`}
                      >
                        <p className="text-lg">{currentAnswer.userAnswer}</p>
                      </motion.div>
                    </div>

                    {!currentAnswer.isCorrect && (
                      <div className="flex-1 min-w-[200px] w-full mt-4 sm:mt-0">
                        <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                          정답
                        </h3>
                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 dark:text-green-200"
                        >
                          <p className="text-lg">
                            {currentQuestion.correct_answer}
                          </p>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="justify-center pt-2 pb-6 px-6">
            <Button
              ref={buttonRef}
              onClick={onNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl p-5 h-auto rounded-lg w-full max-w-xs transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg dark:bg-indigo-700 dark:hover:bg-indigo-800"
            >
              {currentQuestionIndex < selectedQuestions.length - 1
                ? '다음 문제'
                : '결과 보기'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
