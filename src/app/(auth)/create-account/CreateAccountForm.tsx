'use client'

import { useState, useId } from 'react'
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

export function CreateAccountForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()
  const toastId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.', { id: toastId })
      return
    }

    try {
      setIsLoading(true)
      await auth.signUp(email, password)
      toast.success('계정이 생성되었습니다. 이메일을 통해 인증해주세요', {
        id: toastId,
      })
      router.push('/login')
    } catch (error) {
      const { message } = getAuthError(error)

      toast.error('계정을 생성할 수 없습니다.', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-96">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription className="text-xs">
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500">
              Login
            </Link>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create account
          </Button>
        </CardContent>
        <CardFooter>
          <OAuthSignIn isLoading={isLoading} onLoadingChange={setIsLoading} />
        </CardFooter>
      </form>
    </Card>
  )
}
