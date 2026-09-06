import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Home from './page'

const replaceMock = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

describe('스플래시 화면', () => {
  afterEach(() => {
    vi.useRealTimers()
    replaceMock.mockReset()
  })

  it('Recovery30 브랜드를 시작 화면으로 보여준다', () => {
    render(<Home />)

    expect(screen.getByRole('main', { name: 'Recovery30 시작 화면' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Recovery30' })).toBeInTheDocument()
  })

  it('1.5초 동안 스플래시를 보여준 뒤 로그인 화면으로 이동한다', () => {
    vi.useFakeTimers()
    render(<Home />)

    act(() => vi.advanceTimersByTime(1499))
    expect(replaceMock).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(replaceMock).toHaveBeenCalledOnce()
    expect(replaceMock).toHaveBeenCalledWith('/login')
  })
})
