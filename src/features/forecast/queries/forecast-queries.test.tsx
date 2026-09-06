import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { forecastQueryKeys, useForecastOverviewQueries } from './forecast-queries'

const latestForecast = {
  forecastRunId: 4821,
  baseDate: '2025-07-15',
  updatedAt: '2025-07-14T23:32:00Z',
  status: 'RISK',
}

const responsesByPath: Readonly<Record<string, unknown>> = {
  '/api/forecasts/4821/min-balance': {
    forecastRunId: 4821,
    available: true,
    conservative: -1280000,
    expected: 540000,
    optimistic: 830000,
  },
  '/api/forecasts/4821/shortfall': {
    forecastRunId: 4821,
    hasShortfall: true,
    dDay: 11,
    expectedDate: '2025-07-26',
    horizonDays: 30,
    shortfallAmountMin: 760000,
    shortfallAmountMax: 1240000,
  },
  '/api/forecasts/4821/safety-buffer': {
    forecastRunId: 4821,
    amount: 830000,
    bufferMet: true,
  },
  '/api/forecasts/4821/risk-drivers': [
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
    },
  ],
  '/api/forecasts/4821/coverage': [
    {
      sourceType: 'AUTO_TRANSFER',
      status: 'PARTIAL',
      coverageRate: 61,
      lastSyncedAt: '2025-07-15T00:14:00Z',
      belowThreshold: true,
    },
  ],
}

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

describe('useForecastOverviewQueries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('최신 예측의 실행 ID를 받은 뒤 하위 리소스를 조회하고 각각 캐시한다', async () => {
    let resolveLatest: ((response: Response) => void) | undefined
    const latestResponse = new Promise<Response>((resolve) => {
      resolveLatest = resolve
    })
    const requestedPaths: string[] = []
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) {
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      }

      const path = new URL(input.url).pathname
      requestedPaths.push(path)

      if (path === '/api/businesses/1/forecasts/latest') {
        return latestResponse
      }

      if (!(path in responsesByPath)) {
        return Response.json(
          { code: 'NOT_FOUND', message: '테스트 응답이 없습니다.' },
          { status: 404 },
        )
      }

      return apiResponse(responsesByPath[path])
    })
    vi.stubGlobal('fetch', fetchMock)

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () =>
        useForecastOverviewQueries(1, {
          client: createApiClient('https://api.example.com'),
        }),
      { wrapper },
    )

    await waitFor(() => expect(requestedPaths).toEqual(['/api/businesses/1/forecasts/latest']))

    resolveLatest?.(apiResponse(latestForecast))

    await waitFor(() => {
      expect(result.current.coverage.isSuccess).toBe(true)
    })

    expect(requestedPaths).toEqual([
      '/api/businesses/1/forecasts/latest',
      '/api/forecasts/4821/min-balance',
      '/api/forecasts/4821/shortfall',
      '/api/forecasts/4821/safety-buffer',
      '/api/forecasts/4821/risk-drivers',
      '/api/forecasts/4821/coverage',
    ])
    expect(result.current.minBalance.data?.expected).toBe(540000)
    expect(queryClient.getQueryData(forecastQueryKeys.latest(1))).toEqual(latestForecast)
    expect(queryClient.getQueryData(forecastQueryKeys.coverage(4821))).toEqual(
      responsesByPath['/api/forecasts/4821/coverage'],
    )
  })
})
