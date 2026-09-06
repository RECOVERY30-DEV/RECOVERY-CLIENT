import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import RecoveryActionSavePage from './actions/fixed-cost-reschedule/save/page'
import RecoveryFollowUpPage from './follow-up/page'
import RecoveryPacketPage from './page'

describe('Recovery route entries', () => {
  it('renders the Recovery Packet route entry', () => {
    render(<RecoveryPacketPage />)

    expect(screen.getByRole('heading', { name: 'Recovery Packet' })).toBeInTheDocument()
  })

  it('renders the follow-up route entry', () => {
    render(<RecoveryFollowUpPage />)

    expect(screen.getByRole('heading', { name: '30·60·90일 사후점검' })).toBeInTheDocument()
  })

  it('renders the self-action save route entry', () => {
    render(<RecoveryActionSavePage />)

    expect(screen.getByRole('heading', { name: '자체 실행 저장' })).toBeInTheDocument()
  })
})
