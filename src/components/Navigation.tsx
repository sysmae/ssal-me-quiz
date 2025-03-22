'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }

    checkUser()
  }, [supabase.auth]) // supabase.auth를 의존성 배열에 추가

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between">
        <Link href={'/'} className="text-xl font-bold">
          쌀미 퀴즈
        </Link>
        <div>
          {isLoggedIn ? (
            <Link href={'/quiz/my'} className="text-blue-500 mr-4">
              내 퀴즈
            </Link>
          ) : (
            <Link href={'/login'} className="text-blue-500 mr-4">
              로그인
            </Link>
          )}{' '}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
