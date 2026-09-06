import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RecoveryOptionView, RecoveryScenario } from '../api/recovery-option-contract'
import { RecoveryPlanComparisonScreen } from './recovery-plan-comparison-screen'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetchOptions: vi.fn(),
  refetchScenarios: vi.fn(),
  resetMutation: vi.fn(),
  useForecastSummaryQueries: vi.fn(),
  useRecoveryOptionQueries: vi.fn(),
  useSaveRecoveryOptionSelectionsMutation: vi.fn(),
}))

vi.mock('@/features/forecast', () => ({
  useForecastSummaryQueries: mocks.useForecastSummaryQueries,
}))

vi.mock('../queries/recovery-option-queries', () => ({
  useRecoveryOptionQueries: mocks.useRecoveryOptionQueries,
  useSaveRecoveryOptionSelectionsMutation: mocks.useSaveRecoveryOptionSelectionsMutation,
}))

const recoveryOptions: readonly RecoveryOptionView[] = [
  {
    optionId: 1,
    optionCode: 'REPAYMENT_ADJUST',
    category: 'FINANCIAL_CONSULT',
    expectedEffectText: '부족일 최대 16일 연장 가능',
    monthlyBurdenChangeText: '월 상환액 약 15만 원 감소 예상',
    preconditionText: '원리금 3회 이상 정상 납부 이력',
    difficulty: 'LOW',
    requiresReview: true,
    disclaimer: '승인 여부와 조건은 금융기관 심사 결과에 따릅니다.',
    selected: true,
  },
  {
    optionId: 3,
    optionCode: 'FIXED_COST_RESCHEDULE',
    category: 'SELF_ACTION',
    expectedEffectText: '월말 부족 위험 완화 가능',
    monthlyBurdenChangeText: '월 부담 총액은 유지',
    preconditionText: '임차료·공과금 납부일 협의 가능',
    difficulty: 'LOW',
    requiresReview: false,
    disclaimer: '거래처 협의 결과에 따라 달라질 수 있습니다.',
    selected: false,
  },
  {
    optionId: 7,
    optionCode: 'REFINANCING_REVIEW',
    category: 'FINANCIAL_CONSULT',
    expectedEffectText: '월 상환 부담 조정 가능',
    monthlyBurdenChangeText: '심사 결과에 따라 달라짐',
    preconditionText: '금리·중도상환 조건 비교 필요',
    difficulty: 'HIGH',
    requiresReview: true,
    disclaimer: '금융기관 심사 결과에 따라 달라질 수 있습니다.',
    selected: false,
  },
]

const scenarios: readonly RecoveryScenario[] = [
  {
    scenarioId: 1,
    scenarioType: 'BASELINE',
    firstShortfallDate: '2025-05-14',
    minBalance: -1240000,
    deltaDays: null,
    deltaMinBalance: null,
    monthlyPaymentDelta: null,
    note: '현재 현금흐름 예측을 유지합니다.',
    appliedOptionIds: [],
  },
  {
    scenarioId: 2,
    scenarioType: 'SIMULATED',
    firstShortfallDate: '2025-05-30',
    minBalance: -630000,
    deltaDays: 16,
    deltaMinBalance: 610000,
    monthlyPaymentDelta: -150000,
    note: '상담 및 심사 결과에 따라 실제 효과는 달라질 수 있습니다.',
    appliedOptionIds: [1],
  },
]

function setSuccessfulQueries() {
  mocks.useForecastSummaryQueries.mockReturnValue({ latest: { data: { forecastRunId: 4821 } } })
  mocks.useRecoveryOptionQueries.mockReturnValue({
    recoveryOptions: { data: recoveryOptions, isError: false, refetch: mocks.refetchOptions },
    scenarios: { data: scenarios, isError: false, refetch: mocks.refetchScenarios },
  })
  mocks.useSaveRecoveryOptionSelectionsMutation.mockReturnValue({
    mutate: mocks.mutate,
    isError: false,
    isPending: false,
    reset: mocks.resetMutation,
  })
}

describe('회복안 비교 화면', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setSuccessfulQueries()
  })

  it('API 회복안의 선택 상태와 비교 정보를 표시한다', async () => {
    render(<RecoveryPlanComparisonScreen />)

    await waitFor(() => expect(screen.getByText('총 1건')).toBeInTheDocument())

    const repayment = screen.getByRole('button', { name: '상환조건 조정 상담' })
    expect(repayment).toHaveAttribute('aria-pressed', 'true')
    expect(repayment).toHaveAccessibleDescription(/예상 효과.*부족일 최대 16일 연장 가능/)
    expect(repayment).toHaveAccessibleDescription(/월 부담 변화.*월 상환액 약 15만 원 감소 예상/)
    expect(repayment).toHaveAccessibleDescription(/사전 조건.*원리금 3회 이상 정상 납부 이력/)
    expect(screen.getByText('기준')).toBeInTheDocument()
    expect(screen.getByText(/기준 시나리오 · 최저 잔액 -1,240,000원/)).toBeInTheDocument()
    expect(screen.queryByText(/부족일 null일 지연/)).not.toBeInTheDocument()
    expect(screen.getAllByText('상환조건 조정 상담')).toHaveLength(2)
    expect(screen.getByText(/부족일 16일 지연/)).toBeInTheDocument()
  })

  it('선택 변경을 저장 API에 전달하고 최대 두 개까지만 허용한다', async () => {
    render(<RecoveryPlanComparisonScreen />)

    await waitFor(() => expect(screen.getByText('총 1건')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: '고정비 납부일 재배치' }))
    expect(mocks.mutate).toHaveBeenLastCalledWith([1, 3])

    fireEvent.click(screen.getByRole('button', { name: '대환 검토' }))
    expect(mocks.mutate).toHaveBeenCalledTimes(1)
  })

  it('조회 실패 시 재시도 동작을 제공한다', () => {
    mocks.useRecoveryOptionQueries.mockReturnValue({
      recoveryOptions: {
        data: undefined,
        isError: true,
        refetch: mocks.refetchOptions,
      },
      scenarios: { data: undefined, isError: false, refetch: mocks.refetchScenarios },
    })

    render(<RecoveryPlanComparisonScreen />)

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(mocks.refetchOptions).toHaveBeenCalledTimes(1)
  })

  it('선택한 숫자 회복안 ID를 상담 예약 경로로 전달한다', async () => {
    render(<RecoveryPlanComparisonScreen />)

    await waitFor(() =>
      expect(screen.getByRole('link', { name: '상담 예약하기' })).toBeInTheDocument(),
    )

    fireEvent.click(screen.getByRole('button', { name: '고정비 납부일 재배치' }))

    expect(screen.getByRole('link', { name: '상담 예약하기' })).toHaveAttribute(
      'href',
      '/recovery/consultation?plans=1&plans=3',
    )
    expect(screen.getByRole('link', { name: '지원사업 확인' })).toHaveAttribute(
      'href',
      '/recovery/support-programs',
    )
  })
})
