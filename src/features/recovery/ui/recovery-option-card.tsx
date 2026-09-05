'use client'

import { cn } from '@/shared/lib'

import { RECOVERY_OPTION_CATALOG, type RecoveryOptionId } from '../model/recovery-plan-data'

type RecoveryOptionCardProps = Readonly<{
  isSelected: boolean
  onSelect: () => void
  optionId: RecoveryOptionId
}>

export function RecoveryOptionCard({
  isSelected,
  onSelect,
  optionId,
}: RecoveryOptionCardProps): React.JSX.Element {
  const option = RECOVERY_OPTION_CATALOG.find((item) => item.id === optionId)

  if (!option) {
    return <></>
  }

  return (
    <button
      aria-label={option.title}
      aria-pressed={isSelected}
      className={cn(
        'w-full rounded-[10px] border bg-neutral-100 p-[14px] text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none',
        isSelected
          ? 'border-primary-blue-400 bg-base-white'
          : 'border-disabled-50 hover:border-primary-blue-300',
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="typo-body-5 text-secondary-800">{option.title}</span>
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 size-4 shrink-0 rounded-full border',
            isSelected ? 'border-primary-blue-500 bg-primary-blue-400' : 'border-disabled-50',
          )}
        />
      </span>
      <span className="mt-3 block space-y-[7px] text-[12px] leading-[14px] text-neutral-900">
        <span className="flex justify-between gap-3">
          <span>예상 효과</span>
          <strong className="text-right font-medium">{option.effect}</strong>
        </span>
        <span className="flex justify-between gap-3">
          <span>월 부담 변화</span>
          <strong className="text-right font-medium">{option.monthlyChange}</strong>
        </span>
        <span className="flex justify-between gap-3">
          <span>상환조건</span>
          <strong className="text-right font-medium">{option.condition}</strong>
        </span>
      </span>
      <span className="mt-3 block text-[11px] leading-[13px] text-secondary-300">
        {option.description}
      </span>
    </button>
  )
}
