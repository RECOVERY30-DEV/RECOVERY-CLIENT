import { CASHFLOW_COVERAGE_ITEMS } from '../model/cashflow-correction-data'

export function CashflowCoverageCard() {
  return (
    <section
      aria-labelledby="cashflow-coverage-title"
      className="rounded-[10px] bg-neutral-100 px-[14px] py-5"
    >
      <h2
        className="text-[18px] leading-[21px] font-bold text-neutral-900"
        id="cashflow-coverage-title"
      >
        데이터 반영률
      </h2>

      <dl className="mt-5 flex flex-col">
        {CASHFLOW_COVERAGE_ITEMS.map((item) => (
          <div className="flex min-h-[30px] items-center justify-between gap-3" key={item.label}>
            <dt className="text-[12px] leading-[14px] font-medium text-primary-100">
              {item.label}
            </dt>
            <dd className="text-[12px] leading-[14px] font-semibold text-secondary-500">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
