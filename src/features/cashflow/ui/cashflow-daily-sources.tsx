import type { CashflowDailyDetail } from '../model/cashflow-daily-detail-data'

type CashflowDailySourcesProps = Readonly<{
  sources: CashflowDailyDetail['sources']
}>

export function CashflowDailySources({ sources }: CashflowDailySourcesProps) {
  return (
    <section aria-label="예측 데이터 출처" className="rounded-[10px] bg-neutral-100 px-[14px] py-5">
      <dl>
        {sources.map((source) => (
          <div
            className="flex min-h-[30px] items-center justify-between gap-3 text-[12px] leading-[14px]"
            key={source.label}
          >
            <dt className="font-medium text-primary-100">{source.label}</dt>
            <dd className="text-right font-semibold text-secondary-300">{source.status}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] leading-[13px] text-secondary-300">
        이 날짜의 예측은 확정값이 아닌 범위로 제공됩니다. 지원 자격·금융 승인·금리·한도는 상담자 및
        공식 출처의 최종 확인이 필요합니다.
      </p>
    </section>
  )
}
