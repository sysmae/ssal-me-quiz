import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { quizzes } from '@/utils/quiz'
import { prefetchQuiz, prefetchPublishedQuiz } from '@/hooks/useQuizQueries'
import QuizClient from './_components/QuizClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const quiz = await quizzes.list.getPublished(Number(resolvedParams.id))

  if (!quiz) {
    return {
      title: '퀴즈를 찾을 수 없습니다 | 나에게 맞는 퀴즈 찾기',
      description: '요청하신 퀴즈를 찾을 수 없거나 비공개 상태입니다.',
    }
  }

  return {
    title: `${quiz.title} | 나에게 맞는 퀴즈 찾기`,
    description: quiz.description ? quiz.description.substring(0, 160) : '',
    openGraph: {
      title: quiz.title,
      description: quiz.description,
      images: quiz.thumbnail_url ? [quiz.thumbnail_url] : [],
      type: 'website',
    },
  }
}

export const dynamic = 'force-static' // 정적 생성 유지 (성능 최적화)
export const revalidate = 300 // 5분마다 재검증 (필요에 따라 조정)

type Params = {
  id: string
}

export async function generateStaticParams() {
  // 모든 퀴즈 ID를 가져와서 정적 페이지 생성
  const quizzes_data = await quizzes.list.getAll()
  return quizzes_data.map((quiz) => ({ id: String(quiz.id) }))
}

export default async function QuizPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const queryClient = new QueryClient()

  // 서버에서 쿼리 미리 실행 - prefetchQuiz 함수 사용
  await prefetchQuiz(queryClient, Number(id))

  // 메타데이터용 공개 퀴즈 데이터도 미리 가져오기
  await prefetchPublishedQuiz(queryClient, Number(id))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuizClient id={id} />
    </HydrationBoundary>
  )
}
