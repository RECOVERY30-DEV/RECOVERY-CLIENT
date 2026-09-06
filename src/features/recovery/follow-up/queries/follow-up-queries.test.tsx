import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { followUpQueryKeys, useFollowUpQueries } from './follow-up-queries'

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('follow-up queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('결과가 있는 첫 일정의 결과만 조회하고 일정·실행 상태를 별도 캐시한다', async () => {
    const requestedPaths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname
        requestedPaths.push(path)

        if (path.endsWith('/followups')) {
          return apiResponse([
            {
              id: 1,
              checkpoint: 'D30',
              scheduledDate: '2025-08-14',
              status: 'DONE',
              forecastRunId: 1,
              packetId: null,
              hasResult: true,
            },
            {
              id: 2,
              checkpoint: 'D60',
              scheduledDate: '2025-09-13',
              status: 'SCHEDULED',
              forecastRunId: 1,
              packetId: null,
              hasResult: false,
            },
          ])
        }

        if (path.endsWith('/result')) {
          return apiResponse({
            scheduleId: 1,
            balanceRecovered: 'PARTIAL',
            delinquency: false,
            baselineBalance: -1280000,
            currentBalance: 360000,
            recoveryAmount: 1640000,
            latestForecastRunId: 1,
            riskStatus: 'STABLE',
            recordedAt: '2025-08-14T09:00:00Z',
          })
        }

        return apiResponse([
          {
            id: 3,
            recoveryOptionId: 1,
            status: 'IN_PROGRESS',
            blockerText: null,
            forecastRunId: 1,
            updatedAt: '2025-08-14T09:00:00Z',
          },
        ])
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { result } = renderHook(
      () =>
        useFollowUpQueries(1, {
          client: createApiClient('https://api.example.com'),
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => expect(result.current.result.isSuccess).toBe(true))

    expect(requestedPaths).toEqual(
      expect.arrayContaining([
        '/api/businesses/1/followups',
        '/api/followups/1/result',
        '/api/businesses/1/recovery-execution-status',
      ]),
    )
    expect(queryClient.getQueryData(followUpQueryKeys.result(1))).toMatchObject({
      recoveryAmount: 1640000,
    })
  })
})
