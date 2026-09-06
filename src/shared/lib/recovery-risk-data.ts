export type RecoveryRiskCause = Readonly<{
  actions: ReadonlyArray<Readonly<{ href: string; label: string }>>
  contribution: string
  description: string
  evidence: string
  forecastAssumption: string
  title: string
}>

export const RECOVERY_RISK_SUMMARY = {
  firstShortageAfter: '14일 후',
  minimumBalanceRange: '-230만 ~ -80만 원',
  shortageDate: '6월 28일',
  shortSummary: '14일 후 · 6월 28일',
} as const

export const RECOVERY_RISK_CAUSES: readonly RecoveryRiskCause[] = [
  {
    actions: [{ href: '/cashflow/corrections/expected-income/new', label: '보정값 추가하기' }],
    contribution: '–180만 원',
    description:
      '최근 8주 평균 대비 약 32% 매출이 줄었습니다. 카드 정산 기준 주간 입금이 감소 추세입니다.',
    evidence: '신한카드 정산 5건 · 6월 2일~11일',
    forecastAssumption: '직전 4주 평균 입금 패턴 반영',
    title: '최근 8주 매출 감소',
  },
  {
    actions: [{ href: '/cashflow/corrections/expected-expenses/new', label: '보정값 추가하기' }],
    contribution: '–320만 원',
    description:
      '6월 30일 임차료 150만 원과 대출 원리금 170만 원이 같은 날 출금 예정입니다. 잔액 부족 가능성이 높습니다.',
    evidence: '임차료·원리금 자동이체 2건 · 6월 30일 예정',
    forecastAssumption: '등록된 자동이체 일정 반영',
    title: '월말 임차료·원리금 집중',
  },
  {
    actions: [
      { href: '/cashflow/corrections/cash-sales/new', label: '현금매출 보정하기' },
      { href: '#cashflow-forecast-accuracy', label: '근거 더 보기' },
    ],
    contribution: '추정 중',
    description: '과거 같은 시기 패턴과 비교한 추정입니다. 보정 후 재계산을 권장합니다.',
    evidence: '최근 2년 동기간 매출 패턴',
    forecastAssumption: '현금 매출 입력 전 추정값 적용',
    title: '계절적 매출 회복 지연',
  },
]
