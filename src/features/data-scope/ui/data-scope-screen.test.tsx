import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DataScopeScreen } from './data-scope-screen'

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com'
})

const dataSources = [
  {
    sourceType: 'BANK_ACCOUNT',
    institutionName: 'KB국민은행 · 신한은행',
    coverageRate: 95,
    periodMonths: 6,
    lastSyncedAt: '2025-07-14T21:14:00Z',
    syncStatus: 'SYNCED',
    belowThreshold: false,
  },
  {
    sourceType: 'CARD_SETTLEMENT',
    institutionName: 'BC카드 · KB카드 가맹점 정산',
    coverageRate: 92,
    periodMonths: 3,
    lastSyncedAt: '2025-07-13T14:42:00Z',
    syncStatus: 'SYNCED',
    belowThreshold: false,
  },
  {
    sourceType: 'LOAN',
    institutionName: 'IBK기업은행 사업자대출 약정',
    coverageRate: 88,
    periodMonths: 12,
    lastSyncedAt: '2025-07-14T21:00:00Z',
    syncStatus: 'SYNCED',
    belowThreshold: false,
  },
  {
    sourceType: 'AUTO_TRANSFER',
    institutionName: '공과금 · 구독 · 보험료 등',
    coverageRate: 61,
    periodMonths: 1,
    lastSyncedAt: '2025-07-11T00:00:00Z',
    syncStatus: 'PARTIAL',
    belowThreshold: true,
  },
]

function successResponse(data = dataSources) {
  return Response.json({ success: true, data, error: null })
}

describe('분석 데이터 범위 화면', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('API 출처별 상태와 낮은 자동이체 반영률을 제공한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => successResponse()),
    )

    renderWithQueryClient(<DataScopeScreen />)

    expect(screen.getByRole('heading', { name: '분석 데이터 범위' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '출처별 데이터 현황' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('61%')).toBeInTheDocument())
    expect(screen.getByText('일부 반영')).toBeInTheDocument()
    expect(screen.getByText('Coverage 낮음')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '예측 미반영 정보' })).toBeInTheDocument()
    expect(screen.getByText('현금 매출 및 타행 입금')).toBeInTheDocument()
  })

  it('분석 한계와 낮은 데이터 반영률의 후속 경로를 안내한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => successResponse()),
    )

    renderWithQueryClient(<DataScopeScreen />)

    expect(screen.getByRole('heading', { name: '분석 한계 안내' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Coverage 낮음')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: '오류 확인' })).toHaveAttribute(
      'href',
      '/cashflow/pending',
    )
    expect(screen.getByRole('link', { name: '오류 확인' })).toHaveClass('text-primary-blue-800')
    expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toHaveAttribute('href', '/home')
  })

  it('연결된 데이터 출처가 없으면 빈 상태를 안내한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => successResponse([])),
    )

    renderWithQueryClient(<DataScopeScreen />)

    expect(await screen.findByText('연결된 데이터 출처가 없습니다.')).toBeInTheDocument()
    expect(screen.queryByText('Coverage 낮음')).not.toBeInTheDocument()
  })

  it('조회 실패 시 다시 시도할 수 있다', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          {
            success: false,
            data: null,
            error: { code: 'DATA_SOURCE_500_1', message: '데이터 출처를 조회할 수 없습니다.' },
          },
          { status: 500 },
        ),
      )
      .mockResolvedValueOnce(successResponse())
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<DataScopeScreen />)

    expect(await screen.findByRole('button', { name: '다시 시도' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('61%')).toBeInTheDocument()
  })
})

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}
