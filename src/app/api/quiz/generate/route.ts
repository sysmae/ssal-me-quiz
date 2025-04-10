import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { QuizSchema } from '@/lib/schema/quiz'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { subject, difficulty, numQuestions, questionType } = await req.json()

    // 입력 검증
    if (!subject) {
      return NextResponse.json(
        { error: '주제를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 출력 파서 설정
    const parser = StructuredOutputParser.fromZodSchema(QuizSchema)
    const formatInstructions = parser.getFormatInstructions()

    // 프롬프트 템플릿 설정
    const prompt = PromptTemplate.fromTemplate(`
      당신은 전문적인 퀴즈 생성 AI입니다. 주어진 주제와 조건에 맞는 퀴즈 문제를 생성해주세요.
      
      주제: {subject}
      난이도: {difficulty}
      문제 유형: {questionType}
      문제 수: {numQuestions}
      
      다음 형식 지침에 따라 JSON 형식으로 응답해주세요:
      {formatInstructions}
      
      각 문제에는 명확한 질문과 정확한 정답, 그리고 해설을 포함해주세요.
      객관식 문제의 경우 최소 4개의 선택지를 제공하고, 그 중 하나만 정답으로 표시해주세요.
      주관식 문제의 경우 명확한 정답을 제공해주세요.
    `)

    // // 모델 설정
    // const model = new ChatOpenAI({
    //   modelName: 'gpt-4o-mini',
    //   temperature: 0.7,
    // })

    // Gemini 모델 설정
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash', // 최신 Gemini 모델 사용
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY, // 환경 변수에서 API 키 가져오기
    })

    // 프롬프트 포맷팅
    const input = await prompt.format({
      subject,
      difficulty: difficulty || '보통',
      questionType: questionType || '혼합',
      numQuestions: numQuestions || 5,
      formatInstructions,
    })

    // 모델 호출 및 응답 파싱
    const response = await model.invoke(input)
    const parsedOutput = await parser.parse(response.content.toLocaleString())

    return NextResponse.json(parsedOutput)
  } catch (error: any) {
    console.error('퀴즈 생성 오류:', error)
    return NextResponse.json(
      { error: error.message || '퀴즈 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
