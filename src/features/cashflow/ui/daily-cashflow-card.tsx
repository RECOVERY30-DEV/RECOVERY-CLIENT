import Link from 'next/link'

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

      <ul className="mt-5">
        {DAILY_CASHFLOW_ITEMS.map((item) => (
          <li key={item.id}>
            <Link
              aria-label={`${item.date} 상세 보기`}
              className="flex h-[30px] items-center justify-between rounded px-0.5 text-[12px] leading-[14px] focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:outline-none"
              href={`/cashflow/daily/${item.id}`}
            >
              <span className="font-medium text-primary-100">{item.date}</span>
              <span className="font-semibold text-primary-blue-700">{item.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
