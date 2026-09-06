export type CashflowCorrectionItem = Readonly<{
  description: string
  href: string
  id: 'cash-sales' | 'external-funds' | 'expected-income' | 'expected-expenses'
  status: string
  title: string
}>

export const CASHFLOW_COVERAGE_ITEMS = [
  { label: '사업자 계좌 입출금', value: '72%' },
  { label: '카드 정산', value: '55%' },
  { label: '대출·원리금', value: '40%' },
  { label: '자동이체', value: '61%' },
] as const

export const CASHFLOW_CORRECTION_ITEMS: readonly CashflowCorrectionItem[] = [
  {
    description: '현금으로 받은 매출을 추가하면 매출 흐름을 더 정확히 계산할 수 있어요.',
    href: '/cashflow/corrections/cash-sales/new',
    id: 'cash-sales',
    status: '입력 필요',
    title: '현금매출',
  },
  {
    description: '다른 은행 계좌나 외부에서 들어온 자금을 반영해 주세요.',
    href: '/cashflow/corrections/external-funds/new',
    id: 'external-funds',
    status: '입력 필요',
    title: '타행·외부자금',
  },
  {
    description: '이미 예정된 수입을 등록하면 현금 유입 시점을 예측할 수 있어요.',
    href: '/cashflow/corrections/expected-income/new',
    id: 'expected-income',
    status: '입력 필요',
    title: '예정수입',
  },
  {
    description: '다가오는 지출을 등록하면 부족 가능 시점을 더 정확히 볼 수 있어요.',
    href: '/cashflow/corrections/expected-expenses/new',
    id: 'expected-expenses',
    status: '입력 필요',
    title: '예정지출',
  },
] as const

export const CASHFLOW_MISSING_INFORMATION = [
  '현금 매출 또는 타행 입금 내역',
  '예정된 수입·지출 일정',
  '반복 지출 중 미등록 항목',
] as const

export const CASHFLOW_REPEAT_PATTERN_CANDIDATES = [
  '매월 15일 현금 매출 약 120만 원',
  '매월 말 타행 입금 약 85만 원',
] as const
