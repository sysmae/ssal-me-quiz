// utils/quiz_question.ts
import { createClient } from '@/utils/supabase/client'

import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from '@/app/actions/quiz_questions'

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
    update: updateQuestion,
    delete: deleteQuestion,
  },
  create: createQuestion,
}
