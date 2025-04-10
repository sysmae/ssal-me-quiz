import { z } from 'zod'

// 객관식 문제 옵션 스키마
export const QuizOptionSchema = z.object({
  option_text: z.string().describe('선택지 텍스트'),
  is_correct: z.boolean().describe('정답 여부'),
})

// 퀴즈 문제 스키마
export const QuizQuestionSchema = z.object({
  question_text: z.string().describe('문제 텍스트'),
  question_type: z
    .enum(['MULTIPLE_CHOICE', 'SUBJECTIVE'])
    .describe('문제 유형: 객관식 또는 주관식'),
  correct_answer: z
    .string()
    .describe('정답 (주관식인 경우 정답 텍스트, 객관식인 경우 정답 선택지)'),
  options: z
    .array(QuizOptionSchema)
    .optional()
    .describe('객관식 문제의 선택지 목록 (주관식인 경우 비워둠)'),
  explanation: z.string().optional().describe('문제 해설'),
})

// 전체 퀴즈 스키마
export const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('퀴즈 문제 목록'),
})

export type QuizOption = z.infer<typeof QuizOptionSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type Quiz = z.infer<typeof QuizSchema>
