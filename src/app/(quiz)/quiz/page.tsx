import { Metadata } from 'next'
import QuizClientPage from './QuizClientPage'

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = 'https://quiz.ssal.me'

  return {
    title:
      '쌀미 퀴즈 | 모든 퀴즈 보기 | 시험 문제, 넌센스, 유행 등 모든 퀴즈를 한 곳에',
    description:
      '다양한 퀴즈를 탐험하고 자신에게 맞는 퀴즈를 찾아보세요. 여러분이 만든 퀴즈를 친구, 가족, 전 세계 사람들에게 공유하세요. 시험 문제 족보, 넌센스, 유행 등 다양한 퀴즈를 만들고 즐겨보세요',
    alternates: {
      canonical: `${siteUrl}/quiz`,
    },
    openGraph: {
      title:
        '쌀미 퀴즈 | 모든 퀴즈 보기 | 시험 문제, 넌센스, 유행 등 모든 퀴즈를 한 곳에',
      description:
        '다양한 퀴즈를 탐험하고 자신에게 맞는 퀴즈를 찾아보세요. 여러분이 만든 퀴즈를 친구, 가족, 전 세계 사람들에게 공유하세요. 시험 문제 족보, 넌센스, 유행 등 다양한 퀴즈를 만들고 즐겨보세요',
      url: `${siteUrl}/quiz`,
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: '쌀미 퀴즈 로고',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title:
        '쌀미 퀴즈 | 모든 퀴즈 보기 | 시험 문제, 넌센스, 유행 등 모든 퀴즈를 한 곳에',
      description: '다양한 퀴즈를 탐험하고 자신에게 맞는 퀴즈를 찾아보세요.',
      images: ['/logo.png'],
    },
    keywords: [
      '퀴즈 목록',
      '온라인 퀴즈 모음',
      '지식 퀴즈 사이트',
      '무료 퀴즈 추천',
    ],
  }
}

export default async function QuizPage() {
  return <QuizClientPage />
}
