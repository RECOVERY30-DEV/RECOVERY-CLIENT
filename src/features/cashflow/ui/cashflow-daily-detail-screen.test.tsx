import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import type { DailyItemView } from '../api/forecast-timeline-contract'
import { CashflowDailyDetailScreen } from './cashflow-daily-detail-screen'

const API_BASE_URL = 'https://api.example.com'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function renderDailyDetail(items = defaultDailyItems) {
  const fetchMock = vi.fn<typeof fetch>(async (input) => {
    const request = input instanceof Request ? input : new Request(input)
    const path = new URL(request.url).pathname
    const data =
      path === '/api/businesses/1/forecasts/latest'
        ? {
            forecastRunId: 1,
            baseDate: '2025-07-15',
            updatedAt: '2025-07-15T00:00:00Z',
            status: 'RISK',
          }
        : {
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
            items,
          }

    return Response.json({ success: true, data, error: null })
  })
  vi.stubGlobal('fetch', fetchMock)

  return render(
    <CashflowDailyDetailScreen client={createApiClient(API_BASE_URL)} date="2025-07-20" />,
    { wrapper: createWrapper() },
  )
}

const defaultDailyItems: ReadonlyArray<DailyItemView> = [
  {
    itemKind: 'CONFIRMED',
    label: '카드 정산',
    subLabel: '확정 매출',
    direction: 'I',
    amountMin: 520000,
    amountMax: 520000,
    refType: 'CARD_SETTLEMENT',
    refId: 1,
  },
  {
    itemKind: 'EXPECTED',
    label: '현금 매출 추정',
    subLabel: '최근 4주 기준',
    direction: 'I',
    amountMin: 400000,
    amountMax: 700000,
    refType: null,
    refId: null,
  },
  {
    itemKind: 'EXPECTED',
    label: '공과금',
    subLabel: null,
    direction: 'O',
    amountMin: 180000,
    amountMax: 220000,
    refType: null,
    refId: null,
  },
  {
    itemKind: 'ADJUSTMENT',
    label: '사용자 보정',
    subLabel: '인테리어 대금',
    direction: 'O',
    amountMin: 1200000,
    amountMax: 1200000,
    refType: 'ADJUSTMENT',
    refId: 2,
  },
]

describe('일자별 현금흐름 상세 화면', () => {
  it('선택한 날짜 API의 네 거래 근거를 종류별로 제공한다', async () => {
    renderDailyDetail()

    await waitFor(() => expect(screen.getByText('카드 정산')).toBeInTheDocument())

    expect(screen.getByRole('heading', { name: '2025년 7월 20일' })).toBeInTheDocument()
    expect(screen.getByText('확정 거래')).toBeInTheDocument()
    expect(screen.getByText('예상 거래')).toBeInTheDocument()
    expect(screen.getByText('보정값')).toBeInTheDocument()
    expect(screen.getByText('현금 매출 추정')).toBeInTheDocument()
    expect(screen.getByText('공과금')).toBeInTheDocument()
    expect(screen.getByText('사용자 보정')).toBeInTheDocument()
  })

  it('대시보드 복귀 경로와 보정 이동을 제공한다', async () => {
    renderDailyDetail()

    await waitFor(() => expect(screen.getByText('카드 정산')).toBeInTheDocument())

    expect(screen.getByRole('link', { name: '현금흐름 대시보드로 돌아가기' })).toHaveAttribute(
      'href',
      '/cashflow',
    )
    expect(screen.getByRole('link', { name: '보정값 추가·수정하기' })).toHaveAttribute(
      'href',
      '/cashflow/corrections',
    )
  })

  it('성공한 상세 응답에 거래 근거가 없으면 빈 상태를 안내한다', async () => {
    renderDailyDetail([])

    await waitFor(() =>
      expect(screen.getByText('표시할 거래 근거가 없습니다.')).toBeInTheDocument(),
    )

    expect(screen.queryByText('확정 거래')).not.toBeInTheDocument()
    expect(screen.queryByText('예상 거래')).not.toBeInTheDocument()
    expect(screen.queryByText('보정값')).not.toBeInTheDocument()
  })
})
