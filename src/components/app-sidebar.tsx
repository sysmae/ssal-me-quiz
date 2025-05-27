'use client'

import * as React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BookOpen,
  Zap,
  LayoutDashboard,
  Layers,
  History,
  FileText,
  Search,
  ChevronRight,
  HelpCircle,
  Heart,
} from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button } from './ui/button'
import ThemeChanger from '@/components/DarkSwitch'
import Logo from '@/components/authentication/Logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{
    name: string
    email: string
    avatar: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }
      // users 테이블에서 추가 정보 가져오기
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('users')
        .select('name,email,avatar')
        .eq('id', authUser.id)
        .single()
      if (data) {
        setUser({
          name: data.name ?? authUser.email ?? '',
          email: data.email ?? authUser.email ?? '',
          avatar: data.avatar || '/avatars/default.png',
        })
      } else {
        setUser({
          name: authUser.email ?? '',
          email: authUser.email ?? '',
          avatar: '/avatars/default.png',
        })
      }
      setLoading(false)
    }

    checkUser()
  }, [supabase])

  // 메뉴 항목을 예시 코드 스타일로 확장
  const navItems = [
    {
      title: '대시보드', // 로그인 안되어 있으면 랜딩페이지, 로그인 되어있으면 대시보드
      url: '/',
      icon: LayoutDashboard,
    },
    {
      title: '퀴즈 찾기',
      url: '/quiz',
      icon: Search,
    },
    {
      title: '내 퀴즈',
      url: '/quiz/my',
      icon: FileText,
    },

    {
      title: '찜한 퀴즈',
      url: '/quiz/favorite',
      icon: Heart,
    },
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="p-4 border-b flex items-center gap-2">
        <Link href="/" className="flex justify-between items-center">
          <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">쌀미 퀴즈</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col flex-1 py-4 bg-white dark:bg-zinc-950">
        <nav className="space-y-2 px-2">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-900"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <ThemeChanger />
        </div>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t mt-auto">
        <NavUser user={user} loading={loading} />
      </SidebarFooter>
    </Sidebar>
  )
}
