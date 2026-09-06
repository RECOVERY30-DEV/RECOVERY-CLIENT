import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { forecastQueryKeys } from '@/features/forecast/queries/forecast-queries'
import { createApiClient } from '@/shared/api/api-client'

import {
  CashflowCauseContainer,
  CashflowPendingContainer,
  CashflowStatusContainer,
} from './cashflow-forecast-containers'

const responsesByPath: Readonly<Record<string, unknown>> = {
  '/api/businesses/1/forecasts/latest': {
    forecastRunId: 1,
    baseDate: '2025-07-15',
    updatedAt: '2025-07-14T23:32:00Z',
    status: 'RISK',
  },
  '/api/forecasts/1': {
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
  },
  '/api/forecasts/1/min-balance': {
    forecastRunId: 1,
    available: true,
    conservative: -1280000,
    expected: 540000,
    optimistic: 830000,
  },
  '/api/forecasts/1/shortfall': {
    forecastRunId: 1,
    hasShortfall: true,
    dDay: 11,
    expectedDate: '2025-07-26',
    horizonDays: 30,
    shortfallAmountMin: 760000,
    shortfallAmountMax: 1240000,
  },
  '/api/forecasts/1/safety-buffer': {
    forecastRunId: 1,
    amount: 830000,
    bufferMet: false,
  },
  '/api/forecasts/1/coverage': [
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
  ],
  '/api/forecasts/1/risk-drivers': [
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
  ],
}

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function renderContainer(container: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { queryClient, ...render(container, { wrapper }) }
}

describe('현금흐름 예측 화면 컨테이너', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('실제 예측 요약을 위험 상태 화면에 표시한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) throw new TypeError('Request가 필요합니다.')
        return apiResponse(responsesByPath[new URL(input.url).pathname])
      }),
    )

    renderContainer(<CashflowStatusContainer client={createApiClient('https://api.example.com')} />)

    expect(screen.getByRole('status')).toHaveTextContent('현금흐름 분석을 불러오는 중입니다.')
    expect(await screen.findByRole('heading', { name: '현금흐름 위험' })).toBeInTheDocument()
    expect(screen.getByText('약 -128만 원 ~ 83만 원')).toBeInTheDocument()
    expect(screen.getByText('2025년 07월 26일')).toBeInTheDocument()
  })

  it('예측 조회 실패를 안내하고 실패한 요청을 다시 시도한다', async () => {
    let shouldFail = true
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) throw new TypeError('Request가 필요합니다.')

        if (shouldFail) {
          return Response.json(
            { success: false, data: null, error: { code: 'TEMPORARY', message: '재시도 필요' } },
            { status: 503 },
          )
        }

        return apiResponse(responsesByPath[new URL(input.url).pathname])
      }),
    )

    renderContainer(<CashflowStatusContainer client={createApiClient('https://api.example.com')} />)

    expect(await screen.findByRole('alert', {}, { timeout: 3_000 })).toHaveTextContent(
      '분석 정보를 불러오지 못했습니다.',
    )

    shouldFail = false
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '현금흐름 위험' })).toBeInTheDocument()
    })
  })

  it('갱신 요청이 실패해도 캐시된 상태 화면을 유지한다', async () => {
    let shouldFail = false
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) throw new TypeError('Request가 필요합니다.')

      if (shouldFail) {
        return Response.json(
          { success: false, data: null, error: { code: 'TEMPORARY', message: '재시도 필요' } },
          { status: 503 },
        )
      }

      return apiResponse(responsesByPath[new URL(input.url).pathname])
    })
    vi.stubGlobal('fetch', fetchMock)

    const { queryClient } = renderContainer(
      <CashflowStatusContainer client={createApiClient('https://api.example.com')} />,
    )

    expect(await screen.findByRole('heading', { name: '현금흐름 위험' })).toBeInTheDocument()

    shouldFail = true
    await queryClient.invalidateQueries({ queryKey: forecastQueryKeys.all })

    expect(screen.getByRole('heading', { name: '현금흐름 위험' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('실제 소스별 반영률을 판단 보류 화면에 표시한다', async () => {
    const requestedPaths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) throw new TypeError('Request가 필요합니다.')
        const url = new URL(input.url)
        requestedPaths.push(`${url.pathname}${url.search}`)

        return apiResponse(responsesByPath[url.pathname])
      }),
    )

    renderContainer(
      <CashflowPendingContainer client={createApiClient('https://api.example.com')} />,
    )

    expect(await screen.findByText('95%')).toBeInTheDocument()
    expect(screen.getByText('61%')).toBeInTheDocument()
    expect(screen.getByText('2025년 7월 15일 ~ 30일 후')).toBeInTheDocument()
    expect(requestedPaths).toEqual([
      '/api/businesses/1/forecasts/latest',
      '/api/forecasts/1/coverage',
    ])
  })

  it('실제 위험 원인과 근거를 원인 상세 화면에 표시한다', async () => {
    const requestedPaths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) throw new TypeError('Request가 필요합니다.')
        const url = new URL(input.url)
        requestedPaths.push(`${url.pathname}${url.search}`)

        return apiResponse(responsesByPath[url.pathname])
      }),
    )

    renderContainer(<CashflowCauseContainer client={createApiClient('https://api.example.com')} />)

    expect(
      await screen.findByRole('heading', { name: '1순위: 월말 원리금 임차료 집중' }),
    ).toBeInTheDocument()
    expect(screen.getByText('−185만 원')).toBeInTheDocument()
    expect(screen.getByText('임차료·원리금 자동이체 2건 · 7월 31일 예정')).toBeInTheDocument()
    expect(requestedPaths).toEqual([
      '/api/businesses/1/forecasts/latest',
      '/api/forecasts/1',
      '/api/forecasts/1/risk-drivers?limit=3&include=evidence',
    ])
  })
})
