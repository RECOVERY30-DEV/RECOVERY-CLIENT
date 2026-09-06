import Link from 'next/link'

import { BackLink, MobileScreen } from '@/shared/ui'

import {
  CASHFLOW_CAUSE_DETAILS,
  CASHFLOW_RISK_SUMMARY,
  type CashflowCauseDetail,
} from '../model/cashflow-cause-detail-data'
import { CashflowCauseCard } from './cashflow-cause-card'

type CashflowCauseDetailScreenProps = Readonly<{
  baseDateLabel?: string
  causes?: ReadonlyArray<CashflowCauseDetail>
  summary?: Readonly<{
    firstShortageAfter: string
    minimumBalanceRange: string
    shortageDate: string
  }>
}>

export function CashflowCauseDetailScreen({
  baseDateLabel = '예측 기준일 2025년 6월 14일 · 보수적~낙관 범위 제공',
  causes = CASHFLOW_CAUSE_DETAILS,
  summary = CASHFLOW_RISK_SUMMARY,
}: CashflowCauseDetailScreenProps = {}): React.JSX.Element {
  return (
    <MobileScreen aria-label="현금부족 원인 상세 화면" className="min-h-[1547px]" mode="document">
      <BackLink href="/cashflow" label="현금흐름 대시보드로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">
            현금부족 원인 분석
          </h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">{baseDateLabel}</p>
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
                <span>{summary.firstShortageAfter}</span>
                <strong className="text-[18px] leading-[21px] font-bold text-primary-100">
                  {summary.shortageDate}
                </strong>
              </dd>
            </div>
            <div>
              <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
                예상 최저 잔액
              </dt>
              <dd className="mt-1 text-[18px] leading-[21px] font-bold text-primary-100">
                {summary.minimumBalanceRange}
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
          <div className="mt-5 flex flex-col gap-3">
            {causes.length === 0 ? (
              <p className="text-[12px] leading-[15px] text-secondary-300">
                확인된 주요 원인이 없습니다.
              </p>
            ) : (
              causes.map((cause, index) => (
                <CashflowCauseCard cause={cause} key={`${index}-${cause.title}`} rank={index + 1} />
              ))
            )}
          </div>
        </section>

        <section
          aria-labelledby="cashflow-forecast-accuracy-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
          id="cashflow-forecast-accuracy"
        >
          <h2
            className="text-[16px] leading-5 font-bold text-primary-200"
            id="cashflow-forecast-accuracy-title"
          >
            예측 정확도 안내
          </h2>
          <p className="mt-3 text-[11px] leading-[16px] text-secondary-300">
            위 원인은 연결된 사업자·카드정산·자동이체 데이터 기반 추정입니다. 현금매출이나 예정
            자금의 반영 여부에 따라 결과가 달라질 수 있으며, 상담과 공식 출처 확인이 필요합니다.
          </p>
        </section>

        <Link
          className="mt-8 inline-flex h-[42px] w-full items-center justify-center rounded-[6px] bg-primary-100 px-[22px] py-[8px] text-[16px] leading-6 font-medium text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/recovery/compare"
        >
          실행 계획 확인
        </Link>
      </div>
    </MobileScreen>
  )
}
