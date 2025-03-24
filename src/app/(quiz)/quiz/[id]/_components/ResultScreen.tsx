import { QuizWithQuestions } from './types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ResultScreenProps = {
  quiz: QuizWithQuestions
  score: number
  onRestart: () => void
}

export default function ResultScreen({
  quiz,
  score,
  onRestart,
}: ResultScreenProps) {
  const percentage = Math.round((score / quiz.questions.length) * 100)

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-start p-4 pt-16">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/trophy.svg" alt="Trophy" className="w-24 h-24" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            {score}개 맞히셨습니다
          </h2>
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          {/* 점수 그래프 */}
          <div className="w-full max-w-md mb-6">
            <div className="flex justify-center items-end h-32 gap-1">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 bg-gray-200 rounded-t-sm"
                  style={{
                    height: `${Math.max(15, Math.min(100, 15 + i * 5))}%`,
                    backgroundColor:
                      i === 7 ? 'rgb(99, 102, 241)' : 'rgb(229, 231, 235)',
                  }}
                />
              ))}
            </div>
          </div>

          <p className="text-xl font-medium mb-8">
            당신은 상위 {percentage}%입니다
          </p>

          <div className="flex gap-3 w-full max-w-md justify-center">
            <Button
              onClick={onRestart}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2"
            >
              다시 도전하기
            </Button>

            <Button
              variant="outline"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-2"
            >
              다시보기
            </Button>

            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100 text-black font-bold px-6 py-2"
            >
              홈으로
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex-col">
          {/* 댓글 섹션은 기존 코드와 동일하게 유지 */}
          <div className="w-full mt-8 border-t pt-6">
            <h3 className="text-lg font-bold mb-4">댓글 (3712)</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-500">
                댓글 작성 시 타인을 기분나쁘게 하거나 이용 약관이나 안전에 대한
                문제 조장이 위험할 수 있습니다.
              </p>
              <div className="flex mt-2 gap-2">
                <input
                  type="text"
                  placeholder="닉네임"
                  className="flex-grow p-2 border rounded-md text-sm"
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  className="w-24 p-2 border rounded-md text-sm"
                />
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm">
                  작성하기
                </Button>
              </div>
            </div>

            {/* 댓글 목록 샘플 */}
            <div className="space-y-4">
              {[
                {
                  name: '장세현',
                  date: '2023-03-24 06:30:01',
                  content: '나 오세훈인데 너무 쉽다 역겨워서 게임 안한다야.',
                },
                {
                  name: '국가안보위기',
                  date: '2023-03-22 15:21:21',
                  content: '요즘 세상 모르시네요 구글 찾아서 답하세요',
                },
              ].map((comment, i) => (
                <div key={i} className="flex justify-between border-b pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{comment.name}</span>
                      <span className="text-xs text-gray-500">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <button className="text-red-500">▲</button>
                    <button className="text-gray-500">▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
