import type { HomeForecastViewModel } from '@/features/business-home/model/home-forecast-view-model'

export function DataSourceSummary({
  dataSources,
}: Readonly<Pick<HomeForecastViewModel, 'dataSources'>>) {
  return (
    <section className="rounded-[10px] bg-neutral-100 px-[19px] py-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">데이터 활용</p>
      <h2 className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">
        분석에 포함된 데이터
      </h2>

      <ul className="mt-[14px]">
        {dataSources.map((source) => (
          <li
            className="flex h-[30px] items-center justify-between text-[12px] leading-[14px]"
            key={source.label}
          >
            <span className="flex items-center gap-2 font-medium text-primary-100">
              <span aria-hidden="true" className="size-2 rounded-[1px] bg-warning-500" />
              {source.label}
            </span>
            <span className="font-semibold text-warning-700">{source.refreshedAt}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AnalysisDataScopeCard({
  dataStatuses,
}: Readonly<Pick<HomeForecastViewModel, 'dataStatuses'>>) {
  return (
    <section
      aria-labelledby="analysis-data-scope-title"
      className="rounded-[10px] bg-neutral-100 px-[19px] py-[14px]"
    >
      <h2
        className="text-[18px] leading-[21px] font-bold text-neutral-900"
        id="analysis-data-scope-title"
      >
        분석 데이터 범위
      </h2>
      <p className="mt-1 text-[12px] leading-[14px] text-secondary-300">
        현금매출·타행자금 등 일부 정보는 포함되지 않을 수 있습니다.
      </p>

      <ul className="mt-[14px] flex flex-col gap-[6px]">
        {dataStatuses.map((source) => (
          <li
            className="flex h-[50px] items-center justify-between rounded-lg bg-neutral-400 px-[14px] text-[14px] leading-[17px] font-medium text-primary-100"
            key={source.label}
          >
            <span>{source.label}</span>
            <span className="text-[12px] font-semibold text-primary-blue-800">{source.status}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
