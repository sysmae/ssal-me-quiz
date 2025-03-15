import Link from 'next/link'
import React from 'react'

const Navigation = () => {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between">
        <Link href={'/'} className="text-xl font-bold">
          쌀미 퀴즈
        </Link>
        <button className="text-blue-500">로그인</button>
      </div>
    </nav>
  )
}

export default Navigation
