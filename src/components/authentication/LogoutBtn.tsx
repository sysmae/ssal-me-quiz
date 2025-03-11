'use client'

import { logout } from '@/app/actions/auth-actions'

const LogoutBtn = () => {
  const handleLogout = async () => {
    await logout()
  }
  return (
    <span
      className="inline-block w-full cursor-pointer text-destructive"
      onClick={handleLogout}
    >
      로그아웃
    </span>
  )
}
export default LogoutBtn
