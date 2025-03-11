'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { login } from '@/app/actions/auth-actions'
import { redirect } from 'next/navigation'
import { useId, useState } from 'react'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email({
    message: '이메일 형식이 아닙니다.',
  }),
  password: z.string().min(8, {
    message: '비밀번호는 8자 이상이어야 합니다.',
  }),
})

const LoginForm = ({ className }: { className?: string }) => {
  const toastId = useId()
  const [loading, setLoading] = useState(false)

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast.loading('로그인 중...', { id: toastId })
    setLoading(true)

    // auth-actions의 login 으로 보내기 위해 FormData로 변환
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)

    // 3. Call your action.
    const { error, success } = await login(formData)
    if (!success) {
      toast.error('로그인에 실패했습니다. 다시 시도해 주세요', { id: toastId })
      setLoading(false)
    } else {
      toast.success('성공적으로 로그인 하였습니다', {
        id: toastId,
      })
      setLoading(false)
      redirect('/')
    }
  }

  return (
    <div className={cn('grid gap-6', className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input placeholder="example@example.com" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="비밀번호를 입력하세요."
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {loading && <Loader2 className="w-6 h-6 mr-2 animate-spin" />}
            로그인
          </Button>
        </form>
      </Form>
    </div>
  )
}
export default LoginForm
