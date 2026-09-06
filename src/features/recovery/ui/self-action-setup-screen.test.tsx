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
    expect(screen.getByText('-240만 원')).toBeInTheDocument()
    expect(screen.getByText('-180만 원')).toBeInTheDocument()
    expect(screen.getByTestId('self-action-effect-grid')).toHaveClass(
      'grid-cols-1',
      'min-[360px]:grid-cols-2',
    )
  })

  it('모든 준비 항목을 확인해야 실행 계획을 저장할 수 있다', () => {
    render(<SelfActionSetupScreen />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    checkboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked())
    expect(screen.getByRole('button', { name: '실행 계획 저장하기' })).toBeDisabled()

    checkboxes.forEach((checkbox) => fireEvent.click(checkbox))

    expect(screen.getByRole('button', { name: '실행 계획 저장하기' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: '실행 계획 저장하기' }))

    expect(screen.getByRole('button', { name: '저장 완료' })).toBeDisabled()
    checkboxes.forEach((checkbox) => expect(checkbox).toBeDisabled())
    expect(screen.getByRole('link', { name: 'Recovery Packet 확인하기' })).toHaveAttribute(
      'href',
      '/recovery?plans=fixed-cost-reschedule',
    )
    expect(screen.getByRole('link', { name: 'Recovery Packet 확인하기' })).toHaveClass(
      'focus-visible:ring-primary-blue-800',
    )
  })

  it('세 준비 항목과 다음 행동을 안내한다', () => {
    render(<SelfActionSetupScreen />)

    expect(
      screen.getByRole('checkbox', { name: /임대인에게 납부일 조정 요청하기/ }),
    ).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /자동이체 일정 확인/ })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /원리금 납부일 은행 협의하기/ })).not.toBeChecked()
    expect(screen.queryByText(/예정일 입력/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '다음 행동 안내' })).toBeInTheDocument()
    expect(screen.getByText(/새로고침하면 초기화됩니다/)).toBeInTheDocument()
    expect(screen.queryByText('재배칱')).not.toBeInTheDocument()
  })
})
