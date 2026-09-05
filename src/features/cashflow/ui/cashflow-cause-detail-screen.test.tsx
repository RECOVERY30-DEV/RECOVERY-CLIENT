import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CashflowCauseDetailScreen } from './cashflow-cause-detail-screen'

describe('현금부족 원인 상세 화면', () => {
  it('부족 예상 시점과 최저 잔액 범위를 제공한다', () => {
    render(<CashflowCauseDetailScreen />)

    expect(screen.getByRole('heading', { name: '현금부족 원인 분석' })).toBeInTheDocument()
    expect(screen.getByText('14일 후')).toBeInTheDocument()
    expect(screen.getByText('6월 28일')).toBeInTheDocument()
    expect(screen.getByText('-230만 ~ -80만 원')).toBeInTheDocument()
    expect(screen.getByText('예상 부족액 기준 범위이며 확정 금액이 아닙니다.')).toBeInTheDocument()
  })

  it('순위가 매겨진 원인 카드 세 개와 보정 경로를 제공한다', () => {
    render(<CashflowCauseDetailScreen />)

    const causes = screen.getAllByRole('article')

    expect(causes).toHaveLength(3)
    expect(screen.getByRole('heading', { name: '1. 최근 8주 매출 감소' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2. 월말 임차료·원리금 집중' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '3. 계절적 매출 회복 지연' })).toBeInTheDocument()
    expect(screen.getByText('–180만 원')).toBeInTheDocument()
    expect(screen.getByText('–320만 원')).toBeInTheDocument()
    expect(screen.getByText('추정 중')).toBeInTheDocument()
    expect(
      screen.getByText('과거 같은 시기 패턴과 비교한 추정입니다. 보정 후 재계산을 권장합니다.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '최근 8주 매출 감소 보정하기' })).toHaveAttribute(
      'href',
      '/cashflow/corrections/expected-income/new',
    )
    expect(screen.getByRole('link', { name: '월말 임차료·원리금 집중 보정하기' })).toHaveAttribute(
      'href',
      '/cashflow/corrections/expected-expenses/new',
    )
    expect(screen.getByRole('link', { name: '계절적 매출 회복 지연 보정하기' })).toHaveAttribute(
      'href',
      '/cashflow/corrections/cash-sales/new',
    )
  })

  it('실행 계획 확인 경로와 대시보드 복귀 경로를 제공한다', () => {
    render(<CashflowCauseDetailScreen />)

    expect(screen.getByRole('link', { name: '실행 계획 확인' })).toHaveAttribute(
      'href',
      '/recovery/compare',
    )
    expect(screen.getByRole('link', { name: '현금흐름 대시보드로 돌아가기' })).toHaveAttribute(
      'href',
      '/cashflow',
    )
  })
})
