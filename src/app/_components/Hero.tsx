import Image from 'next/image'
import heroImg from '../../../public/img/hero_1.png'
import { Container } from './Container'
import Link from 'next/link'

export const Hero = () => {
  return (
    <>
      <Container className="flex flex-wrap ">
        <div className="flex items-center w-full lg:w-1/2">
          <div className="max-w-2xl mb-8">
            <h1 className="text-4xl font-bold leading-snug tracking-tight text-gray-800 lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight dark:text-white">
              쌀미 퀴즈: 당신이 얼마나 알고 있는지 발견하세요
            </h1>
            <p className="py-5 text-xl leading-normal text-gray-500 lg:text-xl xl:text-2xl dark:text-gray-300">
              자신을 제대로 아는 여정을 시작하세요
              <br />
              진정한 지식은 피드백에서 시작됩니다. 자신의 지식 수준을 확인하고,
              새로운 인사이트를 얻으세요.
            </p>

            <div className="flex flex-col items-start space-y-3 sm:space-x-4 sm:space-y-0 sm:items-center sm:flex-row">
              <Link
                href="/quiz"
                className="px-8 py-4 text-lg font-medium text-center text-white bg-indigo-600 rounded-md "
              >
                지금 바로 시작하기
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center w-full lg:w-1/2">
          <div className="">
            <Image
              src={heroImg}
              width="500"
              height="600"
              className={'object-cover'}
              alt="Hero Illustration"
              loading="eager"
              placeholder="blur"
            />
          </div>
        </div>
      </Container>
    </>
  )
}
