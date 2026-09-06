import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('라벨을 접근 가능한 이름으로 연결하고 선택 상태를 변경한다', () => {
    render(<Checkbox label="현금흐름 Snapshot" />)

    const checkbox = screen.getByRole('checkbox', { name: '현금흐름 Snapshot' })
    fireEvent.click(screen.getByText('현금흐름 Snapshot'))

    expect(checkbox).toBeChecked()
  })

  it('보조 설명과 피그마 카드 배경을 제공한다', () => {
    render(
      <Checkbox description="매출, 지출 및 가용 현금을 포함합니다." label="현금흐름 Snapshot" />,
    )

    const container = screen.getByText('현금흐름 Snapshot').closest('div')

    expect(screen.getByText('매출, 지출 및 가용 현금을 포함합니다.')).toHaveClass(
      'text-secondary-300',
    )
    expect(container).toHaveClass('bg-neutral-400')
    const checkbox = screen.getByRole('checkbox', { name: '현금흐름 Snapshot' })
    expect(checkbox.closest('label')).toBeNull()
    expect(checkbox.parentElement).toHaveClass('has-[:focus-visible]:ring-primary-blue-800')
  })

  it('외부 접근성 설명과 이름 속성을 보존한다', () => {
    render(
      <>
        <span id="external-label">외부 체크박스 이름</span>
        <span id="external-help">필수 선택 항목입니다.</span>
        <Checkbox
          aria-describedby="external-help"
          aria-labelledby="external-label"
          description="세부 설명"
          label="내부 라벨"
        />
      </>,
    )

    const checkbox = screen.getByRole('checkbox', { name: '외부 체크박스 이름' })
    const describedBy = checkbox.getAttribute('aria-describedby')?.split(' ')

    expect(describedBy).toContain('external-help')
    expect(describedBy).toHaveLength(2)
  })

  it('제어된 선택 상태에 맞는 아이콘 하나만 표시한다', () => {
    const { container, rerender } = render(
      <Checkbox checked={false} label="재무 상태" onChange={() => undefined} />,
    )

    expect(container.querySelectorAll('svg')).toHaveLength(1)
    expect(container.querySelector('path')).toHaveAttribute('fill', '#E0E0E0')

    rerender(<Checkbox checked label="재무 상태" onChange={() => undefined} />)

    expect(container.querySelectorAll('svg')).toHaveLength(1)
    expect(container.querySelector('path')).toHaveAttribute('fill', '#185B80')
  })

  it('비활성 상태에서는 선택 상태를 변경하지 않는다', () => {
    render(<Checkbox disabled label="재무비율" />)

    const checkbox = screen.getByRole('checkbox', { name: '재무비율' })
    checkbox.click()

    expect(checkbox).toBeDisabled()
    expect(checkbox).not.toBeChecked()
  })
})
