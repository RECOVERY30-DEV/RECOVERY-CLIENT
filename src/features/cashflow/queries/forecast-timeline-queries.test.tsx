import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  forecastTimelineQueryKeys,
  useForecastDailyDetailQuery,
  useForecastTimelineQueries,
} from './forecast-timeline-queries'

const API_BASE_URL = 'https://api.example.com'

const dailyView = {
  targetDate: '2025-07-20',
  dDay: 5,
  openingBalance: 1400000,
  confirmedInflow: 520000,
  confirmedOutflow: 0,
  expectedInflowMin: 400000,
  expectedInflowMax: 700000,
  expectedOutflowMin: 180000,
  expectedOutflowMax: 220000,
  adjustmentNet: -1200000,
  closingBalanceConservative: -180000,
  closingBalanceExpected: 220000,
  closingBalanceOptimistic: 610000,
  shortfall: true,
  holiday: false,
  holidayShiftNote: null,
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function createJsonFetch(responsesByPath: Readonly<Record<string, unknown>>) {
  return vi.fn<typeof fetch>(async (input) => {
    const request = input instanceof Request ? input : new Request(input)
    const data = responsesByPath[`${new URL(request.url).pathname}${new URL(request.url).search}`]

    return Response.json({ success: true, data, error: null })
  })
}

describe('forecast timeline queries', () => {
  it('최신 예측 실행을 받은 뒤 일별 흐름과 상태 문구를 조회한다', async () => {
    const fetchMock = createJsonFetch({
      '/api/businesses/1/forecasts/latest': {
        forecastRunId: 1,
        baseDate: '2025-07-15',
        updatedAt: '2025-07-15T00:00:00Z',
        status: 'RISK',
      },
      '/api/forecasts/1/daily': [dailyView],
      '/api/forecasts/1/narratives': [{ kind: 'STATUS_LABEL', seq: 1, text: '주의 필요' }],
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(
      () => useForecastTimelineQueries(1, { client: createApiClient(API_BASE_URL) }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.daily.data).toEqual([dailyView]))

    expect(result.current.narratives.data).toEqual([
      { kind: 'STATUS_LABEL', seq: 1, text: '주의 필요' },
    ])
    expect(forecastTimelineQueryKeys.daily(1)).toEqual(['cashflow', 'run', 1, 'daily'])
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('날짜별 상세를 실행 ID와 날짜별 키로 분리해 조회한다', async () => {
    const fetchMock = createJsonFetch({
      '/api/businesses/1/forecasts/latest': {
        forecastRunId: 1,
        baseDate: '2025-07-15',
        updatedAt: '2025-07-15T00:00:00Z',
        status: 'RISK',
      },
      '/api/forecasts/1/daily/2025-07-20': { ...dailyView, items: [] },
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(
      () => useForecastDailyDetailQuery(1, '2025-07-20', { client: createApiClient(API_BASE_URL) }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.data).toMatchObject({ targetDate: '2025-07-20' }))

    expect(forecastTimelineQueryKeys.detail(1, '2025-07-20')).toEqual([
      'cashflow',
      'run',
      1,
      'daily',
      '2025-07-20',
    ])
  })
})
