// hooks/useQuizQuestionQueries.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quiz_questions } from '@/utils/quiz_question'
import { QuestionInsertData, QuestionUpdateData } from '@/types/quiz'

export const useQuestionQueries = (quizId: number) => {
  const queryClient = useQueryClient()

  const { data: questionsData, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['questions', quizId],
    queryFn: () => quiz_questions.list.getAll(quizId),
    enabled: !!quizId,
  })

  const createQuestion = useMutation({
    mutationFn: (questionData: QuestionInsertData) =>
      quiz_questions.create(questionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
    },
  })

  const updateQuestion = useMutation({
    mutationFn: ({
      questionId,
      updates,
    }: {
      questionId: number
      updates: QuestionUpdateData
    }) => quiz_questions.update(questionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
    },
  })

  const deleteQuestion = useMutation({
    mutationFn: (questionId: number) => quiz_questions.delete(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
    },
  })

  return {
    questionsData,
    isQuestionsLoading,
    createQuestion: createQuestion.mutate,
    updateQuestion: updateQuestion.mutate,
    deleteQuestion: deleteQuestion.mutate,
  }
}
