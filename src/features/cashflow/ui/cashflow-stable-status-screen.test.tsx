import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CASHFLOW_STABLE_REASONS } from '../model/cashflow-stable-status-data'
import { CashflowStableStatusScreen } from './cashflow-stable-status-screen'

describe('현금흐름 안정 상태 안내 화면', () => {
  it('분석 기준과 안정 상태의 핵심 수치를 제공한다', () => {
    render(<CashflowStableStatusScreen />)

    expect(screen.getByText('분석일 기준 2025년 7월 14일 · 데이터 반영 완료')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '현금흐름 안정' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '핵심 수치 요약' })).toBeInTheDocument()
    expect(screen.getByText('약 312만 원 ~ 448만 원')).toBeInTheDocument()
    expect(screen.getByText('30일 이내 없음')).toBeInTheDocument()
    expect(screen.getByText('약 312만 원 ~ 448만 원')).toHaveClass('text-primary-blue-800')
  })

  it('판단 근거와 상태가 바뀌는 조건을 안내한다', () => {
    render(<CashflowStableStatusScreen />)

    expect(screen.getByRole('heading', { name: '판단 근거' })).toBeInTheDocument()
    expect(
      screen.getByText('최근 8주 매출이 전월 대비 안정적으로 유지되고 있습니다.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '이런 경우 상태가 바뀔 수 있어요' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Coverage 70% 미만 항목이 있어 판단을 보류합니다.'),
    ).not.toBeInTheDocument()
  })

  it('대시보드 복귀와 사후점검 경로를 제공한다', () => {
    render(<CashflowStableStatusScreen />)

    expect(screen.getByRole('link', { name: '현금흐름 대시보드로 돌아가기' })).toHaveAttribute(
      'href',
      '/cashflow',
    )
    expect(screen.getByRole('link', { name: '확인 필요' })).toHaveAttribute(
      'href',
      '/cashflow/corrections',
    )
    expect(screen.getByRole('link', { name: '30·60·90일 사후점검 확인하기' })).toHaveAttribute(
      'href',
      '/recovery/follow-up',
    )
  })

  it('위험 상태 데이터가 주어지면 위험 안내와 위험 핵심 수치를 제공한다', () => {
    render(<CashflowStableStatusScreen status="risk" />)

    expect(screen.getByRole('heading', { name: '현금흐름 위험' })).toBeInTheDocument()
    expect(screen.getByText('약 -128만 원 ~ -54만 원')).toBeInTheDocument()
    expect(screen.getByText('약 -128만 원 ~ -54만 원')).toHaveClass('text-warning-700')
    expect(screen.getByText('미충족')).toBeInTheDocument()
    expect(screen.getByText('2025년 07월 29일')).toBeInTheDocument()
  })

  it('판단 근거를 항목당 최대 40자로 제공한다', () => {
    expect(CASHFLOW_STABLE_REASONS.every((reason) => Array.from(reason).length <= 40)).toBe(true)
  })
})
