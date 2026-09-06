import Link from 'next/link'

import { BackLink, MobileScreen } from '@/shared/ui'

import { CashflowStableChangeNotice } from './cashflow-stable-change-notice'
import { CashflowStableReasons } from './cashflow-stable-reasons'
import { CashflowStableSummary } from './cashflow-stable-summary'

export function CashflowStableStatusScreen() {
  return (
    <MobileScreen
      aria-label="현금흐름 안정 상태 안내 화면"
      className="min-h-[1014px]"
      mode="document"
    >
      <BackLink href="/cashflow" label="현금흐름 대시보드로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <p className="text-[13px] leading-4 text-secondary-300">
            분석일 기준 2025년 7월 14일 · 데이터 반영 완료
          </p>
          <h1 className="mt-2 text-[18px] leading-[21px] font-bold text-primary-200">
            현금흐름 안정
          </h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            향후 30일간 안전자금
            <br />
            아래로 내려갈 가능성이 낮습니다.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-5">
          <CashflowStableSummary />
          <CashflowStableReasons />
          <CashflowStableChangeNotice />
        </div>

        <Link
          className="mt-[76px] inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 text-[16px] leading-6 font-medium text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/recovery/follow-up"
        >
          30·60·90일 사후점검 확인하기
        </Link>
      </div>
    </MobileScreen>
  )
}
