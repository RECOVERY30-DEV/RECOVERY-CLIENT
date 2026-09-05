import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CashflowCorrectionOverviewScreen } from './cashflow-correction-overview-screen'

describe('현금흐름 정보 보정 허브 화면', () => {
  it('보정 현황과 Task 2 입력 경로를 제공한다', () => {
    render(<CashflowCorrectionOverviewScreen />)

    expect(screen.getByRole('heading', { name: '누락 정보 보정' })).toBeInTheDocument()
    expect(screen.getByText('62% · 판단보류')).toBeInTheDocument()
    expect(screen.getByText('오늘 오전 9:14')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /현금매출/ })).toHaveAttribute(
      'href',
      '/cashflow/corrections/cash-sales/new',
    )
    expect(screen.getByRole('link', { name: /타행·외부자금/ })).toHaveAttribute(
      'href',
      '/cashflow/corrections/external-funds/new',
    )
    expect(screen.getByRole('link', { name: /예정수입/ })).toHaveAttribute(
      'href',
      '/cashflow/corrections/expected-income/new',
    )
    expect(screen.getByRole('link', { name: /예정지출/ })).toHaveAttribute(
      'href',
      '/cashflow/corrections/expected-expenses/new',
    )
    expect(screen.getByText('예측 가능 기간')).toBeInTheDocument()
    expect(screen.getByText('D+12 → D+18 (예상)')).toBeInTheDocument()
  })

  it('후보 이름이 포함된 접근 가능한 이름으로 각 반복 패턴 동작을 구분한다', () => {
    render(<CashflowCorrectionOverviewScreen />)

    expect(
      screen.getByRole('button', { name: '매월 15일 현금 매출 약 120만 원 확인' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '매월 15일 현금 매출 약 120만 원 해당 없음' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '매월 말 타행 입금 약 85만 원 확인' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '매월 말 타행 입금 약 85만 원 해당 없음' }),
    ).toBeInTheDocument()
  })

  it('확인과 해당 없음 선택 결과를 live status로 알리고 후보별 상태가 독립적이다', () => {
    render(<CashflowCorrectionOverviewScreen />)

    fireEvent.click(screen.getByRole('button', { name: '매월 15일 현금 매출 약 120만 원 확인' }))

    expect(
      screen.getByRole('status', { name: '매월 15일 현금 매출 약 120만 원 확인됨' }),
    ).toHaveFocus()
    expect(screen.getByText('확인됨')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '매월 말 타행 입금 약 85만 원 해당 없음' }))

    expect(screen.getByText('확인됨')).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: '매월 말 타행 입금 약 85만 원 해당 없음' }),
    ).toHaveFocus()
    expect(screen.getByText('해당 없음')).toBeInTheDocument()
  })

  it('서버 재계산을 막고 판단 보류로 돌아가는 경로를 제공한다', () => {
    render(<CashflowCorrectionOverviewScreen />)

    expect(screen.getByRole('button', { name: '재계산 실행' })).toBeDisabled()
    expect(screen.getByRole('link', { name: '보정 중단' })).toHaveAttribute(
      'href',
      '/cashflow/pending',
    )
  })
})
