import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { CashflowCorrectionOverviewScreen } from './cashflow-correction-overview-screen'

describe('현금흐름 정보 보정 허브 화면', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('정적 진행 상태 대신 API 보정값과 후보를 표시한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request))
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        const suggestions = new URL(input.url).pathname.endsWith('/adjustment-suggestions')
        return Response.json({
          success: true,
          data: suggestions
            ? []
            : [
                {
                  adjustmentId: 1,
                  adjustmentType: 'CASH_SALES',
                  amount: 650000,
                  certainty: 'CONFIRMED',
                  expectedDate: '2025-07-20',
                  status: 'SAVED',
                  memo: null,
                },
              ],
          error: null,
        })
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <CashflowCorrectionOverviewScreen client={createApiClient('https://api.example.com')} />
      </QueryClientProvider>,
    )

    await waitFor(() => expect(screen.getByText('현금매출 +650,000원')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: '예정지출 입력' })).toHaveAttribute(
      'href',
      '/cashflow/corrections/expected-expenses/new',
    )
    expect(screen.getByRole('button', { name: '재계산 실행' })).toBeEnabled()
  })
})
