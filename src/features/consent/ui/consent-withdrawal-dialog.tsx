import { Button } from '@/shared/ui'

type ConsentWithdrawalDialogProps = Readonly<{
  errorMessage?: string
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
}>

export function ConsentWithdrawalDialog({
  errorMessage,
  isPending = false,
  onCancel,
  onConfirm,
}: ConsentWithdrawalDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-200/50 px-4"
      onClick={onCancel}
    >
      <section
        aria-labelledby="consent-withdrawal-title"
        aria-modal="true"
        className="w-full max-w-[324px] rounded-[20px] bg-base-white px-5 py-[15px]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2
          className="text-[18px] leading-[21px] font-bold text-neutral-900"
          id="consent-withdrawal-title"
        >
          동의 철회 확인
        </h2>
        <p className="mt-[10px] text-[13px] leading-4 text-neutral-900">
          분석 동의를 철회하면 30일 현금흐름 예측, 부족 원인 분석 등 모든 서비스 기능을 이용할 수
          없게 됩니다.
        </p>
        {errorMessage === undefined ? null : (
          <p className="mt-3 text-[12px] leading-4 text-warning-700" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button className="w-full" disabled={isPending} onClick={onCancel} variant="secondary">
            취소
          </Button>
          <Button className="w-full" disabled={isPending} onClick={onConfirm}>
            {isPending ? '변경 중' : '철회'}
          </Button>
        </div>
      </section>
    </div>
  )
}
