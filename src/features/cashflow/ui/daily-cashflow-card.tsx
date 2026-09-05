import { DAILY_CASHFLOW_ITEMS } from '../model/cashflow-dashboard-data'

export function DailyCashflowCard() {
  return (
    <section className="h-[289px] rounded-[10px] bg-neutral-100 px-[14px] py-5">
      <p className="text-[12px] leading-[14px] font-semibold text-primary-blue-700">
        최종 갱신 09:14
      </p>
      <h2 className="mt-[5px] text-[18px] leading-[21px] font-bold text-neutral-900">
        일자별 현금흐름
      </h2>

      <dl className="mt-5">
        {DAILY_CASHFLOW_ITEMS.map((item) => (
          <div
            className="flex h-[30px] items-center justify-between px-0.5 text-[12px] leading-[14px]"
            key={item.date}
          >
            <dt className="font-medium text-primary-100">{item.date}</dt>
            <dd className="font-semibold text-primary-blue-700">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
