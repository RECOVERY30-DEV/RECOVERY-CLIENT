import { describe, expect, it } from 'vitest'

import type {
  ForecastCoverage,
  ForecastMinBalance,
  ForecastSafetyBuffer,
  ForecastShortfall,
  LatestForecast,
} from '@/features/forecast'

import { createHomeForecastViewModel } from './home-forecast-view-model'

const latest: LatestForecast = {
  forecastRunId: 4821,
  baseDate: '2025-07-15',
  updatedAt: '2025-07-14T23:32:00Z',
  status: 'RISK',
}

const minBalance: ForecastMinBalance = {
  forecastRunId: 4821,
  available: true,
  conservative: -1280000,
  expected: 540000,
  optimistic: 830000,
}

const shortfall: ForecastShortfall = {
  forecastRunId: 4821,
  hasShortfall: true,
  dDay: 11,
  expectedDate: '2025-07-26',
  horizonDays: 30,
  shortfallAmountMin: 760000,
  shortfallAmountMax: 1240000,
}

const safetyBuffer: ForecastSafetyBuffer = {
  forecastRunId: 4821,
  amount: 830000,
  bufferMet: true,
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
    sourceType: 'CARD_SETTLEMENT',
    status: 'COMPLETE',
    coverageRate: 92,
    lastSyncedAt: '2025-07-14T01:00:00Z',
    belowThreshold: false,
  },
  {
    sourceType: 'LOAN',
    status: 'COMPLETE',
    coverageRate: 88,
    lastSyncedAt: '2025-07-12T01:00:00Z',
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

describe('createHomeForecastViewModel', () => {
  it('예측 응답을 홈 화면의 금액, 날짜, 데이터 상태로 변환한다', () => {
    const viewModel = createHomeForecastViewModel(
      { latest, minBalance, shortfall, safetyBuffer, coverage },
      new Date('2025-07-15T02:00:00Z'),
    )

    expect(viewModel.headerText).toBe('2025년 7월 15일 기준 · 최근 갱신 오전 8:32')
    expect(viewModel.range).toEqual({
      summary: '−128만 원 ~ +54만 원',
      conservative: '−128만',
      optimistic: '83만',
      expectedPosition: 86.26,
    })
    expect(viewModel.shortage).toEqual({
      dDay: 'D-11',
      expectedDate: '7월 26일 예상',
      progress: 36.67,
    })
    expect(viewModel.safety).toEqual({ amount: '약 83만원', status: '안전상태' })
    expect(viewModel.dataSources).toEqual([
      { label: '사업자 계좌', refreshedAt: '최근 갱신 2시간 전' },
      { label: '카드 정산', refreshedAt: '최근 갱신 1일 전' },
      { label: '자동이체·대출', refreshedAt: '최근 갱신 3일 전' },
    ])
    expect(viewModel.dataStatuses).toEqual([
      { label: '사업자 계좌', status: '갱신 완료' },
      { label: '카드 정산', status: '갱신 완료' },
      { label: '자동이체/대출', status: '부분 반영' },
    ])
  })

  it('예측 보류와 누락된 데이터 소스를 확인 가능한 대체 문구로 표시한다', () => {
    const viewModel = createHomeForecastViewModel(
      {
        latest: { ...latest, status: 'HOLD' },
        minBalance: {
          ...minBalance,
          available: false,
          conservative: null,
          expected: null,
          optimistic: null,
        },
        shortfall: {
          ...shortfall,
          hasShortfall: false,
          dDay: null,
          expectedDate: null,
          horizonDays: null,
          shortfallAmountMin: null,
          shortfallAmountMax: null,
        },
        safetyBuffer: { ...safetyBuffer, amount: 540000, bufferMet: false },
        coverage: coverage.filter(({ sourceType }) => sourceType === 'BANK_ACCOUNT'),
      },
      new Date('2025-07-15T02:00:00Z'),
    )

    expect(viewModel.range).toEqual({
      summary: '범위 산출 불가',
      conservative: '확인 필요',
      optimistic: '확인 필요',
      expectedPosition: 0,
    })
    expect(viewModel.shortage).toEqual({
      dDay: '확인 어려움',
      expectedDate: '데이터 보정 필요',
      progress: 0,
    })
    expect(viewModel.safety).toEqual({ amount: '약 54만원', status: '안전 잔액 미충족' })
    expect(viewModel.dataSources[1]).toEqual({
      label: '카드 정산',
      refreshedAt: '갱신 시간 확인 필요',
    })
    expect(viewModel.dataStatuses[2]).toEqual({
      label: '자동이체/대출',
      status: '확인 필요',
    })
  })
})
