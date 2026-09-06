import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { RecoveryFollowUpScreen } from './recovery-follow-up-screen'

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function followups() {
  return [
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
    {
      id: 3,
      checkpoint: 'D90',
      scheduledDate: '2025-10-13',
      status: 'SCHEDULED',
      forecastRunId: 1,
      packetId: null,
      hasResult: false,
    },
  ]
}

function followupResult() {
  return {
    scheduleId: 1,
    balanceRecovered: 'PARTIAL',
    delinquency: false,
    baselineBalance: -1280000,
    currentBalance: 360000,
    recoveryAmount: 1640000,
    latestForecastRunId: 1,
    riskStatus: 'STABLE',
    recordedAt: '2025-08-14T09:00:00Z',
  }
}

function executionStatuses() {
  return [
    {
      id: 1,
      recoveryOptionId: 1,
      status: 'IN_PROGRESS',
      blockerText: null,
      forecastRunId: 1,
      updatedAt: '2025-08-14T09:00:00Z',
    },
    {
      id: 2,
      recoveryOptionId: 3,
      status: 'BLOCKED',
      blockerText: '임대인 회신 지연',
      forecastRunId: 1,
      updatedAt: '2025-08-14T09:00:00Z',
    },
  ]
}

function stubFollowUpRequests(resultResponse: Response | null = apiResponse(followupResult())) {
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async (input) => {
      const path = new URL(input instanceof Request ? input.url : input.toString()).pathname

      if (path.endsWith('/followups')) return apiResponse(followups())
      if (path.endsWith('/result')) return resultResponse ?? apiResponse(followupResult())

      return apiResponse(executionStatuses())
    }),
  )
}

describe('사후점검 화면', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('실제 D30·D60·D90 일정, 부분 회복 결과와 실행 차단 사유를 표시한다', async () => {
    stubFollowUpRequests()
    renderWithQueryClient(
      <RecoveryFollowUpScreen client={createApiClient('https://api.example.com')} />,
    )

    expect(await screen.findByText('D30')).toBeInTheDocument()
    expect(screen.getByText('2025-08-14')).toBeInTheDocument()
    expect(screen.getByText('D60')).toBeInTheDocument()
    expect(screen.getByText('D90')).toBeInTheDocument()
    expect(await screen.findByText('부분 회복')).toBeInTheDocument()
    expect(screen.getByText('+₩1,640,000 회복')).toBeInTheDocument()
    expect(screen.getByText('안정 구간')).toBeInTheDocument()
    expect(screen.getByText('진행 중')).toBeInTheDocument()
    expect(screen.getByText('차단됨')).toBeInTheDocument()
    expect(screen.getByText('임대인 회신 지연')).toBeInTheDocument()
  })

  it('결과 조회가 FOLLOWUP_404_1이어도 일정과 실행 상태는 유지하고 결과 영역만 빈 상태로 처리한다', async () => {
    stubFollowUpRequests(
      Response.json(
        { success: false, data: null, error: { code: 'FOLLOWUP_404_1', message: '결과 없음' } },
        { status: 404 },
      ),
    )
    renderWithQueryClient(
      <RecoveryFollowUpScreen client={createApiClient('https://api.example.com')} />,
    )

    expect(await screen.findByText('결과가 아직 기록되지 않았습니다')).toBeInTheDocument()
    expect(screen.getByText('D60')).toBeInTheDocument()
    expect(screen.getByText('D90')).toBeInTheDocument()
    expect(screen.getByText('차단됨')).toBeInTheDocument()
    expect(screen.queryByText('부분 회복')).not.toBeInTheDocument()
  })

  it('동의는 화면 내에서 수정하지 않고 동의 관리 화면으로 연결한다', async () => {
    stubFollowUpRequests()
    renderWithQueryClient(
      <RecoveryFollowUpScreen client={createApiClient('https://api.example.com')} />,
    )

    expect(await screen.findByRole('link', { name: '동의 설정 변경' })).toHaveAttribute(
      'href',
      '/consents',
    )
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })
})
