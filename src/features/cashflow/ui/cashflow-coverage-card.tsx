import { CASHFLOW_COVERAGE_ITEMS } from '../model/cashflow-correction-data'

type CashflowCoverageCardProps = Readonly<{
  items?: ReadonlyArray<Readonly<{ label: string; value: string }>>
}>

export function CashflowCoverageCard({
  items = CASHFLOW_COVERAGE_ITEMS,
}: CashflowCoverageCardProps) {
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

      {items.length === 0 ? (
        <p className="mt-5 text-[12px] leading-[15px] text-secondary-300">
          데이터 반영률을 확인할 수 없습니다.
        </p>
      ) : (
        <dl className="mt-5 flex flex-col">
          {items.map((item) => (
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
      )}
    </section>
  )
}
