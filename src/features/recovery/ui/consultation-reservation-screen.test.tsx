import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ConsultationPage from '@/app/recovery/consultation/page'

import { ConsultationReservationScreen } from './consultation-reservation-screen'

describe('상담 예약 화면', () => {
  it('지원사업 상세 상담에는 해당 사업만 표시하고 선택한 지원사업 전송 항목을 제공한다', async () => {
    render(
      await ConsultationPage({
        searchParams: Promise.resolve({ program: 'credit-guarantee-sales-decline' }),
      }),
    )

    expect(screen.getByRole('heading', { name: '지원사업 상담' })).toBeInTheDocument()
    expect(screen.getByText('신용보증기금 매출감소특례보증')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '지원사업 상세로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery/support-programs/credit-guarantee-sales-decline',
    )
    expect(screen.queryByTestId('selected-recovery-options-summary')).not.toBeInTheDocument()
    expect(screen.queryByText('선택한 회복안')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '선택한 지원사업' })).toBeChecked()
  })

  it('지원사업 목록 상담에는 기본 회복안을 표시하거나 전송하지 않는다', async () => {
    render(
      await ConsultationPage({ searchParams: Promise.resolve({ source: 'support-programs' }) }),
    )

    expect(screen.getByRole('heading', { name: '지원사업 상담' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '지원사업 목록으로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery/support-programs',
    )
    expect(screen.queryByTestId('selected-recovery-options-summary')).not.toBeInTheDocument()
    expect(screen.queryByText('선택한 회복안')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '지원사업 상담 요청 내용' })).toBeChecked()
  })

  it('지원사업과 plans query가 함께 있으면 지원사업 맥락을 우선한다', async () => {
    render(
      await ConsultationPage({
        searchParams: Promise.resolve({
          program: 'small-business-stability-fund',
          plans: ['refinancing-review'],
        }),
      }),
    )

    expect(screen.getByRole('heading', { name: '지원사업 상담' })).toBeInTheDocument()
    expect(screen.getByText('소상공인 경영안정자금')).toBeInTheDocument()
    expect(screen.queryByTestId('selected-recovery-options-summary')).not.toBeInTheDocument()
    expect(screen.queryByText('상환조건 조정 상담')).not.toBeInTheDocument()
    expect(screen.queryByText('대환 검토')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '선택한 지원사업' })).toBeChecked()
  })

  it('유효하지 않은 지원사업 ID는 기본 회복안 상담으로 안전하게 되돌린다', async () => {
    render(
      await ConsultationPage({ searchParams: Promise.resolve({ program: 'unknown-program' }) }),
    )

    expect(screen.getByRole('link', { name: '회복안 비교로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery/compare',
    )
    expect(screen.getByText('상환조건 조정 상담')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '선택한 회복안' })).toBeChecked()
  })

  it('회복안 상담은 기존 회복안 선택과 전송 항목을 유지한다', () => {
    render(<ConsultationReservationScreen />)

    expect(screen.getByTestId('selected-recovery-options-summary')).toHaveTextContent(
      '상환조건 조정 상담',
    )
    expect(screen.getByTestId('selected-recovery-options-summary')).toHaveTextContent(
      '고정비 납부일 재배치',
    )
    expect(screen.getByRole('checkbox', { name: '선택한 회복안' })).toBeChecked()
  })

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

  it.each([
    ['query가 없을 때', undefined, ['상환조건 조정 상담', '고정비 납부일 재배치']],
    ['빈 query일 때', '', ['상환조건 조정 상담', '고정비 납부일 재배치']],
    ['유효하지 않은 query만 있을 때', 'unknown', ['상환조건 조정 상담', '고정비 납부일 재배치']],
    [
      '중복된 query일 때',
      ['repayment-adjustment', 'repayment-adjustment', 'fixed-cost-reschedule'],
      ['상환조건 조정 상담', '고정비 납부일 재배치'],
    ],
    [
      '유효하지 않은 값이 섞인 query일 때',
      ['unknown', 'refinancing-review', 'repayment-adjustment'],
      ['상환조건 조정 상담', '대환 검토'],
    ],
  ] as const)('%s 회복안을 정규화한다', async (_name, plans, expectedTitles) => {
    render(await ConsultationPage({ searchParams: Promise.resolve({ plans }) }))

    const selectedOptions = screen.getByTestId('selected-recovery-options-summary')
    expect(selectedOptions).toHaveTextContent(expectedTitles[0])
    expect(selectedOptions).toHaveTextContent(expectedTitles[1])
    expect(selectedOptions.textContent).not.toContain('unknown')
  })

  it('전화 상담 한 채널과 세 개의 시간을 단일 선택한다', () => {
    render(<ConsultationReservationScreen />)

    expect(screen.getAllByRole('radio', { name: '전화 상담' })).toHaveLength(1)
    expect(screen.getByRole('radio', { name: '채팅 상담' })).toBeDisabled()

    const morning = screen.getByRole('radio', { name: '2025년 7월 14일 오전 10시' })
    const afternoon = screen.getByRole('radio', { name: '2025년 7월 14일 오후 2시' })
    const nextDay = screen.getByRole('radio', { name: '2025년 7월 15일 오전 11시' })
    expect(morning).toBeChecked()
    expect(morning.closest('label')).toHaveClass('has-[:focus-visible]:ring-primary-blue-800')

    fireEvent.click(nextDay)
    expect(nextDay).toBeChecked()
    expect(morning).not.toBeChecked()
    expect(afternoon).not.toBeChecked()
    expect(screen.getByText('잔여 1석')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '원하는 시간이 없어요' })).toBeInTheDocument()
  })

  it('전송 범위 안내와 예약 내용 최종 확인을 한 화면에서 제공한다', () => {
    render(<ConsultationReservationScreen />)

    expect(screen.getByRole('heading', { name: '상담원 전송 정보 범위' })).toBeInTheDocument()
    expect(screen.getByText(/전송 동의가 없어도 예약은 완료됩니다/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '예약 내용 최종 확인' })).toBeInTheDocument()
    expect(screen.getByText('선택한 회복안 2건')).toBeInTheDocument()
  })

  it('세 전송 항목을 독립적으로 선택하고 안내 modal을 닫을 수 있다', async () => {
    render(<ConsultationReservationScreen />)

    const backLink = screen.getByRole('link', { name: '회복안 비교로 돌아가기' })
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
    expect(information).toHaveClass('focus-visible:ring-primary-blue-800')
    fireEvent.click(information)
    const dialog = screen.getByRole('dialog', { name: '전송 정보 안내' })
    const closeButton = screen.getByRole('button', { name: '안내 닫기' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(
      screen.getByText(
        '서버 연동 전에는 선택한 항목이 상담 준비 화면에만 표시되며 실제 상담사에게 전송되지 않습니다.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(/상담사에게 전달되며/)).not.toBeInTheDocument()
    expect(screen.getByTestId('consultation-reservation-background')).toHaveAttribute('inert')
    expect(backLink.closest('[inert]')).not.toBeNull()
    expect(information).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(closeButton, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true })
    expect(closeButton).toHaveFocus()

    fireEvent.click(closeButton)
    expect(screen.queryByRole('dialog', { name: '전송 정보 안내' })).not.toBeInTheDocument()
    await waitFor(() => expect(information).toHaveFocus())
    expect(screen.getByTestId('consultation-reservation-background')).not.toHaveAttribute('inert')
  })

  it('안내 modal을 Escape로 닫고 trigger에 focus를 복원한다', async () => {
    render(<ConsultationReservationScreen />)

    const information = screen.getByRole('button', { name: '전송 정보 안내' })
    fireEvent.click(information)
    fireEvent.keyDown(screen.getByRole('dialog', { name: '전송 정보 안내' }), { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: '전송 정보 안내' })).not.toBeInTheDocument()
    await waitFor(() => expect(information).toHaveFocus())
  })

  it('예약을 외부 전송 없이 화면 안에서 완료 상태로 바꾼다', () => {
    render(<ConsultationReservationScreen />)

    fireEvent.click(screen.getByRole('button', { name: '예약 확정하기' }))

    expect(screen.getByText('화면 내 예약 정보 확인 완료')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '화면 내 확인 완료' })).toBeDisabled()
    expect(
      screen.getByText(/이 상태는 새로고침하면 초기화되며 실제 상담사에게 전송되지 않습니다/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/상담사는 .* 확인합니다/)).not.toBeInTheDocument()
  })
})
