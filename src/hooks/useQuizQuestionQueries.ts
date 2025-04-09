// hooks/useQuizQuestionQueries.ts
'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import {
  QuestionData,
  QuestionInsertData,
  QuestionUpdateData,
  OptionInsertData,
  OptionData,
} from '@/types/quiz'

export const useQuestionQueries = (quizId: number) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // 질문 목록 조회
  const { data: questionsData, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['questions', quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*, options:quiz_options(*)')
        .eq('quiz_id', quizId)
        .order('id', { ascending: true })

      if (error) throw error
      return data as QuestionData[]
    },
    enabled: !!quizId,
  })

  // 질문 생성
  const createQuestion = useCallback(
    async (questionData: QuestionInsertData) => {
      try {
        // 1. 질문 생성
        const { data: newQuestion, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: questionData.quiz_id,
            question_text: questionData.question_text,
            question_type: questionData.question_type,
            correct_answer:
              questionData.question_type === 'multiple_choice'
                ? questionData.options?.find((opt) => opt.is_correct)
                    ?.option_text || ''
                : questionData.correct_answer,
          })
          .select()
          .single()

        if (questionError) throw questionError

        // 2. 객관식 문제인 경우 옵션 생성
        if (
          questionData.question_type === 'multiple_choice' &&
          'options' in questionData &&
          questionData.options
        ) {
          const options = questionData.options.map(
            (option: OptionInsertData) => ({
              ...option,
              question_id: newQuestion.id,
            })
          )

          const { error: optionsError } = await supabase
            .from('quiz_options')
            .insert(options)

          if (optionsError) throw optionsError
        }

        // 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
        return newQuestion
      } catch (error) {
        console.error('질문 생성 오류:', error)
        throw error
      }
    },
    [quizId, supabase, queryClient]
  )

  // 질문 업데이트
  const updateQuestion = useCallback(
    async ({
      questionId,
      updates,
      options,
    }: {
      questionId: number
      updates: QuestionUpdateData
      options?: OptionInsertData[]
    }) => {
      try {
        // 객관식 문제의 경우 correct_answer를 options에서 추출
        const correctAnswer =
          updates.question_type === 'multiple_choice' && options
            ? options.find((opt) => opt.is_correct)?.option_text || ''
            : updates.correct_answer

        // 1. 질문 업데이트
        const { data: updatedQuestion, error: questionError } = await supabase
          .from('quiz_questions')
          .update({
            ...updates,
            correct_answer: correctAnswer,
          })
          .eq('id', questionId)
          .select()
          .single()

        if (questionError) throw questionError

        // 2. 객관식 문제인 경우 옵션 업데이트
        if (updatedQuestion.question_type === 'multiple_choice' && options) {
          // 기존 옵션 삭제
          const { error: deleteError } = await supabase
            .from('quiz_options')
            .delete()
            .eq('question_id', questionId)

          if (deleteError) throw deleteError

          // 새 옵션 추가
          const validOptions = options.map((option) => ({
            ...option,
            question_id: questionId,
            option_text: option.option_text || '', // 기본값 설정
          }))

          const { error: insertError } = await supabase
            .from('quiz_options')
            .insert(validOptions)

          if (insertError) throw insertError
        }

        // 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
        return updatedQuestion
      } catch (error) {
        console.error('질문 업데이트 오류:', error)
        throw error
      }
    },
    [quizId, supabase, queryClient]
  )

  // 질문 삭제
  const deleteQuestion = useCallback(
    async (questionId: number) => {
      try {
        // 질문을 삭제하면 외래 키 제약 조건으로 인해 관련 옵션도 자동 삭제됨
        const { error } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('id', questionId)

        if (error) throw error

        // 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['questions', quizId] })
      } catch (error) {
        console.error('질문 삭제 오류:', error)
        throw error
      }
    },
    [quizId, supabase, queryClient]
  )

  return {
    questionsData,
    isQuestionsLoading,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  }
}
