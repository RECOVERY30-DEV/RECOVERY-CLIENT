import type { CashflowDailySummary as CashflowDailySummaryData } from '../model/cashflow-daily-detail-data'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]

  return `${year}년 ${month}월 ${day}일 (${weekday})`
}

type CashflowDailySummaryProps = Readonly<{
  date: string
  summary: CashflowDailySummaryData
}>

export function CashflowDailySummary({ date, summary }: CashflowDailySummaryProps) {
  return (
    <section className="rounded-[10px] bg-neutral-100 p-[14px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[16px] leading-[21px] font-semibold text-neutral-900">
          {formatDate(date)}
        </h1>
        <span className="text-[14px] leading-5 font-medium text-secondary-300">{summary.dDay}</span>
      </div>

      <dl className="mt-[14px] grid grid-cols-[115px_1fr] border-b border-disabled-50 pb-2">
        <div>
          <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">시작잔액</dt>
          <dd className="mt-1 text-[16px] leading-[21px] font-semibold text-primary-blue-700">
            {summary.openingBalance}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
            예상 마감잔액
          </dt>
          <dd className="mt-1 text-[16px] leading-[21px] font-semibold text-primary-blue-700">
            {summary.expectedBalance}
          </dd>
        </div>
      </dl>

      <div className="mt-[15px] flex justify-between text-[11px] leading-[13px] text-secondary-300">
        <span>예상 범위</span>
        <span>
          보수적 {summary.conservativeBalance} · 낙관 {summary.optimisticBalance}
        </span>
      </div>
    </section>
  )
}
