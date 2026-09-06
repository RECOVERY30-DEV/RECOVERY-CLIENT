import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'
import { ApiContractError } from '@/shared/api/api-response'

import {
  getForecastCoverage,
  getForecastMinBalance,
  getForecastRiskDrivers,
  getForecastSafetyBuffer,
  getForecastShortfall,
  getLatestForecast,
} from './forecast-api'

const API_BASE_URL = 'https://api.example.com'

function createJsonFetch(data: unknown) {
  return vi.fn<typeof fetch>(async () =>
    Response.json({
      success: true,
      data,
      error: null,
    }),
  )
}

function readRequest(fetchMock: ReturnType<typeof createJsonFetch>) {
  const request = fetchMock.mock.calls[0]?.[0]

  if (!(request instanceof Request)) {
    throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
  }

  return request
}

describe('forecast API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('사업자의 최신 예측과 상태를 조회한다', async () => {
    const fetchMock = createJsonFetch({
      forecastRunId: 4821,
      baseDate: '2025-07-15',
      updatedAt: '2025-07-14T23:32:00Z',
      status: 'RISK',
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getLatestForecast(1, {
      client: createApiClient(API_BASE_URL),
    })

    expect(result).toEqual({
      forecastRunId: 4821,
      baseDate: '2025-07-15',
      updatedAt: '2025-07-14T23:32:00Z',
      status: 'RISK',
    })
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/businesses/1/forecasts/latest',
    )
  })

  it('예측 실행의 시나리오별 최저 잔액을 조회한다', async () => {
    const fetchMock = createJsonFetch({
      forecastRunId: 4821,
      available: true,
      conservative: -1280000,
      expected: 540000,
      optimistic: 830000,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getForecastMinBalance(4821, {
      client: createApiClient(API_BASE_URL),
    })

    expect(result.expected).toBe(540000)
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/forecasts/4821/min-balance',
    )
  })

  it('판단 보류 최저 잔액의 null 값을 보존한다', async () => {
    const fetchMock = createJsonFetch({
      forecastRunId: 4821,
      available: false,
      conservative: null,
      expected: null,
      optimistic: null,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getForecastMinBalance(4821, {
      client: createApiClient(API_BASE_URL),
    })

    expect(result).toEqual({
      forecastRunId: 4821,
      available: false,
      conservative: null,
      expected: null,
      optimistic: null,
    })
  })

  it('첫 잔액 부족 시점과 예상 부족액을 조회한다', async () => {
    const fetchMock = createJsonFetch({
      forecastRunId: 4821,
      hasShortfall: true,
      dDay: 11,
      expectedDate: '2025-07-26',
      horizonDays: 30,
      shortfallAmountMin: 760000,
      shortfallAmountMax: 1240000,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getForecastShortfall(4821, {
      client: createApiClient(API_BASE_URL),
    })

    expect(result).toMatchObject({ hasShortfall: true, dDay: 11, horizonDays: 30 })
    expect(readRequest(fetchMock).url).toBe('https://api.example.com/api/forecasts/4821/shortfall')
  })

  it('안전 잔액과 충족 여부를 조회한다', async () => {
    const fetchMock = createJsonFetch({
      forecastRunId: 4821,
      amount: 830000,
      bufferMet: true,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getForecastSafetyBuffer(4821, {
      client: createApiClient(API_BASE_URL),
    })

    expect(result).toEqual({ forecastRunId: 4821, amount: 830000, bufferMet: true })
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/forecasts/4821/safety-buffer',
    )
  })

  it('상위 위험 요인과 근거 포함 조건을 조회한다', async () => {
    const fetchMock = createJsonFetch([
      {
        rank: 1,
        driverCode: 'RENT_LOAN_CONCENTRATION',
        title: '월말 원리금 임차료 집중',
        occurrenceDate: '2025-07-31',
        occurrenceText: '7월 31일 발생',
        impactPeriodText: '7월 20일~31일 영향',
        metricText: null,
        contributionAmount: -1850000,
        estimating: false,
        evidence: [
          {
            refType: 'CARD_SETTLEMENT',
            refId: 3391,
            label: '신한카드 정산 5건',
            periodText: '6월 2일~11일',
          },
        ],
      },
    ])
    vi.stubGlobal('fetch', fetchMock)

    const result = await getForecastRiskDrivers(4821, {
      client: createApiClient(API_BASE_URL),
      limit: 3,
      includeEvidence: true,
    })

    expect(result[0]).toMatchObject({ rank: 1, contributionAmount: -1850000 })
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/forecasts/4821/risk-drivers?limit=3&include=evidence',
    )
  })

  it('분석 데이터별 커버리지 상태를 조회한다', async () => {
    const fetchMock = createJsonFetch([
      {
        sourceType: 'AUTO_TRANSFER',
        status: 'PARTIAL',
        coverageRate: 61,
        lastSyncedAt: '2025-07-15T00:14:00Z',
        belowThreshold: true,
      },
    ])
    vi.stubGlobal('fetch', fetchMock)

    const result = await getForecastCoverage(4821, {
      client: createApiClient(API_BASE_URL),
    })

    expect(result).toEqual([
      {
        sourceType: 'AUTO_TRANSFER',
        status: 'PARTIAL',
        coverageRate: 61,
        lastSyncedAt: '2025-07-15T00:14:00Z',
        belowThreshold: true,
      },
    ])
    expect(readRequest(fetchMock).url).toBe('https://api.example.com/api/forecasts/4821/coverage')
  })

  it('Swagger에 없는 상태 값은 계약 오류로 거부한다', async () => {
    const fetchMock = createJsonFetch({
      forecastRunId: 4821,
      baseDate: '2025-07-15',
      updatedAt: '2025-07-14T23:32:00Z',
      status: 'UNKNOWN',
    })
    vi.stubGlobal('fetch', fetchMock)

    const request = getLatestForecast(1, {
      client: createApiClient(API_BASE_URL),
    })

    await expect(request).rejects.toBeInstanceOf(ApiContractError)
  })
})
