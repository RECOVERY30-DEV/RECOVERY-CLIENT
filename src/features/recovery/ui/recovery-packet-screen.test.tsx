import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RecoveryPacketScreen } from './recovery-packet-screen'

describe('Recovery Packet 화면', () => {
  it('기준 위험 요약과 보정값 및 부족 원인을 표시한다', () => {
    render(<RecoveryPacketScreen selectedOptionIds={['fixed-cost-reschedule']} />)

    expect(screen.getByRole('heading', { name: 'Recovery Packet' })).toBeInTheDocument()
    expect(screen.getByText('v2 · 2025-07-14 생성')).toBeInTheDocument()
    expect(screen.getByText('14일 후 · 6월 28일')).toBeInTheDocument()
    expect(screen.getByText('-230만 ~ -80만 원')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '보정값 및 부족 원인' })).toBeInTheDocument()
    expect(screen.getByText('현금매출 추가 입력')).toBeInTheDocument()
    expect(screen.getByText('최근 8주 매출 감소')).toBeInTheDocument()
  })

  it('선택한 회복안의 준비 항목과 다음 행동을 표시한다', () => {
    render(<RecoveryPacketScreen selectedOptionIds={['fixed-cost-reschedule']} />)

    const selectedActions = screen
      .getByRole('heading', { name: '선택한 회복안' })
      .closest('section')
    expect(selectedActions).not.toBeNull()
    expect(screen.getByRole('heading', { name: '고정비 납부일 재배치' })).toBeInTheDocument()
    expect(screen.getByText('임차계약서 확인, 임대인 협의')).toBeInTheDocument()
    expect(within(selectedActions!).getByText('직접 실행 준비 가능')).toBeInTheDocument()
    expect(screen.queryByText('상황조건')).not.toBeInTheDocument()
  })

  it('Packet 상태와 사후점검 일정을 제공한다', () => {
    render(<RecoveryPacketScreen selectedOptionIds={['fixed-cost-reschedule']} />)

    expect(screen.getByRole('heading', { name: 'Packet 버전 및 전송 상태' })).toBeInTheDocument()
    expect(screen.getByText('전송 전')).toBeInTheDocument()
    expect(screen.getByText('선택한 회복안 요약')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '사후 점검 일정' })).toBeInTheDocument()
    expect(screen.getByText('2025-08-13 예정')).toBeInTheDocument()
    expect(screen.getByText('2025-09-12 예정')).toBeInTheDocument()
    expect(screen.getByText('2025-10-12 예정')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '최신 사후점검 확인' })).toHaveAttribute(
      'href',
      '/recovery/follow-up?plans=fixed-cost-reschedule',
    )
    expect(screen.getByRole('link', { name: '최신 사후점검 확인' })).toHaveClass(
      'focus-visible:ring-primary-blue-800',
    )
    expect(screen.getByRole('link', { name: '회복안' })).toHaveAttribute('aria-current', 'page')
  })
})
