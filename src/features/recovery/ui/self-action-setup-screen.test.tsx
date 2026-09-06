import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SelfActionSetupScreen } from './self-action-setup-screen'

describe('자체 실행 저장 화면', () => {
  it('선택한 자체 실행 회복안과 예상 효과를 표시한다', () => {
    render(<SelfActionSetupScreen />)

    expect(screen.getByRole('heading', { name: '자체 실행 저장' })).toBeInTheDocument()
    expect(screen.getByText('고정비 납부일 재배치')).toBeInTheDocument()
    expect(screen.getByText('8일')).toBeInTheDocument()
    expect(screen.getByText('20일')).toBeInTheDocument()
    expect(screen.getByText('-230만원')).toBeInTheDocument()
    expect(screen.getByText('+180만원')).toBeInTheDocument()
  })

  it('준비 항목을 모두 확인했을 때만 Recovery Packet으로 이동할 수 있다', () => {
    render(<SelfActionSetupScreen />)

    const rentSchedule = screen.getByRole('checkbox', {
      name: /임차인 협의 요청 예정일 입력/,
    })
    expect(rentSchedule).toBeChecked()
    expect(screen.getByRole('link', { name: '실행 계획 확인' })).toHaveAttribute(
      'href',
      '/recovery?plans=fixed-cost-reschedule',
    )

    fireEvent.click(rentSchedule)

    expect(screen.getByRole('button', { name: '실행 계획 확인' })).toBeDisabled()
    expect(screen.queryByRole('link', { name: '실행 계획 확인' })).not.toBeInTheDocument()
  })

  it('세 준비 항목과 다음 행동을 안내한다', () => {
    render(<SelfActionSetupScreen />)

    expect(screen.getByRole('checkbox', { name: /임차인 협의 요청 예정일 입력/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /자동이체 일정 확인/ })).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /원리금 납부일 은행 협의 예정일 입력/ }),
    ).toBeChecked()
    expect(screen.getByRole('heading', { name: '다음 행동 안내' })).toBeInTheDocument()
    expect(screen.queryByText('재배칱')).not.toBeInTheDocument()
  })
})
