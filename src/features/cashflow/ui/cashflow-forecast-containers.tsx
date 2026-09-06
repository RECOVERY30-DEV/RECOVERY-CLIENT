'use client'

import type { KyInstance } from 'ky'

import {
  useForecastCauseQueries,
  useForecastPendingQueries,
  useForecastSummaryQueries,
} from '@/features/forecast'
import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { Button, MobileScreen } from '@/shared/ui'

import {
  createCashflowCauseViewModel,
  createCashflowPendingViewModel,
  createCashflowStatusViewModel,
} from '../model/cashflow-forecast-view-model'
import { CashflowCauseDetailScreen } from './cashflow-cause-detail-screen'
import { CashflowPendingScreen } from './cashflow-pending-screen'
import { CashflowStatusDetailScreen } from './cashflow-stable-status-screen'

type CashflowForecastContainerProps = Readonly<{
  client?: KyInstance
}>

function CashflowForecastLoadingScreen() {
  return (
    <MobileScreen aria-label="현금흐름 분석 로딩 화면" className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-center text-[14px] text-secondary-300" role="status">
          현금흐름 분석을 불러오는 중입니다.
        </p>
      </div>
    </MobileScreen>
  )
}

function CashflowForecastErrorScreen({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <MobileScreen aria-label="현금흐름 분석 오류 화면" className="min-h-screen">
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
        <div role="alert">
          <h1 className="text-[18px] font-bold text-primary-200">
            분석 정보를 불러오지 못했습니다.
          </h1>
          <p className="mt-2 text-[13px] text-secondary-300">잠시 후 다시 시도해 주세요.</p>
        </div>
        <Button onClick={onRetry}>다시 시도</Button>
      </div>
    </MobileScreen>
  )
}

export function CashflowStatusContainer({ client }: CashflowForecastContainerProps = {}) {
  const queries = useForecastSummaryQueries(
    DEMO_BUSINESS_ID,
    client === undefined ? {} : { client },
  )
  const queryResults = [
    queries.latest,
    queries.minBalance,
    queries.shortfall,
    queries.safetyBuffer,
    queries.coverage,
  ]

  if (queryResults.some((query) => query.isError && query.data === undefined)) {
    return (
      <CashflowForecastErrorScreen
        onRetry={() => {
          queryResults.forEach((query) => {
            if (query.isError) void query.refetch()
          })
        }}
      />
    )
  }

  if (
    queries.latest.data === undefined ||
    queries.minBalance.data === undefined ||
    queries.shortfall.data === undefined ||
    queries.safetyBuffer.data === undefined ||
    queries.coverage.data === undefined
  ) {
    return <CashflowForecastLoadingScreen />
  }

  if (queries.latest.data.status === 'HOLD') {
    const pending = createCashflowPendingViewModel({
      latest: queries.latest.data,
      coverage: queries.coverage.data,
    })

    return <CashflowPendingScreen {...pending} />
  }

  const data = createCashflowStatusViewModel({
    latest: queries.latest.data,
    minBalance: queries.minBalance.data,
    shortfall: queries.shortfall.data,
    safetyBuffer: queries.safetyBuffer.data,
    coverage: queries.coverage.data,
  })

  return <CashflowStatusDetailScreen data={data} />
}

export function CashflowPendingContainer({ client }: CashflowForecastContainerProps = {}) {
  const queries = useForecastPendingQueries(
    DEMO_BUSINESS_ID,
    client === undefined ? {} : { client },
  )
  const queryResults = [queries.latest, queries.coverage]

  if (queryResults.some((query) => query.isError && query.data === undefined)) {
    return (
      <CashflowForecastErrorScreen
        onRetry={() => {
          queryResults.forEach((query) => {
            if (query.isError) void query.refetch()
          })
        }}
      />
    )
  }

  if (queries.latest.data === undefined || queries.coverage.data === undefined) {
    return <CashflowForecastLoadingScreen />
  }

  return (
    <CashflowPendingScreen
      {...createCashflowPendingViewModel({
        latest: queries.latest.data,
        coverage: queries.coverage.data,
      })}
    />
  )
}

export function CashflowCauseContainer({ client }: CashflowForecastContainerProps = {}) {
  const queries = useForecastCauseQueries(DEMO_BUSINESS_ID, client === undefined ? {} : { client })
  const queryResults = [queries.latest, queries.detail, queries.riskDrivers]

  if (queryResults.some((query) => query.isError && query.data === undefined)) {
    return (
      <CashflowForecastErrorScreen
        onRetry={() => {
          queryResults.forEach((query) => {
            if (query.isError) void query.refetch()
          })
        }}
      />
    )
  }

  if (queries.detail.data === undefined || queries.riskDrivers.data === undefined) {
    return <CashflowForecastLoadingScreen />
  }

  return (
    <CashflowCauseDetailScreen
      {...createCashflowCauseViewModel({
        detail: queries.detail.data,
        riskDrivers: queries.riskDrivers.data,
      })}
    />
  )
}
