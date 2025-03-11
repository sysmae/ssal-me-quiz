'use client'
import { useState } from 'react'
import LoginForm from './LoginForm'
import { Button } from '../ui/button'
import SignupForm from './SignupForm'
import Link from 'next/link'
import ResetPassword from './ResetPassword'
import { OAuthSignIn } from './OAuthSignIn'

const AuthForm = ({ state }: { state: string }) => {
  const [mode, setMode] = useState(state)
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === 'reset'
            ? '비밀번호 재설정'
            : mode === 'login'
            ? '로그인'
            : '회원가입'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === 'reset'
            ? '이메일을 입력하여 비밀번호를 재설정합니다.'
            : mode === 'login'
            ? '로그인하여 계속하세요.'
            : '계정을 생성하세요.'}
        </p>
      </div>
      {mode === 'login' && (
        <>
          <LoginForm />
          <OAuthSignIn />
          <div className="text-center flex justify-between">
            <Button
              variant="link"
              onClick={() => setMode('signup')}
              className="p-0"
            >
              아직 계정이 없으신가요?
            </Button>
            <Button
              variant="link"
              onClick={() => setMode('reset')}
              className="p-0"
            >
              비밀번호를 잊으셨나요?
            </Button>
          </div>
        </>
      )}
      {mode === 'signup' && (
        <>
          <SignupForm />
          <OAuthSignIn />
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setMode('login')}
              className="p-0"
            >
              이미 계정이 있으신가요?
            </Button>
            <p className="px-8 text-center text-muted-foreground text-sm">
              회원가입하시면 Pictoria AI의{' '}
              <Link
                className="underline underline-offset-4 hover:text-primary"
                // href="https://pictoriaai.com/terms"
                href="#"
              >
                이용약관
              </Link>
              과{' '}
              <Link
                className="underline underline-offset-4 hover:text-primary"
                // href="https://pictoriaai.com/privacy"
                href="#"
              >
                개인정보 처리방침
              </Link>
              에 동의하게 됩니다.
            </p>
          </div>
        </>
      )}
      {mode === 'reset' && (
        <>
          <ResetPassword />
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setMode('login')}
              className="p-0"
            >
              로그인하러 가기
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
export default AuthForm
