import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { metadata, viewport, themeColor } from '@/config/metadata'
import Providers from '@/components/Providers'
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import SidebarTriggerWhenClosed from '@/components/sidebar-trigger-when-closed'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export { metadata, viewport, themeColor }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn(fontSans.variable, 'flex flex-col min-h-svh')}>
        <Providers>
          <SidebarProvider>
            <div className="flex flex-1 w-full">
              <AppSidebar />
              <main className="flex-1 container mx-auto max-w-4xl px-4 w-full relative">
                <SidebarTriggerWhenClosed />
                {children}
                <Analytics />
                <SpeedInsights />
              </main>
            </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  )
}
