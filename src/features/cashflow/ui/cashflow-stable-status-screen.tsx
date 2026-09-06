import Link from 'next/link'

import { BackLink, MobileScreen } from '@/shared/ui'

import {
  CASHFLOW_RISK_STATUS_DATA,
  CASHFLOW_STABLE_STATUS_DATA,
  type CashflowStatusViewData,
} from '../model/cashflow-stable-status-data'
import { CashflowStableChangeNotice } from './cashflow-stable-change-notice'
import { CashflowStableReasons } from './cashflow-stable-reasons'
import { CashflowStableSummary } from './cashflow-stable-summary'

type CashflowStatusDetailScreenProps = Readonly<{
  data: CashflowStatusViewData
}>

export function CashflowStatusDetailScreen({ data }: CashflowStatusDetailScreenProps) {
  return (
    <MobileScreen aria-label={data.ariaLabel} className="min-h-[1014px]" mode="document">
      <BackLink href="/cashflow" label="현금흐름 대시보드로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <p className="text-[13px] leading-4 text-secondary-300">{data.analysisLabel}</p>
          <h1 className="mt-2 text-[18px] leading-[21px] font-bold text-primary-200">
            {data.title}
          </h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            {data.description.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-5">
          <CashflowStableSummary metrics={data.metrics} note={data.summaryNote} />
          <CashflowStableReasons reasons={data.reasons} />
          <CashflowStableChangeNotice />
        </div>

        <Link
          className="mt-[76px] inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 typo-body-3 text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/recovery/follow-up"
        >
          30·60·90일 사후점검 확인하기
        </Link>
      </div>
    </MobileScreen>
  )
}

type CashflowStableStatusScreenProps = Readonly<{
  status?: 'risk' | 'stable'
}>

export function CashflowStableStatusScreen({ status = 'stable' }: CashflowStableStatusScreenProps) {
  const data = status === 'risk' ? CASHFLOW_RISK_STATUS_DATA : CASHFLOW_STABLE_STATUS_DATA

  return <CashflowStatusDetailScreen data={data} />
}
