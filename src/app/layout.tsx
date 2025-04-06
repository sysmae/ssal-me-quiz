import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import QueryProvider from '@/components/providers/QueryProvider'
import Navigation from '@/components/Navigation'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = 'https://ssal.me'

  return {
    metadataBase: new URL(siteUrl),
    title:
      '쌀미 퀴즈 | 2025 인기 심리테스트와 재미있는 지식 퀴즈로 자신을 발견하는 여행 | 무료 성격 분석',
    description:
      '쌀미 퀴즈에서 다양한 심리테스트와 지식 퀴즈를 통해 숨겨진 자신의 성격과 잠재력을 발견하세요. 취향 분석부터 MBTI까지, 재미있게 학습하며 자기 이해를 높이고 친구들과 결과를 공유해보세요. 지금 바로 무료로 시작하는 나를 향한 지식 여행!',
    alternates: {
      canonical: siteUrl,
    },
    keywords: [
      '퀴즈',
      '심리테스트',
      '자기이해',
      '지식테스트',
      '자기발견',
      '학습퀴즈',
      '성격테스트',
      'MBTI 테스트',
      '무료 퀴즈',
      '성격 분석',
      '취향 테스트',
      '2025 인기 심리테스트',
      '온라인 퀴즈',
    ],
    openGraph: {
      title:
        '쌀미 퀴즈 | 2025 인기 심리테스트와 재미있는 지식 퀴즈로 자신을 발견하는 여행 | 무료 성격 분석',
      description:
        '쌀미 퀴즈에서 다양한 심리테스트와 지식 퀴즈를 통해 숨겨진 자신의 성격과 잠재력을 발견하세요. 취향 분석부터 MBTI까지, 재미있게 학습하며 자기 이해를 높이고 친구들과 결과를 공유해보세요. 지금 바로 무료로 시작하는 나를 향한 지식 여행!',
      url: siteUrl,
      siteName: '쌀미 퀴즈',
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: '쌀미 퀴즈 로고',
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '쌀미 퀴즈 | 2025 인기 심리테스트와 지식 퀴즈 | 무료 성격 분석',
      description:
        '다양한 심리테스트와 지식 퀴즈로 자신의 숨겨진 성격과 잠재력을 발견하세요. 지금 무료로 시작해보세요!',
      images: ['/logo.png'],
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
    robots: 'index, follow',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const themeColor = [
  { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  { media: '(prefers-color-scheme: dark)', color: '#000000' },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn(fontSans.variable, 'flex flex-col min-h-screen')}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navigation />
            <main className="flex-grow">{children}</main>
          </ThemeProvider>
          <Toaster />
        </QueryProvider>
        <footer className="flex items-center justify-center w-full h-16 bg-gray-200 dark:bg-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 SYSMAE. All rights reserved.
          </span>
        </footer>
      </body>
    </html>
  )
}
