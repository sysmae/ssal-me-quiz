// utils/quiz_instance_questions.ts
import { createClient } from '@/utils/supabase/client'
import { QuizInstanceQuestion } from '@/types/quiz_instance_questions'

const supabase = createClient()

export const quiz_instance_questions = {
  // 인스턴스 문제 생성 관련 기능
  create: async (questions: QuizInstanceQuestion[]) => {
    const { data, error } = await supabase
      .from('quiz_instance_questions')
      .insert(questions)
      .select()

    if (error) throw error
    return data
  },

  // 인스턴스 문제 목록 관련 기능
  list: {
    getByInstanceId: async (instanceId: number) => {
      const { data, error } = await supabase
        .from('quiz_instance_questions')
        .select(
          `
          id,
          question_id,
          question_order,
          quiz_questions (*)
        `
        )
        .eq('instance_id', instanceId)
        .order('question_order', { ascending: true })

      if (error) throw error
      return data
    },
  },

  // 랜덤 문제 선택 기능
  getRandomQuestions: async (count: number) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id')
      .order('RANDOM()')
      .limit(count)

    if (error) throw error
    return data
  },
}
