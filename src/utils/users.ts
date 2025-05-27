import { createClient } from './supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserData } from '@/types/user'
import type { UserUpdateData } from '@/types/user'
import type { UserInsertData } from '@/types/user'

const supabase = createClient()

export const users = {
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as UserData
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) return null
    return await this.getUser(data.user.id)
  },

  async createUser(user: UserInsertData) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()

    if (error) throw error
    return data as UserData
  },

  async captureUserDetails(authUser: User) {
    // Check if user already exists
    const existingUser = await this.getUser(authUser.id).catch(() => null)
    if (existingUser) return existingUser

    // Extract provider
    const provider = authUser.app_metadata.provider as
      | 'google'
      | 'github'
      | 'email'

    // Create new user
    const newUser: UserInsertData = {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata.full_name || authUser.email!.split('@')[0],
      avatar: authUser.user_metadata.avatar_url || '',
      description: '',
      provider,
    }

    return await this.createUser(newUser)
  },

  async updateUser(id: string, updates: UserUpdateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as UserData
  },

  // async updateProfile(
  //   userId: string,
  //   updates: Partial<Omit<UserData, 'id' | 'email' | 'provider'>>
  // ) {
  //   const { error } = await supabase
  //     .from('users')
  //     .update(updates)
  //     .eq('id', userId)

  //   if (error) throw error

  //   // Update auth user metadata if avatar or name changed
  //   const metadata: { avatar_url?: string; full_name?: string } = {}

  //   if (updates.avatar !== null) {
  //     metadata.avatar_url = updates.avatar
  //   }

  //   if (updates.name !== undefined) {
  //     metadata.full_name = updates.name
  //   }

  //   if (Object.keys(metadata).length > 0) {
  //     const { error: authError } = await supabase.auth.updateUser({
  //       data: metadata,
  //     })

  //     if (authError) {
  //       return {
  //         error: authError,
  //         message: 'Failed to update user metadata in auth',
  //       }
  //     }
  //   }
  // },
  async updateProfile(
    userId: string,
    updates: Partial<Omit<UserData, 'id' | 'email' | 'provider'>>
  ) {
    console.log('[users.updateProfile] 시작', { userId, updates })

    // 1) 사용자 테이블 업데이트
    const { error: tableError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
    if (tableError) {
      console.error('[users.updateProfile] 테이블 업데이트 실패', tableError)
      throw tableError
    }
    console.log('[users.updateProfile] users 테이블 업데이트 성공')

    // 2) Supabase Auth 유저 메타데이터 업데이트
    const { data: authData, error: authError } = await supabase.auth.updateUser(
      {
        data: {
          avatar: updates.avatar ?? undefined,
          name: updates.name ?? undefined,
          description: updates.description ?? undefined,
        },
      }
    )
    if (authError) {
      console.error(
        '[users.updateProfile] Auth 프로필 업데이트 실패',
        authError
      )
      throw authError
    }
    console.log('[users.updateProfile] Auth 프로필 업데이트 성공', authData)

    return { table: true, auth: authData }
  },
}
