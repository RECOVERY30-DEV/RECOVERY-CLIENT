import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ConsultationPage from '@/app/recovery/consultation/page'
import { createApiClient } from '@/shared/api/api-client'

import { ConsultationReservationScreen } from './consultation-reservation-screen'

const counselor = {
  counselorId: 1,
  name: '김상담',
  institution: '소상공인시장진흥공단',
  branch: null,
  role: '경영지도사',
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

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return render(ui, { wrapper })
}

describe('상담 예약 화면', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('상담사와 예약 가능 시간을 선택해 예약을 요청하고 상세 성공 상태를 표시한다', async () => {
    const requestedPaths: string[] = []
    let requestBody: unknown
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname
        requestedPaths.push(path)
        if (input.method === 'POST') {
          requestBody = await input.clone().json()
          return apiResponse({
            consultationId: 8,
            status: 'REQUESTED',
            channel: 'PHONE',
            scheduledAt: slot.startAt,
          })
        }
        if (path === '/api/counselors') {
          return apiResponse([counselor])
        }
        if (path === '/api/counselors/1/slots') {
          return apiResponse([slot])
        }

        return apiResponse({
          consultationId: 8,
          businessId: 1,
          packetId: null,
          counselorId: 1,
          counselorName: counselor.name,
          channel: 'PHONE',
          scheduledAt: slot.startAt,
          purposeText: '현금흐름 위험 대응',
          preQuestion: null,
          transferConsentGranted: true,
          status: 'REQUESTED',
          recoveryOptionIds: [],
          finalDecision: null,
          resultNote: null,
        })
      }),
    )

    renderWithQuery(
      <ConsultationReservationScreen client={createApiClient('https://api.example.com')} />,
    )

    await waitFor(() => expect(requestedPaths).toEqual(['/api/counselors']))
    fireEvent.click(await screen.findByRole('radio', { name: /김상담/ }))
    fireEvent.click(await screen.findByRole('radio', { name: /2025년 7월 14일 오전 10시/ }))
    fireEvent.click(screen.getByRole('button', { name: '예약 확정하기' }))

    expect(await screen.findByText('상담 예약이 접수되었습니다.')).toBeInTheDocument()
    expect(requestedPaths).toEqual([
      '/api/counselors',
      '/api/counselors/1/slots',
      '/api/businesses/1/consultations',
      '/api/consultations/8',
    ])
    expect(requestBody).toEqual({
      channel: 'PHONE',
      counselorId: 1,
      slotId: 31,
      purposeText: '상환조건 조정 상담, 고정비 납부일 재배치',
      transferConsentGranted: true,
    })
  })

  it('예약 요청 실패 후 같은 선택으로 다시 시도할 수 있다', async () => {
    let bookingAttempts = 0
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname
        if (path === '/api/counselors') {
          return apiResponse([counselor])
        }
        if (path === '/api/counselors/1/slots') {
          return apiResponse([slot])
        }
        if (input.method === 'POST') {
          bookingAttempts += 1
          if (bookingAttempts === 1) {
            return Response.json(
              {
                success: false,
                data: null,
                error: { code: 'TEMPORARY', message: '잠시 후 재시도' },
              },
              { status: 503 },
            )
          }

          return apiResponse({
            consultationId: 8,
            status: 'REQUESTED',
            channel: 'PHONE',
            scheduledAt: slot.startAt,
          })
        }

        return apiResponse({
          consultationId: 8,
          businessId: 1,
          packetId: null,
          counselorId: 1,
          counselorName: counselor.name,
          channel: 'PHONE',
          scheduledAt: slot.startAt,
          purposeText: '현금흐름 위험 대응',
          preQuestion: null,
          transferConsentGranted: true,
          status: 'REQUESTED',
          recoveryOptionIds: [],
          finalDecision: null,
          resultNote: null,
        })
      }),
    )

    renderWithQuery(
      <ConsultationReservationScreen client={createApiClient('https://api.example.com')} />,
    )

    await screen.findByRole('radio', { name: /2025년 7월 14일 오전 10시/ })
    fireEvent.click(screen.getByRole('button', { name: '예약 확정하기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('예약 요청에 실패했습니다.')

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('상담 예약이 접수되었습니다.')).toBeInTheDocument()
    expect(bookingAttempts).toBe(2)
  })

  it('지원사업 상세 상담에는 해당 사업만 표시하고 선택한 지원사업 전송 항목을 제공한다', async () => {
    renderWithQuery(
      await ConsultationPage({
        searchParams: Promise.resolve({ program: 'credit-guarantee-sales-decline' }),
      }),
    )

    expect(screen.getByRole('heading', { name: '지원사업 상담' })).toBeInTheDocument()
    expect(screen.getByText('신용보증기금 매출감소특례보증')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '지원사업 상세로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery/support-programs/credit-guarantee-sales-decline',
    )
    expect(screen.queryByTestId('selected-recovery-options-summary')).not.toBeInTheDocument()
    expect(screen.queryByText('선택한 회복안')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '선택한 지원사업' })).toBeChecked()
  })

  it('지원사업 목록 상담에는 기본 회복안을 표시하거나 전송하지 않는다', async () => {
    renderWithQuery(
      await ConsultationPage({ searchParams: Promise.resolve({ source: 'support-programs' }) }),
    )

    expect(screen.getByRole('heading', { name: '지원사업 상담' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '지원사업 목록으로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery/support-programs',
    )
    expect(screen.queryByTestId('selected-recovery-options-summary')).not.toBeInTheDocument()
    expect(screen.queryByText('선택한 회복안')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '지원사업 상담 요청 내용' })).toBeChecked()
  })

  it('지원사업과 plans query가 함께 있으면 지원사업 맥락을 우선한다', async () => {
    renderWithQuery(
      await ConsultationPage({
        searchParams: Promise.resolve({
          program: 'small-business-stability-fund',
          plans: ['refinancing-review'],
        }),
      }),
    )

    expect(screen.getByRole('heading', { name: '지원사업 상담' })).toBeInTheDocument()
    expect(screen.getByText('소상공인 경영안정자금')).toBeInTheDocument()
    expect(screen.queryByTestId('selected-recovery-options-summary')).not.toBeInTheDocument()
    expect(screen.queryByText('상환조건 조정 상담')).not.toBeInTheDocument()
    expect(screen.queryByText('대환 검토')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '선택한 지원사업' })).toBeChecked()
  })

  it('유효하지 않은 지원사업 ID는 기본 회복안 상담으로 안전하게 되돌린다', async () => {
    renderWithQuery(
      await ConsultationPage({ searchParams: Promise.resolve({ program: 'unknown-program' }) }),
    )

    expect(screen.getByRole('link', { name: '회복안 비교로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery/compare',
    )
    expect(screen.getByText('상환조건 조정 상담')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '선택한 회복안' })).toBeChecked()
  })

  it('회복안 상담은 기존 회복안 선택과 전송 항목을 유지한다', () => {
    renderWithQuery(<ConsultationReservationScreen />)

    expect(screen.getByTestId('selected-recovery-options-summary')).toHaveTextContent(
      '상환조건 조정 상담',
    )
    expect(screen.getByTestId('selected-recovery-options-summary')).toHaveTextContent(
      '고정비 납부일 재배치',
    )
    expect(screen.getByRole('checkbox', { name: '선택한 회복안' })).toBeChecked()
  })

  it('본문 요약은 현재 예약 요청에 포함되는 정보만 안내한다', () => {
    renderWithQuery(<ConsultationReservationScreen />)

    expect(
      screen.getByText(
        '상담 목적, 상담 전 메모, 전송 동의 여부만 예약 요청에 포함합니다. 선택한 회복안·지원사업·전송 항목과 회복안 ID는 아직 전송하지 않습니다.',
      ),
    ).toBeInTheDocument()
  })

  it('query에서 전달된 회복안을 목적과 요약에 반영한다', async () => {
    renderWithQuery(
      await ConsultationPage({
        searchParams: Promise.resolve({
          plans: ['repayment-adjustment', 'refinancing-review', 'invalid-option'],
        }),
      }),
    )

    expect(screen.getByRole('heading', { name: '상담 목적 및 회복안' })).toBeInTheDocument()
    expect(screen.getByText('상환조건 조정 상담')).toBeInTheDocument()
    expect(screen.getByText('대환 검토')).toBeInTheDocument()
    expect(screen.queryByText('텍스트')).not.toBeInTheDocument()
  })

  it.each([
    ['query가 없을 때', undefined, ['상환조건 조정 상담', '고정비 납부일 재배치']],
    ['빈 query일 때', '', ['상환조건 조정 상담', '고정비 납부일 재배치']],
    ['유효하지 않은 query만 있을 때', 'unknown', ['상환조건 조정 상담', '고정비 납부일 재배치']],
    [
      '중복된 query일 때',
      ['repayment-adjustment', 'repayment-adjustment', 'fixed-cost-reschedule'],
      ['상환조건 조정 상담', '고정비 납부일 재배치'],
    ],
    [
      '유효하지 않은 값이 섞인 query일 때',
      ['unknown', 'refinancing-review', 'repayment-adjustment'],
      ['상환조건 조정 상담', '대환 검토'],
    ],
  ] as const)('%s 회복안을 정규화한다', async (_name, plans, expectedTitles) => {
    renderWithQuery(await ConsultationPage({ searchParams: Promise.resolve({ plans }) }))

    const selectedOptions = screen.getByTestId('selected-recovery-options-summary')
    expect(selectedOptions).toHaveTextContent(expectedTitles[0])
    expect(selectedOptions).toHaveTextContent(expectedTitles[1])
    expect(selectedOptions.textContent).not.toContain('unknown')
  })

  it('전화 상담 채널을 표시하고 상담사 선택 전에는 예약 시간을 요청하지 않는다', () => {
    renderWithQuery(<ConsultationReservationScreen />)

    expect(screen.getAllByRole('radio', { name: '전화 상담' })).toHaveLength(1)
    expect(
      screen.getByText('상담사를 선택하면 예약 가능한 시간을 확인할 수 있습니다.'),
    ).toBeInTheDocument()
  })

  it('세 전송 항목을 독립적으로 선택하고 안내 modal을 닫을 수 있다', async () => {
    renderWithQuery(<ConsultationReservationScreen />)

    const backLink = screen.getByRole('link', { name: '회복안 비교로 돌아가기' })
    const summary = screen.getByRole('checkbox', { name: '현금흐름 요약' })
    const causes = screen.getByRole('checkbox', { name: '주요 원인 분석' })
    const plans = screen.getByRole('checkbox', { name: '선택한 회복안' })
    expect(summary).toBeChecked()
    expect(causes).not.toBeChecked()
    expect(plans).toBeChecked()

    fireEvent.click(causes)
    expect(summary).toBeChecked()
    expect(causes).toBeChecked()
    expect(plans).toBeChecked()

    const information = screen.getByRole('button', { name: '전송 정보 안내' })
    expect(information).toHaveClass('focus-visible:ring-primary-blue-800')
    fireEvent.click(information)
    const dialog = screen.getByRole('dialog', { name: '전송 정보 안내' })
    const closeButton = screen.getByRole('button', { name: '안내 닫기' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(
      screen.getByText(
        '현재 예약 요청에는 상담 목적, 상담 전 메모, 전송 동의 여부만 포함합니다. 선택한 전송 항목과 회복안 ID는 아직 전달하지 않습니다.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('consultation-reservation-background')).toHaveAttribute('inert')
    expect(backLink.closest('[inert]')).not.toBeNull()
    expect(information).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(closeButton, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true })
    expect(closeButton).toHaveFocus()

    fireEvent.click(closeButton)
    expect(screen.queryByRole('dialog', { name: '전송 정보 안내' })).not.toBeInTheDocument()
    await waitFor(() => expect(information).toHaveFocus())
    expect(screen.getByTestId('consultation-reservation-background')).not.toHaveAttribute('inert')
  })

  it('안내 modal을 Escape로 닫고 trigger에 focus를 복원한다', async () => {
    renderWithQuery(<ConsultationReservationScreen />)

    const information = screen.getByRole('button', { name: '전송 정보 안내' })
    fireEvent.click(information)
    fireEvent.keyDown(screen.getByRole('dialog', { name: '전송 정보 안내' }), { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: '전송 정보 안내' })).not.toBeInTheDocument()
    await waitFor(() => expect(information).toHaveFocus())
  })

  it('상담사와 슬롯을 선택하기 전에는 예약 요청을 막는다', () => {
    renderWithQuery(<ConsultationReservationScreen />)

    expect(screen.getByRole('button', { name: '예약 확정하기' })).toBeDisabled()
  })
})
