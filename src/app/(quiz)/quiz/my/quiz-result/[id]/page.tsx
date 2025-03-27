import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { quizAttempts } from '@/utils/quiz_attempts'

import QuizResultClient from './_components/QuizResultClient'

export const dynamic = 'force-dynamic'

type Params = {
  id: string
}

export default async function QuizResultPage({ params }: { params: Params }) {
  const { id } = params
  const queryClient = new QueryClient()

  // 서버에서 쿼리 미리 실행
  await queryClient.prefetchQuery({
    queryKey: ['quizAttempt', Number(id)],
    queryFn: () => quizAttempts.results.getAttemptResult(Number(id)),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuizResultClient id={id} />
    </HydrationBoundary>
  )
}
