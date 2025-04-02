'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/authentication/Icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { auth } from '@/utils/auth'
import { toast } from 'sonner'
import { getAuthError } from '@/utils/auth-errors'
import { OAuthSignIn } from '@/components/authentication/OAuthSignIn'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const toastId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      toast.loading('로그인 중...', { id: toastId })
      await auth.signIn(email, password)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Auth error:', error)
      const { message } = getAuthError(error)
      toast.error(message, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-blue-50 shadow-lg rounded-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">
            로그인
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-center">
            계정이 없으신가요?{' '}
            <Link
              href="/create-account"
              className="text-blue-500 hover:underline"
            >
              회원가입
            </Link>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-700">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="rounded-lg"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-700">
                비밀번호
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-500 hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="rounded-lg"
            />
          </div>

          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            로그인
          </Button>
        </CardContent>
        <CardFooter>
          <OAuthSignIn isLoading={isLoading} onLoadingChange={setIsLoading} />
        </CardFooter>
      </form>
    </Card>
  )
}
