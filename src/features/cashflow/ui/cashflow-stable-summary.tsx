import { cn } from '@/shared/lib'

import type { CashflowStatusMetric } from '../model/cashflow-stable-status-data'

type CashflowStableSummaryProps = Readonly<{
  metrics: readonly CashflowStatusMetric[]
  note?: string
}>

export function CashflowStableSummary({ metrics, note }: CashflowStableSummaryProps) {
  return (
    <section
      aria-labelledby="cashflow-stable-summary-title"
      className="rounded-[10px] bg-neutral-100 px-[14px] py-5"
    >
      <h2
        className="text-[18px] leading-[21px] font-bold text-neutral-900"
        id="cashflow-stable-summary-title"
      >
        핵심 수치 요약
      </h2>

      <dl className="mt-5 flex flex-col">
        {metrics.map((metric) => (
          <div className="flex min-h-[30px] items-center justify-between gap-3" key={metric.label}>
            <dt className="shrink-0 text-[12px] leading-[14px] font-medium text-primary-100">
              {metric.label}
            </dt>
            <dd
              className={cn(
                'text-right text-[12px] leading-[14px] font-semibold',
                metric.tone === 'danger' ? 'text-[#ea0065]' : 'text-info-500',
              )}
            >
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
      {note ? <p className="mt-2 text-[12px] leading-[14px] text-secondary-300">{note}</p> : null}
    </section>
  )
}
