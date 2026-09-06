import Link from 'next/link'

import { HOME_DATA_SOURCES, HOME_DATA_STATUSES } from '@/features/business-home/model/home-data'

export function DataSourceSummary() {
  return (
    <section className="rounded-[10px] bg-neutral-100 px-[19px] py-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">데이터 활용</p>
      <h2 className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">
        분석에 포함된 데이터
      </h2>

      <ul className="mt-[14px]">
        {HOME_DATA_SOURCES.map((source) => (
          <li
            className="flex h-[30px] items-center justify-between text-[12px] leading-[14px]"
            key={source.label}
          >
            <span className="flex items-center gap-2 font-medium text-primary-100">
              <span aria-hidden="true" className="size-2 rounded-[1px] bg-warning-500" />
              {source.label}
            </span>
            <span className="font-semibold text-warning-500">{source.refreshedAt}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AnalysisDataScopeCard() {
  return (
    <Link
      aria-label="분석 데이터 범위 자세히 보기"
      className="block rounded-[10px] bg-neutral-100 px-[19px] py-[14px] focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
      href="/data-scope"
    >
      <h2 className="text-[18px] leading-[21px] font-bold text-neutral-900">분석 데이터 범위</h2>
      <p className="mt-1 text-[12px] leading-[14px] text-neutral-700">
        현금매출·타행자금 등 일부 정보는 포함되지 않을 수 있습니다.
      </p>

      <ul className="mt-[14px] flex flex-col gap-[6px]">
        {HOME_DATA_STATUSES.map((source) => (
          <li
            className="flex h-[50px] items-center justify-between rounded-lg bg-neutral-400 px-[14px] text-[14px] leading-[17px] font-medium text-primary-100"
            key={source.label}
          >
            <span>{source.label}</span>
            <span
              className={
                source.status === '부분 반영'
                  ? 'text-[12px] font-semibold text-primary-blue-300'
                  : 'text-[12px] font-semibold text-primary-blue-500'
              }
            >
              {source.status}
            </span>
          </li>
        ))}
      </ul>
    </Link>
  )
}
