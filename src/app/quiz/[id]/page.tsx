import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { fetchQuizById, fetchQuizzes } from '@/lib/api'
import QuizClient from './QuizClient'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const quiz = await fetchQuizById(Number(params.id))

  return {
    title: `${quiz.title} | 나에게 맞는 퀴즈 찾기`,
    description: quiz.description ? quiz.description.substring(0, 160) : '',
    openGraph: {
      title: quiz.title,
      description: quiz.description,
      type: 'website',
    },
  }
}

// 기존 QuizPage 컴포넌트에 추가
export const dynamic = 'force-static'
export const revalidate = false // 또는 원하는 시간(초) 설정

type Params = {
  id: string
}

export async function generateStaticParams() {
  // 모든 퀴즈 ID를 가져와서 정적 페이지 생성
  const quizzes = await fetchQuizzes()
  return quizzes.map((quiz) => ({ id: String(quiz.id) }))
}

export default async function QuizPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const queryClient = new QueryClient()

  // 서버에서 쿼리 미리 실행
  await queryClient.prefetchQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuizById(Number(id)),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuizClient id={id} />
    </HydrationBoundary>
  )
}
