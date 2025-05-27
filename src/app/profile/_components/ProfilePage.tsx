// pages/profile.tsx
'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useCurrentUserQueries, useUserQueries } from '@/hooks/useUserQueries'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export default function ProfilePage() {
  const { currentUser, isCurrentUserLoading } = useCurrentUserQueries()
  const userId = currentUser?.id || ''
  const { isUserLoading, updateProfile } = useUserQueries(userId)

  const [form, setForm] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || '',
        description: currentUser.description || '',
      })
    }
  }, [currentUser])

  if (isCurrentUserLoading || isUserLoading) {
    return <p>로딩 중…</p>
  }
  if (!currentUser) {
    return <p>로그인 후 이용해주세요.</p>
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!currentUser) return

    try {
      await updateProfile({
        name: form.name,
        description: form.description,
      })
      alert('프로필이 업데이트되었습니다.')
    } catch (error) {
      console.error('[ProfilePage] 프로필 업데이트 오류', error)
      alert('업데이트 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-blue-700 mt-12">
        프로필 업데이트
      </h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            이메일
          </label>
          <p className="text-xs text-gray-400 mb-1">
            계정에 등록된 이메일입니다. 변경할 수 없습니다.
          </p>
          <input
            value={currentUser.email}
            readOnly
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            이름
          </label>
          <p className="text-xs text-gray-400 mb-1">
            프로필에 표시될 이름을 입력하세요.
          </p>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            설명
          </label>
          <p className="text-xs text-gray-400 mb-1">
            간단한 자기소개나 상태 메시지를 입력할 수 있습니다.
          </p>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition resize-none"
            placeholder="자기소개를 입력하세요"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          저장하기
        </button>
      </form>
    </>
  )
}
