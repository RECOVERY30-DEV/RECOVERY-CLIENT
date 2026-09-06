import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RecoveryActionSaveScreen } from './recovery-action-save-screen'
import { RecoveryFollowUpScreen } from './recovery-follow-up-screen'
import { RecoveryPacketScreen } from './recovery-packet-screen'

describe('자체 실행 저장 화면', () => {
  it('필수 준비 항목을 모두 확인한 뒤 로컬 저장 완료 상태로 전환한다', () => {
    render(<RecoveryActionSaveScreen />)

    const saveButton = screen.getByRole('button', { name: '실행 계획 저장하기' })

    expect(saveButton).toBeDisabled()
    expect(screen.getByText('고정비 납부일 재배치')).toBeInTheDocument()
    expect(screen.getByText('임대인에게 납부일 조정 요청하기')).toBeInTheDocument()
    expect(screen.queryByText(/예정일 입력/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: '임대인에게 납부일 조정 요청하기' }))
    fireEvent.click(screen.getByRole('checkbox', { name: '자동이체 일정 확인하기' }))
    fireEvent.click(screen.getByRole('checkbox', { name: '은행에 원리금 납부일 변경을 문의하기' }))
    fireEvent.click(saveButton)

    expect(screen.getByRole('status')).toHaveTextContent('저장 완료')
    expect(screen.getByRole('checkbox', { name: '임대인에게 납부일 조정 요청하기' })).toBeDisabled()
    expect(screen.getByText('저장 후에는 준비 항목을 변경할 수 없습니다.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Recovery Packet 확인하기' })).toHaveAttribute(
      'href',
      '/recovery',
    )
  })

  it('단일 fixture와 일치하는 전후 비교 및 다음 행동을 제공한다', () => {
    render(<RecoveryActionSaveScreen />)

    expect(screen.getByText('8일')).toBeInTheDocument()
    expect(screen.getByText('20일')).toBeInTheDocument()
    expect(screen.getByText('-240만 원')).toBeInTheDocument()
    expect(screen.getByText('-180만 원')).toBeInTheDocument()
    expect(screen.getByText('예상 효과: 첫 부족일 +12일 연장')).toBeInTheDocument()
  })
})

describe('Recovery Packet 화면', () => {
  it('위험, 선택 회복안, 전송 및 사후점검 정보를 일관된 값으로 보여준다', () => {
    render(<RecoveryPacketScreen />)

    expect(screen.getByRole('heading', { name: 'Recovery Packet' })).toBeInTheDocument()
    expect(screen.getByText('-240만 원 ~ -180만 원')).toBeInTheDocument()
    expect(screen.getByText('부족 위험')).toBeInTheDocument()
    expect(screen.getByText('현재 버전')).toBeInTheDocument()
    expect(screen.getAllByText('상환조건 조정 상담').length).toBeGreaterThan(0)
    expect(screen.getAllByText('고정비 납부일 재배치').length).toBeGreaterThan(0)
    expect(screen.getByText('다음 점검 2025-10-12')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '30·60·90일 사후점검 보기' })).toHaveAttribute(
      'href',
      '/recovery/follow-up',
    )
    expect(screen.queryByText(/재시도/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '지원사업 확인' })).toHaveAttribute(
      'href',
      '/recovery/support-programs',
    )
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toHaveTextContent('회복안')
    expect(screen.getByRole('link', { name: '회복안' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('현금매출 추가 입력')).toBeInTheDocument()
    expect(screen.getByText('+65만 원')).toBeInTheDocument()
    expect(screen.getByText('2025-07-20')).toBeInTheDocument()
    expect(screen.getByText('예정 지출 (인테리어 대금)')).toBeInTheDocument()
    expect(screen.getByText('-120만 원')).toBeInTheDocument()
    expect(screen.getByText('2025-07-22')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '보정값' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '원인 TOP 3' })).toBeInTheDocument()
    expect(screen.getByText('부족 위험')).toHaveClass('text-primary-blue-800')
  })
})

describe('Recovery Packet 사후점검 화면', () => {
  it('단일 시간축과 진행 상태, 위험, 지원 링크를 제공한다', () => {
    render(<RecoveryFollowUpScreen />)

    expect(screen.getByRole('heading', { name: '30·60·90일 사후점검' })).toBeInTheDocument()
    expect(screen.getByText('Packet 생성 2025-07-14')).toBeInTheDocument()
    expect(screen.getByText('30일 · 2025-08-13 · 완료')).toBeInTheDocument()
    expect(screen.getByText('60일 · 2025-09-12 · 완료')).toBeInTheDocument()
    expect(screen.getByText('90일 · 2025-10-12 · 예정')).toBeInTheDocument()
    expect(screen.getByText('마지막 점검 2025-09-12')).toBeInTheDocument()
    expect(screen.getByText('다음 점검 2025-10-12')).toBeInTheDocument()
    expect(screen.getByText('현재 위험 수준')).toBeInTheDocument()
    expect(screen.getByText('진행 중')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '현금흐름 보기' })).toHaveAttribute('href', '/cashflow')
    expect(screen.getByRole('link', { name: '동의 관리' })).toHaveAttribute('href', '/consents')
    expect(screen.getByRole('link', { name: '지원사업 확인' })).toHaveAttribute(
      'href',
      '/recovery/support-programs',
    )
    expect(screen.getByRole('link', { name: '회복안' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('부족 위험 완화 · 다음 30일 관찰 필요')).toHaveClass(
      'text-primary-blue-800',
    )
  })

  it('동의 switch 상태는 이 화면 안에서만 전환한다', () => {
    render(<RecoveryFollowUpScreen />)

    const riskSwitch = screen.getByRole('switch', { name: '위험 변동 알림 받기' })
    const supportSwitch = screen.getByRole('switch', { name: '지원사업 안내 받기' })

    expect(riskSwitch).toBeChecked()
    expect(supportSwitch).not.toBeChecked()

    fireEvent.click(riskSwitch)
    fireEvent.click(supportSwitch)

    expect(riskSwitch).not.toBeChecked()
    expect(supportSwitch).toBeChecked()
  })
})
