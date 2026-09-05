import Link from 'next/link'

import { BackLink, Button, MobileScreen } from '@/shared/ui'

import { CASHFLOW_MISSING_INFORMATION } from '../model/cashflow-correction-data'
import { CashflowCoverageCard } from './cashflow-coverage-card'

const PENDING_METRICS = [
  { label: '분석 기간', value: '오늘 ~ 30일 후' },
  { label: '예상 최저잔액', value: '범위 산출 불가' },
  { label: '첫 부족 예상일', value: '확인 어려움' },
  { label: '예측 신뢰도', value: '낮음 — 보정 필요' },
] as const

export function CashflowPendingScreen(): React.JSX.Element {
  return (
    <MobileScreen aria-label="현금흐름 판단 보류 화면" className="min-h-[1014px]" mode="document">
      <BackLink href="/cashflow" label="현금흐름 대시보드로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <p className="text-[13px] leading-4 text-secondary-300">
            분석 데이터가 충분하지 않습니다
          </p>
          <h1 className="mt-2 text-[18px] leading-[21px] font-bold text-primary-200">판단 보류</h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            누락 가능 정보를 보정하면
            <br />
            현금흐름 예측을 다시 확인할 수 있어요.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-5">
          <section
            aria-labelledby="cashflow-pending-summary-title"
            className="rounded-[10px] bg-neutral-100 px-[14px] py-5"
          >
            <h2
              className="text-[18px] leading-[21px] font-bold text-neutral-900"
              id="cashflow-pending-summary-title"
            >
              판단보류 요약
            </h2>
            <dl className="mt-5 flex flex-col">
              {PENDING_METRICS.map((metric) => (
                <div
                  className="flex min-h-[30px] items-center justify-between gap-3"
                  key={metric.label}
                >
                  <dt className="shrink-0 text-[12px] leading-[14px] font-medium text-primary-100">
                    {metric.label}
                  </dt>
                  <dd className="text-right text-[12px] leading-[14px] font-semibold text-secondary-500">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <CashflowCoverageCard />

          <section
            aria-labelledby="cashflow-missing-information-title"
            className="rounded-[10px] bg-neutral-100 px-[14px] py-5"
          >
            <h2
              className="text-[18px] leading-[21px] font-bold text-neutral-900"
              id="cashflow-missing-information-title"
            >
              누락 가능 정보
            </h2>
            <ul className="mt-5 flex flex-col gap-[14px]">
              {CASHFLOW_MISSING_INFORMATION.map((item) => (
                <li className="text-[12px] leading-[15px] font-medium text-primary-100" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-[76px] flex flex-col gap-3">
          <Link
            className="inline-flex h-[42px] items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-[8px] text-[16px] leading-6 font-medium text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/cashflow/corrections"
          >
            정보 보정하기
          </Link>
          <Button className="w-full" disabled variant="secondary">
            재시도 안내 확인
          </Button>
        </div>
      </div>
    </MobileScreen>
  )
}
