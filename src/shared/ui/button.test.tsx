import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'
import { IconButton } from './icon-button'

describe('Button', () => {
  it('폼 안에서도 기본적으로 제출하지 않는 버튼으로 동작한다', () => {
    render(<Button>확인</Button>)

    expect(screen.getByRole('button', { name: '확인' })).toHaveAttribute('type', 'button')
  })

  it('비활성 상태에서는 클릭 동작을 실행하지 않는다', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        저장
      </Button>,
    )

    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it.each([
    ['primary', 'lg', 'bg-secondary-700', 'h-[42px]'],
    ['secondary', 'lg', 'bg-neutral-400', 'h-[42px]'],
    ['outline', 'md', 'border-primary-blue-900', 'h-9'],
    ['text', 'sm', 'border-b-neutral-700', 'h-[30px]'],
  ] as const)('%s 변형과 %s 크기의 디자인 규칙을 적용한다', (variant, size, tone, height) => {
    render(
      <Button size={size} variant={variant}>
        버튼
      </Button>,
    )

    expect(screen.getByRole('button', { name: '버튼' })).toHaveClass(tone, height)
  })
})

describe('IconButton', () => {
  it('아이콘에 접근 가능한 이름과 버튼 의미를 제공한다', () => {
    render(
      <IconButton aria-label="뒤로가기">
        <svg aria-hidden="true" />
      </IconButton>,
    )

    const button = screen.getByRole('button', { name: '뒤로가기' })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('size-6')
  })
})
