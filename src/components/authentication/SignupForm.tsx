'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { signup } from '@/app/actions/auth-actions'

const passwordValidationRegex = new RegExp(
  '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
)

const formSchema = z
  .object({
    full_name: z.string().min(2, {
      message: '이름은 2자 이상이어야 합니다.',
    }),
    email: z.string().email({
      message: '이메일 형식이 아닙니다.',
    }),
    password: z
      .string({
        required_error: '비밀번호를 입력하세요.',
      })
      .min(8, {
        message: '비밀번호는 8자 이상이어야 합니다.',
      })
      .regex(passwordValidationRegex, {
        message:
          '비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자가 포함되어야 합니다.',
      }),
    confirm_password: z.string({
      required_error: '비밀번호를 다시 입력하세요.',
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirm_password'],
  })

const SignupForm = ({ className }: { className?: string }) => {
  const [loading, setLoading] = useState(false)

  const toastId = useId()

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      confirm_password: '',
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast.loading('회원가입 중...', { id: toastId })
    setLoading(true)

    // auth-actions의 signup 으로 보내기 위해 FormData로 변환
    const formData = new FormData()
    formData.append('full_name', values.full_name)
    formData.append('email', values.email)
    formData.append('password', values.password)

    // 3. Call your action.
    const { error, success } = await signup(formData)
    if (!success) {
      toast.error(String(error), { id: toastId })
      setLoading(false)
    } else {
      toast.success(
        '회원가입 확인 이메일을 발송했습니다. 이메일로 이동해 확인해주세요',
        {
          id: toastId,
        }
      )
      setLoading(false)
      redirect('/login')
    }
  }

  return (
    <div className={cn('grid gap-6', className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호 확인</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-6 h-6 mr-2 animate-spin" />}
            회원가입
          </Button>
        </form>
      </Form>
    </div>
  )
}
export default SignupForm
