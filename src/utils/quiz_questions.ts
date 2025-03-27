// utils/question.ts
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
