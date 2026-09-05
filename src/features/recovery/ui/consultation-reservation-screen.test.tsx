import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ConsultationPage from '@/app/recovery/consultation/page'

import { ConsultationReservationScreen } from './consultation-reservation-screen'

describe('상담 예약 화면', () => {
  it('query에서 전달된 회복안을 목적과 요약에 반영한다', async () => {
    render(
      await ConsultationPage({
        searchParams: Promise.resolve({
          plans: ['repayment-adjustment', 'refinancing-review', 'invalid-option'],
        }),
      }),
    )

    expect(screen.getByRole('heading', { name: '상담 목적 및 회복안' })).toBeInTheDocument()
    expect(screen.getByText('상환조건 조정 상담')).toBeInTheDocument()
    expect(screen.getByText('대환 검토')).toBeInTheDocument()
    expect(screen.queryByText('텍스트')).not.toBeInTheDocument()
  })

  it('전화 상담 한 채널과 세 개의 시간을 단일 선택한다', () => {
    render(<ConsultationReservationScreen />)

    expect(screen.getAllByRole('radio', { name: '전화 상담' })).toHaveLength(1)

    const morning = screen.getByRole('radio', { name: '2025년 7월 14일 오전 10시' })
    const afternoon = screen.getByRole('radio', { name: '2025년 7월 14일 오후 2시' })
    const nextDay = screen.getByRole('radio', { name: '2025년 7월 15일 오전 11시' })
    expect(morning).toBeChecked()

    fireEvent.click(nextDay)
    expect(nextDay).toBeChecked()
    expect(morning).not.toBeChecked()
    expect(afternoon).not.toBeChecked()
  })

  it('세 전송 항목을 독립적으로 선택하고 안내 popover를 닫을 수 있다', () => {
    render(<ConsultationReservationScreen />)

    const summary = screen.getByRole('checkbox', { name: '현금흐름 요약' })
    const causes = screen.getByRole('checkbox', { name: '주요 원인 분석' })
    const plans = screen.getByRole('checkbox', { name: '선택한 회복안' })
    expect(summary).toBeChecked()
    expect(causes).not.toBeChecked()
    expect(plans).toBeChecked()

    fireEvent.click(causes)
    expect(summary).toBeChecked()
    expect(causes).toBeChecked()
    expect(plans).toBeChecked()

    const information = screen.getByRole('button', { name: '전송 정보 안내' })
    fireEvent.click(information)
    expect(screen.getByRole('dialog', { name: '전송 정보 안내' })).toBeInTheDocument()
    expect(information).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('button', { name: '안내 닫기' }))
    expect(screen.queryByRole('dialog', { name: '전송 정보 안내' })).not.toBeInTheDocument()
    expect(information).toHaveFocus()
  })

  it('예약을 외부 전송 없이 화면 안에서 완료 상태로 바꾼다', () => {
    render(<ConsultationReservationScreen />)

    fireEvent.click(screen.getByRole('button', { name: '예약 확정하기' }))

    expect(screen.getByText('예약 요청 완료')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '예약 요청 완료' })).toBeDisabled()
  })
})
