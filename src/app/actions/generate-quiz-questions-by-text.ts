'use server'

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { LLMChain } from 'langchain/chains'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { z } from 'zod'
import { QuizQuestionType } from '@/constants'
import { QuestionInsertData } from '@/types/quiz'

// 입력 검증을 위한 스키마
const QuestionsGenerationRequestSchema = z.object({
  quizId: z.number().int().positive('퀴즈 ID는 필수입니다'),
  quizTitle: z.string().min(1, '퀴즈 제목은 필수입니다'),
  quizDescription: z.string().nullable().optional(),
  questionType: z
    .enum([QuizQuestionType.MULTIPLE_CHOICE, QuizQuestionType.SUBJECTIVE])
    .default(QuizQuestionType.MULTIPLE_CHOICE),
  quizText: z.string().min(1, '퀴즈 텍스트는 필수입니다'),
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

export async function generateQuizQuestionsByText(params: {
  quizId: number
  quizTitle: string
  quizDescription: string | null
  questionType: string
  quizText: string
}): Promise<QuestionInsertData[]> {
  try {
    // 1. 입력 검증
    const validation = QuestionsGenerationRequestSchema.safeParse(params)
    if (!validation.success) {
      throw new Error(
        validation.error.errors[0].message || '입력 데이터가 유효하지 않습니다.'
      )
    }
    const { quizId, quizTitle, quizDescription, questionType, quizText } =
      validation.data

    // 2. 텍스트 분할 세팅
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 100,
    })
    const chunks = await splitter.splitText(quizText)

    // 3. 파서 및 포맷 지침
    const parser = StructuredOutputParser.fromZodSchema(ApiQuestionsSchema)
    const formatInstructions = parser.getFormatInstructions()

    // 4. 프롬프트 템플릿
    const prompt = PromptTemplate.fromTemplate(`
당신은 전문적인 퀴즈 문제 생성 AI입니다.
퀴즈 제목: {quizTitle}
퀴즈 설명: {quizDescription}
문제 유형: {questionType}
청크 정보: {chunkIndex}/{totalChunks}

아래 텍스트에서 주제에 맞는 문제를 생성해주세요:
"{chunkText}"

JSON 형식으로 응답해주세요:
{formatInstructions}

객관식일 경우 4개 이상의 선택지, 단답식일 경우 빈칸(___) 하나로 정답을 요구하세요.
    `)

    // Gemini 모델 설정
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY,
    })
    const quizChain = new LLMChain({ llm: model, prompt })

    // 6. 청크별 순차 호출 및 결과 수집
    let allQuestions: QuestionInsertData[] = []
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i]
      const input = await prompt.format({
        quizTitle,
        quizDescription: quizDescription || '(설명 없음)',
        questionType,
        chunkIndex: i + 1,
        totalChunks: chunks.length,
        chunkText,
        formatInstructions,
      })
      const res = await model.invoke(input)
      let content = res.content.toString()
      if (content.startsWith('```')) {
        content = content.replace(/^```json/, '').replace(/\n```$/, '')
      }
      const parsed = await parser.parse(content)
      const mapped = parsed.questions.map((q) => ({
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
      allQuestions = allQuestions.concat(mapped)
    }

    // 7. 중복 제거 (question_text 기준)
    const uniqueMap = new Map<string, QuestionInsertData>()
    allQuestions.forEach((q) => {
      if (!uniqueMap.has(q.question_text)) {
        uniqueMap.set(q.question_text, q)
      }
    })

    return Array.from(uniqueMap.values())
  } catch (error: any) {
    console.error('문제 생성 오류:', error)
    throw new Error(error.message || '문제 생성 중 오류가 발생했습니다.')
  }
}
