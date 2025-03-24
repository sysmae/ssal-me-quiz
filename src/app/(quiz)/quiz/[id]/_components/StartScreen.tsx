import { QuizWithQuestions } from './types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, MessageSquare, Clock, ThumbsUp, Edit, Trash2 } from 'lucide-react'
import LikeButton from './../../_components/LikeCount'
import { useQuizComments, useQuizCommentCount } from '@/hooks/useCommentQueries'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

type StartScreenProps = {
  quiz: QuizWithQuestions
  onStart: () => void
}

export default function StartScreen({ quiz, onStart }: StartScreenProps) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [commentContent, setCommentContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // 댓글 관련 훅 사용
  const {
    comments: commentData,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
  } = useQuizComments(quiz.id)

  const { data: commentCount } = useQuizCommentCount(quiz.id)

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    fetchUser()
  }, [supabase])

  // 댓글 작성 처리
  const handleAddComment = async () => {
    if (!commentContent.trim()) return

    try {
      await addComment.mutateAsync({
        quiz_id: quiz.id,
        content: commentContent.trim(),
        parent_id: null,
        user_id: user.id,
      })
      setCommentContent('')
    } catch (error) {
      console.error('댓글 작성 실패:', error)
      alert('댓글 작성에 실패했습니다.')
    }
  }

  // 댓글 수정 처리
  const handleUpdateComment = async (id: number) => {
    if (!editContent.trim()) return

    try {
      await updateComment.mutateAsync({
        id,
        content: editContent.trim(),
      })
      setEditingId(null)
      setEditContent('')
    } catch (error) {
      console.error('댓글 수정 실패:', error)
      alert('댓글 수정에 실패했습니다.')
    }
  }

  // 댓글 삭제 처리
  const handleDeleteComment = async (id: number) => {
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return

    try {
      await deleteComment.mutateAsync(id)
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  // 답글 작성 처리
  const handleAddReply = async (parentId: number) => {
    if (!replyContent.trim()) return

    try {
      await addComment.mutateAsync({
        quiz_id: quiz.id,
        content: replyContent.trim(),
        parent_id: parentId,
        user_id: user.id,
      })
      setReplyingTo(null)
      setReplyContent('')
    } catch (error) {
      console.error('답글 작성 실패:', error)
      alert('답글 작성에 실패했습니다.')
    }
  }

  // 댓글 목록을 부모 댓글과 답글로 구성
  const organizeComments = async () => {
    if (!commentData) return { parentComments: [], replies: {} }

    const data = await commentData.getByQuizId(quiz.id) // commentData를 await로 처리하여 실제 데이터 배열을 가져옴

    const parentComments = data.filter((c) => !c.parent_id)
    const replies = data.reduce((acc, comment) => {
      if (comment.parent_id) {
        if (!acc[comment.parent_id]) {
          acc[comment.parent_id] = []
        }
        acc[comment.parent_id].push(comment)
      }
      return acc
    }, {} as Record<number, typeof data>)

    return { parentComments, replies }
  }
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* 위쪽 섹션 - 기존 코드 유지 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 왼쪽 썸네일, 제목, 설명 */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative w-full h-64 overflow-hidden">
              <img
                src={quiz.thumbnail_url ?? ''}
                alt={quiz.title}
                className="w-full h-full object-cover"
              />
            </div>

            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold">
                  {quiz.title}
                </CardTitle>
                <Button
                  onClick={onStart}
                  className="bg-primary hover:bg-primary/90"
                >
                  퀴즈 시작하기
                </Button>
              </div>
              <CardDescription className="mt-2">
                {quiz.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>약 {quiz.questions.length * 2}분</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{quiz.view_count}회</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>댓글 {commentCount || 0}개</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  {/* 기존 코드 유지 */}
                </div>
                <div className="flex gap-2">
                  <LikeButton quizId={quiz.id} likeCount={quiz.like_count} />
                  <Button variant="outline" size="sm">
                    공유하기
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* 오른쪽 추천 퀴즈들 - 기존 코드 유지 */}
        <div className="md:col-span-1">{/* 기존 코드 유지 */}</div>
      </div>

      {/* 아래쪽 댓글 섹션 - 수정된 부분 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              댓글 {commentCount || 0}개
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 댓글 작성 폼 */}
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.substring(0, 2).toUpperCase() || 'ME'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="border rounded-lg overflow-hidden">
                  <textarea
                    className="w-full p-3 resize-none focus:outline-none"
                    rows={3}
                    placeholder={
                      user
                        ? '댓글을 작성해주세요...'
                        : '댓글을 작성하려면 로그인이 필요합니다.'
                    }
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    disabled={!user || addComment.isPending}
                  />
                  <div className="bg-muted/20 p-2 flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={
                        !user || !commentContent.trim() || addComment.isPending
                      }
                    >
                      댓글 작성
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 댓글 로딩 상태 */}
            {isLoading && (
              <div className="text-center py-4 text-muted-foreground">
                댓글을 불러오는 중...
              </div>
            )}

            {/* 댓글이 없는 경우 */}
            {!isLoading && parentComments.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
              </div>
            )}

            {/* 댓글 목록 */}
            {!isLoading &&
              parentComments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  {/* 부모 댓글 */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.user?.avatar_url} />
                      <AvatarFallback>
                        {comment.user?.name?.substring(0, 2).toUpperCase() ||
                          'UN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.user?.name || '익명'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: ko,
                          })}
                          {comment.created_at !== comment.updated_at &&
                            ' (수정됨)'}
                        </span>
                      </div>

                      {/* 댓글 수정 모드 */}
                      {editingId === comment.id ? (
                        <div className="mt-2">
                          <textarea
                            className="w-full p-2 border rounded resize-none focus:outline-none"
                            rows={3}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              취소
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={
                                !editContent.trim() || updateComment.isPending
                              }
                            >
                              수정 완료
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1 text-sm">{comment.content}</p>
                          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                            <button
                              className="hover:text-foreground"
                              onClick={() => {
                                setReplyingTo(
                                  replyingTo === comment.id ? null : comment.id
                                )
                                setReplyContent('')
                              }}
                            >
                              답글 달기
                            </button>

                            {/* 자신의 댓글인 경우에만 수정/삭제 버튼 표시 */}
                            {user?.id === comment.user_id && (
                              <>
                                <button
                                  className="hover:text-foreground flex items-center gap-1"
                                  onClick={() => {
                                    setEditingId(comment.id)
                                    setEditContent(comment.content)
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                  수정
                                </button>
                                <button
                                  className="hover:text-destructive flex items-center gap-1"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {/* 답글 작성 폼 */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 pl-4 border-l-2">
                          <div className="flex gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user?.user_metadata?.avatar_url}
                              />
                              <AvatarFallback>
                                {user?.email?.substring(0, 2).toUpperCase() ||
                                  'ME'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <textarea
                                className="w-full p-2 border rounded resize-none focus:outline-none text-sm"
                                rows={2}
                                placeholder="답글을 작성해주세요..."
                                value={replyContent}
                                onChange={(e) =>
                                  setReplyContent(e.target.value)
                                }
                                disabled={!user || addComment.isPending}
                              />
                              <div className="flex justify-end gap-2 mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  취소
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddReply(comment.id)}
                                  disabled={
                                    !replyContent.trim() || addComment.isPending
                                  }
                                >
                                  답글 작성
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 답글 목록 */}
                      {replies[comment.id] &&
                        replies[comment.id].length > 0 && (
                          <div className="mt-3 space-y-3 pl-4 border-l-2">
                            {replies[comment.id].map((reply) => (
                              <div key={reply.id} className="flex gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={reply.user?.avatar_url} />
                                  <AvatarFallback>
                                    {reply.user?.name
                                      ?.substring(0, 2)
                                      .toUpperCase() || 'UN'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-xs">
                                      {reply.user?.name || '익명'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(
                                        new Date(reply.created_at),
                                        { addSuffix: true, locale: ko }
                                      )}
                                      {reply.created_at !== reply.updated_at &&
                                        ' (수정됨)'}
                                    </span>
                                  </div>
                                  {/* 답글 수정 모드 */}
                                  {editingId === reply.id ? (
                                    <div className="mt-1">
                                      <textarea
                                        className="w-full p-2 border rounded resize-none focus:outline-none text-sm"
                                        rows={2}
                                        value={editContent}
                                        onChange={(e) =>
                                          setEditContent(e.target.value)
                                        }
                                      />
                                      <div className="flex justify-end gap-2 mt-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingId(null)}
                                        >
                                          취소
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleUpdateComment(reply.id)
                                          }
                                          disabled={
                                            !editContent.trim() ||
                                            updateComment.isPending
                                          }
                                        >
                                          수정 완료
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm">{reply.content}</p>

                                      {/* 자신의 답글인 경우에만 수정/삭제 버튼 표시 */}
                                      {user?.id === reply.user_id && (
                                        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                                          <button
                                            className="hover:text-foreground flex items-center gap-1"
                                            onClick={() => {
                                              setEditingId(reply.id)
                                              setEditContent(reply.content)
                                            }}
                                          >
                                            <Edit className="h-3 w-3" />
                                            수정
                                          </button>
                                          <button
                                            className="hover:text-destructive flex items-center gap-1"
                                            onClick={() =>
                                              handleDeleteComment(reply.id)
                                            }
                                          >
                                            <Trash2 className="h-3 w-3" />
                                            삭제
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>

          {/* 더 보기 버튼 - 댓글이 있을 때만 표시 */}
          {!isLoading && parentComments.length > 0 && (
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full">
                더 보기
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
