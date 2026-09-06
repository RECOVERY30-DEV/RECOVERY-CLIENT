import Link from 'next/link'

import type { CashflowCauseDetail } from '../model/cashflow-cause-detail-data'

type CashflowCauseCardProps = Readonly<{
  cause: CashflowCauseDetail
  rank: number
}>

export function CashflowCauseCard({ cause, rank }: CashflowCauseCardProps): React.JSX.Element {
  return (
    <article className="rounded-[10px] border border-disabled-50 bg-neutral-100 px-[14px] py-5">
      <div className="flex items-center gap-[5px]">
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center rounded-[3px] bg-secondary-600 text-[11px] leading-[13px] font-semibold text-base-white"
        >
          {rank}
        </span>
        <h3 className="text-[12px] leading-[14px] font-medium text-secondary-800">{cause.title}</h3>
      </div>

      <div className="mt-[10px]">
        <p className="text-[12px] leading-[14px] text-neutral-900">
          기여 금액 <strong className="font-semibold">{cause.contribution}</strong>
        </p>
        <p className="mt-[10px] text-[11px] leading-[15px] text-secondary-300">
          {cause.description}
        </p>
      </div>

      <dl className="mt-5 space-y-1 text-[12px] leading-[14px] text-primary-100">
        <div className="flex items-start justify-between gap-3">
          <dt>근거 거래</dt>
          <dd className="text-right font-medium text-primary-100">{cause.evidence}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt>예측 가정</dt>
          <dd className="text-right font-medium text-primary-100">{cause.forecastAssumption}</dd>
        </div>
      </dl>

      {cause.actions.map((action) => (
        <Link
          aria-label={`${cause.title}: ${action.label}`}
          className="mt-5 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-neutral-400 px-[22px] py-[8px] text-[16px] leading-6 font-medium text-primary-blue-900 transition-colors hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          href={action.href}
          key={action.href}
        >
          {action.label}
        </Link>
      ))}
    </article>
  )
}
