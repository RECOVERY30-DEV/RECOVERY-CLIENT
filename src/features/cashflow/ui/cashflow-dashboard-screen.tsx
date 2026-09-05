import { BackLink, MobileScreen } from '@/shared/ui'

import { ServiceBottomNavigation } from '../../navigation/ui/service-bottom-navigation'
import { AnalysisDataScopeCard } from './analysis-data-scope-card'
import { CashflowFactors } from './cashflow-factors'
import { CashflowStatus } from './cashflow-status'
import { DailyCashflowCard } from './daily-cashflow-card'
import { ForecastMetrics } from './forecast-metrics'

export function CashflowDashboardScreen() {
  return (
    <MobileScreen aria-label="현금흐름 대시보드 화면" className="min-h-[1775px]" mode="document">
      <BackLink href="/home" label="사업자 홈으로 돌아가기" />

      <div className="px-6 pt-[102px]">
        <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">
          30일 현금흐름 분석
        </h1>

        <div className="mt-5">
          <AnalysisDataScopeCard />
        </div>
        <div className="mt-5">
          <ForecastMetrics />
        </div>
        <div className="mt-4">
          <CashflowStatus />
        </div>
        <div className="mt-3">
          <DailyCashflowCard />
        </div>
        <div className="mt-5">
          <CashflowFactors />
        </div>
      </div>

      <ServiceBottomNavigation activeItem="cashflow" className="mt-[72px]" />
    </MobileScreen>
  )
}
