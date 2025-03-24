// hooks/useCommentQueries.ts
import { comments } from '@/utils/comments'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react'
import {
  CommentData,
  CommentInsertData,
  CommentUpdateData,
} from '@/types/comment'

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
          // 댓글 데이터 갱신
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
  } = useQuery<CommentData[], Error>({
    queryKey: ['comments', quizId],
    queryFn: () => comments.getByQuizId(quizId),
    enabled: !!quizId,
  })

  // 댓글 추가 뮤테이션
  const addComment = useMutation<CommentData, Error, CommentInsertData>({
    mutationFn: (newComment) => comments.add(newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', quizId] })
    },
  })

  // 댓글 수정 뮤테이션
  const updateComment = useMutation<
    CommentData,
    Error,
    { id: number; content: string }
  >({
    mutationFn: ({ id, content }) => comments.update(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', quizId] })
    },
  })

  // 댓글 삭제 뮤테이션
  const deleteComment = useMutation<boolean, Error, number>({
    mutationFn: (id) => comments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', quizId] })
    },
  })

  return {
    comments,
    isLoading,
    error,
    addComment,
    updateComment,
    deleteComment,
  }
}

// 댓글 개수 가져오기 훅
export const useQuizCommentCount = (quizId: number) => {
  return useQuery<number, Error>({
    queryKey: ['commentCount', quizId],
    queryFn: () => comments.getCountByQuizId(quizId),
    enabled: !!quizId,
  })
}
