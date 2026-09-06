import { describe, expect, it } from 'vitest'

import { RECOVERY_RISK_CAUSES, RECOVERY_RISK_SUMMARY } from '@/shared/lib/recovery-risk-data'

import {
  FOLLOW_UP_BALANCE_STATUS,
  FOLLOW_UP_CONSENTS,
  FOLLOW_UP_EXECUTION_STATUSES,
  FOLLOW_UP_MILESTONES,
  FOLLOW_UP_RISK_STATUS,
  FOLLOW_UP_SUMMARY,
  getFollowUpExecutionStatuses,
  getRecoveryFollowUpHref,
  getRecoveryPacketActions,
  getRecoveryPacketHref,
  getSelfActionHref,
  normalizeSelfActionOptionId,
  RECOVERY_PACKET_ANALYSIS_NOTE,
  RECOVERY_PACKET_CAUSES,
  RECOVERY_PACKET_CORRECTIONS,
  RECOVERY_PACKET_RISK_SUMMARY,
  RECOVERY_PACKET_SCHEDULE,
  RECOVERY_PACKET_STATUS,
  SELF_ACTION_PLAN,
  SELF_ACTION_PREPARATION_ITEMS,
} from './recovery-execution-data'

describe('recovery execution data', () => {
  it.each([
    ['fixed-cost-reschedule', 'fixed-cost-reschedule'],
    [['unknown', 'fixed-cost-reschedule'], 'fixed-cost-reschedule'],
    ['repayment-adjustment', 'fixed-cost-reschedule'],
    [undefined, 'fixed-cost-reschedule'],
  ] as const)('normalizes %o into the supported self action plan', (plan, expectedId) => {
    expect(normalizeSelfActionOptionId(plan)).toBe(expectedId)
  })

  it.each([
    [['fixed-cost-reschedule'], '/recovery/self-action?plan=fixed-cost-reschedule'],
    [['repayment-adjustment'], null],
    [['fixed-cost-reschedule', 'refinancing-review'], null],
    [[], null],
  ] as const)('builds a self action href only for one supported plan', (plans, expectedHref) => {
    expect(getSelfActionHref(plans)).toBe(expectedHref)
  })

  it.each([
    [['fixed-cost-reschedule'], '/recovery?plans=fixed-cost-reschedule'],
    [
      ['refinancing-review', 'unknown', 'repayment-adjustment'],
      '/recovery?plans=refinancing-review&plans=repayment-adjustment',
    ],
    [undefined, '/recovery?plans=repayment-adjustment&plans=fixed-cost-reschedule'],
  ] as const)('builds a packet href from normalized plan query values', (plans, expectedHref) => {
    expect(getRecoveryPacketHref(plans)).toBe(expectedHref)
  })

  it('keeps selected recovery plans in the follow-up href and execution statuses', () => {
    expect(getRecoveryFollowUpHref(['fixed-cost-reschedule'])).toBe(
      '/recovery/follow-up?plans=fixed-cost-reschedule',
    )
    expect(
      getFollowUpExecutionStatuses(['fixed-cost-reschedule']).map(({ optionId }) => optionId),
    ).toEqual(['fixed-cost-reschedule'])
  })

  it('provides a follow-up execution state for every supported recovery plan', () => {
    expect(
      getFollowUpExecutionStatuses(['refinancing-review']).map(
        ({ description, optionId, status }) => ({ description, optionId, status }),
      ),
    ).toEqual([
      {
        description: '금리·중도상환 조건 확인 필요',
        optionId: 'refinancing-review',
        status: '진행 중',
      },
    ])
  })

  it('combines selected recovery plans with their execution metadata', () => {
    expect(
      getRecoveryPacketActions(['fixed-cost-reschedule', 'repayment-adjustment']).map(
        ({ id, nextAction, preparation, title }) => ({ id, nextAction, preparation, title }),
      ),
    ).toEqual([
      {
        id: 'repayment-adjustment',
        nextAction: '상담 예약 필요',
        preparation: '사업자등록증, 최근 3개월 거래내역',
        title: '상환조건 조정 상담',
      },
      {
        id: 'fixed-cost-reschedule',
        nextAction: '직접 실행 준비 가능',
        preparation: '임차계약서 확인, 임대인 협의',
        title: '고정비 납부일 재배치',
      },
    ])
  })

  it('provides the complete self action checklist and packet tracking fixtures', () => {
    expect(SELF_ACTION_PLAN.id).toBe('fixed-cost-reschedule')
    expect(SELF_ACTION_PREPARATION_ITEMS.map(({ title }) => title)).toEqual([
      '임차인 협의 요청 예정일 입력',
      '자동이체 일정 확인',
      '원리금 납부일 은행 협의 예정일 입력',
    ])
    expect(RECOVERY_PACKET_CORRECTIONS).toHaveLength(2)
    expect(RECOVERY_PACKET_ANALYSIS_NOTE).toContain('보정값 반영분만 포함')
    expect(RECOVERY_PACKET_STATUS).toMatchObject({
      createdAt: '2025-07-14 09:32',
      scope: '선택한 회복안 요약',
      transmission: '전송 전',
      version: 'v2',
    })
    expect(RECOVERY_PACKET_SCHEDULE.map(({ day }) => day)).toEqual([30, 60, 90])
  })

  it('reuses the canonical risk summary and causes in the recovery packet', () => {
    expect(RECOVERY_PACKET_RISK_SUMMARY).toBe(RECOVERY_RISK_SUMMARY)
    expect(RECOVERY_PACKET_CAUSES).toBe(RECOVERY_RISK_CAUSES)
  })

  it('provides the follow-up states needed to render the 30·60·90 day check', () => {
    expect(FOLLOW_UP_SUMMARY).toEqual({
      lastCheckedAt: '2025년 6월 23일',
      nextCheckAt: '2025년 9월 23일',
    })
    expect(FOLLOW_UP_MILESTONES.map(({ day, status }) => [day, status])).toEqual([
      [30, '완료'],
      [60, '완료'],
      [90, '예정'],
    ])
    expect(FOLLOW_UP_BALANCE_STATUS).toMatchObject({
      balanceStatus: '회복 완료',
      delinquencyStatus: '없음',
      recoveredBalance: '+₩2,400,000',
    })
    expect(
      FOLLOW_UP_EXECUTION_STATUSES.map(({ description, status }) => ({ description, status })),
    ).toEqual([
      { description: '장애요인 없음', status: '완료' },
      { description: '장애요인 담당자 확인 필요', status: '진행 중' },
      { description: '금리·중도상환 조건 확인 필요', status: '진행 중' },
    ])
    expect(FOLLOW_UP_RISK_STATUS).toMatchObject({
      level: '안정 구간',
      maximumBalance: '₩3,800,000',
      minimumBalance: '₩1,200,000',
    })
    expect(FOLLOW_UP_CONSENTS).toMatchObject([
      { isEnabled: true, label: '30-60-90일 점검 알림' },
      { isEnabled: true, label: '결과 개선 활용 동의' },
    ])
  })
})
