import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SupportProgramDetailScreen } from './support-program-detail-screen'
import { SupportProgramListScreen } from './support-program-list-screen'

describe('지원사업 목록 화면', () => {
  it('동일 fixture의 세 지원사업과 canonical 지원 한도 및 자격 기준을 표시한다', () => {
    render(<SupportProgramListScreen />)

    expect(screen.getByText('총 3건')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '소상공인 경영안정자금' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '신용보증기금 매출감소특례보증' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '소상공인 경영개선 지원사업' })).toBeInTheDocument()
    expect(screen.getByText('운전자금 최대 7,000만 원 / 연 3.4% 고정금리')).toBeInTheDocument()
    expect(screen.getByText(/사업자 2년 이상/)).toBeInTheDocument()
  })

  it('검색, 카테고리, 지역, 신청 가능 필터에 따라 결과 수와 빈 상태를 갱신한다', () => {
    render(<SupportProgramListScreen />)

    fireEvent.click(screen.getByRole('button', { name: '행정자금' }))
    expect(screen.getByRole('button', { name: '행정자금' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('총 2건')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: '지역' }), {
      target: { value: '부산' },
    })
    expect(screen.getByText('총 1건')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: '신청 가능만 보기' }))
    expect(screen.getByRole('switch', { name: '신청 가능만 보기' })).not.toBeChecked()

    fireEvent.change(screen.getByRole('searchbox', { name: '지원사업 검색' }), {
      target: { value: '없는 사업' },
    })
    expect(screen.getByText('조건에 맞는 지원사업이 없습니다.')).toBeInTheDocument()
  })

  it('카테고리 선택 상태가 명확하고 카드에서 상세와 상담으로 연결한다', () => {
    render(<SupportProgramListScreen />)

    expect(screen.getByRole('group', { name: '지원사업 카테고리' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('switch', { name: '신청 가능만 보기' })).toBeChecked()
    expect(screen.getByRole('link', { name: '소상공인 경영안정자금 상세 확인' })).toHaveAttribute(
      'href',
      '/recovery/support-programs/small-business-stability-fund',
    )
    expect(screen.getByRole('link', { name: '지원사업 상담 예약' })).toHaveAttribute(
      'href',
      '/recovery/consultation?source=support-programs',
    )
  })

  it('목록 카드의 두 매칭 상태를 상세와 같은 대비 안전 색상으로 표시한다', () => {
    render(<SupportProgramListScreen />)

    expect(screen.getAllByTestId('support-program-match-status')[0]).toHaveClass(
      'bg-primary-blue-100',
      'text-primary-blue-800',
    )
    expect(screen.getAllByTestId('support-program-match-status')[1]).toHaveClass(
      'bg-neutral-300',
      'text-secondary-500',
    )
  })

  it('지원사업 카드 상세 링크는 고대비 hover와 focus 색상을 사용한다', () => {
    render(<SupportProgramListScreen />)

    expect(screen.getByRole('link', { name: '소상공인 경영안정자금 상세 확인' })).toHaveClass(
      'hover:text-primary-blue-800',
      'focus-visible:ring-primary-blue-800',
    )
  })
})

describe('지원사업 상세 화면', () => {
  it('개요, 추정 상태 구분, 교정된 서류명, 공식 확인 안내를 제공한다', () => {
    render(<SupportProgramDetailScreen programId="small-business-stability-fund" />)

    expect(screen.getByRole('heading', { name: '소상공인 경영안정자금' })).toBeInTheDocument()
    expect(screen.getByText('운전자금 최대 7,000만 원 융자')).toBeInTheDocument()
    expect(screen.getByText('자동 자격판정이 아님')).toBeInTheDocument()
    expect(screen.getAllByText('충족 가능')).not.toHaveLength(0)
    expect(screen.getByText('확인 필요')).toBeInTheDocument()
    expect(screen.getByText('금융거래확인서')).toBeInTheDocument()
    expect(screen.getByText('임대차계약서 (해당 시)')).toBeInTheDocument()
    expect(screen.queryByText('금웅거래확인서')).not.toBeInTheDocument()
    expect(screen.queryByText('(해당시)')).not.toBeInTheDocument()
    expect(screen.getByText('공식 출처에서 최신 조건을 반드시 확인하세요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '공식 공고 확인하기' })).toBeDisabled()
  })

  it('실제 매칭 상태와 상담 및 뒤로가기 링크를 제공한다', () => {
    render(<SupportProgramDetailScreen programId="small-business-stability-fund" />)

    expect(screen.getByText('매칭 가능성 높음', { exact: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '상담 예약하기' })).toHaveAttribute(
      'href',
      '/recovery/consultation?program=small-business-stability-fund',
    )
    expect(screen.getByRole('link', { name: '지원사업 목록으로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery/support-programs',
    )
    expect(screen.getByText('상담예약')).toBeInTheDocument()
    expect(screen.getByTestId('support-eligibility-list')).toHaveClass('bg-neutral-100')
  })

  it.each([
    ['small-business-stability-fund', '소상공인 경영안정자금'],
    ['credit-guarantee-sales-decline', '신용보증기금 매출감소특례보증'],
    ['small-business-management-improvement', '소상공인 경영개선 지원사업'],
  ] as const)('%s 상세는 해당 지원사업을 상담 query로 전달한다', (programId, title) => {
    render(<SupportProgramDetailScreen programId={programId} />)

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '상담 예약하기' })).toHaveAttribute(
      'href',
      `/recovery/consultation?program=${programId}`,
    )
  })

  it.each([
    [
      'small-business-stability-fund',
      '매칭 가능성 높음',
      'bg-primary-blue-100',
      'text-primary-blue-800',
    ],
    ['credit-guarantee-sales-decline', '조건 확인 필요', 'bg-neutral-300', 'text-secondary-500'],
  ] as const)(
    '상세의 %s 상태를 목록 카드와 같은 대비 안전 스타일로 표시한다',
    (programId, status, backgroundClass, textClass) => {
      const { container } = render(<SupportProgramDetailScreen programId={programId} />)

      const statusElement = screen.getByText(status, { exact: true })
      expect(statusElement).toHaveClass(backgroundClass)
      expect(statusElement).toHaveClass(textClass)
      expect(container.querySelectorAll('[class*="text-warning-500"]')).toHaveLength(0)
    },
  )
})
