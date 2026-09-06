import { useId } from 'react'

import { cn } from '@/shared/lib'

import type { RecoveryOptionView } from '../api/recovery-option-contract'

type RecoveryOptionCardProps = Readonly<{
  isSelected: boolean
  onSelect: () => void
  option: RecoveryOptionView
}>

const RECOVERY_OPTION_TITLES: Readonly<Record<string, string>> = {
  FIXED_COST_RESCHEDULE: '고정비 납부일 재배치',
  REFINANCING_REVIEW: '대환 검토',
  REPAYMENT_ADJUST: '상환조건 조정 상담',
}

export function getRecoveryOptionTitle(optionCode: string): string {
  return RECOVERY_OPTION_TITLES[optionCode] ?? optionCode.replaceAll('_', ' ')
}

export function RecoveryOptionCard({
  isSelected,
  onSelect,
  option,
}: RecoveryOptionCardProps): React.JSX.Element {
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descriptionId = `${generatedId}-description`
  const noteId = `${generatedId}-note`

  return (
    <button
      aria-describedby={`${descriptionId} ${noteId}`}
      aria-labelledby={titleId}
      aria-pressed={isSelected}
      className={cn(
        'w-full rounded-[10px] border bg-neutral-100 p-[14px] text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none',
        isSelected
          ? 'border-primary-blue-700 bg-base-white'
          : 'border-disabled-50 hover:border-primary-blue-300',
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="typo-body-5 text-secondary-800" id={titleId}>
          {getRecoveryOptionTitle(option.optionCode)}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 size-4 shrink-0 rounded-full border',
            isSelected ? 'border-primary-blue-700 bg-primary-blue-700' : 'border-disabled-50',
          )}
        />
      </span>
      <span
        className="mt-3 block space-y-[7px] text-[12px] leading-[14px] text-neutral-900"
        id={descriptionId}
      >
        <span className="flex justify-between gap-3">
          <span>예상 효과</span>
          <strong className="text-right font-medium">{option.expectedEffectText}</strong>
        </span>
        <span className="flex justify-between gap-3">
          <span>월 부담 변화</span>
          <strong className="text-right font-medium">{option.monthlyBurdenChangeText}</strong>
        </span>
        <span className="flex justify-between gap-3">
          <span>사전 조건</span>
          <strong className="text-right font-medium">{option.preconditionText}</strong>
        </span>
      </span>
      <span className="mt-3 block text-[11px] leading-[13px] text-secondary-300" id={noteId}>
        {option.disclaimer}
      </span>
    </button>
  )
}
