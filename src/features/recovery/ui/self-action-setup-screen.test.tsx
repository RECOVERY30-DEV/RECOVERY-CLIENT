import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { SelfActionPlan } from '../self-action/api/self-action-contract'

import { SelfActionSetupScreen } from './self-action-setup-screen'

const mocks = vi.hoisted(() => ({
  create: { isError: false, isPending: false, mutate: vi.fn() },
  update: { isError: false, isPending: false, mutate: vi.fn(), reset: vi.fn() },
  setup: {
    plans: { data: [] as readonly SelfActionPlan[], isError: false, refetch: vi.fn() },
    recoveryOptions: {
      data: [{ optionId: 2, category: 'SELF_ACTION', expectedEffectText: '월말 집중 부담 분산' }],
      isError: false,
      refetch: vi.fn(),
    },
  },
}))

vi.mock('@/features/forecast', () => ({
  useForecastSummaryQueries: () => ({
    latest: { data: { forecastRunId: 1 }, isError: false, refetch: vi.fn() },
  }),
}))

vi.mock('../self-action/queries/self-action-queries', () => ({
  useCreateSelfActionPlanMutation: () => mocks.create,
  useSelfActionSetupQueries: () => mocks.setup,
  useUpdateSelfActionItemMutation: () => mocks.update,
}))

describe('자체 실행 저장 화면', () => {
  it('계획이 없으면 SELF_ACTION 회복안 ID와 준비 항목으로 저장 요청한다', () => {
    render(<SelfActionSetupScreen />)
    fireEvent.click(screen.getByRole('button', { name: '실행 계획 저장하기' }))

    expect(mocks.create.mutate).toHaveBeenCalledWith({
      recoveryOptionId: 2,
      expectedEffectText: '월말 집중 부담 분산',
      items: [
        { title: '임대인에게 납부일 조정 요청하기' },
        { title: '자동이체 일정 확인' },
        { title: '원리금 납부일 은행 협의하기' },
      ],
    })
  })

  it('계획의 준비 항목 완료 상태와 메모를 API 데이터로 표시하고 토글한다', () => {
    mocks.setup.plans.data = [
      {
        id: 5,
        recoveryOptionId: 2,
        expectedEffectText: '월말 집중 부담 분산',
        status: 'ACTIVE',
        savedAt: '2025-07-14T00:00:00Z',
        items: [
          {
            id: 11,
            title: '임대인 협의',
            targetDate: '2025-07-18',
            status: 'DONE',
            memo: '전화 예정',
          },
        ],
      },
    ]
    render(<SelfActionSetupScreen />)

    const checkbox = screen.getByRole('checkbox', { name: /임대인 협의/ })
    expect(checkbox).toBeChecked()
    expect(screen.getByText('메모: 전화 예정')).toBeInTheDocument()
    fireEvent.click(checkbox)

    expect(mocks.update.mutate).toHaveBeenCalledWith({ itemId: 11, input: { status: 'PENDING' } })
  })
})
