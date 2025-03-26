// utils/quiz_instances.ts
import { createClient } from '@/utils/supabase/client'
import { QuizInstance, QuizInstanceInsertData } from '@/types/quiz_instance'

const supabase = createClient()

export const quiz_instances = {
  // 인스턴스 생성 관련 기능
  create: async (instance: QuizInstanceInsertData) => {
    const { data, error } = await supabase
      .from('quiz_instances')
      .insert(instance)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 인스턴스 목록 관련 기능
  list: {
    getByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('quiz_instances')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })

      if (error) throw error
      return data
    },

    getInProgressByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('quiz_instances')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .order('start_time', { ascending: false })

      if (error) throw error
      return data
    },

    getBySessionToken: async (sessionToken: string) => {
      const { data, error } = await supabase
        .from('quiz_instances')
        .select('*')
        .eq('session_token', sessionToken)
        .order('start_time', { ascending: false })

      if (error) throw error
      return data
    },
  },

  // 인스턴스 상세 관련 기능
  details: {
    get: async (id: number) => {
      const { data, error } = await supabase
        .from('quiz_instances')
        .select(
          `
          *,
          quiz_instance_questions (
            id,
            question_id,
            question_order,
            quiz_questions (*)
          ),
          quiz_instance_answers (
            id,
            question_id,
            user_answer,
            is_correct
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    update: async (id: number, updates: Partial<QuizInstance>) => {
      const { data, error } = await supabase
        .from('quiz_instances')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      return data
    },

    complete: async (id: number, score: number) => {
      const { data, error } = await supabase
        .from('quiz_instances')
        .update({
          completed: true,
          score: score,
          end_time: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      return data
    },
  },
}
