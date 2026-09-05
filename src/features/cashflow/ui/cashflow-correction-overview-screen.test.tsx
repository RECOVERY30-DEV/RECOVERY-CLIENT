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
    expect(screen.getByRole('link', { name: /예정지출/ })).toHaveAttribute(
      'href',
      '/cashflow/corrections/expected-expenses/new',
    )
    expect(screen.getByText('예측 가능 기간')).toBeInTheDocument()
    expect(screen.getByText('D+12 → D+18 (예상)')).toBeInTheDocument()
  })

  it('반복 후보 결정을 화면 안에서 반영하고 서버 재계산은 막아 둔다', () => {
    render(<CashflowCorrectionOverviewScreen />)

    fireEvent.click(screen.getAllByRole('button', { name: '확인' })[0])

    expect(screen.getByText('확인됨')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '재계산 실행' })).toBeDisabled()
    expect(screen.getByRole('link', { name: '보정 중단' })).toHaveAttribute(
      'href',
      '/cashflow/pending',
    )
  })
})
