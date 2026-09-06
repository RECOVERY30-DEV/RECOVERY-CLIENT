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
  afterEach(() => vi.unstubAllGlobals())

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
            adjustmentId: 11,
            adjustmentType: 'CASH_SALES',
            amount: 650000,
            certainty: 'CONFIRMED',
            expectedDate: '2025-07-20',
            status: 'DRAFT',
            memo: null,
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

  it('생성 실패 시 입력을 유지하고 재시도를 제공한다', async () => {
    let attempts = 0
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => {
        attempts += 1
        return attempts === 1
          ? Response.json(
              { code: 'ADJUSTMENT_400_1', message: '금액을 확인해 주세요.' },
              { status: 400 },
            )
          : Response.json({
              success: true,
              data: {
                adjustmentId: 11,
                adjustmentType: 'CASH_SALES',
                amount: 650000,
                certainty: 'EXPECTED',
                expectedDate: '2025-07-20',
                status: 'DRAFT',
                memo: null,
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
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('보정값을 저장하지 못했습니다.')
    expect(screen.getByLabelText('금액 (원)')).toHaveValue('650000')
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => expect(screen.getByText('보정값이 저장되었습니다.')).toBeInTheDocument())
    expect(attempts).toBe(2)
  })
})
