'use client'

import React, { useState, useEffect } from 'react'
import { useQuizComments, useQuizCommentCount } from '@/hooks/useCommentQueries'
import { createClient } from '@/utils/supabase/client'
import { CommentData } from '@/types/comment'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface QuizCommentProps {
  quizId: number
}

// 댓글 아이템 컴포넌트 (재귀적으로 사용)
const CommentItem = ({
  comment,
  quizId,
  userId,
  userName,
  userAvatar,
  onReply,
  onUpdate,
  onDelete,
}: {
  comment: CommentData & { replies?: Array<CommentData & { replies?: any[] }> }
  quizId: number
  userId: string | null
  userName: string | null
  userAvatar: string | null
  onReply: Function
  onUpdate: Function
  onDelete: Function
}) => {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  // 답글 작성 처리
  const handleReplySubmit = () => {
    if (!replyContent.trim() || !userId) return

    onReply({
      quiz_id: quizId,
      content: replyContent,
      user_id: userId,
      parent_id: comment.id,
    })

    setReplyContent('')
    setIsReplying(false)
  }

  // 댓글 수정 처리
  const handleUpdateSubmit = () => {
    if (!editContent.trim()) return

    onUpdate({
      id: comment.id,
      content: editContent,
    })

    setIsEditing(false)
  }

  return (
    <div className="border-b pb-4 mb-4 last:border-0 last:mb-0">
      <div className="flex gap-3">
        {/* <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={comment.users.avatar || ''}
            alt={comment.users.name || '사용자'}
          />
          <AvatarFallback>
            {comment.users.name?.substring(0, 2) || 'UN'}
          </AvatarFallback>
        </Avatar> */}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.users.name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>

            {userId === comment.user_id && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-500 text-xs"
                >
                  {isEditing ? '취소' : '수정'}
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-red-500 text-xs"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full p-2 text-sm resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  onClick={handleUpdateSubmit}
                  disabled={!editContent.trim()}
                  size="sm"
                >
                  수정 완료
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm">{comment.content}</p>
          )}

          {!isEditing && (
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              {userId && (
                <button
                  className="hover:text-foreground"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  {isReplying ? '취소' : '답글 달기'}
                </button>
              )}
            </div>
          )}

          {/* 답글 작성 폼 */}
          {isReplying && (
            <div className="mt-3">
              <div className="border rounded-lg overflow-hidden">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 작성해주세요..."
                  rows={2}
                  className="w-full p-2 text-sm resize-none border-0"
                />
                <div className="bg-muted/20 p-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim()}
                  >
                    답글 작성
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 중첩 답글 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="pl-4 border-l-2 border-gray-100 mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  quizId={quizId}
                  userId={userId}
                  userName={userName}
                  userAvatar={userAvatar}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const QuizComment = ({ quizId }: QuizCommentProps) => {
  const [newComment, setNewComment] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  const supabase = createClient()

  const {
    commentData,
    isLoading,
    error,
    addComment,
    updateComment,
    deleteComment,
    addReply,
  } = useQuizComments(quizId)

  const { data: commentCount } = useQuizCommentCount(quizId)

  // 사용자 정보 가져오기
  useEffect(() => {
    async function getUserInfo() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)

        const { data: userData } = await supabase
          .from('users')
          .select('name, avatar')
          .eq('id', user.id)
          .single()

        if (userData) {
          setUserName(userData.name)
          setUserAvatar(userData.avatar)
        }
      }
    }
    getUserInfo()
  }, [supabase])

  // 댓글 작성 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !userId) return

    addComment({
      quiz_id: quizId,
      content: newComment,
      user_id: userId,
      parent_id: null, // 최상위 댓글
    })

    setNewComment('')
  }

  // 댓글 삭제 처리
  const handleDelete = (id: number) => {
    if (confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      deleteComment(id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          댓글 {commentCount?.count || 0}개
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 댓글 작성 폼 */}
        {userId && (
          <form onSubmit={handleSubmit} className="flex gap-3">
            {/* <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={userAvatar || ''} alt={userName || '사용자'} />
              <AvatarFallback>
                {userName?.substring(0, 2) || 'ME'}
              </AvatarFallback>
            </Avatar> */}
            <div className="flex-1">
              <div className="border rounded-lg overflow-hidden">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 작성해주세요..."
                  rows={3}
                  className="w-full p-3 resize-none border-0 focus:ring-0"
                />
                <div className="bg-muted/20 p-2 flex justify-end">
                  <Button type="submit" disabled={!newComment.trim()} size="sm">
                    댓글 작성
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* 댓글 목록 */}
        {isLoading ? (
          <div className="py-8 text-center">댓글을 불러오는 중...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">
            댓글을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : commentData?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            첫 번째 댓글을 작성해보세요!
          </div>
        ) : (
          <div className="space-y-4">
            {commentData?.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                quizId={quizId}
                userId={userId}
                userName={userName}
                userAvatar={userAvatar}
                onReply={addReply}
                onUpdate={updateComment}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
      {commentData && commentData.length > 5 && (
        <CardFooter className="border-t pt-4">
          <Button variant="outline" className="w-full">
            더 보기
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export default QuizComment
