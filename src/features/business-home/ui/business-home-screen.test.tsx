import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BusinessHomeScreen } from './business-home-screen'

describe('사업자 홈 화면', () => {
  it('30일 현금흐름의 핵심 지표와 갱신 상태를 제공한다', () => {
    render(<BusinessHomeScreen />)

    expect(screen.getByRole('heading', { name: '30일 현금흐름 현황' })).toBeInTheDocument()
    expect(screen.getByText('−128만 원 ~ +54만 원')).toBeInTheDocument()
    expect(screen.getByText('D-11')).toBeInTheDocument()
    expect(screen.getByText('약 83만원')).toBeInTheDocument()
    expect(screen.getByText('최근 갱신 2시간 전')).toBeInTheDocument()
    expect(screen.getByText('최근 갱신 어제 오전 9시')).toBeInTheDocument()
    expect(screen.getByText('최근 갱신 3일 전')).toBeInTheDocument()
  })

  it('위험 분석과 데이터 범위의 후속 경로를 제공한다', () => {
    render(<BusinessHomeScreen />)

    expect(screen.getByRole('link', { name: '위험분석 바로가기' })).toHaveAttribute(
      'href',
      '/cashflow',
    )
    expect(screen.getByRole('link', { name: '분석 데이터 범위 자세히 보기' })).toHaveAttribute(
      'href',
      '/data-scope',
    )
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('aria-current', 'page')
  })
})
