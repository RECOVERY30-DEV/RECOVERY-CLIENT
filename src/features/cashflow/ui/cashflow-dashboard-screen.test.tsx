import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CASHFLOW_FACTORS } from '../model/cashflow-dashboard-data'
import { CashflowDashboardScreen } from './cashflow-dashboard-screen'

describe('현금흐름 대시보드 화면', () => {
  it('분석 범위와 핵심 위험 지표를 제공한다', () => {
    render(<CashflowDashboardScreen />)

    expect(screen.getByRole('heading', { name: '30일 현금흐름 분석' })).toBeInTheDocument()
    expect(screen.getByText('D-18')).toBeInTheDocument()
    expect(screen.getByText('-128만원 ~ -54만원')).toBeInTheDocument()
    expect(screen.getByText('위험상태')).toBeInTheDocument()
    expect(screen.getByText('부족일까지 18일 남았습니다.')).toBeInTheDocument()
    const riskStatusLink = screen.getByRole('link', { name: '위험상태 상세 보기' })

    expect(riskStatusLink).toHaveAttribute('href', '/cashflow/status')
    expect(riskStatusLink).toHaveClass('text-warning-700', 'focus-visible:ring-primary-blue-800')
    expect(screen.getByText('30일 후').parentElement).toHaveClass('text-secondary-300')
    expect(screen.getByText('−120만')).toHaveClass('text-warning-700')
    expect(screen.getByText(/범위 전체가 0원 아래로/)).toHaveClass('text-secondary-300')
  })

  it('데이터 범위와 정보 보정 경로를 제공한다', () => {
    render(<CashflowDashboardScreen />)

    expect(screen.getByRole('link', { name: '분석 데이터 범위 확인하기' })).toHaveAttribute(
      'href',
      '/data-scope',
    )
    const correctionLink = screen.getByRole('link', { name: '누락 정보 보정하기' })

    expect(correctionLink).toHaveAttribute('href', '/cashflow/corrections')
    expect(correctionLink).toHaveClass('focus-visible:ring-primary-blue-800')
    expect(screen.getByRole('link', { name: '현금흐름' })).toHaveAttribute('aria-current', 'page')
  })

  it('Figma Info 상태색으로 갱신 및 일정 정보를 표시한다', () => {
    render(<CashflowDashboardScreen />)

    expect(screen.getAllByText('최종 갱신 09:14')).toHaveLength(2)
    screen
      .getAllByText('최종 갱신 09:14')
      .forEach((element) => expect(element).toHaveClass('text-info-500'))
    screen
      .getAllByText('오늘 09:14 반영')
      .forEach((element) => expect(element).toHaveClass('text-info-500'))
    screen
      .getAllByText(/유입|유출|공휴일/)
      .forEach((element) => expect(element).toHaveClass('text-info-500'))
    expect(screen.getByRole('link', { name: '누락 정보 보정하기' })).toHaveClass(
      'text-primary-blue-500',
    )
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

  it('최근 현금흐름 다섯 건을 최신 날짜부터 제공한다', () => {
    render(<CashflowDashboardScreen />)

    const dailyLinks = screen.getAllByRole('link', {
      name: /^\d{2} \/ \d{2} \([일월화수목금토]\) 상세 보기$/,
    })

    expect(dailyLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/cashflow/daily/2024-11-28',
      '/cashflow/daily/2024-11-25',
      '/cashflow/daily/2024-11-20',
      '/cashflow/daily/2024-11-14',
      '/cashflow/daily/2024-11-10',
    ])
  })

  it('부족 원인 설명을 최대 30자로 제공한다', () => {
    expect(CASHFLOW_FACTORS.every((factor) => Array.from(factor.description).length <= 30)).toBe(
      true,
    )
  })
})
