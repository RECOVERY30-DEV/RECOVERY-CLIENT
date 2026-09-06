import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

import { CashflowCorrectionFormScreen } from './cashflow-correction-form-screen'

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '650000' } })
  fireEvent.change(screen.getByLabelText('반복 여부'), { target: { value: 'monthly' } })
  fireEvent.click(screen.getByRole('button', { name: '예정일 예정일을 선택해주세요.' }))
  fireEvent.click(screen.getByRole('button', { name: '2025년 7월 20일' }))
}

describe('현금흐름 보정 입력 API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    window.localStorage.clear()
  })

  it('유효한 입력을 DRAFT 보정값 생성 API로 전송하고 완료를 표시한다', async () => {
    let requestBody: unknown
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request))
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        requestBody = await input.clone().json()
        return Response.json({
          success: true,
          data: {
            id: 11,
            adjustmentType: 'CASH_SALES',
            amount: 650000,
            certainty: 'CONFIRMED',
            expectedDate: '2025-07-20',
            direction: 'I',
            recurrenceRule: null,
            expenseCategory: null,
            fundSource: null,
            status: 'DRAFT',
            memo: null,
            appliedRunId: null,
            createdAt: '2025-07-14T00:00:00Z',
            updatedAt: '2025-07-14T00:00:00Z',
          },
          error: null,
        })
      }),
    )
    render(
      <CashflowCorrectionFormScreen
        client={createApiClient('https://api.example.com')}
        kind="cash-sales"
      />,
    )

    fillRequiredFields()
    fireEvent.click(screen.getByLabelText('확정 매출'))
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(screen.getByText('보정값이 저장되었습니다.')).toBeInTheDocument())
    expect(requestBody).toEqual({
      adjustmentType: 'CASH_SALES',
      amount: 650000,
      certainty: 'CONFIRMED',
      expectedDate: '2025-07-20',
    })
  })

  it('400 응답 시 반복 선택을 포함해 이 기기에 임시 저장한다', async () => {
    let requestBody: unknown
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request))
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        requestBody = await input.clone().json()
        return Response.json(
          { code: 'ADJUSTMENT_400_1', message: '반복 주기를 확인해 주세요.' },
          { status: 400 },
        )
      }),
    )
    render(
      <CashflowCorrectionFormScreen
        client={createApiClient('https://api.example.com')}
        kind="cash-sales"
      />,
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('status')).toHaveTextContent('이 기기에 임시 저장되었습니다.')
    expect(screen.getByRole('status')).toHaveTextContent(
      '서버 연동 전까지 예측 결과에는 반영되지 않습니다.',
    )
    expect(requestBody).toEqual({
      adjustmentType: 'CASH_SALES',
      amount: 650000,
      certainty: 'ESTIMATED',
      expectedDate: '2025-07-20',
    })
    expect(
      JSON.parse(window.localStorage.getItem('recovery30.pending-adjustments.v1') ?? '[]'),
    ).toEqual([
      expect.objectContaining({
        adjustmentType: 'CASH_SALES',
        amount: 650000,
        certainty: 'ESTIMATED',
        expectedDate: '2025-07-20',
        selection: 'monthly',
      }),
    ])

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('금액 (원)')).toBeDisabled()
  })

  it('400이 아닌 서버 오류는 임시 저장으로 전환하지 않고 재시도를 제공한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        Response.json(
          { code: 'ADJUSTMENT_500_1', message: '잠시 후 다시 시도해 주세요.' },
          { status: 500 },
        ),
      ),
    )
    render(
      <CashflowCorrectionFormScreen
        client={createApiClient('https://api.example.com')}
        kind="cash-sales"
      />,
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('보정값을 저장하지 못했습니다.')
    expect(window.localStorage.getItem('recovery30.pending-adjustments.v1')).toBeNull()
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeEnabled()
  })
})
