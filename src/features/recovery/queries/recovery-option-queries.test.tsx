import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  recoveryOptionQueryKeys,
  useRecoveryOptionQueries,
  useSaveRecoveryOptionSelectionsMutation,
} from './recovery-option-queries'

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

describe('recovery option queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('회복안과 시나리오를 예측 실행 ID별로 조회하고 캐시한다', async () => {
    const requestedPaths: string[] = []
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) {
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      }

      const path = new URL(input.url).pathname
      requestedPaths.push(path)

      if (path.endsWith('/recovery-options')) {
        return apiResponse([
          {
            optionId: 3,
            optionCode: 'REPAYMENT_ADJUST',
            category: 'FINANCIAL_CONSULT',
            expectedEffectText: '부족일 최대 16일 연장 가능',
            monthlyBurdenChangeText: '월 상환액 약 15만 원 감소 예상',
            preconditionText: '원리금 3회 이상 정상 납부 이력',
            difficulty: 'LOW',
            requiresReview: true,
            disclaimer: '승인 여부와 조건은 금융기관 심사 결과에 따릅니다.',
            selected: true,
          },
        ])
      }

      return apiResponse([
        {
          scenarioId: 12,
          scenarioType: 'SIMULATED',
          firstShortfallDate: '2025-05-30',
          minBalance: -630000,
          deltaDays: 16,
          deltaMinBalance: 610000,
          monthlyPaymentDelta: -150000,
          note: '상담 및 심사 결과에 따라 실제 효과는 달라질 수 있습니다.',
          appliedOptionIds: [3],
        },
      ])
    })
    vi.stubGlobal('fetch', fetchMock)

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () =>
        useRecoveryOptionQueries(4821, {
          client: createApiClient('https://api.example.com'),
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.scenarios.isSuccess).toBe(true))

    expect(requestedPaths).toEqual(
      expect.arrayContaining([
        '/api/forecasts/4821/recovery-options',
        '/api/forecasts/4821/scenarios',
      ]),
    )
    expect(queryClient.getQueryData(recoveryOptionQueryKeys.options(4821))).toHaveLength(1)
    expect(result.current.scenarios.data?.[0]?.deltaDays).toBe(16)
  })

  it('저장 성공 후 회복안 선택 캐시를 갱신한다', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => apiResponse({ selectedOptionIds: [1, 3] }))
    vi.stubGlobal('fetch', fetchMock)

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () =>
        useSaveRecoveryOptionSelectionsMutation(4821, {
          client: createApiClient('https://api.example.com'),
        }),
      { wrapper },
    )

    await act(async () => {
      await result.current.mutateAsync([1, 3])
    })

    expect(queryClient.getQueryData(recoveryOptionQueryKeys.selections(4821))).toEqual({
      selectedOptionIds: [1, 3],
    })
  })
})
