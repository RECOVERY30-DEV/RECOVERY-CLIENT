import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { HomeForecastViewModel } from '../model/home-forecast-view-model'
import { BusinessHomeScreen } from './business-home-screen'

const homeData = {
  headerText: '2025년 7월 15일 기준 · 최근 갱신 오전 8:32',
  range: {
    summary: '−128만 원 ~ +54만 원',
    conservative: '−128만',
    optimistic: '83만',
    expectedPosition: 86.26,
  },
  shortage: {
    dDay: 'D-11',
    expectedDate: '7월 26일 예상',
    progress: 36.67,
  },
  safety: {
    amount: '약 54만원',
    status: '안전 잔액 미충족',
  },
  dataSources: [
    { label: '사업자 계좌', refreshedAt: '최근 갱신 2시간 전' },
    { label: '카드 정산', refreshedAt: '최근 갱신 1일 전' },
    { label: '자동이체·대출', refreshedAt: '최근 갱신 3일 전' },
  ],
  dataStatuses: [
    { label: '사업자 계좌', status: '갱신 완료' },
    { label: '카드 정산', status: '갱신 완료' },
    { label: '자동이체/대출', status: '부분 반영' },
  ],
} satisfies HomeForecastViewModel

describe('사업자 홈 화면', () => {
  it('30일 현금흐름의 핵심 지표와 갱신 상태를 제공한다', () => {
    render(<BusinessHomeScreen data={homeData} />)

    expect(screen.getByRole('heading', { name: '30일 현금흐름 현황' })).toBeInTheDocument()
    expect(screen.getByText('2025년 7월 15일 기준 · 최근 갱신 오전 8:32')).toBeInTheDocument()
    expect(screen.getByText('30일 이후 예상 최저잔액')).toBeInTheDocument()
    expect(screen.getByText('안전 잔액')).toBeInTheDocument()
    expect(screen.getByText('현재 예상기준')).toBeInTheDocument()
    expect(screen.getByText('−128만 원 ~ +54만 원')).toBeInTheDocument()
    expect(screen.getByText('D-11')).toBeInTheDocument()
    expect(screen.getByText('약 54만원')).toBeInTheDocument()
    expect(screen.getByText('안전 잔액 미충족')).toBeInTheDocument()
    expect(screen.getByText('최근 갱신 2시간 전')).toBeInTheDocument()
    expect(screen.getByText('최근 갱신 1일 전')).toBeInTheDocument()
    expect(screen.getByText('최근 갱신 3일 전')).toBeInTheDocument()
    expect(screen.getByText('최근 갱신 2시간 전')).toHaveClass('text-warning-700')
    screen
      .getAllByText('갱신 완료')
      .forEach((status) => expect(status).toHaveClass('text-primary-blue-800'))
    expect(screen.getByText(/연체 전 회복 지원용 분석/)).toHaveClass('text-base-white/80')
  })

  it('위험 분석은 동의 설정으로 연결하고 데이터 범위 카드는 비대화형으로 제공한다', () => {
    render(<BusinessHomeScreen data={homeData} />)

    expect(screen.getByRole('link', { name: '위험분석 바로가기' })).toHaveAttribute(
      'href',
      '/consents/setup',
    )
    expect(screen.getByRole('link', { name: '위험분석 바로가기' })).toHaveClass(
      'focus-visible:ring-primary-blue-800',
    )
    expect(
      screen.queryByRole('link', { name: '분석 데이터 범위 자세히 보기' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: '분석 데이터 범위' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('aria-current', 'page')
  })
})
