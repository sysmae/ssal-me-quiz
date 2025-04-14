'use server'

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { z } from 'zod'
import { QuizQuestionType } from '@/constants'
import { QuestionInsertData } from '@/types/quiz'

// 입력 검증을 위한 스키마
const QuestionsGenerationRequestSchema = z.object({
  quizId: z.number().int().positive('퀴즈 ID는 필수입니다'),
  quizTitle: z.string().min(1, '퀴즈 제목은 필수입니다'),
  quizDescription: z.string().nullable().optional(),
  difficulty: z.enum(['쉬움', '보통', '어려움']).default('보통'),
  numQuestions: z.number().int().min(1).max(10).default(5),
  questionType: z
    .enum([QuizQuestionType.MULTIPLE_CHOICE, QuizQuestionType.SUBJECTIVE])
    .default(QuizQuestionType.MULTIPLE_CHOICE),
})

// API 응답용 문제 스키마
const ApiQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question_text: z.string(),
      question_type: z.enum([
        QuizQuestionType.MULTIPLE_CHOICE,
        QuizQuestionType.SUBJECTIVE,
      ]),
      correct_answer: z.string(),
      explanation: z.string().nullable(),
      options: z
        .array(
          z.object({
            option_text: z.string(),
            is_correct: z.boolean(),
          })
        )
        .optional(),
    })
  ),
})

export async function generateQuizQuestions(params: {
  quizId: number
  quizTitle: string
  quizDescription: string | null
  difficulty: string
  numQuestions: number
  questionType: string
}): Promise<QuestionInsertData[]> {
  try {
    // 입력 검증
    const validationResult = QuestionsGenerationRequestSchema.safeParse(params)
    if (!validationResult.success) {
      throw new Error(
        validationResult.error.errors[0].message ||
          '입력 데이터가 유효하지 않습니다.'
      )
    }

    const {
      quizId,
      quizTitle,
      quizDescription,
      difficulty,
      numQuestions,
      questionType,
    } = validationResult.data

    // API 응답용 스키마로 파서 설정
    const parser = StructuredOutputParser.fromZodSchema(ApiQuestionsSchema)
    const formatInstructions = parser.getFormatInstructions()

    // 프롬프트 템플릿 설정
    const prompt = PromptTemplate.fromTemplate(`
      당신은 전문적인 퀴즈 문제 생성 AI입니다. 기존 퀴즈에 추가할 문제들을 생성해주세요.
      
      퀴즈 제목: {quizTitle}
      퀴즈 설명: {quizDescription}
      난이도: {difficulty}
      문제 유형: {questionType}
      생성할 문제 수: {numQuestions}
      
      퀴즈 제목과 설명을 참고하여 주제에 맞는 문제를 생성해주세요.
      
      다음 형식 지침에 따라 JSON 형식으로 응답해주세요:
      {formatInstructions}
      
      각 문제에는 명확한 질문과 정확한 정답, 그리고 해설을 포함해주세요.
      
      객관식 문제(multiple_choice)의 경우:
      1. 반드시 4개 이상의 선택지를 제공하세요.
      2. 그 중 하나만 정답으로 표시하세요.
      3. options 배열은 필수입니다.
      
      단답식 문제(subjective)의 경우:
      1. 명확한 정답을 제공하세요. 정답은 반드시 1단어로 제한하세요.
      2. 질문에 ___로 빈칸을 뚫어 해당 빈칸을 만족하는 하나의 정답을 요구하세요.
      3. options 배열은 비워두세요.
      
      문제 유형이 객관식(multiple_choice)으로 지정된 경우, 오직 객관식 문제만 생성하세요. 절대로 단답식 문제를 생성하지 마세요.
      문제 유형이 단답식(subjective) 문제로 지정된 경우, 오직 단답식 문제만 생성하세요. 절대로 객관식 문제를 생성하지 마세요.
    `)

    // Gemini 모델 설정
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY,
    })

    // 프롬프트 포맷팅
    const input = await prompt.format({
      quizTitle,
      quizDescription: quizDescription || '(설명 없음)',
      difficulty,
      questionType,
      numQuestions,
      formatInstructions,
    })

    // 모델 호출 및 응답 파싱
    const response = await model.invoke(input)
    // 응답 전처리: 마크다운 코드 블록 제거
    let responseText = response.content.toString()
    // 코드 블록 제거 (```json과 마지막 ```
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```json/, '').replace(/\n```$/, '')
    }
    // 전처리된 텍스트로 파싱
    const apiResponse = await parser.parse(responseText)
    // API 응답을 QuestionInsertData 형식으로 변환
    const questions = apiResponse.questions.map((q) => ({
      quiz_id: quizId,
      question_text: q.question_text,
      question_type: q.question_type,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      options: q.options?.map((opt) => ({
        option_text: opt.option_text,
        is_correct: opt.is_correct,
      })),
    })) as QuestionInsertData[]

    return questions

    return questions
  } catch (error: any) {
    console.error('문제 생성 오류:', error)
    throw new Error(error.message || '문제 생성 중 오류가 발생했습니다.')
  }
}
