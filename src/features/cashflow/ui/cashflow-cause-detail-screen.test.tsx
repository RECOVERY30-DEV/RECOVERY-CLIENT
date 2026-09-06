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
  })

  it('최저 잔액 범위를 정확한 안내 문구로 설명한다', () => {
    render(<CashflowCauseDetailScreen />)

    expect(
      screen.getByText('예상 최저 잔액 기준 범위이며 확정 금액이 아닙니다.'),
    ).toBeInTheDocument()
  })

  it('순위가 매겨진 원인 카드 세 개와 보정 경로를 제공한다', () => {
    render(<CashflowCauseDetailScreen />)

    const causes = screen.getAllByRole('article')

    expect(causes).toHaveLength(3)
    const firstCauseHeading = screen.getByRole('heading', {
      name: '1순위: 최근 8주 매출 감소',
    })
    expect(firstCauseHeading).toBeInTheDocument()
    expect(firstCauseHeading.querySelector('.sr-only')).toHaveTextContent('1순위:')
    expect(firstCauseHeading).not.toHaveTextContent('1. 최근 8주 매출 감소')
    expect(
      screen.getByRole('heading', { name: '2순위: 월말 임차료·원리금 집중' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '3순위: 계절적 매출 회복 지연' }),
    ).toBeInTheDocument()
    expect(screen.getByText('–180만 원')).toBeInTheDocument()
    expect(screen.getByText('–320만 원')).toBeInTheDocument()
    expect(screen.getByText('추정 중')).toBeInTheDocument()
    expect(
      screen.getByText('과거 같은 시기 패턴과 비교한 추정입니다. 보정 후 재계산을 권장합니다.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '최근 8주 매출 감소: 보정값 추가하기' }),
    ).toHaveAttribute('href', '/cashflow/corrections/expected-income/new')
    expect(
      screen.getByRole('link', { name: '월말 임차료·원리금 집중: 보정값 추가하기' }),
    ).toHaveAttribute('href', '/cashflow/corrections/expected-expenses/new')
    expect(
      screen.getByRole('link', { name: '계절적 매출 회복 지연: 현금매출 보정하기' }),
    ).toHaveAttribute('href', '/cashflow/corrections/cash-sales/new')
  })

  it('보정 링크의 접근 가능한 이름에 화면 표시 문구와 원인명을 함께 포함한다', () => {
    render(<CashflowCauseDetailScreen />)

    expect(
      screen.getByRole('link', { name: '최근 8주 매출 감소: 보정값 추가하기' }),
    ).toHaveTextContent('보정값 추가하기')
    expect(
      screen.getByRole('link', { name: '월말 임차료·원리금 집중: 보정값 추가하기' }),
    ).toHaveTextContent('보정값 추가하기')
    expect(
      screen.getByRole('link', { name: '계절적 매출 회복 지연: 현금매출 보정하기' }),
    ).toHaveTextContent('현금매출 보정하기')
    expect(screen.getByRole('link', { name: '최근 8주 매출 감소: 보정값 추가하기' })).toHaveClass(
      'focus-visible:ring-primary-blue-800',
    )
  })

  it('핵심 수치와 근거·가정에 충분한 대비의 토큰을 적용한다', () => {
    render(<CashflowCauseDetailScreen />)

    expect(screen.getByText('6월 28일')).toHaveClass('text-primary-100')
    expect(screen.getByText('-230만 ~ -80만 원')).toHaveClass('text-primary-100')
    expect(screen.getByText('신한카드 정산 5건 · 6월 2일~11일')).toHaveClass('text-primary-100')
    expect(screen.getByText('직전 4주 평균 입금 패턴 반영')).toHaveClass('text-primary-100')
  })

  it('실행 계획 확인 경로와 대시보드 복귀 경로를 제공한다', () => {
    render(<CashflowCauseDetailScreen />)

    expect(screen.getByRole('link', { name: '실행 계획 확인' })).toHaveAttribute(
      'href',
      '/recovery/compare',
    )
    expect(screen.getByRole('link', { name: '실행 계획 확인' })).toHaveClass(
      'focus-visible:ring-primary-blue-800',
    )
    expect(screen.getByRole('link', { name: '현금흐름 대시보드로 돌아가기' })).toHaveAttribute(
      'href',
      '/cashflow',
    )
  })

  it('위험 원인이 비어 있으면 확인 가능한 안내를 제공한다', () => {
    render(<CashflowCauseDetailScreen causes={[]} />)

    expect(screen.getByText('확인된 주요 원인이 없습니다.')).toBeInTheDocument()
  })

  it('계절 원인의 추가 근거와 예측 정확도 안내를 제공한다', () => {
    render(<CashflowCauseDetailScreen />)

    expect(
      screen.getByRole('link', { name: '계절적 매출 회복 지연: 근거 더 보기' }),
    ).toHaveAttribute('href', '#cashflow-forecast-accuracy')
    expect(screen.getByRole('heading', { name: '예측 정확도 안내' })).toBeInTheDocument()
  })
})
