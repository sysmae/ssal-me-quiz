'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { auth } from '@/utils/auth'
import { Button } from './ui/button'
import ThemeChanger from '@/components/DarkSwitch'
import { Menu } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }

    checkUser()
  }, [supabase.auth])

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold flex items-center">
          쌀미 퀴즈
        </Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/quiz" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    퀴즈 목록
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              {isLoggedIn && (
                <NavigationMenuItem>
                  <Link href="/quiz/my" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      내 퀴즈
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button
                onClick={async () => {
                  await auth.signOut()
                  setIsLoggedIn(false)
                }}
                variant="outline"
                size="sm"
              >
                로그아웃
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">로그인</Link>
              </Button>
            )}
            <ThemeChanger />
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <div className="md:hidden flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <Link
                  href="/quiz"
                  className="text-sm font-medium px-2 py-1 hover:bg-accent rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  퀴즈 목록
                </Link>
                {isLoggedIn && (
                  <Link
                    href="/quiz/my"
                    className="text-sm font-medium px-2 py-1 hover:bg-accent rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    내 퀴즈
                  </Link>
                )}
                <div className="flex items-center justify-between mt-2">
                  {isLoggedIn ? (
                    <Button
                      onClick={async () => {
                        await auth.signOut()
                        setIsLoggedIn(false)
                        setIsOpen(false)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      로그아웃
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/login">로그인</Link>
                    </Button>
                  )}
                  <ThemeChanger />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
