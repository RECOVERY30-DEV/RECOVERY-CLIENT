import { CASHFLOW_STABLE_METRICS } from '../model/cashflow-stable-status-data'

export function CashflowStableSummary() {
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
        {CASHFLOW_STABLE_METRICS.map((metric) => (
          <div className="flex min-h-[30px] items-center justify-between gap-3" key={metric.label}>
            <dt className="shrink-0 text-[12px] leading-[14px] font-medium text-primary-100">
              {metric.label}
            </dt>
            <dd className="text-right text-[12px] leading-[14px] font-semibold text-primary-blue-800">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
