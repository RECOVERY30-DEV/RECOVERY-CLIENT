import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { ConsultationReservationScreen } from './consultation-reservation-screen'

const counselors = [
  {
    counselorId: 1,
    name: '김상담',
    institution: '소상공인시장진흥공단',
    branch: '서울중부센터',
    role: '경영지도사',
  },
  {
    counselorId: 2,
    name: '이회복',
    institution: null,
    branch: null,
    role: null,
  },
]

const slots = [
  {
    slotId: 31,
    startAt: '2025-07-14T01:00:00Z',
    endAt: '2025-07-14T01:30:00Z',
    capacity: 3,
    bookedCount: 1,
    remainingSeats: 2,
    status: 'OPEN',
    bookable: true,
  },
  {
    slotId: 32,
    startAt: '2025-07-14T05:00:00Z',
    endAt: '2025-07-14T05:30:00Z',
    capacity: 1,
    bookedCount: 1,
    remainingSeats: 0,
    status: 'BOOKED',
    bookable: false,
  },
  {
    slotId: 33,
    startAt: '2025-07-15T02:00:00Z',
    endAt: '2025-07-15T02:30:00Z',
    capacity: 3,
    bookedCount: 0,
    remainingSeats: 3,
    status: 'OPEN',
    bookable: true,
  },
]

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function renderReservation(fetchMock: typeof fetch) {
  vi.stubGlobal('fetch', fetchMock)
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return render(
    <ConsultationReservationScreen client={createApiClient('https://api.example.com')} />,
    { wrapper },
  )
}

describe('상담 예약 API 사용자 흐름', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('상담사 조회 중과 빈 목록을 명확히 안내한다', async () => {
    let resolveCounselors: ((response: Response) => void) | undefined
    const counselorResponse = new Promise<Response>((resolve) => {
      resolveCounselors = resolve
    })
    renderReservation(vi.fn<typeof fetch>(async () => counselorResponse))

    expect(screen.getByText('상담사를 불러오는 중입니다.')).toHaveAttribute('role', 'status')
    expect(screen.getByRole('button', { name: '예약 확정하기' })).toBeDisabled()

    resolveCounselors?.(apiResponse([]))

    expect(await screen.findByText('예약 가능한 상담사가 없습니다.')).toBeInTheDocument()
  })

  it('상담사 조회 오류를 표시한다', async () => {
    renderReservation(
      vi.fn<typeof fetch>(async () =>
        Response.json(
          { code: 'COUNSELOR_ERROR', message: '상담사 조회에 실패했습니다.' },
          { status: 500 },
        ),
      ),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '상담사를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    )
  })

  it('상담사를 선택한 뒤 예약 가능한 슬롯만 보여준다', async () => {
    let resolveSlots: ((response: Response) => void) | undefined
    const slotResponse = new Promise<Response>((resolve) => {
      resolveSlots = resolve
    })
    renderReservation(
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        return new URL(input.url).pathname === '/api/counselors'
          ? apiResponse(counselors)
          : slotResponse
      }),
    )

    expect(await screen.findByRole('radio', { name: /김상담/ })).toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent('예약 시간을 불러오는 중입니다.')

    await act(async () => {
      resolveSlots?.(apiResponse(slots))
    })

    expect(await screen.findByRole('radio', { name: '2025년 7월 14일 오전 10시' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '2025년 7월 15일 오전 11시' })).toBeInTheDocument()
    expect(
      screen.queryByRole('radio', { name: '2025년 7월 14일 오후 2시' }),
    ).not.toBeInTheDocument()
  })

  it.each([
    [
      '오류',
      Response.json({ code: 'SLOT_ERROR', message: '슬롯 조회에 실패했습니다.' }, { status: 404 }),
      '예약 시간을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      'alert',
    ],
    ['빈 목록', apiResponse([]), '예약 가능한 시간이 없습니다.', 'status'],
  ])('슬롯 조회 %s 상태를 안내한다', async (_name, response, message, role) => {
    renderReservation(
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        return new URL(input.url).pathname === '/api/counselors'
          ? apiResponse(counselors)
          : response.clone()
      }),
    )

    expect(await screen.findByText(message)).toHaveAttribute('role', role)
    expect(screen.getByRole('button', { name: '예약 확정하기' })).toBeDisabled()
  })

  it('선택한 상담사와 슬롯 및 메모로 예약하고 제출 상태를 표시한다', async () => {
    let resolveBooking: ((response: Response) => void) | undefined
    const bookingResponse = new Promise<Response>((resolve) => {
      resolveBooking = resolve
    })
    let bookingBody: unknown
    renderReservation(
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname

        if (input.method === 'POST') {
          bookingBody = await input.clone().json()
          return bookingResponse
        }

        if (path === '/api/counselors') {
          return apiResponse(counselors)
        }

        if (path === '/api/consultations/8') {
          return apiResponse({
            consultationId: 8,
            businessId: 1,
            packetId: null,
            counselorId: 1,
            counselorName: '김상담',
            channel: 'PHONE',
            scheduledAt: '2025-07-14T01:00:00Z',
            purposeText: '현금흐름 위험 대응',
            preQuestion: '준비할 서류가 있나요?',
            transferConsentGranted: true,
            status: 'REQUESTED',
            recoveryOptionIds: [],
            finalDecision: null,
            resultNote: null,
          })
        }

        return apiResponse(slots)
      }),
    )

    const submitButton = await screen.findByRole('button', { name: '예약 확정하기' })
    await waitFor(() => expect(submitButton).toBeEnabled())
    fireEvent.change(screen.getByLabelText('상담 전 메모 (선택)'), {
      target: { value: '준비할 서류가 있나요?' },
    })
    fireEvent.click(submitButton)

    expect(await screen.findByRole('button', { name: '예약하는 중...' })).toBeDisabled()
    await waitFor(() => {
      expect(bookingBody).toEqual({
        channel: 'PHONE',
        counselorId: 1,
        slotId: 31,
        purposeText: '상환조건 조정 상담, 고정비 납부일 재배치',
        preQuestion: '준비할 서류가 있나요?',
        transferConsentGranted: true,
      })
    })

    await act(async () => {
      resolveBooking?.(
        apiResponse({
          consultationId: 8,
          status: 'REQUESTED',
          channel: 'PHONE',
          scheduledAt: '2025-07-14T01:00:00Z',
        }),
      )
    })

    expect(await screen.findByText('상담 예약이 접수되었습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '예약 요청 완료' })).toBeDisabled()
  })

  it('예약 요청 중에는 상담사와 슬롯 선택을 잠근다', async () => {
    let resolveBooking: ((response: Response) => void) | undefined
    const bookingResponse = new Promise<Response>((resolve) => {
      resolveBooking = resolve
    })
    renderReservation(
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        if (input.method === 'POST') {
          return bookingResponse
        }

        return apiResponse(new URL(input.url).pathname === '/api/counselors' ? counselors : slots)
      }),
    )

    const submitButton = await screen.findByRole('button', { name: '예약 확정하기' })
    await waitFor(() => expect(submitButton).toBeEnabled())
    fireEvent.click(submitButton)

    expect(await screen.findByRole('button', { name: '예약하는 중...' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: /김상담/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: '2025년 7월 14일 오전 10시' })).toBeDisabled()

    await act(async () => {
      resolveBooking?.(
        apiResponse({
          consultationId: 8,
          status: 'REQUESTED',
          channel: 'PHONE',
          scheduledAt: '2025-07-14T01:00:00Z',
        }),
      )
    })
  })

  it('상담사 변경 시 이전 예약 상세 성공 상태를 지운다', async () => {
    renderReservation(
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname
        if (input.method === 'POST') {
          return apiResponse({
            consultationId: 8,
            status: 'REQUESTED',
            channel: 'PHONE',
            scheduledAt: '2025-07-14T01:00:00Z',
          })
        }
        if (path === '/api/counselors') {
          return apiResponse(counselors)
        }
        if (path === '/api/consultations/8') {
          return apiResponse({
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
          })
        }

        return apiResponse(slots)
      }),
    )

    const submitButton = await screen.findByRole('button', { name: '예약 확정하기' })
    await waitFor(() => expect(submitButton).toBeEnabled())
    fireEvent.click(submitButton)
    expect(await screen.findByText('상담 예약이 접수되었습니다.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: '이회복' }))

    expect(screen.queryByText('상담 예약이 접수되었습니다.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '예약 확정하기' })).toBeDisabled()
  })

  it('예약 생성 오류를 안내하고 다시 제출할 수 있게 한다', async () => {
    renderReservation(
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        if (input.method === 'POST') {
          return Response.json(
            { code: 'SLOT_BOOKED', message: '이미 마감된 시간입니다.' },
            { status: 400 },
          )
        }

        return apiResponse(new URL(input.url).pathname === '/api/counselors' ? counselors : slots)
      }),
    )

    const submitButton = await screen.findByRole('button', { name: '예약 확정하기' })
    await waitFor(() => expect(submitButton).toBeEnabled())
    fireEvent.click(submitButton)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '예약 요청에 실패했습니다. 선택한 시간을 확인하고 다시 시도해주세요.',
    )
    expect(submitButton).toBeEnabled()
  })
})
