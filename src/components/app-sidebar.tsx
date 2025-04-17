'use client'

import * as React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BookOpen,
  Command,
  LifeBuoy,
  Frame,
  PieChart,
  Map,
  Send,
} from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { auth } from '@/utils/auth'
import { Button } from './ui/button'
import ThemeChanger from '@/components/DarkSwitch'
import Logo from '@/components/authentication/Logo'

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
  }, [supabase.auth])

  const data = {
    navMain: [
      {
        title: '퀴즈 목록',
        url: '/quiz',
        icon: BookOpen,
      },
      {
        title: '내 퀴즈',
        url: '/quiz/my',
        icon: BookOpen,
        requiresAuth: true,
      },
    ],
  }

  const filteredNavMain = data.navMain.filter(
    (item) => !item.requiresAuth || isLoggedIn
  )

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="pb-2 border-b border-border">
        <div className="flex flex-col gap-2 px-4 pt-4">
          <div className="flex items-center justify-between">
            <Logo />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pr-2 flex flex-col flex-1">
        <NavMain items={filteredNavMain} />
        <div className="mt-auto">
          <ThemeChanger />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} loading={loading} />
      </SidebarFooter>
    </Sidebar>
  )
}
