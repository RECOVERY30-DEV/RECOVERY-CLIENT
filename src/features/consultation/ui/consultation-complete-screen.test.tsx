import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConsultationCompleteScreen } from './consultation-complete-screen'

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
  useConsultationQuery: vi.fn(),
}))

vi.mock('@/features/consultation', () => ({
  useConsultationQuery: mocks.useConsultationQuery,
}))

describe('상담 예약 완료 화면', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('접수된 예약의 상담사와 일시를 표시하고 회복안 비교와 Packet으로 이동할 수 있다', () => {
    mocks.useConsultationQuery.mockReturnValue({
      data: {
        consultationId: 8,
        counselorName: '김상담',
        scheduledAt: '2025-07-14T01:00:00Z',
        status: 'REQUESTED',
      },
      isError: false,
      isPending: false,
      refetch: mocks.refetch,
    })

    render(<ConsultationCompleteScreen consultationId={8} />)

    expect(mocks.useConsultationQuery).toHaveBeenCalledWith(8)
    expect(screen.getByText('상담 예약이 접수되었습니다.')).toBeInTheDocument()
    expect(screen.getByText('김상담')).toBeInTheDocument()
    expect(screen.getByText(/2025년 7월 14일/)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '회복안 비교로 돌아가기' })[1]).toHaveAttribute(
      'href',
      '/recovery/compare',
    )
    expect(screen.getByRole('link', { name: 'Recovery Packet 확인' })).toHaveAttribute(
      'href',
      '/recovery',
    )
  })

  it('상세 조회에 실패해도 뒤로 가는 동작과 재시도를 유지한다', () => {
    mocks.useConsultationQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch: mocks.refetch,
    })

    render(<ConsultationCompleteScreen consultationId={8} />)

    expect(screen.getByRole('alert')).toHaveTextContent('예약 상세 정보를 불러오지 못했습니다.')
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(mocks.refetch).toHaveBeenCalledTimes(1)
    expect(screen.getAllByRole('link', { name: '회복안 비교로 돌아가기' })[1]).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Recovery Packet 확인' })).toBeInTheDocument()
  })
})
