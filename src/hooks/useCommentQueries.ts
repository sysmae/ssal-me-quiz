import { comments } from '@/utils/comments'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react'
import { CommentData, CommentInsertData } from '@/types/comment'

// 댓글 목록 가져오기 훅
export const useQuizComments = (quizId: number) => {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // 실시간 업데이트 구독
  useEffect(() => {
    const channel = supabase
      .channel(`quiz_comments:${quizId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_comments',
          filter: `quiz_id=eq.${quizId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', quizId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [quizId, queryClient, supabase])

  // 댓글 목록 조회
  const {
    data: commentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['comments', quizId],
    queryFn: () => comments.getByQuizId(quizId),
    enabled: !!quizId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  // 댓글 추가 뮤테이션
  const { mutate: addComment } = useMutation({
    mutationFn: (newComment: CommentInsertData) => comments.add(newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', quizId] })
      queryClient.invalidateQueries({ queryKey: ['commentCount', quizId] })
    },
  })

  // 댓글 수정 뮤테이션
  const { mutate: updateComment } = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      comments.update(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', quizId] })
    },
  })

  // 댓글 삭제 뮤테이션
  const { mutate: deleteComment } = useMutation({
    mutationFn: (id: number) => comments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', quizId] })
      queryClient.invalidateQueries({ queryKey: ['commentCount', quizId] })
    },
  })

  // 답글 추가 뮤테이션 (기존 addComment와 동일한 함수 사용)
  const { mutate: addReply } = useMutation({
    mutationFn: (replyData: CommentInsertData) => comments.add(replyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', quizId] })
      queryClient.invalidateQueries({ queryKey: ['commentCount', quizId] })
    },
  })

  return {
    commentData,
    isLoading,
    error,
    addComment,
    updateComment,
    deleteComment,
    addReply,
  }
}

// 댓글 개수 가져오기 훅
export const useQuizCommentCount = (quizId: number) => {
  return useQuery({
    queryKey: ['commentCount', quizId],
    queryFn: () => comments.getCountByQuizId(quizId),
    enabled: !!quizId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })
}
