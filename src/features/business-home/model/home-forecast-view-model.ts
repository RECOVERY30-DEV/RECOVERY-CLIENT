import type {
  ForecastCoverage,
  ForecastCoverageSource,
  ForecastMinBalance,
  ForecastSafetyBuffer,
  ForecastShortfall,
  LatestForecast,
} from '@/features/forecast'

import { formatHomeDataUpdatedAt } from './home-data'

type HomeForecastData = Readonly<{
  latest: LatestForecast
  minBalance: ForecastMinBalance
  shortfall: ForecastShortfall
  safetyBuffer: ForecastSafetyBuffer
  coverage: ReadonlyArray<ForecastCoverage>
}>

type HomeDataSource = Readonly<{
  label: string
  refreshedAt: string
}>

type HomeDataStatus = Readonly<{
  label: string
  status: '갱신 완료' | '부분 반영' | '확인 필요'
}>

export type HomeForecastViewModel = Readonly<{
  headerText: string
  range: Readonly<{
    summary: string
    conservative: string
    optimistic: string
    expectedPosition: number
  }>
  shortage: Readonly<{
    dDay: string
    expectedDate: string
    progress: number
  }>
  safety: Readonly<{
    amount: string
    status: string
  }>
  dataSources: ReadonlyArray<HomeDataSource>
  dataStatuses: ReadonlyArray<HomeDataStatus>
}>

const KOREA_TIME_OFFSET_IN_MILLISECONDS = 9 * 60 * 60 * 1000

function formatAmountUnit(amount: number): string {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(
    Math.abs(amount) / 10_000,
  )
}

function formatSignedAmount(amount: number, suffix: string): string {
  const sign = amount < 0 ? '−' : amount > 0 ? '+' : ''

  return `${sign}${formatAmountUnit(amount)}${suffix}`
}

function formatBaseDate(baseDate: string): string {
  const [year, month, day] = baseDate.split('-').map(Number)

  return `${year}년 ${month}월 ${day}일`
}

function formatUpdatedTime(updatedAt: string): string {
  const koreaTime = new Date(Date.parse(updatedAt) + KOREA_TIME_OFFSET_IN_MILLISECONDS)
  const hour = koreaTime.getUTCHours()
  const minute = String(koreaTime.getUTCMinutes()).padStart(2, '0')
  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour % 12 || 12

  return `${period} ${displayHour}:${minute}`
}

function roundPercentage(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100
}

function createRange(
  latest: LatestForecast,
  minBalance: ForecastMinBalance,
): HomeForecastViewModel['range'] {
  const { available, conservative, expected, optimistic } = minBalance

  if (
    latest.status === 'HOLD' ||
    !available ||
    conservative === null ||
    expected === null ||
    optimistic === null
  ) {
    return {
      summary: '범위 산출 불가',
      conservative: '확인 필요',
      optimistic: '확인 필요',
      expectedPosition: 0,
    }
  }

  const range = optimistic - conservative
  const expectedPosition = range === 0 ? 50 : ((expected - conservative) / range) * 100

  return {
    summary: `${formatSignedAmount(conservative, '만 원')} ~ ${formatSignedAmount(expected, '만 원')}`,
    conservative: formatSignedAmount(conservative, '만'),
    optimistic: `${formatAmountUnit(optimistic)}만`,
    expectedPosition: roundPercentage(expectedPosition),
  }
}

function createShortage(
  latest: LatestForecast,
  shortfall: ForecastShortfall,
): HomeForecastViewModel['shortage'] {
  if (
    latest.status === 'HOLD' ||
    !shortfall.hasShortfall ||
    shortfall.dDay === null ||
    shortfall.expectedDate === null ||
    shortfall.horizonDays === null
  ) {
    return {
      dDay: '확인 어려움',
      expectedDate: latest.status === 'HOLD' ? '데이터 보정 필요' : '부족 예상 없음',
      progress: 0,
    }
  }

  const [, month, day] = shortfall.expectedDate.split('-').map(Number)

  return {
    dDay: `D-${shortfall.dDay}`,
    expectedDate: `${month}월 ${day}일 예상`,
    progress: roundPercentage((shortfall.dDay / shortfall.horizonDays) * 100),
  }
}

function getCoverage(
  coverage: ReadonlyArray<ForecastCoverage>,
  sourceType: ForecastCoverageSource,
): ForecastCoverage | undefined {
  return coverage.find((item) => item.sourceType === sourceType)
}

function getStatus(items: ReadonlyArray<ForecastCoverage | undefined>): HomeDataStatus['status'] {
  if (items.some((item) => item === undefined)) {
    return '확인 필요'
  }

  return items.some((item) => item?.status === 'PARTIAL') ? '부분 반영' : '갱신 완료'
}

function getOldestSyncedAt(items: ReadonlyArray<ForecastCoverage | undefined>): string | undefined {
  let oldest: string | undefined

  for (const item of items) {
    if (item === undefined) {
      return undefined
    }

    if (oldest === undefined || Date.parse(item.lastSyncedAt) < Date.parse(oldest)) {
      oldest = item.lastSyncedAt
    }
  }

  return oldest
}

function createCoverageViewModels(
  coverage: ReadonlyArray<ForecastCoverage>,
  referenceAt: Date,
): Pick<HomeForecastViewModel, 'dataSources' | 'dataStatuses'> {
  const bankAccount = getCoverage(coverage, 'BANK_ACCOUNT')
  const cardSettlement = getCoverage(coverage, 'CARD_SETTLEMENT')
  const autoTransfer = getCoverage(coverage, 'AUTO_TRANSFER')
  const loan = getCoverage(coverage, 'LOAN')
  const groups = [
    {
      sourceLabel: '사업자 계좌',
      statusLabel: '사업자 계좌',
      items: [bankAccount],
    },
    {
      sourceLabel: '카드 정산',
      statusLabel: '카드 정산',
      items: [cardSettlement],
    },
    {
      sourceLabel: '자동이체·대출',
      statusLabel: '자동이체/대출',
      items: [autoTransfer, loan],
    },
  ] as const

  return {
    dataSources: groups.map(({ sourceLabel, items }) => {
      const lastSyncedAt = getOldestSyncedAt(items)

      return {
        label: sourceLabel,
        refreshedAt:
          lastSyncedAt === undefined
            ? '갱신 시간 확인 필요'
            : formatHomeDataUpdatedAt(lastSyncedAt, referenceAt),
      }
    }),
    dataStatuses: groups.map(({ statusLabel, items }) => ({
      label: statusLabel,
      status: getStatus(items),
    })),
  }
}

export function createHomeForecastViewModel(
  data: HomeForecastData,
  referenceAt: Date = new Date(),
): HomeForecastViewModel {
  const coverageViewModels = createCoverageViewModels(data.coverage, referenceAt)

  return {
    headerText: `${formatBaseDate(data.latest.baseDate)} 기준 · 최근 갱신 ${formatUpdatedTime(data.latest.updatedAt)}`,
    range: createRange(data.latest, data.minBalance),
    shortage: createShortage(data.latest, data.shortfall),
    safety: {
      amount: `약 ${formatAmountUnit(data.safetyBuffer.amount)}만원`,
      status: data.safetyBuffer.bufferMet ? '안전상태' : '안전 잔액 미충족',
    },
    ...coverageViewModels,
  }
}
