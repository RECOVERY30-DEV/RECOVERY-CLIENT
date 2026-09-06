import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/recovery/ui/self-action-setup-screen', () => ({
  SelfActionSetupScreen: ({ optionId }: Readonly<{ optionId?: string }>) => (
    <section>
      <h1>자체 실행 저장</h1>
      <output data-testid="self-action-option-id">{optionId}</output>
    </section>
  ),
}))

import RecoveryFollowUpPage from './follow-up/page'
import RecoveryPacketPage from './page'
import CanonicalSelfActionPage from './actions/fixed-cost-reschedule/save/page'
import SelfActionPage from './self-action/page'

describe('회복 실행·추적 route adapter', () => {
  it('Packet query를 검증하고 중복을 제거한 최대 두 회복안만 전달한다', async () => {
    render(
      await RecoveryPacketPage({
        searchParams: Promise.resolve({
          plans: [
            'unknown',
            'fixed-cost-reschedule',
            'fixed-cost-reschedule',
            'refinancing-review',
            'repayment-adjustment',
          ],
        }),
      }),
    )

    const selectedActions = screen.getByRole('region', { name: '선택한 회복안' })
    expect(
      within(selectedActions).getByRole('heading', { name: '고정비 납부일 재배치' }),
    ).toBeInTheDocument()
    expect(within(selectedActions).getByRole('heading', { name: '대환 검토' })).toBeInTheDocument()
    expect(
      within(selectedActions).queryByRole('heading', { name: '상환조건 조정 상담' }),
    ).not.toBeInTheDocument()
  })

  it('지원하지 않는 자체 실행 query는 고정비 납부일 재배치로 안전하게 정규화한다', async () => {
    render(
      await SelfActionPage({
        searchParams: Promise.resolve({ plan: 'repayment-adjustment' }),
      }),
    )

    expect(screen.getByTestId('self-action-option-id')).toHaveTextContent('fixed-cost-reschedule')
  })

  it('계획된 canonical 자체 실행 저장 route로 진입한다', async () => {
    render(
      await CanonicalSelfActionPage({
        searchParams: Promise.resolve({ plan: 'fixed-cost-reschedule' }),
      }),
    )

    expect(screen.getByRole('heading', { name: '자체 실행 저장' })).toBeInTheDocument()
    expect(screen.getByTestId('self-action-option-id')).toHaveTextContent('fixed-cost-reschedule')
  })

  it('사후점검 query의 회복안만 실행 상태로 전달한다', async () => {
    render(
      await RecoveryFollowUpPage({
        searchParams: Promise.resolve({ plans: ['unknown', 'refinancing-review'] }),
      }),
    )

    expect(screen.getByRole('heading', { name: '대환 검토' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '상환조건 조정 상담' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '고정비 납부일 재배치' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Recovery Packet으로 돌아가기' })).toHaveAttribute(
      'href',
      '/recovery?plans=refinancing-review',
    )
  })
})
