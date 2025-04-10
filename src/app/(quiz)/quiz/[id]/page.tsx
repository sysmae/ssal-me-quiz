import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { quizzes } from '@/utils/quiz'
import { prefetchQuiz, prefetchPublishedQuiz } from '@/hooks/useQuizQueries'
import QuizClient from './_components/QuizClient'
import { Metadata } from 'next'

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const resolvedParams = await params // 비동기 처리로 params 접근
  const siteUrl = 'https://ssal.me'
  const quizId = Number(resolvedParams.id)

  try {
    const quiz = await quizzes.list.getPublished(quizId)

    if (!quiz) {
      return {
        title: '쌀미 퀴즈 | 퀴즈를 찾을 수 없습니다',
        description: '요청하신 퀴즈를 찾을 수 없거나 비공개 상태입니다.',
        alternates: {
          canonical: `${siteUrl}/quiz/${resolvedParams.id}`,
        },
      }
    }

    // 퀴즈 질문 최대 3개 가져오기
    // const quizQuestions =
    //   quiz.questions?.slice(0, 3).map((question) => question.question_text) ||
    //   []
    // const questionsText =
    //   quizQuestions.length > 0
    //     ? ` 예를 들어, "${quizQuestions.join('", "')}" 같은 질문들이 있습니다.`
    //     : ''

    // Canonical URL 및 메타데이터 설정
    const canonicalUrl = `${siteUrl}/quiz/${resolvedParams.id}`

    return {
      title: `쌀미 퀴즈 | ${quiz.title}`,
      description: `퀴즈 설명: ${quiz.description?.substring(0, 160)}`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: quiz.title,
        description: quiz.description?.substring(0, 160) || '',
        url: canonicalUrl,
        images: quiz.thumbnail_url
          ? [
              {
                url: quiz.thumbnail_url,
                width: 1200,
                height: 630,
                alt: quiz.title,
              },
            ]
          : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: quiz.title,
        description: `쌀미 퀴즈에서 이런 퀴즈를 풀어보세요: ${quiz.description?.substring(
          0,
          160
        )}`,
        images: quiz.thumbnail_url ? [quiz.thumbnail_url] : [],
      },
    }
  } catch (error) {
    console.error('메타데이터 생성 오류:', error)
    return {
      title: '쌀미 퀴즈 | 퀴즈 상세',
      alternates: {
        canonical: `${siteUrl}/quiz/${resolvedParams.id}`,
      },
    }
  }
}

// 정적 경로 생성
export async function generateStaticParams() {
  const quizzesData = await quizzes.list.getAll()
  return quizzesData.map((quiz) => ({
    id: String(quiz.id),
  }))
}

// Quiz 페이지 컴포넌트
export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params // 비동기 처리로 params 접근
  const queryClient = new QueryClient()
  const quizId = Number(resolvedParams.id)

  // 데이터 프리페치 병렬 처리
  await Promise.all([
    prefetchQuiz(queryClient, quizId),
    prefetchPublishedQuiz(queryClient, quizId),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuizClient id={resolvedParams.id} />
    </HydrationBoundary>
  )
}
