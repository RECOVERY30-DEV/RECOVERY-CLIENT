import { describe, expect, it } from 'vitest'

import type {
  ForecastCoverage,
  ForecastDetail,
  ForecastMinBalance,
  ForecastRiskDriver,
  ForecastSafetyBuffer,
  ForecastShortfall,
  LatestForecast,
} from '@/features/forecast'

import {
  createCashflowCauseViewModel,
  createCashflowPendingViewModel,
  createCashflowStatusViewModel,
} from './cashflow-forecast-view-model'

const latest: LatestForecast = {
  forecastRunId: 1,
  baseDate: '2025-07-15',
  updatedAt: '2025-07-14T23:32:00Z',
  status: 'RISK',
}

const minBalance: ForecastMinBalance = {
  forecastRunId: 1,
  available: true,
  conservative: -1280000,
  expected: 540000,
  optimistic: 830000,
}

const shortfall: ForecastShortfall = {
  forecastRunId: 1,
  hasShortfall: true,
  dDay: 11,
  expectedDate: '2025-07-26',
  horizonDays: 30,
  shortfallAmountMin: 760000,
  shortfallAmountMax: 1240000,
}

const safetyBuffer: ForecastSafetyBuffer = {
  forecastRunId: 1,
  amount: 830000,
  bufferMet: false,
}

const coverage: ReadonlyArray<ForecastCoverage> = [
  {
    sourceType: 'BANK_ACCOUNT',
    status: 'COMPLETE',
    coverageRate: 95,
    lastSyncedAt: '2025-07-15T00:00:00Z',
    belowThreshold: false,
  },
  {
    sourceType: 'AUTO_TRANSFER',
    status: 'PARTIAL',
    coverageRate: 61,
    lastSyncedAt: '2025-07-13T01:00:00Z',
    belowThreshold: true,
  },
]

const detail: ForecastDetail = {
  forecastRunId: 1,
  businessId: 1,
  baseDate: '2025-07-15',
  updatedAt: '2025-07-14T23:32:00Z',
  status: 'RISK',
  horizonDays: 30,
  coverageOverall: 84,
  hasShortfall: true,
  daysToShortfall: 11,
  firstShortfallDate: '2025-07-26',
  shortfallAmountMin: 760000,
  shortfallAmountMax: 1240000,
  minBalanceAvailable: true,
  minBalanceConservative: -1280000,
  minBalanceExpected: 540000,
  minBalanceOptimistic: 830000,
  bufferMet: false,
}

const riskDrivers: ReadonlyArray<ForecastRiskDriver> = [
  {
    rank: 1,
    driverCode: 'RENT_LOAN_CONCENTRATION',
    title: '월말 원리금 임차료 집중',
    occurrenceDate: '2025-07-31',
    occurrenceText: null,
    impactPeriodText: null,
    metricText: null,
    contributionAmount: -1850000,
    estimating: false,
    description: '월말 고정비가 같은 주에 출금될 예정입니다.',
    assumptionText: '최근 3개월 출금 이력 기반 반영',
    evidence: [
      {
        refType: 'LOAN_SCHEDULE',
        refId: 22,
        label: '임차료·원리금 자동이체 2건',
        periodText: '7월 31일 예정',
      },
    ],
  },
  {
    rank: 2,
    driverCode: 'NEW_DRIVER',
    title: '추가 확인이 필요한 원인',
    occurrenceDate: null,
    occurrenceText: null,
    impactPeriodText: null,
    metricText: '-18%',
    contributionAmount: null,
    estimating: true,
    description: null,
    assumptionText: null,
    evidence: [],
  },
]

describe('현금흐름 예측 화면 모델', () => {
  it('위험 예측의 상태 화면 수치를 사용자 표시값으로 변환한다', () => {
    const result = createCashflowStatusViewModel({
      latest,
      minBalance,
      shortfall,
      safetyBuffer,
      coverage,
    })

    expect(result.title).toBe('현금흐름 위험')
    expect(result.analysisLabel).toBe('분석일 기준 2025년 7월 15일 · 데이터 반영 완료')
    expect(result.metrics).toEqual([
      { label: '예상 최저잔액', tone: 'danger', value: '약 -128만 원 ~ 83만 원' },
      { label: '안전 금액 수준', tone: 'danger', value: '미충족' },
      { label: '첫 부족일', tone: 'danger', value: '2025년 07월 26일' },
      { label: '분석 범위', tone: 'info', value: '사업자계좌·자동이체' },
    ])
  })

  it('판단 보류 화면에 실제 소스별 데이터 반영률을 제공한다', () => {
    const result = createCashflowPendingViewModel({
      latest: { ...latest, status: 'HOLD' },
      coverage,
    })

    expect(result.analysisPeriod).toBe('2025년 7월 15일 ~ 30일 후')
    expect(result.coverageItems).toEqual([
      { label: '사업자 계좌 입출금', value: '95%' },
      { label: '자동이체', value: '61%' },
    ])
    expect(result.lowCoverageItems).toEqual(['자동이체 출금 내역을 확인해 주세요.'])
  })

  it('분석 소스가 비어 있으면 상태 화면에서 확인 필요로 표시한다', () => {
    const result = createCashflowStatusViewModel({
      latest,
      minBalance,
      shortfall,
      safetyBuffer,
      coverage: [],
    })

    expect(result.metrics[3]).toEqual({
      label: '분석 범위',
      tone: 'info',
      value: '확인 필요',
    })
  })

  it('원인 상세 응답을 순위, 근거, 보정 경로가 포함된 카드로 변환한다', () => {
    const result = createCashflowCauseViewModel({ detail, riskDrivers })

    expect(result.summary).toEqual({
      firstShortageAfter: '11일 후',
      shortageDate: '7월 26일',
      minimumBalanceRange: '-128만 ~ 83만 원',
    })
    expect(result.causes[0]).toMatchObject({
      title: '월말 원리금 임차료 집중',
      contribution: '−185만 원',
      evidence: '임차료·원리금 자동이체 2건 · 7월 31일 예정',
      forecastAssumption: '최근 3개월 출금 이력 기반 반영',
      actions: [{ href: '/cashflow/corrections/expected-expenses/new', label: '보정값 추가하기' }],
    })
    expect(result.causes[1]).toMatchObject({
      contribution: '-18%',
      description: '상세 설명을 확인할 수 없습니다.',
      evidence: '근거 거래 확인 필요',
      forecastAssumption: '예측 가정 확인 필요',
      actions: [{ href: '/cashflow/corrections', label: '정보 확인하기' }],
    })
  })
})
