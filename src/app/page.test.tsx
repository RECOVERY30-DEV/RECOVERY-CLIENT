import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Home from './page'

describe('스플래시 화면', () => {
  it('Recovery30 브랜드를 시작 화면으로 보여준다', () => {
    render(<Home />)

    expect(screen.getByRole('main', { name: 'Recovery30 시작 화면' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Recovery30' })).toBeInTheDocument()
  })
})
