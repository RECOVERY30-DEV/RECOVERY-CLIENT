import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Switch } from './switch'

describe('Switch', () => {
  it('스위치 의미와 라벨을 연결하고 상태를 변경한다', () => {
    render(<Switch label="마케팅 정보 수신" />)

    const switchControl = screen.getByRole('switch', { name: '마케팅 정보 수신' })
    fireEvent.click(screen.getByText('마케팅 정보 수신'))

    expect(switchControl).toBeChecked()
    expect(switchControl.closest('label')).toBeNull()
  })

  it('초기 선택 상태와 네이티브 속성을 전달한다', () => {
    render(<Switch defaultChecked label="이메일 알림" name="email-notification" />)

    const switchControl = screen.getByRole('switch', { name: '이메일 알림' })

    expect(switchControl).toBeChecked()
    expect(switchControl).toHaveAttribute('name', 'email-notification')
  })

  it('SVG 인라인 표시 속성과 관계없이 꺼짐과 켜짐 아이콘을 상태별로 전환한다', () => {
    const { container } = render(<Switch label="앱 알림" />)
    const [offIconContainer, onIconContainer] = container.querySelectorAll(
      'input[role="switch"] ~ span',
    )

    expect(offIconContainer).toHaveClass('block', 'peer-checked:hidden')
    expect(onIconContainer).toHaveClass('hidden', 'peer-checked:block')
  })

  it('비활성 상태에서는 상태를 변경하지 않는다', () => {
    render(<Switch disabled label="문자 알림" />)

    const switchControl = screen.getByRole('switch', { name: '문자 알림' })
    switchControl.click()

    expect(switchControl).toBeDisabled()
    expect(switchControl).not.toBeChecked()
  })
})
