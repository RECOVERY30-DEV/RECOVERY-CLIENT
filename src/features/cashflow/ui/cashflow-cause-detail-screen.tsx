import Link from 'next/link'

import { BackLink, MobileScreen } from '@/shared/ui'

import { CASHFLOW_CAUSE_DETAILS, CASHFLOW_RISK_SUMMARY } from '../model/cashflow-cause-detail-data'
import { CashflowCauseCard } from './cashflow-cause-card'

export function CashflowCauseDetailScreen(): React.JSX.Element {
  return (
    <MobileScreen aria-label="현금부족 원인 상세 화면" className="min-h-[1710px]" mode="document">
      <BackLink href="/cashflow" label="현금흐름 대시보드로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">
            현금부족 원인 분석
          </h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            예측 기준일 2025년 6월 14일 · 보수적~낙관 범위 제공
          </p>
        </header>

        <section
          aria-labelledby="cashflow-cause-summary-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-neutral-900"
            id="cashflow-cause-summary-title"
          >
            부족 예상 시점 요약
          </h2>
          <dl className="mt-[14px] grid grid-cols-2 border-b border-disabled-50 pb-[9px]">
            <div>
              <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
                첫 부족일까지
              </dt>
              <dd className="mt-1 flex items-baseline gap-[7px] text-[12px] leading-[14px] font-medium text-neutral-900">
                <span>{CASHFLOW_RISK_SUMMARY.firstShortageAfter}</span>
                <strong className="text-[18px] leading-[21px] font-bold text-primary-100">
                  {CASHFLOW_RISK_SUMMARY.shortageDate}
                </strong>
              </dd>
            </div>
            <div>
              <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
                예상 최저 잔액
              </dt>
              <dd className="mt-1 text-[18px] leading-[21px] font-bold text-primary-100">
                {CASHFLOW_RISK_SUMMARY.minimumBalanceRange}
              </dd>
            </div>
          </dl>
          <p className="mt-[15px] text-[11px] leading-[13px] text-secondary-300">
            예상 최저 잔액 기준 범위이며 확정 금액이 아닙니다.
          </p>
        </section>

        <section aria-labelledby="cashflow-cause-list-title" className="mt-5">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="cashflow-cause-list-title"
          >
            주요 원인 TOP 3
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            {CASHFLOW_CAUSE_DETAILS.map((cause, index) => (
              <CashflowCauseCard cause={cause} key={cause.title} rank={index + 1} />
            ))}
          </div>
        </section>

        <Link
          className="mt-8 inline-flex h-[42px] w-full items-center justify-center rounded-[6px] bg-primary-100 px-[22px] py-[8px] text-[16px] leading-6 font-medium text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/recovery/compare"
        >
          실행 계획 확인
        </Link>
      </div>
    </MobileScreen>
  )
}
