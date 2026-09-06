import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  consultationQueryKeys,
  useBookConsultationMutation,
  useConsultationQuery,
  useCounselorsQuery,
  useCounselorSlotsQuery,
} from './consultation-queries'

const counselor = {
  counselorId: 1,
  name: '김상담',
  institution: null,
  branch: null,
  role: null,
}

const slot = {
  slotId: 31,
  startAt: '2025-07-14T01:00:00Z',
  endAt: '2025-07-14T01:30:00Z',
  capacity: 3,
  bookedCount: 1,
  remainingSeats: 2,
  status: 'OPEN',
  bookable: true,
}

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('consultation queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('상담사 선택 전에는 슬롯을 요청하지 않고 선택 후 목록을 캐시한다', async () => {
    const requestedPaths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname
        requestedPaths.push(path)

        return apiResponse(path === '/api/counselors' ? [counselor] : [slot])
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const options = { client: createApiClient('https://api.example.com') }
    const { result: counselorsResult } = renderHook(() => useCounselorsQuery(options), {
      wrapper: createWrapper(queryClient),
    })
    const { result: slotsResult, rerender } = renderHook(
      ({ counselorId }: Readonly<{ counselorId: number | null }>) =>
        useCounselorSlotsQuery(counselorId, options),
      { initialProps: { counselorId: null as number | null }, wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => expect(counselorsResult.current.isSuccess).toBe(true))
    expect(requestedPaths).toEqual(['/api/counselors'])

    rerender({ counselorId: 1 })
    await waitFor(() => expect(slotsResult.current.isSuccess).toBe(true))

    expect(requestedPaths).toEqual(['/api/counselors', '/api/counselors/1/slots'])
    expect(queryClient.getQueryData(consultationQueryKeys.slots(1))).toEqual([slot])
  })

  it('상담 상세를 식별자별로 조회하고 캐시한다', async () => {
    const detail = {
      consultationId: 8,
      businessId: 1,
      packetId: null,
      counselorId: 1,
      counselorName: '김상담',
      channel: 'PHONE',
      scheduledAt: '2025-07-14T01:00:00Z',
      purposeText: '현금흐름 위험 대응',
      preQuestion: null,
      transferConsentGranted: true,
      status: 'REQUESTED',
      recoveryOptionIds: [],
      finalDecision: null,
      resultNote: null,
    }
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => apiResponse(detail)),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { result } = renderHook(
      () =>
        useConsultationQuery(8, {
          client: createApiClient('https://api.example.com'),
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(consultationQueryKeys.detail(8))).toEqual(detail)
  })

  it('예약 mutation 결과를 호출자에게 제공한다', async () => {
    let requestBody: unknown
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        requestBody = await input.clone().json()

        return apiResponse({
          consultationId: 8,
          status: 'REQUESTED',
          channel: 'PHONE',
          scheduledAt: '2025-07-14T01:00:00Z',
        })
      }),
    )
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    const { result } = renderHook(
      () =>
        useBookConsultationMutation(1, {
          client: createApiClient('https://api.example.com'),
        }),
      { wrapper: createWrapper(queryClient) },
    )

    let bookedConsultation: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined

    await act(async () => {
      bookedConsultation = await result.current.mutateAsync({
        channel: 'PHONE',
        counselorId: 1,
        slotId: 31,
      })
    })

    expect(bookedConsultation).toMatchObject({ consultationId: 8, status: 'REQUESTED' })
    expect(requestBody).toEqual({ channel: 'PHONE', counselorId: 1, slotId: 31 })
  })
})
