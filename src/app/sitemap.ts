// app/sitemap.ts
import { MetadataRoute } from 'next'
import { quizzes } from '@/utils/quiz'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://ssal.me'

  try {
    // 모든 퀴즈 데이터를 가져옴
    const quizzesData = await quizzes.list.getAll()

    // 루트 URL 추가
    const sitemap: MetadataRoute.Sitemap = [
      {
        url: siteUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]

    // 퀴즈 목록 URL 추가
    const quizListUrl = `${siteUrl}/quiz`
    sitemap.push({
      url: quizListUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    })

    // 퀴즈 URL 추가
    const quizUrls = quizzesData.map((quiz) => ({
      url: `${siteUrl}/quiz/${quiz.id}`,
      lastModified: quiz.updated_at
        ? new Date(quiz.updated_at).toISOString()
        : new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    // 사이트맵에 퀴즈 URL 추가
    sitemap.push(...quizUrls)

    return sitemap
  } catch (error) {
    console.error('사이트맵 생성 오류:', error)
    return []
  }
}
