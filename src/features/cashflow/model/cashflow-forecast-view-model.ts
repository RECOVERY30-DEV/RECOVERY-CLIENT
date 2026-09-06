import type {
  ForecastCoverage,
  ForecastDetail,
  ForecastMinBalance,
  ForecastRiskDriver,
  ForecastSafetyBuffer,
  ForecastShortfall,
  LatestForecast,
} from '@/features/forecast'

import type { CashflowCauseDetail } from './cashflow-cause-detail-data'
import type { CashflowStatusViewData } from './cashflow-stable-status-data'

type StatusInput = Readonly<{
  latest: LatestForecast
  minBalance: ForecastMinBalance
  shortfall: ForecastShortfall
  safetyBuffer: ForecastSafetyBuffer
  coverage: ReadonlyArray<ForecastCoverage>
}>

type PendingInput = Readonly<{
  latest: LatestForecast
  coverage: ReadonlyArray<ForecastCoverage>
}>

type CauseInput = Readonly<{
  detail: ForecastDetail
  riskDrivers: ReadonlyArray<ForecastRiskDriver>
}>

const COVERAGE_LABELS = {
  BANK_ACCOUNT: '사업자계좌',
  CARD_SETTLEMENT: '카드정산',
  LOAN: '대출',
  AUTO_TRANSFER: '자동이체',
} as const

const PENDING_COVERAGE_LABELS = {
  BANK_ACCOUNT: '사업자 계좌 입출금',
  CARD_SETTLEMENT: '카드 정산',
  LOAN: '대출·원리금',
  AUTO_TRANSFER: '자동이체',
} as const

const LOW_COVERAGE_GUIDANCE: Readonly<Record<ForecastCoverage['sourceType'], string>> = {
  BANK_ACCOUNT: '사업자 계좌 입출금 내역을 확인해 주세요.',
  CARD_SETTLEMENT: '카드 정산 내역을 확인해 주세요.',
  LOAN: '대출·원리금 납부 내역을 확인해 주세요.',
  AUTO_TRANSFER: '자동이체 출금 내역을 확인해 주세요.',
}

const DRIVER_ACTIONS: Readonly<Record<string, Readonly<{ href: string; label: string }>>> = {
  RENT_LOAN_CONCENTRATION: {
    href: '/cashflow/corrections/expected-expenses/new',
    label: '보정값 추가하기',
  },
  SALES_DECLINE_4W: {
    href: '/cashflow/corrections/expected-income/new',
    label: '보정값 추가하기',
  },
  AUTODEBIT_OVERLAP: {
    href: '/cashflow/corrections/expected-expenses/new',
    label: '보정값 추가하기',
  },
  SEASONAL_RECOVERY_DELAY: {
    href: '/cashflow/corrections/cash-sales/new',
    label: '현금매출 보정하기',
  },
}

const DEFAULT_DRIVER_ACTION = {
  href: '/cashflow/corrections',
  label: '정보 확인하기',
} as const

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(amount / 10_000)
}

function formatBaseDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)

  return `${year}년 ${month}월 ${day}일`
}

function formatPaddedDate(value: string): string {
  const [year, month, day] = value.split('-')

  return `${year}년 ${month}월 ${day}일`
}

function formatShortDate(value: string): string {
  const [, month, day] = value.split('-').map(Number)

  return `${month}월 ${day}일`
}

function formatBalanceRange(
  conservative: number | null,
  optimistic: number | null,
  unavailableText: string,
): string {
  if (conservative === null || optimistic === null) {
    return unavailableText
  }

  return `${formatAmount(conservative)}만 원 ~ ${formatAmount(optimistic)}만 원`
}

function createStatusReasons(status: LatestForecast['status']): readonly string[] {
  if (status === 'STABLE') {
    return [
      '예측 기간 동안 잔액 부족이 확인되지 않았습니다.',
      '안전 잔액 충족 여부와 데이터 반영률을 함께 확인했습니다.',
      '보정값 미입력 항목이 있을 경우 실제 수치와 다를 수 있습니다.',
      '지원 자격과 금융 조건은 공식 출처에서 최종 확인이 필요합니다.',
    ]
  }

  return [
    '예측 기간 안에 잔액 부족 가능성이 확인되었습니다.',
    '예상 최저잔액과 안전 잔액 충족 여부를 함께 확인했습니다.',
    '보정값 미입력 항목이 있을 경우 실제 수치와 다를 수 있습니다.',
    '지원 자격과 금융 조건은 공식 출처에서 최종 확인이 필요합니다.',
  ]
}

export function createCashflowStatusViewModel(input: StatusInput): CashflowStatusViewData {
  const isRisk = input.latest.status === 'RISK'
  const tone = isRisk ? 'danger' : 'info'
  const coverageLabel = input.coverage
    .map(({ sourceType }) => COVERAGE_LABELS[sourceType])
    .join('·')
  const firstShortfall =
    input.shortfall.hasShortfall && input.shortfall.expectedDate !== null
      ? formatPaddedDate(input.shortfall.expectedDate)
      : '30일 이내 없음'

  return {
    analysisLabel: `분석일 기준 ${formatBaseDate(input.latest.baseDate)} · 데이터 반영 완료`,
    ariaLabel: isRisk ? '현금흐름 위험 상태 안내 화면' : '현금흐름 안정 상태 안내 화면',
    description: isRisk
      ? ['향후 30일간 안전자금', '아래로 내려갈 가능성이 높습니다.']
      : ['향후 30일간 안전자금', '아래로 내려갈 가능성이 낮습니다.'],
    metrics: [
      {
        label: '예상 최저잔액',
        tone,
        value: `약 ${formatBalanceRange(
          input.minBalance.conservative,
          input.minBalance.optimistic,
          '범위 산출 불가',
        )}`,
      },
      {
        label: '안전 금액 수준',
        tone: input.safetyBuffer.bufferMet ? 'info' : 'danger',
        value: input.safetyBuffer.bufferMet ? '충족' : '미충족',
      },
      { label: '첫 부족일', tone, value: firstShortfall },
      {
        label: '분석 범위',
        tone: 'info',
        value: coverageLabel || '확인 필요',
      },
    ],
    reasons: createStatusReasons(input.latest.status),
    status: isRisk ? 'risk' : 'stable',
    title: isRisk ? '현금흐름 위험' : '현금흐름 안정',
  }
}

export function createCashflowPendingViewModel(input: PendingInput) {
  return {
    analysisPeriod: `${formatBaseDate(input.latest.baseDate)} ~ 30일 후`,
    coverageItems: input.coverage.map(({ sourceType, coverageRate }) => ({
      label: PENDING_COVERAGE_LABELS[sourceType],
      value: `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(coverageRate)}%`,
    })),
    lowCoverageItems: input.coverage
      .filter(({ belowThreshold }) => belowThreshold)
      .map(({ sourceType }) => LOW_COVERAGE_GUIDANCE[sourceType]),
  }
}

export function createCashflowCauseViewModel(input: CauseInput): Readonly<{
  baseDateLabel: string
  causes: ReadonlyArray<CashflowCauseDetail>
  summary: Readonly<{
    firstShortageAfter: string
    minimumBalanceRange: string
    shortageDate: string
  }>
}> {
  const causes = [...input.riskDrivers]
    .sort((left, right) => left.rank - right.rank)
    .slice(0, 3)
    .map<CashflowCauseDetail>((driver) => ({
      actions: [DRIVER_ACTIONS[driver.driverCode] ?? DEFAULT_DRIVER_ACTION],
      contribution:
        driver.contributionAmount === null
          ? (driver.metricText ?? '확인 필요')
          : `${driver.contributionAmount < 0 ? '−' : ''}${formatAmount(
              Math.abs(driver.contributionAmount),
            )}만 원`,
      description: driver.description ?? '상세 설명을 확인할 수 없습니다.',
      evidence:
        driver.evidence === undefined || driver.evidence.length === 0
          ? '근거 거래 확인 필요'
          : driver.evidence.map(({ label, periodText }) => `${label} · ${periodText}`).join(', '),
      forecastAssumption: driver.assumptionText ?? '예측 가정 확인 필요',
      title: driver.title,
    }))

  return {
    baseDateLabel: `예측 기준일 ${formatBaseDate(input.detail.baseDate)} · 보수적~낙관 범위 제공`,
    causes,
    summary: {
      firstShortageAfter:
        input.detail.daysToShortfall === null
          ? '확인 어려움'
          : `${input.detail.daysToShortfall}일 후`,
      minimumBalanceRange: formatBalanceRange(
        input.detail.minBalanceConservative,
        input.detail.minBalanceOptimistic,
        '범위 산출 불가',
      ).replace('만 원 ~', '만 ~'),
      shortageDate:
        input.detail.firstShortfallDate === null
          ? '확인 어려움'
          : formatShortDate(input.detail.firstShortfallDate),
    },
  }
}
