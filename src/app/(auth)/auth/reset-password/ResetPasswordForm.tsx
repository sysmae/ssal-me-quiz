'use client'

import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/authentication/Icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth, type AuthError } from '@/utils/auth'
import { toast } from 'sonner'

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
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
      await auth.resetPassword(password)
      toast.success('비밀번호가 재설정되었습니다.', { id: toastId })
      router.push('/login')
    } catch (error) {
      const authError = error as AuthError
      toast.error('비밀번호를 재설정할 수 없습니다.', { id: toastId })
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
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
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
            Reset password
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}
