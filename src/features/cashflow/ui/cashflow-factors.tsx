import Link from 'next/link'

import { cn } from '@/shared/lib'

import { CASHFLOW_FACTORS } from '../model/cashflow-dashboard-data'

export function CashflowFactors() {
  return (
    <section aria-labelledby="cashflow-factors-title" className="h-[289px]">
      <div className="flex h-[21px] items-end justify-between">
        <h2
          className="text-[18px] leading-[21px] font-bold text-primary-200"
          id="cashflow-factors-title"
        >
          부족 원인 Top 3
        </h2>
        <Link
          className="border-b border-neutral-700 py-0.5 text-[12px] leading-[14px] font-medium text-neutral-700"
          href="/cashflow/causes"
        >
          원인 상세 보기
        </Link>
      </div>
      <p className="mt-[6px] text-[13px] leading-[15px] text-secondary-300">
        과거 같은 시기 패턴과 비교한 추정 결과입니다.
        <br />
        보정 후 재계산을 권장합니다.
      </p>

      <ol className="mt-[15px] flex h-[215px] flex-col gap-5 rounded-[10px] bg-neutral-100 p-[14px]">
        {CASHFLOW_FACTORS.map((factor, index) => (
          <li className="flex flex-col gap-2" key={factor.title}>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-[6px]">
                <span className="flex size-5 items-center justify-center rounded-[3px] bg-secondary-600 text-[11px] leading-[13px] font-semibold text-base-white">
                  {index + 1}
                </span>
                <strong className="text-[12px] leading-[14px] font-semibold text-secondary-600">
                  {factor.title}
                </strong>
              </div>
              <span
                className={cn(
                  'flex h-[22px] min-w-[63px] items-center justify-center rounded-[4px] px-2 text-[11px] leading-[13px] font-semibold',
                  factor.tone === 'danger'
                    ? 'bg-[#ffd4d5] text-error-500'
                    : 'bg-disabled-50 text-disabled-200',
                )}
              >
                {factor.impact}
              </span>
            </div>
            <div className="h-[5px] w-full bg-disabled-50">
              {factor.progress !== '0%' && (
                <span className="block h-full bg-[#899bff]" style={{ width: factor.progress }} />
              )}
            </div>
            <p className="text-[12px] leading-[14px] text-secondary-300">{factor.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
