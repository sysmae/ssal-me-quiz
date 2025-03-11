'use client'

import { createClient } from '@/utils/supabase/client'
import LogoutBtn from '@/components/authentication/LogoutBtn'
export default function Home() {
  const supabase = createClient()

  return (
    <>
      <LogoutBtn />
    </>
  )
}
