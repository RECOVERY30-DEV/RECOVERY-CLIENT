import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CashflowPendingScreen } from './cashflow-pending-screen'

describe('현금흐름 판단 보류 화면', () => {
  it('판단이 보류된 이유와 데이터 반영률을 제공한다', () => {
    render(<CashflowPendingScreen />)

    expect(screen.getByRole('heading', { name: '판단 보류' })).toBeInTheDocument()
    expect(screen.getByText('분석 기간')).toBeInTheDocument()
    expect(screen.getByText('오늘 ~ 30일 후')).toBeInTheDocument()
    expect(screen.getByText('예상 최저잔액')).toBeInTheDocument()
    expect(screen.getByText('범위 산출 불가')).toBeInTheDocument()
    expect(screen.getByText('첫 부족 예상일')).toBeInTheDocument()
    expect(screen.getByText('확인 어려움')).toBeInTheDocument()
    expect(screen.getByText('예측 신뢰도')).toBeInTheDocument()
    expect(screen.getByText('낮음 — 보정 필요')).toBeInTheDocument()
    expect(screen.getByText('사업자 계좌 입출금')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('카드 정산')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText('대출·원리금')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('자동이체')).toBeInTheDocument()
    expect(screen.getByText('61%')).toBeInTheDocument()
    expect(
      screen.getByText('반영률이 낮은 정보가 없습니다. 데이터 수집 상태를 확인해 주세요.'),
    ).toBeInTheDocument()
  })

  it('정보 보정으로 이동하고 아직 제공되지 않는 재시도 안내는 비활성화한다', () => {
    render(<CashflowPendingScreen />)

    expect(screen.getByRole('link', { name: '정보 보정하기' })).toHaveAttribute(
      'href',
      '/cashflow/corrections',
    )
    expect(screen.getByRole('link', { name: '정보 보정하기' })).toHaveClass(
      'focus-visible:ring-primary-blue-800',
    )
    expect(screen.getByRole('button', { name: '재시도 안내 확인' })).toBeDisabled()
  })

  it('데이터 반영률이 비어 있으면 확인 가능한 안내를 제공한다', () => {
    render(<CashflowPendingScreen coverageItems={[]} />)

    expect(screen.getByText('데이터 반영률을 확인할 수 없습니다.')).toBeInTheDocument()
  })

  it('API가 알려준 반영률 부족 항목만 보정 대상으로 안내한다', () => {
    render(<CashflowPendingScreen lowCoverageItems={['자동이체 출금 내역을 확인해 주세요.']} />)

    expect(screen.getByRole('heading', { name: '반영률이 낮은 정보' })).toBeInTheDocument()
    expect(screen.getByText('자동이체 출금 내역을 확인해 주세요.')).toBeInTheDocument()
    expect(screen.queryByText('현금 매출 또는 타행 입금 내역')).not.toBeInTheDocument()
  })
})
