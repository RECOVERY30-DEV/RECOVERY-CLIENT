import { RECOVERY_RISK_CAUSES, RECOVERY_RISK_SUMMARY } from '@/shared/lib/recovery-risk-data'

export type RecoveryOptionId =
  'repayment-adjustment' | 'fixed-cost-reschedule' | 'refinancing-review'

export type RecoveryOption = Readonly<{
  condition: string
  description: string
  difficulty: string
  effect: string
  id: RecoveryOptionId
  monthlyChange: string
  title: string
}>

export const RECOVERY_OPTION_CATALOG: readonly RecoveryOption[] = [
  {
    condition: '원리금 3회 이상 정상 납부 이력',
    description: '금융기관과 상환 조건을 조정할 수 있는지 확인합니다.',
    difficulty: '중 · 상담 후 심사 필요',
    effect: '부족일 최대 16일 연장 가능',
    id: 'repayment-adjustment',
    monthlyChange: '월 상환액 약 15만 원 감소 예상',
    title: '상환조건 조정 상담',
  },
  {
    condition: '임차료·공과금 납부일 협의 가능',
    description: '월말에 몰린 고정비의 납부일을 분산하는 방안을 확인합니다.',
    difficulty: '하 · 거래처 확인 필요',
    effect: '월말 부족 위험 완화 가능',
    id: 'fixed-cost-reschedule',
    monthlyChange: '월 부담 총액은 유지',
    title: '고정비 납부일 재배치',
  },
  {
    condition: '금리·중도상환 조건 비교 필요',
    description: '대환 가능성과 총 비용 변화를 상담으로 검토합니다.',
    difficulty: '상 · 조건 비교 필요',
    effect: '월 상환 부담 조정 가능',
    id: 'refinancing-review',
    monthlyChange: '심사 결과에 따라 달라짐',
    title: '대환 검토',
  },
]

export const DEFAULT_RECOVERY_OPTION_IDS: readonly RecoveryOptionId[] = [
  'repayment-adjustment',
  'fixed-cost-reschedule',
]

export { RECOVERY_RISK_SUMMARY }
export const RECOVERY_TOP_CAUSES = RECOVERY_RISK_CAUSES

export function isRecoveryOptionId(value: string): value is RecoveryOptionId {
  return RECOVERY_OPTION_CATALOG.some((option) => option.id === value)
}

export function normalizeRecoveryOptionIds(
  plans: string | readonly string[] | undefined,
): readonly RecoveryOptionId[] {
  const planValues = typeof plans === 'string' ? [plans] : (plans ?? [])
  const selectedIds: RecoveryOptionId[] = []

  for (const plan of planValues) {
    if (isRecoveryOptionId(plan) && !selectedIds.includes(plan)) {
      selectedIds.push(plan)
    }

    if (selectedIds.length === 2) {
      break
    }
  }

  return selectedIds.length > 0 ? selectedIds : DEFAULT_RECOVERY_OPTION_IDS
}

export function getRecoveryOptions(ids: readonly RecoveryOptionId[]): readonly RecoveryOption[] {
  return RECOVERY_OPTION_CATALOG.filter((option) => ids.includes(option.id))
}
