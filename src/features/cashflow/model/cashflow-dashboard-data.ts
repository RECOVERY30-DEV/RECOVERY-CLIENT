export const CASHFLOW_DATA_SOURCES = [
  { label: '사업자계좌', status: '오늘 09:14 반영' },
  { label: '카드정산', status: '오늘 09:14 반영' },
  { label: '대출·원리금', status: '오늘 09:14 반영' },
  { label: '자동이체', status: '오늘 09:14 반영' },
] as const

export const DAILY_CASHFLOW_ITEMS = [
  { date: '11 / 10 (일)', detail: '공휴일 — 이동 적용', id: '2024-11-10' },
  { date: '11 / 14 (목)', detail: '유입 +320만 원 (카드정산)', id: '2024-11-14' },
  { date: '11 / 20 (수)', detail: '유출 −185만 원 (임차료)', id: '2024-11-20' },
  { date: '11 / 25 (월)', detail: '유출 −78만 원 (원리금)', id: '2024-11-25' },
  { date: '11 / 28 (목)', detail: '유출 −78만 원 (원리금)', id: '2024-11-28' },
] as const

export const CASHFLOW_FACTORS = [
  {
    description: '8월 말 고정 지출 3건이 같은 주에 집중',
    impact: '-85만 원',
    progress: '100%',
    title: '월말 원리금 임차료 집중',
    tone: 'danger',
  },
  {
    description: '직전 8주 평균 대비 카드 정산 수입이 감소',
    impact: '-52만 원',
    progress: '66%',
    title: '최근 4주 매출 감소',
    tone: 'danger',
  },
  {
    description: '과거 같은 시기 패턴과 비교한 추정입니다. 보정 후 재계산을 권장합니다.',
    impact: '확인 필요',
    progress: '0%',
    title: '계절적 회복 지연 가능',
    tone: 'pending',
  },
] as const
