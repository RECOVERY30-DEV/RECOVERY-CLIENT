import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { CashflowCorrectionOverviewScreen } from './cashflow-correction-overview-screen'

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function renderScreen(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('현금흐름 보정 API 화면', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('저장된 보정값과 PROPOSED 후보를 API 응답으로 표시하고 후보를 수락한다', async () => {
    const paths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request))
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        const path = new URL(input.url).pathname
        paths.push(path)
        if (path.endsWith('/adjustment-suggestions/12/accept')) {
          return apiResponse({
            id: 12,
            adjustmentType: 'CASH_SALES',
            suggestedAmount: 1200000,
            suggestedRule: '매월 15일',
            evidenceText: '최근 3개월 동일 패턴',
            confidence: 0.82,
            status: 'ACCEPTED',
            acceptedAdjustmentId: 3,
          })
        }
        if (path.endsWith('/adjustment-suggestions')) {
          return apiResponse([
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
          ])
        }
        return apiResponse([
          {
            id: 1,
            adjustmentType: 'CASH_SALES',
            amount: 650000,
            certainty: 'CONFIRMED',
            expectedDate: '2025-07-20',
            direction: 'I',
            recurrenceRule: null,
            expenseCategory: null,
            fundSource: null,
            status: 'SAVED',
            memo: null,
            appliedRunId: 1,
            createdAt: '2025-07-14T00:00:00Z',
            updatedAt: '2025-07-14T00:00:00Z',
          },
          {
            id: 2,
            adjustmentType: 'EXPECTED_EXPENSE',
            amount: 1200000,
            certainty: 'ESTIMATED',
            expectedDate: '2025-07-22',
            direction: 'O',
            recurrenceRule: null,
            expenseCategory: '인테리어',
            fundSource: null,
            status: 'SAVED',
            memo: '인테리어 대금',
            appliedRunId: 1,
            createdAt: '2025-07-14T00:00:00Z',
            updatedAt: '2025-07-14T00:00:00Z',
          },
        ])
      }),
    )

    renderScreen(
      <CashflowCorrectionOverviewScreen client={createApiClient('https://api.example.com')} />,
    )

    await waitFor(() => expect(screen.getByText('현금매출 +650,000원')).toBeInTheDocument())
    expect(screen.getByText('인테리어 대금 -1,200,000원')).toBeInTheDocument()
    expect(screen.getByText('매월 15일')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '매월 15일 수락' }))

    await waitFor(() =>
      expect(paths).toContain('/api/businesses/1/adjustment-suggestions/12/accept'),
    )
  })

  it('보정 적용 성공 결과를 보여 주고 진행 중에는 중복 요청을 막는다', async () => {
    let resolveApply: ((response: Response) => void) | undefined
    const fetchMock = vi.fn<typeof fetch>((input) => {
      if (!(input instanceof Request))
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      const path = new URL(input.url).pathname
      if (path.endsWith('/apply')) {
        return new Promise<Response>((resolve) => {
          resolveApply = resolve
        })
      }
      return Promise.resolve(apiResponse(path.endsWith('/adjustment-suggestions') ? [] : []))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderScreen(
      <CashflowCorrectionOverviewScreen client={createApiClient('https://api.example.com')} />,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: '재계산 실행' })).toBeEnabled())

    fireEvent.click(screen.getByRole('button', { name: '재계산 실행' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '재계산 요청 중' })).toBeDisabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: '재계산 요청 중' }))
    expect(
      fetchMock.mock.calls.filter(
        ([input]) => input instanceof Request && new URL(input.url).pathname.endsWith('/apply'),
      ),
    ).toHaveLength(1)

    resolveApply?.(apiResponse({ appliedCount: 2, appliedRunId: 9 }))

    await waitFor(() =>
      expect(screen.getByText('보정값 2건 적용 요청을 완료했습니다. (실행 9)')).toBeInTheDocument(),
    )
  })

  it('목록 조회 실패 후 재시도하고 보정값을 삭제한다', async () => {
    let listAttempts = 0
    const paths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request))
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        const path = new URL(input.url).pathname
        paths.push(path)
        if (path.endsWith('/adjustment-suggestions')) return apiResponse([])
        if (path.endsWith('/adjustments/1')) return apiResponse({ deleted: true })
        listAttempts += 1
        return listAttempts === 1
          ? Response.json({ code: 'ADJUSTMENT_500_1', message: '일시 오류' }, { status: 500 })
          : apiResponse([
              {
                adjustmentId: 1,
                adjustmentType: 'CASH_SALES',
                amount: 650000,
                certainty: 'CONFIRMED',
                expectedDate: '2025-07-20',
                status: 'SAVED',
                memo: null,
              },
            ])
      }),
    )
    renderScreen(
      <CashflowCorrectionOverviewScreen client={createApiClient('https://api.example.com')} />,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('보정값을 불러오지 못했습니다.')
    fireEvent.click(screen.getByRole('button', { name: '보정값 다시 불러오기' }))
    await waitFor(() => expect(screen.getByText('현금매출 +650,000원')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: '현금매출 +650,000원 삭제' }))
    await waitFor(() => expect(paths).toContain('/api/businesses/1/adjustments/1'))
  })
})
