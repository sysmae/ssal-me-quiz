import { QuizCreateForm } from '@/components/quiz/QuizCreateForm'
type Params = {
  id: string
}
const page = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params

  return <QuizCreateForm id={id} />
}
export default page
