import SafetyIcon from '@/features/business-home/assets/safety.svg'

function ForecastRangeCard() {
  return (
    <section className="rounded-[10px] bg-neutral-100 p-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-primary-blue-800">
        30일 이후 예상 최저잔액
      </p>
      <p className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">
        −128만 원 ~ +54만 원
      </p>

      <div className="mt-[30px]">
        <div className="flex justify-between text-[11px] leading-[13px] text-neutral-700">
          <span>보수적</span>
          <span>낙관적</span>
        </div>
        <div className="relative mt-1 h-[18px] rounded-[5px] bg-[#d0ebf9]">
          <span className="absolute inset-y-0 left-0 w-[73.08%] rounded-l-[5px] bg-danger-gradient" />
          <span className="absolute top-[-7px] left-[73.08%] -translate-x-1/2 border-x-[3px] border-t-[5px] border-x-transparent border-t-neutral-700" />
          <span className="absolute bottom-[-7px] left-[73.08%] -translate-x-1/2 border-x-[3px] border-b-[5px] border-x-transparent border-b-neutral-700" />
        </div>
        <div className="mt-[10px] flex justify-between text-[12px] leading-[14px] font-semibold">
          <span className="text-warning-500">−128만</span>
          <span className="text-primary-blue-400">83만</span>
        </div>
        <p className="mt-6 text-[11px] leading-[13px] text-neutral-700">
          시나리오 기준 범위이며 확정 결과가 아닙니다.
        </p>
      </div>
    </section>
  )
}

function ExpectedShortageCard() {
  return (
    <section className="h-[150px] flex-1 rounded-[10px] bg-neutral-100 p-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">첫 부족 예상일</p>
      <p className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">D-11</p>
      <div className="mt-[27px] h-1 rounded-full bg-disabled-50">
        <span className="block h-full w-[34.34%] rounded-full bg-danger-gradient" />
      </div>
      <div className="mt-[10px] flex justify-between text-[12px] leading-[14px] font-semibold text-neutral-700">
        <span>오늘</span>
        <span>향후 30일</span>
      </div>
      <p className="mt-6 text-[12px] leading-[14px] font-semibold text-neutral-700">
        7월 26일 예상
      </p>
    </section>
  )
}

function SafetyBalanceCard() {
  return (
    <section className="h-[150px] flex-1 rounded-[10px] bg-neutral-100 p-[14px]">
      <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">안전 잔액</p>
      <p className="mt-1 text-[18px] leading-[21px] font-bold text-neutral-900">약 83만원</p>
      <div className="mt-[27px] h-1 rounded-full bg-disabled-50">
        <span className="block h-full w-[34.34%] rounded-full bg-primary-blue-400" />
      </div>
      <div className="mt-[6px] flex items-center text-[12px] leading-[14px] font-semibold text-neutral-700">
        <SafetyIcon aria-hidden="true" className="size-6" />
        <span>안전상태</span>
      </div>
      <p className="mt-[15px] text-[12px] leading-[14px] font-semibold text-neutral-700">
        현재 예상기준
      </p>
    </section>
  )
}

export function ForecastSummary() {
  return (
    <div className="flex flex-col gap-[22px]">
      <ForecastRangeCard />
      <div className="flex gap-2">
        <ExpectedShortageCard />
        <SafetyBalanceCard />
      </div>
    </div>
  )
}
