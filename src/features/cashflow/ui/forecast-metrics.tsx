import ForecastPoint from '@/features/cashflow/assets/forecast-point.svg'
import RangeMarker from '@/features/cashflow/assets/range-marker.svg'

function ShortageDateCard() {
  return (
    <section className="h-[104px] rounded-[10px] bg-neutral-100 p-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">첫 부족 예상일</p>
      <p className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">D-18</p>
      <div className="mt-1 flex justify-between text-[11px] leading-[13px] text-neutral-700">
        <span className="text-[12px]">오늘</span>
        <span>30일 후</span>
      </div>
      <div className="relative mt-1 h-[11px]">
        <span className="absolute top-[3px] left-0 h-[5px] w-full rounded-r-[5px] bg-disabled-50" />
        <span className="absolute top-[3px] left-0 h-[5px] w-[73%] rounded-l-[5px] bg-danger-gradient" />
        <ForecastPoint aria-hidden="true" className="absolute top-0 left-[70%] size-[11px]" />
      </div>
    </section>
  )
}

function BalanceRangeCard() {
  return (
    <section className="h-[167px] rounded-[10px] bg-neutral-100 p-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">
        예상 최저잔액 범위
      </p>
      <p className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">
        -128만원 ~ -54만원
      </p>

      <div className="mt-[30px]">
        <div className="flex justify-between text-[11px] leading-[13px] text-neutral-700">
          <span>보수적</span>
          <span>낙관적</span>
        </div>
        <div className="relative mt-1 h-[18px] rounded-[5px] bg-disabled-50">
          <span className="absolute inset-y-0 left-0 w-[73.08%] rounded-l-[5px] bg-danger-gradient" />
          <RangeMarker
            aria-hidden="true"
            className="absolute -top-[6px] left-[73.08%] h-[5px] w-[6px] -translate-x-1/2 rotate-180"
          />
          <RangeMarker
            aria-hidden="true"
            className="absolute -bottom-[6px] left-[73.08%] h-[5px] w-[6px] -translate-x-1/2"
          />
        </div>
        <div className="mt-[10px] flex justify-between text-[12px] leading-[14px] font-semibold">
          <span className="text-warning-500">−120만</span>
          <span className="text-disabled-200">0</span>
        </div>
      </div>

      <p className="mt-6 text-[11px] leading-[13px] text-neutral-700">
        범위 전체가 0원 아래로, 예상 구간 안에서 흑자 전환은 확인되지 않음
      </p>
    </section>
  )
}

export function ForecastMetrics() {
  return (
    <section aria-labelledby="forecast-metrics-title">
      <h2
        className="text-[18px] leading-[21px] font-bold text-primary-200"
        id="forecast-metrics-title"
      >
        예상 핵심 수치
      </h2>
      <div className="mt-5 flex flex-col gap-5">
        <ShortageDateCard />
        <BalanceRangeCard />
      </div>
    </section>
  )
}
