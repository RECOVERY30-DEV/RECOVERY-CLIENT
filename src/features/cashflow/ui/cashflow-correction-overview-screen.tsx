import Link from 'next/link'

import { BackLink, Button, MobileScreen } from '@/shared/ui'

import { CASHFLOW_CORRECTION_ITEMS } from '../model/cashflow-correction-data'
import { CashflowCorrectionItemCard } from './cashflow-correction-item-card'
import { CashflowRepeatPatternCandidates } from './cashflow-repeat-pattern-candidates'

export function CashflowCorrectionOverviewScreen(): React.JSX.Element {
  return (
    <MobileScreen
      aria-label="현금흐름 정보 보정 허브 화면"
      className="min-h-[1360px]"
      mode="document"
    >
      <BackLink href="/cashflow/pending" label="판단 보류 화면으로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <p className="text-[13px] leading-4 text-secondary-300">오늘 오전 9:14</p>
          <h1 className="mt-2 text-[18px] leading-[21px] font-bold text-primary-200">
            누락 정보 보정
          </h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            누락된 정보를 입력하면
            <br />
            현금흐름 예측의 신뢰도를 높일 수 있어요.
          </p>
        </header>

        <section
          aria-labelledby="cashflow-correction-progress-title"
          className="mt-8 rounded-[10px] bg-neutral-100 px-[14px] py-5"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-neutral-900"
            id="cashflow-correction-progress-title"
          >
            보정 진행 상태
          </h2>
          <p className="mt-5 text-[16px] leading-6 font-semibold text-secondary-500">
            62% · 판단보류
          </p>
          <dl className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[12px] leading-[14px] font-medium text-primary-100">
                예측 가능 기간
              </dt>
              <dd className="text-right text-[12px] leading-[14px] font-semibold text-primary-blue-700">
                D+12 → D+18 (예상)
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="cashflow-correction-items-title" className="mt-5">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="cashflow-correction-items-title"
          >
            보정할 정보
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {CASHFLOW_CORRECTION_ITEMS.map((item) => (
              <CashflowCorrectionItemCard item={item} key={item.id} />
            ))}
          </ul>
        </section>

        <div className="mt-5">
          <CashflowRepeatPatternCandidates />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button className="w-full" disabled>
            재계산 실행
          </Button>
          <Link
            className="inline-flex h-[42px] items-center justify-center rounded-[8px] border border-primary-blue-900 px-[22px] py-[8px] text-[16px] leading-6 font-medium text-primary-blue-900 transition-colors hover:border-primary-blue-700 hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/cashflow/pending"
          >
            보정 중단
          </Link>
        </div>
      </div>
    </MobileScreen>
  )
}
