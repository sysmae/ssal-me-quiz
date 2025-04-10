'use client'

import { useQuizQueries } from '@/hooks/useQuizQueries'
import StartScreen from './StartScreen'
import QuizScreen from './QuizScreen'
import FeedbackScreen from './FeedbackScreen'
import ResultScreen from './ResultScreen'
import { QuizQuestionType } from '@/constants'
import MultipleChoiceQuizScreen from './MultipleChoiceQuizScreen'
import { useQuizGame } from '@/hooks/useQuizGame'
import { useQuizView } from '@/hooks/useQuizView'

export default function QuizClient({ id }: { id: string }) {
  const { quiz } = useQuizQueries(Number(id))
  const { incrementViewCount } = useQuizView(id, quiz)

  const {
    state,
    selectedQuestions,
    quizMode,
    setQuizMode,
    handleStartQuiz,
    handleAnswer,
    handleNextQuestion,
    handleRestartQuiz,
    getCurrentQuestionType,
    saveQuizResults,
  } = useQuizGame(Number(id), quiz)

  // 로딩 및 에러 상태 확인
  if (!quiz) {
    return <div>로딩 중이거나 오류가 발생했습니다.</div>
  }

  return (
    <div className="container mx-auto p-4">
      {state.status === 'start' && (
        <StartScreen
          quiz={quiz}
          onStart={handleStartQuiz}
          quizMode={quizMode}
          setQuizMode={setQuizMode}
        />
      )}

      {state.status === 'quiz' && (
        <>
          {quizMode === QuizQuestionType.SUBJECTIVE ? (
            <QuizScreen
              quiz={quiz}
              currentQuestionIndex={state.currentQuestionIndex}
              selectedQuestions={selectedQuestions}
              onSubmit={handleAnswer}
            />
          ) : getCurrentQuestionType() === QuizQuestionType.MULTIPLE_CHOICE ? (
            <MultipleChoiceQuizScreen
              quiz={quiz}
              currentQuestionIndex={state.currentQuestionIndex}
              selectedQuestions={selectedQuestions}
              onSubmit={handleAnswer}
            />
          ) : (
            <QuizScreen
              quiz={quiz}
              currentQuestionIndex={state.currentQuestionIndex}
              selectedQuestions={selectedQuestions}
              onSubmit={handleAnswer}
            />
          )}
        </>
      )}

      {state.status === 'feedback' && (
        <FeedbackScreen
          quiz={quiz}
          currentQuestionIndex={state.currentQuestionIndex}
          selectedQuestions={selectedQuestions}
          currentAnswer={state.currentAnswer}
          onNext={handleNextQuestion}
        />
      )}

      {state.status === 'result' && (
        <ResultScreen
          quiz={quiz}
          onRestart={handleRestartQuiz}
          saveQuizResults={saveQuizResults}
          selectedCount={selectedQuestions.length}
        />
      )}
    </div>
  )
}
