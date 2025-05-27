import { Database } from '@/database.types'

export type UserData = Database['public']['Tables']['users']['Row']
export type UserUpdateData = Database['public']['Tables']['users']['Update']
export type UserInsertData = Database['public']['Tables']['users']['Insert']
