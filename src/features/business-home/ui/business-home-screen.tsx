import Link from 'next/link'

import RecoveryWordmark from '@/shared/assets/brand/recovery-wordmark.svg'
import { MobileScreen } from '@/shared/ui'

import { ServiceBottomNavigation } from '../../navigation/ui/service-bottom-navigation'
import { AnalysisDataScopeCard, DataSourceSummary } from './data-source-summary'
import { ForecastSummary } from './forecast-summary'

export function BusinessHomeScreen() {
  return (
    <MobileScreen aria-label="사업자 홈 화면" className="min-h-[1214px]" mode="document">
      <div className="px-6 pt-[71px]">
        <RecoveryWordmark aria-label="Recovery30" className="h-[15px] w-[78px]" />

        <header className="mt-[25px]">
          <h1 className="text-[28px] leading-[33px] font-bold text-primary-200">
            30일 현금흐름 현황
          </h1>
          <p className="text-[14px] leading-[17px] font-medium text-primary-100">
            2025년 7월 15일 기준 · 최근 갱신 오전 8:32
          </p>
        </header>

        <div className="mt-[11px] flex flex-col gap-[22px]">
          <ForecastSummary />
          <DataSourceSummary />

          <Link
            aria-label="위험분석 바로가기"
            className="flex h-[68px] flex-col justify-center rounded-[10px] bg-[linear-gradient(95deg,#060c23_0%,#0d1b3b_70%,#291b31_100%)] px-[14px] text-base-white focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
            href="/consents/setup"
          >
            <strong className="text-[18px] leading-[21px]">위험분석 바로가기</strong>
            <span className="mt-1 text-[12px] leading-[14px] text-base-white/80">
              연체 전 회복 지원용 분석으로 신용평가·대출 심사와 무관합니다.
            </span>
          </Link>

          <AnalysisDataScopeCard />
        </div>
      </div>

      <ServiceBottomNavigation activeItem="home" className="mt-7" />
    </MobileScreen>
  )
}
