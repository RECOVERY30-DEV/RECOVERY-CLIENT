'use client'

import { useDialogFocusTrap } from './use-dialog-focus-trap'

type CashflowDraftExitDialogProps = Readonly<{
  onContinue: () => void
  onDiscard: () => void
}>

export function CashflowDraftExitDialog({ onContinue, onDiscard }: CashflowDraftExitDialogProps) {
  const { dialogRef, handleKeyDown } = useDialogFocusTrap({ onClose: onContinue })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-200/50 px-6">
      <section
        aria-labelledby="cashflow-draft-exit-title"
        aria-modal="true"
        className="w-full max-w-[324px] rounded-[20px] bg-base-white px-5 py-[15px]"
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <h2
          className="text-[18px] leading-[21px] font-bold text-neutral-900"
          id="cashflow-draft-exit-title"
        >
          작성 중인 초안
        </h2>
        <p className="mt-[10px] text-[13px] leading-4 text-neutral-900">
          작성 중인 초안을 유지하거나 삭제하고 나갈 수 있습니다. 삭제 시 복구할 수 없습니다.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            className="min-h-[42px] rounded-[8px] bg-neutral-400 px-[22px] py-2 typo-body-3 text-primary-blue-900 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={onContinue}
            type="button"
          >
            계속 작성
          </button>
          <button
            className="min-h-[42px] rounded-[8px] bg-secondary-700 px-[22px] py-2 typo-body-3 text-base-white focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={onDiscard}
            type="button"
          >
            초안 삭제 후 나가기
          </button>
        </div>
      </section>
    </div>
  )
}
