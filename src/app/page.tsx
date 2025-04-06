import { Benefits } from './_components/Benefits'
import { Hero } from './_components/Hero'
import { SectionTitle } from './_components/SectionTitle'
import { benefitOne, benefitTwo } from './_components/data'
import { Cta } from './_components/Cta'

const HomePage = () => {
  return (
    <div>
      <Hero />
      {/* <SectionTitle preTitle="쌀미 퀴즈" title="쌀미 퀴즈가 특별한 이유">
        쌀미는 단순한 퀴즈 앱이 아닙니다. 자기 이해와 지식 확장을 위한
        여정입니다. 다양한 주제의 퀴즈를 통해 자신의 강점과 약점을 발견하고, 더
        나은 자신을 만들어 가세요.
      </SectionTitle> */}
      <Benefits data={benefitOne} />
      <Benefits imgPos="right" data={benefitTwo} />{' '}
      <SectionTitle
        preTitle="진화하는 지식의 놀이터! 쌀미🚀"
        title="지속적인 발전, 끊임없는 혁신"
      >
        끊임없이 업데이트되는 신선한 콘텐츠와 여러분의 소중한 의견이 만나 더욱
        강력해집니다. 곧 출시될 AI 기능으로 단 몇 초 만에 나만의 맞춤형 퀴즈를
        생성해보세요.
      </SectionTitle>
      <Cta />
    </div>
  )
}
export default HomePage
