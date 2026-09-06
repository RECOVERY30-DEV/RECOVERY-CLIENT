import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  adjustmentQueryKeys,
  useAdjustmentQueries,
  useApplyAdjustmentsMutation,
  useCreateAdjustmentMutation,
} from './adjustment-queries'

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const adjustment = {
  adjustmentId: 1,
  adjustmentType: 'CASH_SALES',
  amount: 650000,
  certainty: 'CONFIRMED',
  expectedDate: '2025-07-20',
  status: 'SAVED',
  memo: null,
} as const

describe('adjustment queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('보정값과 후보 목록을 사업자 ID별로 조회해 캐시한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request))
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        return apiResponse(
          new URL(input.url).pathname.endsWith('/adjustment-suggestions')
            ? [
                {
                  id: 12,
                  adjustmentType: 'CASH_SALES',
                  suggestedAmount: 1200000,
                  suggestedRule: '매월 15일',
                  evidenceText: '최근 3개월 동일 패턴',
                  confidence: 0.82,
                  status: 'PROPOSED',
                  acceptedAdjustmentId: null,
                },
              ]
            : [adjustment],
        )
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { result } = renderHook(
      () => useAdjustmentQueries(1, { client: createApiClient('https://api.example.com') }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => expect(result.current.adjustments.isSuccess).toBe(true))
    await waitFor(() => expect(result.current.suggestions.isSuccess).toBe(true))

    expect(queryClient.getQueryData(adjustmentQueryKeys.adjustments(1))).toEqual([adjustment])
    expect(queryClient.getQueryData(adjustmentQueryKeys.suggestions(1))).toHaveLength(1)
  })

  it('보정 저장 성공 후 목록과 후보 캐시를 무효화한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => apiResponse({ ...adjustment, status: 'DRAFT' })),
    )
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(
      () => useCreateAdjustmentMutation(1, { client: createApiClient('https://api.example.com') }),
      { wrapper: createWrapper(queryClient) },
    )

    await act(async () => {
      await result.current.mutateAsync({
        adjustmentType: 'CASH_SALES',
        amount: 650000,
        certainty: 'CONFIRMED',
        expectedDate: '2025-07-20',
      })
    })

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: adjustmentQueryKeys.adjustments(1) })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: adjustmentQueryKeys.suggestions(1) })
  })

  it('적용 성공 후 최신 예측 캐시도 무효화한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => apiResponse({ appliedCount: 2, appliedRunId: 9 })),
    )
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(
      () => useApplyAdjustmentsMutation(1, { client: createApiClient('https://api.example.com') }),
      { wrapper: createWrapper(queryClient) },
    )

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['forecast', 'business', 1, 'latest'],
    })
  })
})
