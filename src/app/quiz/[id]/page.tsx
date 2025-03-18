import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { fetchQuizById, fetchQuizzes } from '@/lib/api'
import QuizClient from './QuizClient'

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
