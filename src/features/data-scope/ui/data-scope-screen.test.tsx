import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DataScopeScreen } from './data-scope-screen'

describe('분석 데이터 범위 화면', () => {
  it('출처별 데이터 상태와 예측 미반영 정보를 제공한다', () => {
    render(<DataScopeScreen />)

    expect(screen.getByRole('heading', { name: '분석 데이터 범위' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '출처별 데이터 현황' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '사업자 계좌' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '카드 정산' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '대출 및 원리금' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '자동이체' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '예측 미반영 정보' })).toBeInTheDocument()
    expect(screen.getByText('현금 매출 및 타행 입금')).toBeInTheDocument()
  })

  it('분석 한계와 낮은 데이터 반영률의 후속 경로를 안내한다', () => {
    render(<DataScopeScreen />)

    expect(screen.getByRole('heading', { name: '분석 한계 안내' })).toBeInTheDocument()
    expect(screen.getByText('Coverage 낮음')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '오류 확인' })).toHaveAttribute(
      'href',
      '/cashflow/pending',
    )
    expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toHaveAttribute('href', '/home')
  })
})
