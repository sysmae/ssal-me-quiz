import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  UserGroupIcon,
  ClockIcon,
  PresentationChartLineIcon,
  ShareIcon,
} from '@heroicons/react/24/solid'

import benefitOneImg from '../../../public/img/benefit_1.png'
import benefitTwoImg from '../../../public/img/benefit_2.png'

const benefitOne = {
  title: '쌀미 퀴즈가 특별한 이유',
  desc: '쌀미는 단순한 퀴즈 앱이 아닙니다. 자기 이해와 지식 확장을 위한 여정입니다. 다양한 주제의 퀴즈를 통해 자신의 강점과 약점을 발견하고, 더 나은 자신을 만들어 가세요.',
  image: benefitOneImg,
  bullets: [
    {
      title: '나를 발견하세요',
      desc: '퀴즈와 심리테스트를 통해 당신의 숨겨진 모습을 발견하세요. 자신이 생각했던 것과 실제는 얼마나 다른가요? 객관적인 결과를 통해 자신을 새롭게 바라보는 기회를 얻으세요.',
      icon: <FaceSmileIcon />,
    },
    {
      title: '지식을 확장하세요',
      desc: '다양한 주제의 퀴즈로 새로운 지식을 쌓고, 자신의 이해도를 점검하세요. 취미부터 전문 지식까지, 퀴즈를 풀며 재미있게 학습하고 성장하세요.',
      icon: <ChartBarSquareIcon />,
    },
    {
      title: '친구들과 공유하세요',
      desc: '재미있는 결과를 소셜 미디어에 공유하고, 친구들과 비교해보세요. 서로의 결과를 통해 새로운 대화를 시작하고 더 깊은 관계를 형성하세요.',
      icon: <UserGroupIcon />,
    },
  ],
}

const benefitTwo = {
  title: '쉽고 직관적인 사용 경험',
  desc: '쌀미 퀴즈는 누구나 쉽게 이용할 수 있도록 설계되었습니다. 단 몇 분 만에 새로운 인사이트를 얻고, 자신에 대해 더 깊이 이해할 수 있습니다.',
  image: benefitTwoImg,
  bullets: [
    {
      title: '퀴즈 선택하기',
      desc: '다양한 주제의 퀴즈 중에서 관심 있는 것을 선택하세요. 인기 있는 퀴즈부터 새롭게 추가된 퀴즈까지, 당신의 호기심을 자극할 콘텐츠가 기다리고 있습니다.',
      icon: <CursorArrowRaysIcon />,
    },
    {
      title: '질문에 답하기',
      desc: '5~10개의 질문에 솔직하게 답변하세요. 시간은 단 5분이면 충분합니다. 언제 어디서나 짧은 시간에 즐길 수 있는 최적의 경험을 제공합니다.',
      icon: <ClockIcon />,
    },
    {
      title: '결과 확인하기',
      desc: '당신의 점수와 상위 몇 %인지 확인하고, 자세한 분석 결과를 받아보세요. 시각적으로 보기 쉽게 정리된 결과는 당신에 대한 새로운 통찰을 제공합니다.',
      icon: <PresentationChartLineIcon />,
    },
    {
      title: '공유하기',
      desc: '재미있는 결과를 친구들과 공유하고 비교해보세요. 한 번의 클릭으로 SNS에 공유하고, 친구들과 함께 퀴즈의 재미를 나눠보세요.',
      icon: <ShareIcon />,
    },
  ],
}

export { benefitOne, benefitTwo }
