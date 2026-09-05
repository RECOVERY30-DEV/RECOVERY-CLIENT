import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoginScreen } from './login-screen'

describe('로그인 화면', () => {
  it('이메일과 비밀번호를 입력할 수 있는 필수 로그인 폼을 제공한다', () => {
    render(<LoginScreen />)

    expect(screen.getByRole('heading', { name: 'Recovery30 로그인' })).toBeInTheDocument()
    expect(screen.getByText('현금흐름 위험을 분석부터 회복까지 Recovery30')).toBeInTheDocument()

    const emailInput = screen.getByRole('textbox', { name: '이메일' })
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autocomplete', 'email')
    expect(emailInput).toBeRequired()
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
    expect(passwordInput).toBeRequired()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('계정 생성과 계정 복구의 후속 경로를 안내한다', () => {
    render(<LoginScreen />)

    expect(screen.getByRole('link', { name: '계정생성' })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: '계정을 잃어버리셨나요?' })).toHaveAttribute(
      'href',
      '/account-recovery',
    )
  })

  it('API 연결 전에는 로그인 제출로 페이지 이동을 발생시키지 않는다', () => {
    render(<LoginScreen />)

    const loginForm = screen.getByRole('form', { name: '로그인' })

    expect(fireEvent.submit(loginForm)).toBe(false)
  })
})
