import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CashflowDailyDetailScreen } from './cashflow-daily-detail-screen'

describe('일자별 현금흐름 상세 화면', () => {
  it('선택한 날짜의 잔액과 거래 근거를 구분해서 제공한다', () => {
    render(<CashflowDailyDetailScreen date="2024-11-14" />)

    expect(screen.getByRole('heading', { name: '2024년 11월 14일 (목)' })).toBeInTheDocument()
    expect(screen.getByText('잔액·유입·유출 요약')).toBeInTheDocument()
    expect(screen.getByText('확정 거래')).toBeInTheDocument()
    expect(screen.getByText('예상 거래')).toBeInTheDocument()
    expect(screen.getByText('보정값')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '특이사항' })).toBeInTheDocument()
    expect(screen.getAllByText('+₩3,200,000')).not.toHaveLength(0)
  })

  it('선택한 날짜에 따라 핵심 거래를 다르게 제공한다', () => {
    render(<CashflowDailyDetailScreen date="2024-11-20" />)

    expect(screen.getByText('임차료 출금')).toBeInTheDocument()
    expect(screen.getAllByText('-₩1,850,000')).not.toHaveLength(0)
    expect(screen.queryByText('+₩3,200,000')).not.toBeInTheDocument()
  })

  it('대시보드 복귀 경로와 데이터 출처 및 보정 이동을 제공한다', () => {
    render(<CashflowDailyDetailScreen date="2024-11-10" />)

    expect(screen.getByRole('link', { name: '현금흐름 대시보드로 돌아가기' })).toHaveAttribute(
      'href',
      '/cashflow',
    )
    expect(screen.getByText('사업자 계좌 (우리은행)')).toBeInTheDocument()
    expect(screen.getByText('카드 정산 (신한카드)')).toBeInTheDocument()
    const correctionLink = screen.getByRole('link', { name: '보정값 추가·수정하기' })

    expect(correctionLink).toHaveAttribute('href', '/cashflow/corrections')
    expect(correctionLink).toHaveClass('focus-visible:ring-primary-blue-800')
  })
})
