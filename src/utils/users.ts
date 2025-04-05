import { createClient } from './supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from './supabase/types'

const supabase = createClient()

// Supabase 생성 타입 사용
type DbUser = Database['public']['Tables']['users']['Row']
type DbUserInsert = Database['public']['Tables']['users']['Insert']
type DbUserUpdate = Database['public']['Tables']['users']['Update']

export const users = {
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as DbUser
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) return null
    return await this.getUser(data.user.id)
  },

  async createUser(user: DbUserInsert) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()

    if (error) throw error
    return data as DbUser
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
    const newUser: DbUserInsert = {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata.full_name || authUser.email!.split('@')[0],
      avatar: authUser.user_metadata.avatar_url || '',
      description: '',
      provider,
    }

    return await this.createUser(newUser)
  },

  async updateUser(id: string, updates: DbUserUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as DbUser
  },

  async updateProfile(
    userId: string,
    updates: Partial<Omit<DbUser, 'id' | 'email' | 'provider'>>
  ) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) throw error

    // Update auth user metadata if avatar or name changed
    const metadata: { avatar_url?: string; full_name?: string } = {}

    if (updates.avatar !== null) {
      metadata.avatar_url = updates.avatar
    }

    if (updates.name !== undefined) {
      metadata.full_name = updates.name
    }

    if (Object.keys(metadata).length > 0) {
      const { error: authError } = await supabase.auth.updateUser({
        data: metadata,
      })

      if (authError) {
        return {
          error: authError,
          message: 'Failed to update user metadata in auth',
        }
      }
    }
  },
}
