import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RecoveryFollowUpScreen } from './recovery-follow-up-screen'

describe('사후점검 화면', () => {
  it('30·60·90일 점검 상태와 다음 점검일을 표시한다', () => {
    render(<RecoveryFollowUpScreen />)

    expect(screen.getByRole('heading', { name: '실행 상태 점검' })).toBeInTheDocument()
    expect(screen.getByText('마지막 점검 2025년 6월 23일')).toBeInTheDocument()
    const milestones = screen
      .getByRole('heading', { name: '30·60·90일 점검 현황' })
      .closest('section')
    expect(milestones).not.toBeNull()
    expect(within(milestones!).getByText('30일')).toBeInTheDocument()
    expect(within(milestones!).getAllByText('완료')).toHaveLength(2)
    expect(within(milestones!).getByText('90일')).toBeInTheDocument()
    expect(within(milestones!).getByText('예정')).toBeInTheDocument()
    expect(screen.getByText('2025년 9월 23일')).toBeInTheDocument()
  })

  it('잔액 회복, 회복안 실행 상태와 최신 위험을 표시한다', () => {
    render(<RecoveryFollowUpScreen />)

    expect(screen.getByText('회복 완료')).toBeInTheDocument()
    expect(screen.getByText('없음')).toBeInTheDocument()
    expect(screen.getByText('+₩2,400,000 회복')).toBeInTheDocument()
    expect(screen.getByText('상환조건 조정 상담')).toBeInTheDocument()
    expect(screen.getByText('고정비 납부일 재배치')).toBeInTheDocument()
    expect(screen.getByText('안정 구간')).toBeInTheDocument()
    expect(screen.getByText('₩1,200,000')).toBeInTheDocument()
    expect(screen.getByText('₩3,800,000')).toBeInTheDocument()
    expect(screen.queryByText('위험 수전')).not.toBeInTheDocument()
  })

  it('Packet에서 전달한 회복안의 실행 상태만 표시한다', () => {
    render(<RecoveryFollowUpScreen selectedOptionIds={['fixed-cost-reschedule']} />)

    expect(screen.getByText('고정비 납부일 재배치')).toBeInTheDocument()
    expect(screen.queryByText('상환조건 조정 상담')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Recovery Packet으로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery?plans=fixed-cost-reschedule',
    )
  })

  it('사후점검 동의를 화면 안에서 변경하고 회복안 경로를 제공한다', () => {
    render(<RecoveryFollowUpScreen />)

    const reminder = screen.getByRole('switch', { name: '30-60-90일 점검 알림' })
    const improvement = screen.getByRole('switch', { name: '결과 개선 활용 동의' })
    expect(reminder).toBeChecked()
    expect(improvement).toBeChecked()

    fireEvent.click(improvement)
    expect(improvement).not.toBeChecked()
    expect(screen.getByRole('link', { name: '회복안' })).toHaveAttribute('aria-current', 'page')
  })
})
