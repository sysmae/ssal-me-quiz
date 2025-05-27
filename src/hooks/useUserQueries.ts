// hooks/useUserQueries.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { users } from '@/utils/users'
import type { UserData, UserInsertData, UserUpdateData } from '@/types/user'

// 현재 유저 훅은 따로 빼기
export const useCurrentUserQueries = () => {
  // 1) 현재 로그인된 사용자 정보
  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => users.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    currentUser,
    isCurrentUserLoading,
  }
}

export const useUserQueries = (userId: string) => {
  const queryClient = useQueryClient()

  // 1) 특정 사용자 정보
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => users.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  // 2) 일반 사용자 업데이트
  const updateUser = useMutation({
    mutationFn: (updates: UserUpdateData) => users.updateUser(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })

  // 6) 프로필(이름·아바타·설명) 업데이트
  const updateProfile = useMutation({
    mutationFn: (
      updates: Partial<Omit<UserData, 'id' | 'email' | 'provider'>>
    ) => users.updateProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })

  return {
    user,
    isUserLoading,
    updateUser: updateUser.mutate,
    updateProfile: updateProfile.mutateAsync,
  }
}
