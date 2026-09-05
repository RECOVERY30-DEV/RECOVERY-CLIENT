import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ConsentManagementScreen } from './consent-management-screen'
import { ConsentSetupScreen } from './consent-setup-screen'

describe('분석 동의 선택 화면', () => {
  it('분석 범위를 확인하고 필수 동의 상태에서 분석을 시작할 수 있다', () => {
    render(<ConsentSetupScreen />)

    expect(screen.getByRole('heading', { name: '분석 동의 선택' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '분석에 포함되는 데이터 범위 확인' })).toHaveAttribute(
      'href',
      '/data-scope',
    )
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).toBeChecked()
    expect(screen.getByRole('switch', { name: '상담원 전송 동의' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '30·60·90일 사후 점검 동의' })).toBeChecked()
    expect(screen.getByRole('link', { name: '분석 시작하기' })).toHaveAttribute('href', '/home')
  })

  it('필수 동의 철회를 취소하면 동의와 분석 시작 상태를 유지한다', () => {
    render(<ConsentSetupScreen />)

    fireEvent.click(screen.getByRole('switch', { name: '서비스 분석 동의' }))

    expect(screen.getByRole('dialog', { name: '동의 철회 확인' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    expect(screen.queryByRole('dialog', { name: '동의 철회 확인' })).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).toBeChecked()
    expect(screen.getByRole('link', { name: '분석 시작하기' })).toHaveAttribute('href', '/home')
  })

  it('필수 동의를 철회하면 분석 시작을 비활성화한다', () => {
    render(<ConsentSetupScreen />)

    fireEvent.click(screen.getByRole('switch', { name: '서비스 분석 동의' }))
    fireEvent.click(screen.getByRole('button', { name: '철회' }))

    expect(screen.queryByRole('dialog', { name: '동의 철회 확인' })).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: '분석 시작하기' })).toBeDisabled()
  })

  it('선택 동의는 필수 동의와 독립적으로 변경한다', () => {
    render(<ConsentSetupScreen />)

    const counselorConsent = screen.getByRole('switch', { name: '상담원 전송 동의' })
    const followUpConsent = screen.getByRole('switch', {
      name: '30·60·90일 사후 점검 동의',
    })

    fireEvent.click(counselorConsent)
    fireEvent.click(followUpConsent)

    expect(counselorConsent).toBeChecked()
    expect(followUpConsent).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).toBeChecked()
  })
})

describe('동의 관리 화면', () => {
  it('현재 동의 내역과 데이터 활용 범위를 제공한다', () => {
    render(<ConsentManagementScreen />)

    expect(screen.getByRole('heading', { name: '동의 철회 안내' })).toBeInTheDocument()
    expect(screen.getByText('최종 동의 변경일: 2025년 1월 15일')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '데이터 활용 범위' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toHaveAttribute('href', '/home')
  })

  it('철회 확인을 완료하면 필수 분석 동의를 해제한다', () => {
    render(<ConsentManagementScreen />)

    fireEvent.click(screen.getByRole('button', { name: '철회하기' }))
    expect(screen.getByRole('dialog', { name: '동의 철회 확인' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '철회' }))

    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).not.toBeChecked()
  })
})
