// utils/quiz_attempts.ts
import { createClient } from '@/utils/supabase/client'
import { QuizAttempt, QuizAttemptQuestion } from '@/types/quiz_attempt'

const supabase = createClient()

export const quizAttempts = {
  // 퀴즈 시도 생성 및 관리
  create: {
    // 새 퀴즈 시도 생성
    newAttempt: async (totalQuestions: number) => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          total_questions: totalQuestions,
          is_completed: false,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 퀴즈 시도에 문제 추가
    addQuestions: async (attemptId: number, questionIds: number[]) => {
      const questionsToInsert = questionIds.map((questionId) => ({
        attempt_id: attemptId,
        question_id: questionId,
      }))

      const { data, error } = await supabase
        .from('quiz_attempt_questions')
        .insert(questionsToInsert)
        .select()

      if (error) throw error
      return data
    },
  },

  // 진행 중인 퀴즈 관련 기능
  progress: {
    // 사용자 답변 저장
    saveAnswer: async (
      attemptId: number,
      questionId: number,
      userAnswer: string
    ) => {
      // 정답 확인을 위해 문제 정보 가져오기
      const { data: question, error: questionError } = await supabase
        .from('quiz_questions')
        .select('correct_answer')
        .eq('id', questionId)
        .single()

      if (questionError) throw questionError

      // 정답 여부 확인
      const isCorrect = userAnswer === question.correct_answer

      // 사용자 답변 저장
      const { data, error } = await supabase
        .from('quiz_attempt_questions')
        .update({
          user_answer: userAnswer,
          is_correct: isCorrect,
          answered_at: new Date().toISOString(),
        })
        .match({ attempt_id: attemptId, question_id: questionId })
        .select()
        .single()

      if (error) throw error
      return { ...data, isCorrect }
    },

    // 퀴즈 시도 완료 처리
    complete: async (attemptId: number) => {
      // 정답 수 계산
      const { data: answers, error: countError } = await supabase
        .from('quiz_attempt_questions')
        .select('is_correct')
        .eq('attempt_id', attemptId)

      if (countError) throw countError

      const correctAnswers = answers.filter((a) => a.is_correct).length
      const score = (correctAnswers / answers.length) * 100

      // 퀴즈 시도 업데이트
      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          completed_at: new Date().toISOString(),
          correct_answers: correctAnswers,
          score: score,
          is_completed: true,
        })
        .eq('id', attemptId)
        .select()
        .single()

      if (error) throw error
      return data
    },
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

    // 사용자의 모든 퀴즈 시도 목록 가져오기
    getUserAttempts: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    // 최근 퀴즈 시도 가져오기
    getRecentAttempts: async (limit = 5) => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    },
  },

  // 랜덤 문제 관련 기능
  random: {
    // 랜덤 문제 가져오기
    getRandomQuestions: async (count: number) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('random()')
        .limit(count)

      if (error) throw error
      return data
    },

    // 특정 퀴즈에서 랜덤 문제 가져오기
    getRandomQuestionsFromQuiz: async (quizId: number, count: number) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('random()')
        .limit(count)

      if (error) throw error
      return data
    },
  },
}
