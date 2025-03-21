import { QuizData } from '@/types/quiz'
import { createClient } from '@/utils/supabase/server'

// lib/api/server.ts 수정
export async function createQuiz(quizData: QuizData) {
  const supabase = await createClient()

  // 트랜잭션 처리를 위한 함수
  const createQuizWithQuestions = async () => {
    // 1. 퀴즈 기본 정보 저장
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: quizData.title,
        description: quizData.description || null,
        thumbnail_url: quizData.thumbnail_url || null,
        created_by: quizData.userId,
        view_count: 0,
        like_count: 0,
      })
      .select()
      .single()

    if (quizError) throw quizError

    // 2. 퀴즈 문제들 저장
    if (quizData.questions && quizData.questions.length > 0) {
      for (const question of quizData.questions) {
        // 2-1. 문제 저장
        const { data: savedQuestion, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: quiz.id,
            question_text: question.question_text,
            correct_answer: question.correct_answer,
            question_type: question.question_type,
            question_image_url: question.question_image_url || null,
            order_number: question.order_number,
          })
          .select()
          .single()

        if (questionError) throw questionError

        // 2-2. 대체 정답 저장 (있는 경우)
        if (
          question.alternative_answers &&
          question.alternative_answers.length > 0
        ) {
          const alternativeAnswersData = question.alternative_answers.map(
            (alt) => ({
              question_id: savedQuestion.id,
              alternative_answer: alt,
            })
          )

          const { error: altError } = await supabase
            .from('alternative_answers')
            .insert(alternativeAnswersData)

          if (altError) throw altError
        }
      }
    }

    return quiz
  }

  try {
    // 트랜잭션 실행
    const quiz = await createQuizWithQuestions()
    return quiz
  } catch (error) {
    console.error('퀴즈 생성 중 오류:', error)
    throw error
  }
}
