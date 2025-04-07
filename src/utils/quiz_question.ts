// utils/quiz_question.ts
import { createClient } from '@/utils/supabase/client'
import {
  QuestionData,
  QuestionInsertData,
  QuestionUpdateData,
} from '@/types/quiz'

const supabase = createClient()

export const quiz_questions = {
  // 문제 목록 관련 기능
  list: {
    getAll: async (quizId: number) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)

      if (error) throw error
      return data
    },
  },
  // 문제 상세 관련 기능
  details: {
    get: async (id: number) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    update: async (id: number, updates: QuestionUpdateData) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      return data
    },
    delete: async (id: number) => {
      // 1. 먼저 해당 문제의 정보를 가져와 퀴즈 ID를 확인
      const { data: question, error: questionError } = await supabase
        .from('quiz_questions')
        .select('quiz_id')
        .eq('id', id)
        .single()

      if (questionError) throw questionError

      // 2. 퀴즈의 상태 확인 (공개 여부)
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('published')
        .eq('id', question.quiz_id)
        .single()

      if (quizError) throw quizError

      // 3. 해당 퀴즈에 속한 문제 개수 확인
      const { data: questions, error: countError } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact' })
        .eq('quiz_id', question.quiz_id)

      if (countError) throw countError

      // 4. 공개 상태이고 문제가 5개 미만이면 삭제 불가
      if (quiz.published && questions.length <= 5) {
        alert('공개된 퀴즈는 최소 5개 이상의 문제를 유자해야 합니다.')
        return
      }

      // 조건을 통과하면 삭제 진행
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
  },
  // 문제 생성 관련 기능
  create: async (question: QuestionInsertData) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(question)

    if (error) throw error
    return data
  },
}
