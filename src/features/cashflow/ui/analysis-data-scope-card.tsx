import Link from 'next/link'

import { CASHFLOW_DATA_SOURCES } from '../model/cashflow-dashboard-data'

export function AnalysisDataScopeCard() {
  return (
    <section className="h-[288px] rounded-[10px] bg-neutral-100 px-[14px] py-5">
      <p className="text-[12px] leading-[14px] font-semibold text-primary-blue-700">
        최종 갱신 09:14
      </p>
      <h2 className="mt-[5px] text-[18px] leading-[21px] font-bold text-neutral-900">
        분석 데이터 범위
      </h2>

      <dl className="mt-5">
        {CASHFLOW_DATA_SOURCES.map((source) => (
          <div
            className="flex h-[30px] items-center justify-between px-0.5 text-[12px] leading-[14px]"
            key={source.label}
          >
            <dt className="font-medium text-primary-100">{source.label}</dt>
            <dd className="font-semibold text-primary-blue-700">{source.status}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-1 px-0.5 text-[12px] leading-[14px] font-medium text-secondary-300">
        현금매출·타행자금 등 누락 가능 항목이 있습니다.
      </p>
      <Link
        className="mt-[20px] inline-flex border-b border-neutral-700 py-0.5 text-[12px] leading-[14px] font-medium text-secondary-300"
        href="/data-scope"
      >
        분석 데이터 범위 확인하기
      </Link>
    </section>
  )
}
