import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RecoveryPlanComparisonScreen } from './recovery-plan-comparison-screen'

describe('회복안 비교 화면', () => {
  it('Task 3과 같은 위험 요약과 TOP 3 원인을 표시한다', () => {
    render(<RecoveryPlanComparisonScreen />)

    expect(screen.getByRole('heading', { name: '회복안 비교' })).toBeInTheDocument()
    expect(screen.getByText('14일 후 · 6월 28일')).toBeInTheDocument()
    expect(screen.getByText('-230만 ~ -80만 원')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '주요 원인 TOP 3' })).toBeInTheDocument()
    expect(screen.getByText('1. 최근 8주 매출 감소')).toBeInTheDocument()
    expect(screen.getByText('2. 월말 임차료·원리금 집중')).toBeInTheDocument()
    expect(screen.getByText('3. 계절적 매출 회복 지연')).toBeInTheDocument()
  })

  it('기본 두 회복안을 선택하고 최대 두 개까지만 선택한다', () => {
    render(<RecoveryPlanComparisonScreen />)

    const repayment = screen.getByRole('button', { name: '상환조건 조정 상담' })
    const fixedCost = screen.getByRole('button', { name: '고정비 납부일 재배치' })
    const refinancing = screen.getByRole('button', { name: '대환 검토' })

    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(2)
    expect(screen.getByText('총 2건')).toHaveClass('text-primary-blue-800')
    expect(repayment).toHaveClass('border-primary-blue-700')
    fireEvent.click(refinancing)
    expect(refinancing).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(repayment)
    fireEvent.click(refinancing)
    expect(fixedCost).toHaveAttribute('aria-pressed', 'true')
    expect(refinancing).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(2)
  })

  it('회복안 card가 제목과 비교 정보를 접근 가능한 이름과 설명으로 제공한다', () => {
    render(<RecoveryPlanComparisonScreen />)

    const repayment = screen.getByRole('button', { name: '상환조건 조정 상담' })

    expect(repayment).toHaveAccessibleName('상환조건 조정 상담')
    expect(repayment).toHaveAccessibleDescription(/예상 효과.*부족일 최대 16일 연장 가능/)
    expect(repayment).toHaveAccessibleDescription(/월 부담 변화.*월 상환액 약 15만 원 감소 예상/)
    expect(repayment).toHaveAccessibleDescription(/상환조건.*원리금 3회 이상 정상 납부 이력/)
    expect(repayment).toHaveAccessibleDescription(
      /금융기관과 상환 조건을 조정할 수 있는지 확인합니다/,
    )
  })

  it('선택한 회복안 ID를 상담 예약 링크 query로 전달하고 고정비 회복안은 자체 실행으로 저장한다', () => {
    render(<RecoveryPlanComparisonScreen />)

    fireEvent.click(screen.getByRole('button', { name: '상환조건 조정 상담' }))
    fireEvent.click(screen.getByRole('button', { name: '대환 검토' }))

    expect(screen.getByRole('link', { name: '상담 예약하기' })).toHaveAttribute(
      'href',
      '/recovery/consultation?plans=fixed-cost-reschedule&plans=refinancing-review',
    )
    expect(screen.getByRole('link', { name: '지원사업 확인' })).toHaveAttribute(
      'href',
      '/recovery/support-programs',
    )
    expect(screen.getByRole('link', { name: '셀프 실행으로 저장' })).toHaveAttribute(
      'href',
      '/recovery/actions/fixed-cost-reschedule/save',
    )
    expect(screen.getByRole('button', { name: '확인 필요' })).toBeDisabled()
  })

  it('고정비 회복안을 선택하지 않으면 자체 실행 저장을 비활성화한다', () => {
    render(<RecoveryPlanComparisonScreen />)

    fireEvent.click(screen.getByRole('button', { name: '고정비 납부일 재배치' }))

    expect(screen.getByRole('button', { name: '셀프 실행으로 저장' })).toBeDisabled()
  })

  it('기준과 선택 회복안을 비교하고 상환조건으로 올바르게 표기한다', () => {
    render(<RecoveryPlanComparisonScreen />)

    expect(screen.getByRole('heading', { name: '시나리오 비교' })).toBeInTheDocument()
    expect(screen.getByText('기준')).toBeInTheDocument()
    expect(screen.getAllByText('상환조건 조정 상담').length).toBeGreaterThan(0)
    expect(screen.getAllByText('고정비 납부일 재배치').length).toBeGreaterThan(0)
    expect(screen.queryByText('상황조건')).not.toBeInTheDocument()
  })
})
