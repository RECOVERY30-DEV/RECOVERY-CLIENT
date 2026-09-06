import Link from 'next/link'
import type { ReactNode } from 'react'

import RecoveryWordmark from '@/shared/assets/brand/recovery-wordmark.svg'
import { Button, MobileScreen } from '@/shared/ui'

import type { HomeForecastViewModel } from '../model/home-forecast-view-model'
import { ServiceBottomNavigation } from '../../navigation/ui/service-bottom-navigation'
import { AnalysisDataScopeCard, DataSourceSummary } from './data-source-summary'
import { ForecastSummary } from './forecast-summary'

type BusinessHomeScreenProps = Readonly<{
  data: HomeForecastViewModel
}>

export function BusinessHomeScreen({ data }: BusinessHomeScreenProps) {
  return (
    <MobileScreen aria-label="사업자 홈 화면" className="min-h-[1214px]" mode="document">
      <div className="px-6 pt-[71px]">
        <RecoveryWordmark aria-label="Recovery30" className="h-[15px] w-[78px]" />

        <header className="mt-[25px]">
          <h1 className="text-[28px] leading-[33px] font-bold text-primary-200">
            30일 현금흐름 현황
          </h1>
          <p className="text-[14px] leading-[17px] font-medium text-primary-100">
            {data.headerText}
          </p>
        </header>

        <div className="mt-[11px] flex flex-col gap-[22px]">
          <ForecastSummary range={data.range} safety={data.safety} shortage={data.shortage} />
          <DataSourceSummary dataSources={data.dataSources} />

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

          <AnalysisDataScopeCard dataStatuses={data.dataStatuses} />
        </div>
      </div>

      <ServiceBottomNavigation activeItem="home" className="mt-7" />
    </MobileScreen>
  )
}

function BusinessHomeStatusLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MobileScreen aria-label="사업자 홈 화면" className="min-h-dvh">
      <div className="flex min-h-dvh flex-col px-6 pt-[71px]">
        <RecoveryWordmark aria-label="Recovery30" className="h-[15px] w-[78px]" />
        <div className="flex flex-1 items-center justify-center pb-[86px]">{children}</div>
      </div>
    </MobileScreen>
  )
}

export function BusinessHomeLoadingScreen() {
  return (
    <BusinessHomeStatusLayout>
      <p className="text-[14px] font-medium text-secondary-300" role="status">
        예측 데이터를 불러오는 중입니다.
      </p>
    </BusinessHomeStatusLayout>
  )
}

export function BusinessHomeErrorScreen({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <BusinessHomeStatusLayout>
      <div className="flex flex-col items-center gap-5 text-center" role="alert">
        <div>
          <h1 className="text-[20px] font-bold text-neutral-900">
            예측 정보를 불러오지 못했습니다.
          </h1>
          <p className="mt-2 text-[14px] text-secondary-300">잠시 후 다시 시도해 주세요.</p>
        </div>
        <Button onClick={onRetry}>다시 시도</Button>
      </div>
    </BusinessHomeStatusLayout>
  )
}
