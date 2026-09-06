export type CashflowStatusKind = 'normal' | 'risk' | 'stable'

export type CashflowStatusMetric = Readonly<{
  label: string
  tone: 'danger' | 'info'
  value: string
}>

export type CashflowStatusViewData = Readonly<{
  analysisLabel: string
  ariaLabel: string
  description: readonly string[]
  metrics: readonly CashflowStatusMetric[]
  reasons: readonly string[]
  status: CashflowStatusKind
  summaryNote?: string
  title: string
}>

export const CASHFLOW_STABLE_METRICS: readonly CashflowStatusMetric[] = [
  { label: '예상 최저잔액', tone: 'info', value: '약 312만 원 ~ 448만 원' },
  { label: '안전 금액 수준', tone: 'info', value: '충족' },
  { label: '첫 부족일', tone: 'info', value: '30일 이내 없음' },
  { label: '분석 범위', tone: 'info', value: '사업자계좌·카드정산·자동이체' },
]

export const CASHFLOW_STABLE_REASONS = [
  '최근 8주 매출이 전월 대비 안정적으로 유지되고 있습니다.',
  '월말 임차료·원리금 납부 일정이 잔액 대비 감당 가능한 수준입니다.',
  '보정값 미입력 항목이 있을 경우 실제 수치와 다를 수 있습니다.',
  '지원 자격과 금융 조건은 공식 출처에서 최종 확인이 필요합니다.',
] as const

export const CASHFLOW_RISK_STATUS_DATA: CashflowStatusViewData = {
  analysisLabel: '분석일 기준 2025년 7월 14일 · 데이터 반영 완료',
  ariaLabel: '현금흐름 위험 상태 안내 화면',
  description: ['향후 30일간 안전자금', '아래로 내려갈 가능성이 높습니다.'],
  metrics: [
    { label: '예상 최저잔액', tone: 'danger', value: '약 -128만 원 ~ -54만 원' },
    { label: '안전 금액 수준', tone: 'danger', value: '미충족' },
    { label: '첫 부족일', tone: 'danger', value: '2025년 07월 29일' },
    { label: '분석 범위', tone: 'info', value: '사업자계좌·카드정산·자동이체' },
  ],
  reasons: [
    '최근 8주 매출이 전월 대비 안정적으로 유지되고 있지 않습니다.',
    '월말 임차료·원리금 납부 일정이 잔액 대비 감당이 어렵습니다.',
    '보정값 미입력 항목이 있을 경우 실제 수치와 다를 수 있습니다.',
    '지원 자격과 금융 조건은 공식 출처에서 최종 확인이 필요합니다.',
  ],
  status: 'risk',
  summaryNote: 'Coverage 70% 미만 항목이 있어 판단을 보류합니다.',
  title: '현금흐름 위험',
}

export const CASHFLOW_STABLE_STATUS_DATA: CashflowStatusViewData = {
  analysisLabel: '분석일 기준 2025년 7월 14일 · 데이터 반영 완료',
  ariaLabel: '현금흐름 안정 상태 안내 화면',
  description: ['향후 30일간 안전자금', '아래로 내려갈 가능성이 낮습니다.'],
  metrics: CASHFLOW_STABLE_METRICS,
  reasons: CASHFLOW_STABLE_REASONS,
  status: 'stable',
  title: '현금흐름 안정',
}
