import { Button } from '@/shared/ui'

export function CashflowStableChangeNotice() {
  return (
    <section
      aria-labelledby="cashflow-stable-change-title"
      className="rounded-[10px] bg-neutral-100 px-[14px] py-[10px]"
    >
      <h2
        className="text-[18px] leading-[21px] font-bold text-neutral-900"
        id="cashflow-stable-change-title"
      >
        이런 경우 상태가 바뀔 수 있어요
      </h2>
      <p className="mt-[15px] text-[12px] leading-[15px] font-medium text-primary-100">
        현금매출·타행자금 등 은행이 알 수 없는 항목을 보정하지 않은 경우와 예정 지출이 갑자기 늘거나
        매출이 감소하는 경우
      </p>
      <Button
        className="mt-[15px] w-full disabled:bg-neutral-400 disabled:text-primary-blue-500"
        disabled
        variant="secondary"
      >
        확인 필요
      </Button>
    </section>
  )
}
