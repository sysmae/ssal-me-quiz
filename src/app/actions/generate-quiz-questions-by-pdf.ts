'use server'

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { LLMChain } from 'langchain/chains'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { z } from 'zod'
import { QuizQuestionType } from '@/constants'
import { QuestionInsertData } from '@/types/quiz'

// 입력 검증 스키마
const PdfQuizRequestSchema = z.object({
  quizId: z.number().int().positive(),
  quizTitle: z.string().min(1),
  quizDescription: z.string().nullable().optional(),
  questionType: z
    .enum([QuizQuestionType.MULTIPLE_CHOICE, QuizQuestionType.SUBJECTIVE])
    .default(QuizQuestionType.MULTIPLE_CHOICE),
  file: z.instanceof(Blob), // PDF 파일 Blob
})

// API 응답용 문제 형식 스키마
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

export async function generateQuizQuestionsByPdf(params: {
  quizId: number
  quizTitle: string
  quizDescription?: string | null
  questionType: string
  file: Blob
}): Promise<QuestionInsertData[]> {
  // 1. 입력 검증
  const parsed = PdfQuizRequestSchema.safeParse(params)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message)
  }
  const { quizId, quizTitle, quizDescription, questionType, file } = parsed.data

  // 2. PDF 로드 및 청크 분할
  const loader = new PDFLoader(file)
  const rawDocs = await loader.load() // Document[] 반환
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 100,
  })
  // splitDocuments -> Document[] (각 Document.pageContent에 텍스트)
  const docChunks = await splitter.splitDocuments(rawDocs)

  // 3. 출력 파서 및 포맷 지침 준비
  const parser = StructuredOutputParser.fromZodSchema(ApiQuestionsSchema)
  const formatInstructions = parser.getFormatInstructions()

  // 4. 프롬프트 템플릿 정의
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

  // 5. LLM 체인 설정
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY!,
  })
  const quizChain = new LLMChain({ llm: model, prompt })

  // 6. 청크별 순차 호출 및 문제 수집
  const allQuestions: QuestionInsertData[] = []
  for (let i = 0; i < docChunks.length; i++) {
    const chunkText = docChunks[i].pageContent
    const input = await prompt.format({
      quizTitle,
      quizDescription: quizDescription ?? '(설명 없음)',
      questionType,
      chunkIndex: i + 1,
      totalChunks: docChunks.length,
      chunkText,
      formatInstructions,
    })
    const res = await model.invoke(input)
    let content = res.content.toString()
    // ```
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
      options: q.options?.map((o) => ({
        option_text: o.option_text,
        is_correct: o.is_correct,
      })),
    }))
    allQuestions.push(...mapped)
  }

  // 7. 중복 문제 제거
  const unique = new Map<string, QuestionInsertData>()
  allQuestions.forEach((q) => {
    if (!unique.has(q.question_text)) unique.set(q.question_text, q)
  })

  return Array.from(unique.values())
}
