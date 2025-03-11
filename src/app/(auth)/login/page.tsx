import Image from 'next/image'
import AuthImg from '@/public/Abstract Curves and Colors.jpeg'
import Logo from '@/components/authentication/Logo'
import AuthForm from '@/components/authentication/AuthForm'

interface SearchParams {
  state?: string
}

const AuthenticationPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) => {
  const { state } = await searchParams

  return (
    <main className="h-screen grid grid-cols-2 relative">
      <div className="relative w-full flex flex-col bg-muted p-10 text-primary-foreground">
        {/* 약간 그라디에이션 깔아줌 */}
        <div className="w-full h-[30%] bg-gradient-to-t from-transparent to-black/50 absolute top-0 left-0 z-10" />
        <div className="w-full h-[30%] bg-gradient-to-b from-transparent to-black/50 absolute bottom-0 left-0 z-10" />

        <Image
          src={AuthImg}
          alt="로그인 이미지"
          fill
          className="w-full h-full object-cover"
        />
        <div className="relative z-20 flex items-center ">
          <Logo />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Pictoria AI는 제 삶을 바꿔놓았습니다. 몇 분 만에 고품질의
              전문적인 프로필 사진을 만들 수 있었고, 덕분에 많은 시간과 비용을
              절약할 수 있었습니다.&rdquo;
            </p>
            <footer className="text-sm">Sysmae</footer>
          </blockquote>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center p-8 h-full  w-full mx-auto">
        <div className="max-w-xl w-[350px] mx-auto">
          <AuthForm state={state ?? 'login'} />
        </div>
      </div>
    </main>
  )
}
export default AuthenticationPage
