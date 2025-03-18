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

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const toastId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await auth.resetPasswordRequest(email)
      toast.message(
        '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요',
        { id: toastId }
      )
      router.push('/login')
    } catch (error) {
      const { message } = getAuthError(error)
      toast.error('이메일을 찾을 수 없습니다.', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-96">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription className="text-xs">
            Enter your email address and we will send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send reset link
          </Button>
        </CardContent>
        <CardFooter>
          <div className="text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-500">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
