export type DataSourceKind = 'account' | 'automatic' | 'card' | 'loan'

export type DataSourceStatus = Readonly<{
  description: string
  kind: DataSourceKind
  reflectedRange: string
  refreshedAt: string
  title: string
  warning?: string
}>

export const DATA_SOURCE_STATUSES: ReadonlyArray<DataSourceStatus> = [
  {
    description: 'KB국민은행 · 신한은행',
    kind: 'account',
    reflectedRange: '최근 6개월 거래내역',
    refreshedAt: '오늘 오전 6:14',
    title: '사업자 계좌',
  },
  {
    description: 'BC카드·KB카드 가맹점 정산',
    kind: 'card',
    reflectedRange: '최근 6개월 거래내역',
    refreshedAt: '오늘 오전 6:14',
    title: '카드 정산',
  },
  {
    description: '사업자 대출 및 원리금 상환',
    kind: 'loan',
    reflectedRange: '최근 6개월 거래내역',
    refreshedAt: '오늘 오전 6:14',
    title: '대출 및 원리금',
  },
  {
    description: '공과금·구독·보험료 등',
    kind: 'automatic',
    reflectedRange: '최근 6개월 거래내역',
    refreshedAt: '오늘 오전 6:14',
    title: '자동이체',
    warning: '자동이체 Coverage가 낮아 일부 고정 지출이 누락됐을 수 있습니다.',
  },
]

export const EXCLUDED_DATA_ITEMS = [
  '현금 매출 및 타행 입금',
  '비정기 지출 (경조사·수리비 등)',
  '타 금융사 계좌 잔액·거래',
  '직접 입력하지 않은 예정 수입·지출',
] as const
