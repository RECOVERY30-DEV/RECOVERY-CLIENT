import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ConsentManagementScreen } from './consent-management-screen'
import { ConsentSetupScreen } from './consent-setup-screen'

describe('분석 동의 선택 화면', () => {
  it('모든 동의를 해제한 상태로 시작하고 분석 시작을 비활성화한다', () => {
    render(<ConsentSetupScreen />)

    expect(screen.getByRole('heading', { name: '분석 동의 선택' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '분석에 포함되는 데이터 범위 확인' })).toHaveAttribute(
      'href',
      '/data-scope',
    )
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '상담원 전송 동의' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '30·60·90일 사후 점검 동의' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: '분석 시작하기' })).toBeDisabled()
  })

  it('필수 동의를 선택하면 현금흐름 분석으로 이동할 수 있다', () => {
    render(<ConsentSetupScreen />)

    fireEvent.click(screen.getByRole('switch', { name: '서비스 분석 동의' }))

    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).toBeChecked()
    expect(screen.getByRole('link', { name: '분석 시작하기' })).toHaveAttribute('href', '/cashflow')
  })

  it('필수 동의를 다시 해제하면 확인창 없이 분석 시작을 비활성화한다', () => {
    render(<ConsentSetupScreen />)

    const analysisConsent = screen.getByRole('switch', { name: '서비스 분석 동의' })
    fireEvent.click(analysisConsent)
    fireEvent.click(analysisConsent)

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
    expect(followUpConsent).toBeChecked()
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: '분석 시작하기' })).toBeDisabled()
  })

  it('동의별 데이터 활용 범위 네 항목을 안내한다', () => {
    render(<ConsentSetupScreen />)

    expect(screen.getByRole('heading', { name: '데이터 활용 범위' })).toBeInTheDocument()
    expect(screen.getByText('분석 동의: 사업자 거래 내역, 보정값, 예측 결과')).toHaveClass(
      'text-secondary-300',
    )
    expect(
      screen.getByText(
        '상담원 전송 동의: Recovery Packet (위험 기록, 원인, 선택안, 질문, 준비서류)',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('사후 점검 동의: 실행 결과, 잔액 회복 여부, 연체 발생 여부'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('데이터는 개인별 추천 개선과 제도 연결 성과 분석에 활용'),
    ).toBeInTheDocument()
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

  it('철회 확인을 완료하면 모든 동의를 해제한다', () => {
    render(<ConsentManagementScreen />)

    fireEvent.click(screen.getByRole('switch', { name: '상담원 전송 동의' }))
    fireEvent.click(screen.getByRole('button', { name: '철회하기' }))
    expect(screen.getByRole('dialog', { name: '동의 철회 확인' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '철회' }))

    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '상담원 전송 동의' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '30·60·90일 사후 점검 동의' })).not.toBeChecked()
  })

  it('철회 확인창의 어두운 배경을 누르면 기존 동의를 유지하고 닫는다', () => {
    render(<ConsentManagementScreen />)

    fireEvent.click(screen.getByRole('button', { name: '철회하기' }))

    const dialog = screen.getByRole('dialog', { name: '동의 철회 확인' })
    fireEvent.click(dialog.parentElement!)

    expect(screen.queryByRole('dialog', { name: '동의 철회 확인' })).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).toBeChecked()
    expect(screen.getByRole('switch', { name: '30·60·90일 사후 점검 동의' })).toBeChecked()
  })
})
