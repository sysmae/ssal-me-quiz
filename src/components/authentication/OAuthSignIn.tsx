'use client'

import { Suspense, useState, useId } from 'react'
import { Icons } from '@/components/authentication/Icons'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAuthError } from '@/utils/auth-errors'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Props {
  isLoading?: boolean
  onLoadingChange?: (loading: boolean) => void
  redirectUrl?: string
}

// Separate component to handle search params
function OAuthButtons({ isLoading, onLoadingChange, redirectUrl }: Props) {
  const toastId = useId()

  const [internalLoading, setInternalLoading] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Use either provided redirectUrl or next param from URL
  const nextUrl = redirectUrl || searchParams.get('next') || '/'

  // Use either parent loading state or internal state
  const loading = isLoading ?? internalLoading
  const setLoading = onLoadingChange ?? setInternalLoading

  // OAuth Sign In (Google, GitHub)
  const signInWithOAuth = async (
    provider: 'github' | 'google',
    nextUrl?: string
  ) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${nextUrl || '/'}`,
      },
    })
    if (error) throw error
    return data
  }

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    try {
      toast.loading('로그인 중...', { id: toastId })
      setLoading(true)
      await signInWithOAuth(provider, nextUrl)
    } catch (error) {
      const { message } = getAuthError(error)
      toast.error(String('로그인 중 오류가 발생했습니다.'), {
        id: toastId,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        type="button"
        disabled={loading}
        onClick={() => handleOAuthSignIn('google')}
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Google
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={loading}
        onClick={() => handleOAuthSignIn('github')}
      >
        <Icons.gitHub className="mr-2 h-4 w-4" />
        Github
      </Button>
    </div>
  )
}

export function OAuthSignIn(props: Props) {
  return (
    <div className="w-full">
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled>
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" disabled>
              <Icons.gitHub className="mr-2 h-4 w-4" />
              Github
            </Button>
          </div>
        }
      >
        <OAuthButtons {...props} />
      </Suspense>
    </div>
  )
}
