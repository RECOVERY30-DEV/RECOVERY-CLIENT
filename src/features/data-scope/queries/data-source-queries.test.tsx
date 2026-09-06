import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { dataSourceQueryKeys, useDataSourcesQuery } from './data-source-queries'

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('data source queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('사업자별 데이터 출처 목록을 조회해 캐시한다', async () => {
    const sources = [
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
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => Response.json({ success: true, data: sources, error: null })),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { result } = renderHook(
      () =>
        useDataSourcesQuery(1, {
          client: createApiClient('https://api.example.com'),
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(dataSourceQueryKeys.list(1))).toEqual(sources)
  })
})
