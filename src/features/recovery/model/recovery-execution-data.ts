import { RECOVERY_RISK_CAUSES } from '@/shared/lib/recovery-risk-data'

import {
  getRecoveryOptions,
  normalizeRecoveryOptionIds,
  RECOVERY_OPTION_CATALOG,
  type RecoveryOption,
  type RecoveryOptionId,
} from './recovery-plan-data'

export const SELF_ACTION_OPTION_ID = 'fixed-cost-reschedule' as const satisfies RecoveryOptionId

export type SelfActionPreparationItem = Readonly<{
  description: string
  id: string
  title: string
}>

export const SELF_ACTION_PREPARATION_ITEMS: readonly SelfActionPreparationItem[] = [
  {
    description: '임대인과 납부일 조정 가능 여부 확인',
    id: 'tenant-request-date',
    title: '임대인에게 납부일 조정 요청하기',
  },
  {
    description: '자동이체 출금일 재설정 확인',
    id: 'automatic-transfer-schedule',
    title: '자동이체 일정 확인',
  },
  {
    description: '거래 은행에 원리금 납부일 변경 신청',
    id: 'loan-payment-request-date',
    title: '원리금 납부일 은행 협의하기',
  },
]

export const SELF_ACTION_EFFECT = {
  disclaimer: '실제 효과는 협의 결과에 따라 달라질 수 있습니다.',
  firstShortageAfter: '20일',
  firstShortageBefore: '8일',
  minimumBalanceAfter: '-180만 원',
  minimumBalanceBefore: '-240만 원',
  summary: '첫 부족일 +12일 연장, 예상 최저잔액 -180만 원',
} as const

const selfActionPlan = RECOVERY_OPTION_CATALOG.find(({ id }) => id === SELF_ACTION_OPTION_ID)

if (!selfActionPlan) {
  throw new Error('자체 실행 회복안이 회복안 목록에 존재해야 합니다.')
}

export const SELF_ACTION_PLAN = selfActionPlan

function isSelfActionOptionId(value: string): value is typeof SELF_ACTION_OPTION_ID {
  return value === SELF_ACTION_OPTION_ID
}

export function normalizeSelfActionOptionId(
  plan: string | readonly string[] | undefined,
): typeof SELF_ACTION_OPTION_ID {
  const planValues = typeof plan === 'string' ? [plan] : (plan ?? [])

  return planValues.find(isSelfActionOptionId) ?? SELF_ACTION_OPTION_ID
}

export function getSelfActionHref(selectedOptionIds: readonly RecoveryOptionId[]): string | null {
  if (selectedOptionIds.length !== 1 || selectedOptionIds[0] !== SELF_ACTION_OPTION_ID) {
    return null
  }

  return `/recovery/actions/${SELF_ACTION_OPTION_ID}/save?plan=${SELF_ACTION_OPTION_ID}`
}

export function getRecoveryPacketHref(plans: string | readonly string[] | undefined): string {
  const parameters = new URLSearchParams()

  normalizeRecoveryOptionIds(plans).forEach((id) => parameters.append('plans', id))

  return `/recovery?${parameters.toString()}`
}

export function getRecoveryFollowUpHref(plans: string | readonly string[] | undefined): string {
  const parameters = new URLSearchParams()

  normalizeRecoveryOptionIds(plans).forEach((id) => parameters.append('plans', id))

  return `/recovery/follow-up?${parameters.toString()}`
}

export type RecoveryPacketCorrection = Readonly<{
  amount: string
  date: string
  title: string
}>

export const RECOVERY_PACKET_CORRECTIONS: readonly RecoveryPacketCorrection[] = [
  { amount: '+65만 원', date: '7월 20일', title: '현금매출 추가 입력' },
  { amount: '-120만 원', date: '7월 22일', title: '예정 지출 (인테리어 대금)' },
]

export const RECOVERY_PACKET_ANALYSIS_NOTE =
  '사업자계좌·카드정산·자동이체 포함. 현금거래·타행자금은 보정값 반영분만 포함됩니다.'

export const RECOVERY_PACKET_RISK_SUMMARY = {
  minimumBalanceRange: '-240만 원 ~ -180만 원',
  shortSummary: '8일 후 · 7월 22일',
} as const
export const RECOVERY_PACKET_CAUSES = RECOVERY_RISK_CAUSES

type RecoveryPacketActionMetadata = Readonly<{
  effect: string
  nextAction: string
  preparation: string
}>

export type RecoveryPacketAction = RecoveryOption & RecoveryPacketActionMetadata

const RECOVERY_PACKET_ACTION_METADATA: Readonly<
  Record<RecoveryOptionId, RecoveryPacketActionMetadata>
> = {
  'fixed-cost-reschedule': {
    effect: '부족일 +12일 개선 추정',
    nextAction: '직접 실행 준비 가능',
    preparation: '임차계약서 확인, 임대인 협의',
  },
  'refinancing-review': {
    effect: '월 상환 부담 조정 가능',
    nextAction: '금리·중도상환 조건 확인 필요',
    preparation: '기존 대출 약정서, 최근 3개월 거래내역',
  },
  'repayment-adjustment': {
    effect: '월 부담 -40만 원 추정',
    nextAction: '상담 예약 필요',
    preparation: '사업자등록증, 최근 3개월 거래내역',
  },
}

export function getRecoveryPacketActions(
  plans: string | readonly string[] | undefined,
): readonly RecoveryPacketAction[] {
  return getRecoveryOptions(normalizeRecoveryOptionIds(plans)).map((option) => ({
    ...option,
    ...RECOVERY_PACKET_ACTION_METADATA[option.id],
  }))
}

export const RECOVERY_PACKET_STATUS = {
  createdAt: '2025-07-14 09:32',
  scope: '선택한 회복안 요약',
  transmission: '전송 전',
  version: 'v2',
} as const

export type RecoveryPacketScheduleItem = Readonly<{
  date: string
  day: 30 | 60 | 90
  status: '완료' | '예정'
}>

export const RECOVERY_PACKET_SCHEDULE: readonly RecoveryPacketScheduleItem[] = [
  { date: '2025-08-13', day: 30, status: '완료' },
  { date: '2025-09-12', day: 60, status: '완료' },
  { date: '2025-10-12', day: 90, status: '예정' },
]

export const FOLLOW_UP_SUMMARY = {
  lastCheckedAt: '2025년 9월 12일',
  nextCheckAt: '2025년 10월 12일',
} as const

export type FollowUpMilestone = Readonly<{
  date: string
  day: 30 | 60 | 90
  status: '완료' | '예정'
}>

export const FOLLOW_UP_MILESTONES: readonly FollowUpMilestone[] = [
  { date: '2025-08-13', day: 30, status: '완료' },
  { date: '2025-09-12', day: 60, status: '완료' },
  { date: '2025-10-12', day: 90, status: '예정' },
]

export const FOLLOW_UP_BALANCE_STATUS = {
  balanceStatus: '회복 완료',
  delinquencyStatus: '없음',
  recoveredBalance: '+₩2,400,000',
} as const

export type FollowUpExecutionStatus = Readonly<{
  description: string
  optionId: RecoveryOptionId
  status: '완료' | '진행 중'
  title: string
}>

export const FOLLOW_UP_EXECUTION_STATUSES: readonly FollowUpExecutionStatus[] = [
  {
    description: '장애요인 없음',
    optionId: 'repayment-adjustment',
    status: '완료',
    title: '상환조건 조정 상담',
  },
  {
    description: '장애요인 담당자 확인 필요',
    optionId: 'fixed-cost-reschedule',
    status: '진행 중',
    title: '고정비 납부일 재배치',
  },
  {
    description: '금리·중도상환 조건 확인 필요',
    optionId: 'refinancing-review',
    status: '진행 중',
    title: '대환 검토',
  },
]

export function getFollowUpExecutionStatuses(
  plans: string | readonly string[] | undefined,
): readonly FollowUpExecutionStatus[] {
  const selectedOptionIds = normalizeRecoveryOptionIds(plans)

  return FOLLOW_UP_EXECUTION_STATUSES.filter(({ optionId }) => selectedOptionIds.includes(optionId))
}

export const FOLLOW_UP_RISK_STATUS = {
  description: '30일 예측 기준 안정 구간에 있습니다.',
  disclaimer: '예측값은 범위이며 확정 수치가 아닙니다.',
  level: '안정 구간',
  maximumBalance: '₩3,800,000',
  minimumBalance: '₩1,200,000',
} as const

export type FollowUpConsent = Readonly<{
  id: string
  isEnabled: boolean
  label: string
}>

export const FOLLOW_UP_CONSENTS: readonly FollowUpConsent[] = [
  { id: 'check-reminders', isEnabled: true, label: '30·60·90일 점검 알림' },
  { id: 'result-improvement', isEnabled: true, label: '결과 개선 활용 동의' },
]
