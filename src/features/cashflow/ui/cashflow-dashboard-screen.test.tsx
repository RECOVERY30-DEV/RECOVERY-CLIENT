import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { CashflowDashboardScreen } from './cashflow-dashboard-screen'

const API_BASE_URL = 'https://api.example.com'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function createDailyView(index: number) {
  const day = String(index + 1).padStart(2, '0')

  return {
    targetDate: `2025-07-${day}`,
    dDay: 30 - index,
    openingBalance: 1400000 - index * 10000,
    confirmedInflow: index === 19 ? 520000 : 0,
    confirmedOutflow: 0,
    expectedInflowMin: 400000,
    expectedInflowMax: 700000,
    expectedOutflowMin: 180000,
    expectedOutflowMax: 220000,
    adjustmentNet: 0,
    closingBalanceConservative: index === 19 ? -180000 : 400000,
    closingBalanceExpected: index === 19 ? 220000 : 750000,
    closingBalanceOptimistic: 900000,
    shortfall: index === 19,
    holiday: index === 17,
    holidayShiftNote: index === 17 ? '공휴일 거래가 다음 영업일로 반영됩니다.' : null,
  }
}

function renderDashboard(responsesByPath: Readonly<Record<string, unknown>>) {
  const fetchMock = vi.fn<typeof fetch>(async (input) => {
    const request = input instanceof Request ? input : new Request(input)
    const path = `${new URL(request.url).pathname}${new URL(request.url).search}`

    return Response.json({ success: true, data: responsesByPath[path], error: null })
  })
  vi.stubGlobal('fetch', fetchMock)

  return render(<CashflowDashboardScreen client={createApiClient(API_BASE_URL)} />, {
    wrapper: createWrapper(),
  })
}

describe('현금흐름 대시보드 화면', () => {
  it('API의 30일 흐름을 렌더링하고 선택한 일자의 실제 경로를 제공한다', async () => {
    const dailyViews = Array.from({ length: 30 }, (_, index) => createDailyView(index))
    renderDashboard({
      '/api/businesses/1/forecasts/latest': {
        forecastRunId: 1,
        baseDate: '2025-07-15',
        updatedAt: '2025-07-15T00:00:00Z',
        status: 'RISK',
      },
      '/api/forecasts/1/daily': dailyViews,
      '/api/forecasts/1/narratives': [
        { kind: 'STATUS_LABEL', seq: 1, text: '주의 필요' },
        { kind: 'RISK_NOTE', seq: 2, text: '7월 26일 전 현금 유출을 확인해 주세요.' },
      ],
      '/api/forecasts/1/shortfall': {
        forecastRunId: 1,
        hasShortfall: true,
        dDay: 11,
        expectedDate: '2025-07-26',
        horizonDays: 30,
        shortfallAmountMin: 760000,
        shortfallAmountMax: 1240000,
      },
    })

    await waitFor(() => expect(screen.getByText('2025년 7월 20일')).toBeInTheDocument())

    expect(screen.getAllByRole('link', { name: /^2025년 .* 상세 보기$/ })).toHaveLength(30)
    expect(screen.getByRole('link', { name: '2025년 7월 20일 상세 보기' })).toHaveAttribute(
      'href',
      '/cashflow/daily/2025-07-20',
    )
    expect(screen.getByText('주의 필요')).toBeInTheDocument()
    expect(screen.getByText('7월 26일 전 현금 유출을 확인해 주세요.')).toBeInTheDocument()
    expect(screen.getByText('공휴일 거래가 다음 영업일로 반영됩니다.')).toBeInTheDocument()
  })

  it('일자별 현금흐름의 날짜는 고정하고 긴 안내문은 한 줄 말줄임표로 표시한다', async () => {
    const dailyViews = Array.from({ length: 30 }, (_, index) => createDailyView(index))
    const holidayNote = '7월 19일(토) 주말로 원리금 상환 기준일이 7월 18일(금)로 앞당겨졌습니다.'
    dailyViews[17] = { ...dailyViews[17], holidayShiftNote: holidayNote }
    renderDashboard({
      '/api/businesses/1/forecasts/latest': {
        forecastRunId: 1,
        baseDate: '2025-07-15',
        updatedAt: '2025-07-15T00:00:00Z',
        status: 'RISK',
      },
      '/api/forecasts/1/daily': dailyViews,
      '/api/forecasts/1/narratives': [],
      '/api/forecasts/1/shortfall': {
        forecastRunId: 1,
        hasShortfall: true,
        dDay: 11,
        expectedDate: '2025-07-26',
        horizonDays: 30,
        shortfallAmountMin: 760000,
        shortfallAmountMax: 1240000,
      },
    })

    const description = await screen.findByText(holidayNote)
    const row = description.closest('a')

    expect(row).not.toBeNull()
    expect(row?.querySelector('span')).toHaveClass('shrink-0')
    expect(description).toHaveClass('min-w-0', 'truncate')
  })

  it('FORECAST_404_1 shortfall 오류 때 정적 날짜 목록 대신 재시도 상태를 보여준다', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const request = input instanceof Request ? input : new Request(input)
      const path = new URL(request.url).pathname

      if (path === '/api/forecasts/999999/shortfall') {
        return Response.json({
          success: false,
          data: null,
          error: { code: 'FORECAST_404_1', message: '예측 실행을 찾을 수 없습니다.' },
        })
      }

      const data =
        path === '/api/businesses/1/forecasts/latest'
          ? {
              forecastRunId: 999999,
              baseDate: '2025-07-15',
              updatedAt: '2025-07-15T00:00:00Z',
              status: 'RISK',
            }
          : path.endsWith('/min-balance')
            ? {
                forecastRunId: 999999,
                available: true,
                conservative: -1280000,
                expected: 540000,
                optimistic: 830000,
              }
            : path.endsWith('/safety-buffer')
              ? { forecastRunId: 999999, amount: 830000, bufferMet: false }
              : path.endsWith('/coverage')
                ? []
                : path.endsWith('/daily')
                  ? []
                  : []

      return Response.json({ success: true, data, error: null })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<CashflowDashboardScreen client={createApiClient(API_BASE_URL)} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('불러오지 못했습니다.'))

    const getShortfallRequestCount = () =>
      fetchMock.mock.calls.filter(
        ([input]) =>
          new URL(input instanceof Request ? input.url : input.toString()).pathname ===
          '/api/forecasts/999999/shortfall',
      ).length

    expect(getShortfallRequestCount()).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => expect(getShortfallRequestCount()).toBe(2))

    expect(screen.getByRole('alert')).toHaveTextContent('불러오지 못했습니다.')
    expect(screen.queryByRole('link', { name: /^2025년 .* 상세 보기$/ })).not.toBeInTheDocument()
    expect(screen.queryByText('2025년 7월 20일')).not.toBeInTheDocument()
  })
})
