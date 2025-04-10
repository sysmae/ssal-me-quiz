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
export const createQuestion = async (questionData: QuestionInsertData) => {
  const supabase = await createClient()
  try {
    const { data: newQuestion, error: questionError } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: questionData.quiz_id,
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        correct_answer:
          questionData.question_type === QuizQuestionType.MULTIPLE_CHOICE
            ? questionData.options?.find((opt) => opt.is_correct)
                ?.option_text || ''
            : questionData.correct_answer,
        explanation: questionData.explanation || null,
      })
      .select()
      .single()

    if (questionError) throw questionError

    if (
      questionData.question_type === QuizQuestionType.MULTIPLE_CHOICE &&
      questionData.options
    ) {
      const options = questionData.options.map((option) => ({
        ...option,
        question_id: newQuestion.id,
      }))

      const { error: optionsError } = await supabase
        .from('quiz_options')
        .insert(options)

      if (optionsError) throw optionsError
    }

    return newQuestion
  } catch (error) {
    console.error('질문 생성 오류:', error)
    throw error
  }
}
export const updateQuestion = async (
  questionId: number,
  updates: QuestionUpdateData
) => {
  const supabase = await createClient()
  try {
    // options 필드를 제외한 업데이트 데이터 생성 (기본값 빈 배열 설정)
    const { options = [], ...questionUpdates } = updates

    // 정답 텍스트 설정 (SUBJECTIVE를 MULTIPLE_CHOICE로 수정)
    const correctAnswer =
      updates.question_type === QuizQuestionType.MULTIPLE_CHOICE &&
      options.length > 0
        ? options.find((opt) => opt.is_correct)?.option_text || ''
        : updates.correct_answer || ''

    console.log('업데이트할 질문 데이터:', {
      ...questionUpdates,
      correct_answer: correctAnswer,
      explanation: updates.explanation,
    })

    // 질문 업데이트
    const { data: updatedQuestion, error: questionError } = await supabase
      .from('quiz_questions')
      .update({
        ...questionUpdates,
        correct_answer: correctAnswer,
        explanation: updates.explanation,
      })
      .eq('id', questionId)
      .select()
      .single()

    if (questionError) throw questionError

    // 객관식 문제이고 옵션이 있는 경우 (SUBJECTIVE를 MULTIPLE_CHOICE로 수정)
    if (updates.question_type === QuizQuestionType.MULTIPLE_CHOICE && options) {
      console.log('객관식 옵션 처리 시작:', options)

      // 기존 옵션과 새 옵션 분리 (타입 안전하게)
      const existingOptions = options.filter(
        (opt): opt is typeof opt & { id: number } =>
          'id' in opt && typeof opt.id === 'number'
      )
      const newOptions = options.filter(
        (opt) => !('id' in opt) || typeof opt.id !== 'number'
      )

      console.log('기존 옵션:', existingOptions)
      console.log('새 옵션:', newOptions)

      // 1. 기존 옵션 중 유지할 옵션의 ID 목록
      const keepOptionIds = existingOptions.map((opt) => opt.id)

      // 2. 기존 옵션 처리
      if (keepOptionIds.length > 0) {
        // 유지할 옵션 외의 다른 옵션 삭제
        const { error: deleteError } = await supabase
          .from('quiz_options')
          .delete()
          .eq('question_id', questionId)
          .not('id', 'in', `(${keepOptionIds.join(',')})`)

        if (deleteError) {
          console.error('옵션 삭제 오류:', deleteError)
          throw deleteError
        }

        // 기존 옵션 업데이트
        for (const option of existingOptions) {
          // 타입 가드를 통해 id가 존재하는지 확인
          if (typeof option.id === 'number') {
            const { error: updateError } = await supabase
              .from('quiz_options')
              .update({
                option_text: option.option_text || '',
                is_correct: option.is_correct || false,
              })
              .eq('id', option.id)

            if (updateError) {
              console.error('옵션 업데이트 오류:', updateError)
              throw updateError
            }
          }
        }
      } else {
        // 유지할 옵션이 없으면 모든 옵션 삭제
        const { error: deleteAllError } = await supabase
          .from('quiz_options')
          .delete()
          .eq('question_id', questionId)

        if (deleteAllError) {
          console.error('모든 옵션 삭제 오류:', deleteAllError)
          throw deleteAllError
        }
      }

      // 3. 새 옵션 추가
      if (newOptions.length > 0) {
        const newOptionsData = newOptions.map((opt) => ({
          question_id: questionId,
          option_text: opt.option_text || '',
          is_correct: opt.is_correct || false,
        }))

        console.log('추가할 새 옵션:', newOptionsData)

        const { error: insertError } = await supabase
          .from('quiz_options')
          .insert(newOptionsData)

        if (insertError) {
          console.error('새 옵션 추가 오류:', insertError)
          throw insertError
        }
      }
    } else if (updates.question_type === QuizQuestionType.MULTIPLE_CHOICE) {
      // 객관식이지만 옵션이 없는 경우, 기존 옵션 모두 삭제
      const { error: deleteAllError } = await supabase
        .from('quiz_options')
        .delete()
        .eq('question_id', questionId)

      if (deleteAllError) throw deleteAllError
    }

    // 캐시 무효화
    revalidatePath(`/quiz/${updates.quiz_id}`)
    revalidatePath(`/quiz/${updates.quiz_id}/edit`)
    return updatedQuestion
  } catch (error) {
    console.error('질문 업데이트 오류:', error)
    throw error
  }
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
