import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Select } from './select'

describe('Select', () => {
  it('선택지를 표시하고 변경 이벤트를 전달한다', () => {
    const handleChange = vi.fn()
    render(
      <Select aria-label="지역" onChange={handleChange} placeholder="지역 선택">
        <option value="seoul">서울</option>
        <option value="busan">부산</option>
      </Select>,
    )

    const select = screen.getByRole('combobox', { name: '지역' })
    fireEvent.change(select, { target: { value: 'busan' } })

    expect(screen.getByRole('option', { name: '지역 선택' })).toHaveValue('')
    expect(select).toHaveValue('busan')
    expect(handleChange).toHaveBeenCalledOnce()
  })

  it('피그마 셀렉트의 높이와 테두리 규칙을 적용한다', () => {
    render(
      <Select aria-label="직군">
        <option value="finance">금융</option>
      </Select>,
    )

    expect(screen.getByRole('combobox', { name: '직군' })).toHaveClass(
      'h-9',
      'border-field',
      'bg-base-white',
    )
  })

  it('비활성 속성을 네이티브 셀렉트에 전달한다', () => {
    render(
      <Select aria-label="업종" disabled>
        <option value="service">서비스업</option>
      </Select>,
    )

    expect(screen.getByRole('combobox', { name: '업종' })).toBeDisabled()
  })
})
