import SafetyIcon from '@/features/business-home/assets/safety.svg'
import type { HomeForecastViewModel } from '@/features/business-home/model/home-forecast-view-model'

function ForecastRangeCard({
  conservative,
  expectedPosition,
  optimistic,
  summary,
}: HomeForecastViewModel['range']) {
  return (
    <section className="rounded-[10px] bg-neutral-100 p-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-primary-blue-800">
        30일 이후 예상 최저잔액
      </p>
      <p className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">{summary}</p>

      <div className="mt-[30px]">
        <div className="flex justify-between text-[11px] leading-[13px] text-secondary-300">
          <span>보수적</span>
          <span>낙관적</span>
        </div>
        <div className="relative mt-1 h-[18px] rounded-[5px] bg-[#d0ebf9]">
          <span
            className="absolute inset-y-0 left-0 rounded-l-[5px] bg-danger-gradient"
            style={{ width: `${expectedPosition}%` }}
          />
          <span
            className="absolute top-[-7px] -translate-x-1/2 border-x-[3px] border-t-[5px] border-x-transparent border-t-neutral-700"
            style={{ left: `${expectedPosition}%` }}
          />
          <span
            className="absolute bottom-[-7px] -translate-x-1/2 border-x-[3px] border-b-[5px] border-x-transparent border-b-neutral-700"
            style={{ left: `${expectedPosition}%` }}
          />
        </div>
        <div className="mt-[10px] flex justify-between text-[12px] leading-[14px] font-semibold">
          <span className="text-warning-700">{conservative}</span>
          <span className="text-primary-blue-400">{optimistic}</span>
        </div>
        <p className="mt-6 text-[11px] leading-[13px] text-secondary-300">
          시나리오 기준 범위이며 확정 결과가 아닙니다.
        </p>
      </div>
    </section>
  )
}

function ExpectedShortageCard({ dDay, expectedDate, progress }: HomeForecastViewModel['shortage']) {
  return (
    <section className="h-[150px] flex-1 rounded-[10px] bg-neutral-100 p-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">첫 부족 예상일</p>
      <p className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">{dDay}</p>
      <div className="mt-[27px] h-1 rounded-full bg-disabled-50">
        <span
          className="block h-full rounded-full bg-danger-gradient"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-[10px] flex justify-between text-[12px] leading-[14px] font-semibold text-secondary-300">
        <span>오늘</span>
        <span>향후 30일</span>
      </div>
      <p className="mt-6 text-[12px] leading-[14px] font-semibold text-secondary-300">
        {expectedDate}
      </p>
    </section>
  )
}

function SafetyBalanceCard({ amount, status }: HomeForecastViewModel['safety']) {
  return (
    <section className="h-[150px] flex-1 rounded-[10px] bg-neutral-100 p-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">안전 잔액</p>
      <p className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">{amount}</p>
      <div className="mt-[27px] h-1 rounded-full bg-disabled-50">
        <span className="block h-full w-[34.34%] rounded-full bg-primary-blue-400" />
      </div>
      <div className="mt-[6px] flex items-center text-[12px] leading-[14px] font-semibold text-secondary-300">
        <SafetyIcon aria-hidden="true" className="size-6" />
        <span>{status}</span>
      </div>
      <p className="mt-[15px] text-[12px] leading-[14px] font-semibold text-secondary-300">
        현재 예상기준
      </p>
    </section>
  )
}

type ForecastSummaryProps = Readonly<Pick<HomeForecastViewModel, 'range' | 'shortage' | 'safety'>>

export function ForecastSummary({ range, safety, shortage }: ForecastSummaryProps) {
  return (
    <div className="flex flex-col gap-[22px]">
      <ForecastRangeCard {...range} />
      <div className="flex gap-2">
        <ExpectedShortageCard {...shortage} />
        <SafetyBalanceCard {...safety} />
      </div>
    </div>
  )
}
