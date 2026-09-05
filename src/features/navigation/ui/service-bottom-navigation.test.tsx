import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ServiceBottomNavigation } from './service-bottom-navigation'

describe('서비스 하단 내비게이션', () => {
  it('주요 서비스 경로를 제공하고 현재 경로를 표시한다', () => {
    render(<ServiceBottomNavigation activeItem="manage" />)

    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/home')
    expect(screen.getByRole('link', { name: '현금흐름' })).toHaveAttribute('href', '/cashflow')
    expect(screen.getByRole('link', { name: '회복안' })).toHaveAttribute('href', '/recovery')
    expect(screen.getByRole('link', { name: '관리' })).toHaveAttribute('href', '/consents')
    expect(screen.getByRole('link', { name: '관리' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '홈' })).not.toHaveAttribute('aria-current')
  })
})
