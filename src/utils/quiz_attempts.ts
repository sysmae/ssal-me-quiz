// utils/quiz_attempts.ts
import { createClient } from '@/utils/supabase/client'
import {
  QuizAttemptInsertData,
  QuizAttemptQuestionInsertData,
} from '@/types/quiz_attempt'

const supabase = createClient()

export const quizAttempts = {
  // 퀴즈 시도 생성 및 관리
  createAttemptAndQuestions: async (
    {
      quiz_id: quiz_id,
      total_questions: total_questions,
      correct_answers: correct_answers,
      score: score,
    }: QuizAttemptInsertData,
    quizAttemptQuestionData: QuizAttemptQuestionInsertData[]
  ) => {
    // 유저가 있는지 확인하고 userId 가져오기
    // 만약 유저가 없다면 userId를 null로 설정
    const userId = (await supabase.auth.getUser()).data.user?.id ?? null

    // 일단 퀴즈 시도 생성
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id,
        user_id: userId,
        total_questions,
        correct_answers,
        score,
      })
      .select('*')
      .single()

    // 에러 처리
    if (attemptError) throw attemptError

    // 퀴즈 시도 ID 가져오기
    const attemptId = attempt.id

    // 문제 및 답변 정보 생성
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_attempt_questions')
      .insert(
        quizAttemptQuestionData.map((question) => ({
          ...question,
          attempt_id: attemptId,
        }))
      )
      .select('*')
      .single()

    // 에러 처리
    if (questionsError) throw questionsError
  },

  // 퀴즈 결과 관련 기능
  results: {
    // 특정 퀴즈 시도 결과 가져오기
    getAttemptResult: async (attemptId: number) => {
      // 퀴즈 시도 정보 가져오기
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('id', attemptId)
        .single()

      if (attemptError) throw attemptError

      // 문제 및 답변 정보 가져오기
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_attempt_questions')
        .select(
          `
          *,
          question:quiz_questions(*)
        `
        )
        .eq('attempt_id', attemptId)

      if (questionsError) throw questionsError

      return {
        attempt,
        questions,
      }
    },
  },
}
// 사용자의 모든 퀴즈 시도 목록 가져오기
//   getUserAttempts: async () => {
//     const userId = (await supabase.auth.getUser()).data.user?.id
//     if (!userId) throw new Error('User not found')

//     const { data, error } = await supabase
//       .from('quiz_attempts')
//       .select('*')
//       .eq('user_id', userId)
//       .order('created_at', { ascending: false })

//     if (error) throw error
//     return data
//   },

// 최근 퀴즈 시도 가져오기
//   getRecentAttempts: async (limit = 5) => {
//     const userId = (await supabase.auth.getUser()).data.user?.id
//     if (!userId) throw new Error('User not found')

//     const { data, error } = await supabase
//       .from('quiz_attempts')
//       .select('*')
//       .eq('user_id', userId)
//       .eq('is_completed', true)
//       .order('completed_at', { ascending: false })
//       .limit(limit)

//     if (error) throw error
//     return data
//   },
// },
