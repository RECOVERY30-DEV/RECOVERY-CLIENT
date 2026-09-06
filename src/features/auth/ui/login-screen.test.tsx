import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LoginScreen } from './login-screen'

const replaceMock = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

describe('로그인 화면', () => {
  afterEach(() => {
    replaceMock.mockReset()
  })

  it('이메일과 비밀번호를 입력할 수 있는 로그인 폼을 제공한다', () => {
    render(<LoginScreen />)

    expect(screen.getByRole('heading', { name: 'Recovery30 로그인' })).toBeInTheDocument()
    expect(screen.getByText('현금흐름 위험을 분석부터 회복까지 Recovery30')).toBeInTheDocument()

    const emailInput = screen.getByRole('textbox', { name: '이메일' })
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autocomplete', 'email')
    expect(emailInput).toHaveClass('placeholder:text-neutral-600')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
    expect(passwordInput).toHaveClass('placeholder:text-neutral-600')
    expect(submitButton).toHaveAttribute('type', 'submit')
    expect(passwordInput.closest('label')).toHaveClass('mt-[13px]')
    expect(submitButton).toHaveClass('mt-7')
    expect(screen.getByRole('navigation', { name: '계정 도움말' })).toHaveClass('mt-1')
  })

  it('계정 생성과 계정 복구의 후속 경로를 안내한다', () => {
    render(<LoginScreen />)

    expect(screen.getByRole('link', { name: '계정생성' })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: '계정을 잃어버리셨나요?' })).toHaveAttribute(
      'href',
      '/account-recovery',
    )
    expect(screen.getByRole('link', { name: '계정을 잃어버리셨나요?' })).toHaveClass(
      'text-neutral-700',
    )
  })

  it('입력값이 없어도 로그인 버튼을 누르면 홈으로 이동한다', () => {
    render(<LoginScreen />)

    const submitButton = screen.getByRole('button', { name: '로그인' })

    fireEvent.click(submitButton)

    expect(replaceMock).toHaveBeenCalledOnce()
    expect(replaceMock).toHaveBeenCalledWith('/home')
  })
})
