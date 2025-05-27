import { Button } from '@/components/ui/button'
import { useCreateEmptyQuizMutation } from '@/hooks/useQuizQueries'
import { Loader2, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// 퀴즈 생성 버튼 컴포넌트 분리
function CreateQuizButton() {
  const router = useRouter()
  const createQuizMutation = useCreateEmptyQuizMutation()

  const handleCreateQuiz = async () => {
    try {
      const quizId = await createQuizMutation.mutateAsync()
      router.push(`/quiz/${quizId}/edit`)
    } catch (error) {
      alert('퀴즈 생성 중 오류가 발생했습니다.')
    }
  }

  return (
    <Button
      onClick={handleCreateQuiz}
      className="bg-indigo-500 hover:bg-indigo-600"
      disabled={
        createQuizMutation.isPending || createQuizMutation.status == 'success'
      }
    >
      {createQuizMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          생성 중...
        </>
      ) : (
        <>
          <PlusCircle className="mr-2 h-4 w-4" />
          퀴즈 생성
        </>
      )}
    </Button>
  )
}

export default CreateQuizButton
