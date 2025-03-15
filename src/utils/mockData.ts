export const mockQuizzes = [
  {
    id: '1',
    title: '일반 상식 퀴즈',
    description: '일상생활에서 알아두면 좋은 일반 상식 퀴즈입니다.',
    thumbnail: 'https://via.placeholder.com/150',
    questions: [
      {
        id: '1-1',
        text: '대한민국의 수도는?',
        type: 'short_answer',
        answer: '서울',
        alternativeAnswers: ['서울특별시', 'Seoul'],
      },
      {
        id: '1-2',
        text: '1 + 1 = ?',
        type: 'short_answer',
        answer: '2',
        alternativeAnswers: ['two', '둘'],
      },
    ],
  },
  {
    id: '2',
    title: '영화 퀴즈',
    description: '유명한 영화에 관한 퀴즈입니다.',
    thumbnail: 'https://via.placeholder.com/150',
    questions: [
      {
        id: '2-1',
        text: '타이타닉의 주인공 남자 배우 이름은?',
        type: 'short_answer',
        answer: '레오나르도 디카프리오',
        alternativeAnswers: ['디카프리오', 'Leonardo DiCaprio'],
      },
      {
        id: '2-2',
        text: '다음 중 마블 시네마틱 유니버스 영화가 아닌 것은?',
        type: 'multiple_choice',
        options: ['아이언맨', '배트맨', '토르', '캡틴 아메리카'],
        answer: '배트맨',
      },
    ],
  },
  {
    id: '3',
    title: '음식 퀴즈',
    description: '맛있는 음식에 관한 퀴즈입니다.',
    thumbnail: 'https://via.placeholder.com/150',
    questions: [
      {
        id: '3-1',
        text: '김치의 주 재료는?',
        type: 'short_answer',
        answer: '배추',
        alternativeAnswers: ['cabbage'],
      },
      {
        id: '3-2',
        text: '다음 중 이탈리아 음식이 아닌 것은?',
        type: 'multiple_choice',
        options: ['피자', '파스타', '스시', '라자냐'],
        answer: '스시',
      },
    ],
  },
]
