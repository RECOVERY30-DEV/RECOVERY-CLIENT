import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { BusinessHomeContainer } from './business-home-container'

const responsesByPath: Readonly<Record<string, unknown>> = {
  '/api/businesses/1/forecasts/latest': {
    forecastRunId: 4821,
    baseDate: '2025-07-15',
    updatedAt: '2025-07-14T23:32:00Z',
    status: 'RISK',
  },
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
    amount: 540000,
    bufferMet: false,
  },
  '/api/forecasts/4821/coverage': [
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
  ],
}

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function renderContainer() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return render(
    <BusinessHomeContainer
      client={createApiClient('https://api.example.com')}
      referenceAt={new Date('2025-07-15T02:00:00Z')}
    />,
    { wrapper },
  )
}

describe('BusinessHomeContainer', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('홈에 필요한 예측 API만 조회해 화면에 표시한다', async () => {
    const requestedPaths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname
        requestedPaths.push(path)

        return apiResponse(responsesByPath[path])
      }),
    )

    renderContainer()

    expect(screen.getByRole('status')).toHaveTextContent('예측 데이터를 불러오는 중입니다.')
    expect(await screen.findByText('−128만 원 ~ +54만 원')).toBeInTheDocument()
    expect(screen.getByText('약 54만원')).toBeInTheDocument()
    expect(screen.getByText('안전 잔액 미충족')).toBeInTheDocument()
    expect(requestedPaths).toHaveLength(5)
    expect(requestedPaths).not.toContain('/api/forecasts/4821/risk-drivers')
  })

  it('조회 실패를 안내하고 실패한 요청을 다시 시도한다', async () => {
    let shouldFail = true
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname

        if (shouldFail) {
          return Response.json(
            { success: false, data: null, error: { code: 'TEMPORARY', message: '잠시 후 재시도' } },
            { status: 503 },
          )
        }

        return apiResponse(responsesByPath[path])
      }),
    )

    renderContainer()

    expect(await screen.findByRole('alert')).toHaveTextContent('예측 정보를 불러오지 못했습니다.')

    shouldFail = false
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(screen.getByText('−128만 원 ~ +54만 원')).toBeInTheDocument()
    })
  })
})
