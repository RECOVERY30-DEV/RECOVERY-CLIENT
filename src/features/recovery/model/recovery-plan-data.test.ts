import { describe, expect, it } from 'vitest'

import {
  RECOVERY_RISK_CAUSES,
  RECOVERY_RISK_SUMMARY as SHARED_RISK_SUMMARY,
} from '@/shared/lib/recovery-risk-data'

import {
  DEFAULT_RECOVERY_OPTION_IDS,
  normalizeRecoveryOptionIds,
  RECOVERY_RISK_SUMMARY,
  RECOVERY_TOP_CAUSES,
} from './recovery-plan-data'

describe('recovery plan data', () => {
  it.each([
    [undefined, DEFAULT_RECOVERY_OPTION_IDS],
    ['', DEFAULT_RECOVERY_OPTION_IDS],
    ['unknown', DEFAULT_RECOVERY_OPTION_IDS],
    [
      ['repayment-adjustment', 'repayment-adjustment', 'fixed-cost-reschedule'],
      ['repayment-adjustment', 'fixed-cost-reschedule'],
    ],
    [
      ['unknown', 'refinancing-review', 'repayment-adjustment'],
      ['refinancing-review', 'repayment-adjustment'],
    ],
  ] as const)('normalizes %o into supported selected option IDs', (plans, expectedIds) => {
    expect(normalizeRecoveryOptionIds(plans)).toEqual(expectedIds)
  })

  it('uses the shared risk fixture instead of copying cashflow internals', () => {
    expect(RECOVERY_RISK_SUMMARY).toBe(SHARED_RISK_SUMMARY)
    expect(RECOVERY_TOP_CAUSES).toBe(RECOVERY_RISK_CAUSES)
  })
})
