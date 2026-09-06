import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CashflowDashboardScreen } from './cashflow-dashboard-screen'

describe('현금흐름 대시보드 화면', () => {
  it('분석 범위와 핵심 위험 지표를 제공한다', () => {
    render(<CashflowDashboardScreen />)

    expect(screen.getByRole('heading', { name: '30일 현금흐름 분석' })).toBeInTheDocument()
    expect(screen.getByText('D-18')).toBeInTheDocument()
    expect(screen.getByText('-128만원 ~ -54만원')).toBeInTheDocument()
    expect(screen.getByText('위험상태')).toBeInTheDocument()
    expect(screen.getByText('부족일까지 18일 남았습니다.')).toBeInTheDocument()
  })

  it('데이터 범위 경로를 제공하고 미구현 보정 이동은 비활성화한다', () => {
    render(<CashflowDashboardScreen />)

    expect(screen.getByRole('link', { name: '분석 데이터 범위 확인하기' })).toHaveAttribute(
      'href',
      '/data-scope',
    )
    expect(screen.getByRole('button', { name: '누락 정보 보정하기' })).toBeDisabled()
    expect(screen.getByRole('link', { name: '현금흐름' })).toHaveAttribute('aria-current', 'page')
  })

  it('일자별 현금흐름과 부족 원인 상위 세 항목 및 상세 경로를 제공한다', () => {
    render(<CashflowDashboardScreen />)

    expect(screen.getByText('유입 +320만 원 (카드정산)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '11 / 10 (일) 상세 보기' })).toHaveAttribute(
      'href',
      '/cashflow/daily/2024-11-10',
    )
    expect(screen.getByRole('link', { name: '11 / 10 (일) 상세 보기' })).toHaveClass(
      'focus-visible:ring-primary-blue-800',
    )
    expect(screen.getByText('유출 −185만 원 (임차료)')).toBeInTheDocument()
    expect(screen.getByText('월말 원리금 임차료 집중')).toBeInTheDocument()
    expect(screen.getByText('최근 4주 매출 감소')).toBeInTheDocument()
    expect(screen.getByText('계절적 회복 지연 가능')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '원인 상세 보기' })).toHaveAttribute(
      'href',
      '/cashflow/causes',
    )
    expect(screen.getByRole('link', { name: '원인 상세 보기' })).toHaveClass('text-primary-100')
    expect(screen.getByRole('link', { name: '원인 상세 보기' })).toHaveClass(
      'focus-visible:ring-primary-blue-800',
    )
  })
})
