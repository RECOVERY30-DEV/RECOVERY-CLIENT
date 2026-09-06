import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { consentQueryKeys, useConsentQueries, useUpdateConsentMutation } from './consent-queries'

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('consent queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('동의 상태를 캐시하고 성공한 변경을 즉시 반영한다', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const request = input as Request

      if (request.method === 'PUT') {
        return apiResponse({ typeCode: 'FOLLOWUP_TRACKING', status: 'GRANTED' })
      }

      return apiResponse([
        { typeCode: 'ANALYSIS', status: 'GRANTED' },
        { typeCode: 'FOLLOWUP_TRACKING', status: 'WITHDRAWN' },
      ])
    })
    vi.stubGlobal('fetch', fetchMock)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = createWrapper(queryClient)

    const { result } = renderHook(
      () => ({
        consents: useConsentQueries(1, { client: createApiClient('https://api.example.com') }),
        update: useUpdateConsentMutation(1, { client: createApiClient('https://api.example.com') }),
      }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.consents.isSuccess).toBe(true))
    await result.current.update.mutateAsync({ typeCode: 'FOLLOWUP_TRACKING', granted: true })

    expect(queryClient.getQueryData(consentQueryKeys.list(1))).toEqual([
      { typeCode: 'ANALYSIS', status: 'GRANTED' },
      { typeCode: 'FOLLOWUP_TRACKING', status: 'GRANTED' },
    ])
  })
})
