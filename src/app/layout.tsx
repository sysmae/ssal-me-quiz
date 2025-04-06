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

export const metadata: Metadata = {
  title: '쌀미 AI',
  description: '쌀미 AI',
}

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
