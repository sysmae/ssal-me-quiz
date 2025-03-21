'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { useId } from 'react'
import { useCreateQuizMutation } from '@/hooks/useQuizQueries'

const quizFormSchema = z.object({
  title: z.string().min(1, {
    message: '타이틀은 필수 입력 사항입니다.',
  }),
  description: z.string().optional(),
})

export function QuizCreateForm({ id }: { id: string }) {
  const toastId = useId()
  const form = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const createQuizMutation = useCreateQuizMutation()

  function onSubmit(data: z.infer<typeof quizFormSchema>) {
    toast.loading('Submitting...', { id: toastId })
    createQuizMutation.mutate(
      { ...data },
      {
        onSuccess: () => {
          toast.success('Quiz created successfully!', { id: toastId })
          form.reset()
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`, { id: toastId })
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        {/* 제목 입력 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Quiz Title" {...field} />
              </FormControl>
              <FormDescription>This is the title of your quiz.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 설명 입력 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Quiz Description" {...field} />
              </FormControl>
              <FormDescription>
                This is a brief description of your quiz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TODO: 선택적으로 thumbnail_url 입력 */}

        <Button type="submit">Create Quiz</Button>
      </form>
    </Form>
  )
}
