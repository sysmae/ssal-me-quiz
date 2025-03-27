// hooks/useQuizCollectionQueries.ts

import { quizCollections } from '@/utils/quiz_collections'
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

// 새 컬렉션 생성 훅
export const useCreateQuizCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      name,
      type,
      description,
    }: {
      name: string
      type: 'wrong_answers' | 'favorites' | 'custom'
      description?: string
    }) => quizCollections.manage.create(name, type, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizCollections'] })
    },
  })
}

// 컬렉션 정보 업데이트 훅
export const useUpdateQuizCollection = (collectionId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: { name?: string; description?: string }) =>
      quizCollections.manage.update(collectionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quizCollection', collectionId],
      })
      queryClient.invalidateQueries({ queryKey: ['quizCollections'] })
    },
  })
}

// 컬렉션 삭제 훅
export const useDeleteQuizCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (collectionId: number) =>
      quizCollections.manage.delete(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizCollections'] })
    },
  })
}

// 컬렉션에 문제 추가 훅
export const useAddQuestionToCollection = (collectionId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      notes,
    }: {
      questionId: number
      notes?: string
    }) => quizCollections.questions.add(collectionId, questionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quizCollection', collectionId],
      })
    },
  })
}

// 컬렉션에서 문제 제거 훅
export const useRemoveQuestionFromCollection = (collectionId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questionId: number) =>
      quizCollections.questions.remove(collectionId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quizCollection', collectionId],
      })
    },
  })
}

// 문제 노트 업데이트 훅
export const useUpdateQuestionNotes = (collectionId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      notes,
    }: {
      questionId: number
      notes: string
    }) =>
      quizCollections.questions.updateNotes(collectionId, questionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quizCollection', collectionId],
      })
    },
  })
}

// 컬렉션의 모든 문제 가져오기 훅
export const useQuizCollectionQuestions = (collectionId: number) => {
  return useQuery({
    queryKey: ['quizCollection', collectionId, 'questions'],
    queryFn: () => quizCollections.questions.getAll(collectionId),
    enabled: !!collectionId,
  })
}

// 사용자의 모든 컬렉션 가져오기 훅
export const useUserQuizCollections = () => {
  return useQuery({
    queryKey: ['quizCollections'],
    queryFn: () => quizCollections.list.getUserCollections(),
  })
}

// 특정 유형의 컬렉션 가져오기 훅
export const useQuizCollectionsByType = (
  type: 'wrong_answers' | 'favorites' | 'custom'
) => {
  return useQuery({
    queryKey: ['quizCollections', type],
    queryFn: () => quizCollections.list.getCollectionsByType(type),
  })
}

// 컬렉션 상세 정보 가져오기 훅
export const useQuizCollectionDetails = (collectionId: number) => {
  return useQuery({
    queryKey: ['quizCollection', collectionId],
    queryFn: () => quizCollections.list.getCollectionDetails(collectionId),
    enabled: !!collectionId,
  })
}

// 오답 노트 생성 및 틀린 문제 추가 훅
export const useCreateWrongAnswersCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attemptId, name }: { attemptId: number; name?: string }) =>
      quizCollections.special.createWrongAnswersCollection(attemptId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizCollections'] })
    },
  })
}

// 즐겨찾기 컬렉션 가져오기 또는 생성 훅
export const useFavoritesCollection = () => {
  return useQuery({
    queryKey: ['quizCollections', 'favorites'],
    queryFn: () => quizCollections.special.getFavoritesCollection(),
  })
}
