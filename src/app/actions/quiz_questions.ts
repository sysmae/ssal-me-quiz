'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  QuestionUpdateData,
  QuestionInsertData,
  OptionData,
} from '@/types/quiz'
import { QuizQuestionType } from '@/constants'

// 문제 생성 (객관식 지원)
export const createQuestion = async (
  question: QuestionInsertData,
  options?: OptionData[]
) => {
  const supabase = await createClient()

  const { data: questionData, error: questionError } = await supabase
    .from('quiz_questions')
    .insert(question)
    .select()
    .single()

  if (questionError || !questionData) throw questionError

  if (
    options &&
    questionData.question_type === QuizQuestionType.MULTIPLE_CHOICE
  ) {
    const { error: optionsError } = await supabase.from('quiz_options').insert(
      options.map((opt) => ({
        ...opt,
        question_id: questionData.id,
      }))
    )

    if (optionsError) throw optionsError
  }

  revalidatePath(`/quiz/edit/${question.quiz_id}`)
  return questionData
}

// 문제 업데이트 (객관식 지원)
export async function updateQuestion(
  id: number,
  updates: QuestionUpdateData,
  options?: OptionData[]
) {
  const supabase = await createClient()

  const { data: questionData, error: questionError } = await supabase
    .from('quiz_questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (questionError || !questionData) throw questionError

  if (
    options &&
    questionData.question_type === QuizQuestionType.MULTIPLE_CHOICE
  ) {
    // 기존 옵션 삭제
    await supabase.from('quiz_options').delete().eq('question_id', id)

    // 새 옵션 추가
    const { error: optionsError } = await supabase.from('quiz_options').insert(
      options.map((opt) => ({
        ...opt,
        question_id: id,
      }))
    )

    if (optionsError) throw optionsError
  }

  revalidatePath(`/quiz/edit/${questionData.quiz_id}`)
  return questionData
}

// 문제 삭제
export async function deleteQuestion(id: number) {
  const supabase = await createClient()

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
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id)

  if (error) throw error
}
