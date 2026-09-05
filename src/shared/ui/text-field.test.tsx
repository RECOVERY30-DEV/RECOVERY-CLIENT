import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Input } from './input'
import { Textarea } from './textarea'

describe('Input', () => {
  it('네이티브 입력 속성과 변경 이벤트를 전달한다', () => {
    const handleChange = vi.fn()
    render(<Input aria-label="매출액" name="sales" onChange={handleChange} />)

    const input = screen.getByRole('textbox', { name: '매출액' })
    fireEvent.change(input, { target: { value: '1000000' } })

    expect(input).toHaveAttribute('name', 'sales')
    expect(input).toHaveValue('1000000')
    expect(handleChange).toHaveBeenCalledOnce()
  })

  it('피그마 입력 상자의 기본 높이와 색상 규칙을 적용한다', () => {
    render(<Input aria-label="이름" placeholder="내용 입력" />)

    expect(screen.getByRole('textbox', { name: '이름' })).toHaveClass(
      'h-[38px]',
      'border-disabled-50',
      'bg-base-white',
    )
  })
})

describe('Textarea', () => {
  it('여러 줄 입력값과 변경 이벤트를 전달한다', () => {
    const handleChange = vi.fn()
    render(<Textarea aria-label="사전 질문" onChange={handleChange} />)

    const textarea = screen.getByRole('textbox', { name: '사전 질문' })
    fireEvent.change(textarea, { target: { value: '상담에서 확인할 내용' } })

    expect(textarea).toHaveValue('상담에서 확인할 내용')
    expect(handleChange).toHaveBeenCalledOnce()
  })

  it('피그마 여러 줄 입력 상자의 최소 높이와 배경색을 적용한다', () => {
    render(<Textarea aria-label="설명" />)

    expect(screen.getByRole('textbox', { name: '설명' })).toHaveClass(
      'min-h-[82px]',
      'bg-neutral-100',
    )
  })
})
