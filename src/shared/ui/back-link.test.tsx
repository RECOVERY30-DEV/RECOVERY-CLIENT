import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BackLink } from './back-link'

describe('뒤로가기 링크', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('이전 방문 기록이 있으면 고정 경로보다 브라우저 뒤로가기를 우선한다', () => {
    window.history.pushState({}, '', '/cashflow')
    window.history.pushState({}, '', '/data-scope')
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)

    render(<BackLink href="/home" label="이전 화면으로 돌아가기" />)
    fireEvent.click(screen.getByRole('link', { name: '이전 화면으로 돌아가기' }))

    expect(back).toHaveBeenCalledOnce()
  })

  it('새 탭을 여는 보조키 클릭은 브라우저 기본 동작을 유지한다', () => {
    window.history.pushState({}, '', '/cashflow')
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)

    render(<BackLink href="#fallback" label="이전 화면으로 돌아가기" />)
    fireEvent.click(screen.getByRole('link', { name: '이전 화면으로 돌아가기' }), {
      metaKey: true,
    })

    expect(back).not.toHaveBeenCalled()
  })
})
