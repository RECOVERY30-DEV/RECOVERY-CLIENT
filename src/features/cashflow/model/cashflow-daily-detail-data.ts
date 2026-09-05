import { DAILY_CASHFLOW_ITEMS } from './cashflow-dashboard-data'

export type CashflowDetailItem = Readonly<{
  amount: string
  description: string
  label: string
}>

export type CashflowDetailSection = Readonly<{
  items: readonly CashflowDetailItem[]
  title: string
}>

export type CashflowDailySummary = Readonly<{
  conservativeBalance: string
  dDay: string
  expectedBalance: string
  optimisticBalance: string
  openingBalance: string
}>

type CashflowDailySource = Readonly<{
  label: string
  status: string
}>

type CashflowDailyNote = Readonly<{
  description: string
  title: string
}>

export type CashflowDailyDetail = Readonly<{
  notes: readonly CashflowDailyNote[]
  sections: readonly CashflowDetailSection[]
  sources: readonly CashflowDailySource[]
  summary: CashflowDailySummary
}>

type CashflowDailyDate = (typeof DAILY_CASHFLOW_ITEMS)[number]['id']

type DailyDetailSeed = Readonly<{
  event: CashflowDetailItem
  note: CashflowDailyNote
  summary: CashflowDailySummary
}>

const CASHFLOW_DAILY_SOURCES: readonly CashflowDailySource[] = [
  { label: '사업자 계좌 (우리은행)', status: '오늘 08:32 갱신' },
  { label: '카드 정산 (신한카드)', status: '오늘 07:15 갱신' },
  { label: '자동이체 스케줄', status: '오늘 08:32 갱신' },
  { label: '보정값 반영 여부', status: '사업자계좌·카드정산·자동이체' },
]

const COMMON_NOTES: readonly CashflowDailyNote[] = [
  {
    description: '예상 거래는 최근 8주 거래 데이터 기반이며 실제 금액과 다를 수 있습니다.',
    title: '예측 근거 안내',
  },
]

const EXPECTED_TRANSACTION_ITEMS: readonly CashflowDetailItem[] = [
  {
    amount: '+₩420,000 ~ ₩710,000',
    description: '최근 8주 평균 기반 · 보정값 반영',
    label: '현금 매출 추정',
  },
  { amount: '-₩150,000', description: '반복 패턴 추정 · 격월 납부', label: '공과금 예정' },
]

const CORRECTION_ITEMS: readonly CashflowDetailItem[] = [
  { amount: '+₩200,000', description: '사용자 직접 입력 · 확정', label: '타행 입금 예정' },
  {
    amount: '-₩150,000',
    description: '사용자 직접 입력 · 미확정',
    label: '공과금 예정 지출 (거래처)',
  },
]

function createSections(event: CashflowDetailItem): readonly CashflowDetailSection[] {
  const isInflow = event.amount.startsWith('+')
  const isOutflow = event.amount.startsWith('-')

  return [
    {
      title: '잔액·유입·유출 요약',
      items: [
        { amount: '약 312만 원 ~ 448만 원', description: '직전 잔액', label: '시작 잔액' },
        ...(isInflow
          ? [{ amount: event.amount, description: event.description, label: '확정 유입' }]
          : []),
        ...(isOutflow
          ? [{ amount: event.amount, description: event.description, label: '확정 유출' }]
          : []),
        {
          amount: '+₩420,000 ~ ₩710,000',
          description: '현금 매출 등 반복 패턴 추정',
          label: '예상 유입',
        },
        { amount: '-₩150,000', description: '공과금 등 반복 패턴 추정', label: '예상 유출' },
        { amount: '+₩50,000', description: '사용자 직접 입력값 반영', label: '보정값 합계' },
      ],
    },
    { title: '확정 거래', items: [event] },
    { title: '예상 거래', items: EXPECTED_TRANSACTION_ITEMS },
    { title: '보정값', items: CORRECTION_ITEMS },
  ]
}

function createDailyDetail(seed: DailyDetailSeed): CashflowDailyDetail {
  return {
    notes: [seed.note, ...COMMON_NOTES],
    sections: createSections(seed.event),
    sources: CASHFLOW_DAILY_SOURCES,
    summary: seed.summary,
  }
}

export const CASHFLOW_DAILY_DETAILS = {
  '2024-11-10': createDailyDetail({
    event: {
      amount: '다음 영업일',
      description: '공휴일로 납부 일정 이동',
      label: '원리금 납부일 이동',
    },
    note: {
      description: '공휴일로 인해 원리금 상환 기준일이 다음 영업일로 이동했습니다.',
      title: '공휴일 납부일 이동',
    },
    summary: {
      conservativeBalance: '₩4,780,000',
      dDay: 'D-16',
      expectedBalance: '₩4,780,000 ~ ₩5,020,000',
      optimisticBalance: '₩5,020,000',
      openingBalance: '₩5,150,000',
    },
  }),
  '2024-11-14': createDailyDetail({
    event: {
      amount: '+₩3,200,000',
      description: '신한카드 · 전일 매출 확정',
      label: '카드 매출 정산',
    },
    note: {
      description: '카드사에서 확정한 전일 매출 정산 금액이 반영됐습니다.',
      title: '카드 정산 반영',
    },
    summary: {
      conservativeBalance: '₩3,150,000',
      dDay: 'D-12',
      expectedBalance: '₩3,150,000 ~ ₩3,640,000',
      optimisticBalance: '₩3,640,000',
      openingBalance: '₩4,820,000',
    },
  }),
  '2024-11-20': createDailyDetail({
    event: {
      amount: '-₩1,850,000',
      description: '우리은행 · 임대차 계약 일정',
      label: '임차료 출금',
    },
    note: {
      description: '정기 임차료가 자동이체 일정에 따라 출금될 예정입니다.',
      title: '고정비 출금 집중',
    },
    summary: {
      conservativeBalance: '₩2,480,000',
      dDay: 'D-6',
      expectedBalance: '₩2,480,000 ~ ₩2,760,000',
      optimisticBalance: '₩2,760,000',
      openingBalance: '₩4,330,000',
    },
  }),
  '2024-11-25': createDailyDetail({
    event: {
      amount: '-₩780,000',
      description: 'IBK기업은행 · 고정 상환 일정',
      label: '원리금 상환',
    },
    note: {
      description: '월말 원리금 상환이 예정되어 가용 현금이 감소합니다.',
      title: '원리금 상환 예정',
    },
    summary: {
      conservativeBalance: '₩1,320,000',
      dDay: 'D-1',
      expectedBalance: '₩1,320,000 ~ ₩1,580,000',
      optimisticBalance: '₩1,580,000',
      openingBalance: '₩2,100,000',
    },
  }),
  '2024-11-28': createDailyDetail({
    event: {
      amount: '-₩780,000',
      description: '우리은행 · 추가 상환 일정',
      label: '원리금 추가 상환',
    },
    note: {
      description: '같은 주에 두 번째 원리금 상환이 예정되어 부족 위험이 커집니다.',
      title: '상환 일정 중복',
    },
    summary: {
      conservativeBalance: '-₩1,280,000',
      dDay: 'D+2',
      expectedBalance: '-₩1,280,000 ~ -₩540,000',
      optimisticBalance: '-₩540,000',
      openingBalance: '₩240,000',
    },
  }),
} satisfies Record<CashflowDailyDate, CashflowDailyDetail>

export function getCashflowDailyDetail(date: string): CashflowDailyDetail | undefined {
  return CASHFLOW_DAILY_DETAILS[date as CashflowDailyDate]
}
