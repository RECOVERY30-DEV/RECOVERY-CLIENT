'use client'

import Link from 'next/link'
import type { KyInstance } from 'ky'

import { useForecastSummaryQueries } from '@/features/forecast'
import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

import type { DailyView } from '../api/forecast-timeline-contract'
import { useForecastTimelineQueries } from '../queries/forecast-timeline-queries'
import { ServiceBottomNavigation } from '../../navigation/ui/service-bottom-navigation'
import { AnalysisDataScopeCard } from './analysis-data-scope-card'
import { CashflowFactors } from './cashflow-factors'
import { CashflowStatus } from './cashflow-status'
import { ForecastMetrics } from './forecast-metrics'

type CashflowDashboardScreenProps = Readonly<{
  client?: KyInstance
}>

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)

  return `${year}년 ${month}월 ${day}일`
}

function formatAmount(amount: number): string {
  const absolute = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(
    Math.abs(amount) / 10_000,
  )
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''

  return `${sign}${absolute}만 원`
}

function getDailyDescription(day: DailyView): string {
  if (day.holidayShiftNote !== null) {
    return day.holidayShiftNote
  }

  return `예상 마감 ${formatAmount(day.closingBalanceExpected)}`
}

function CashflowTimeline({ dailyViews }: Readonly<{ dailyViews: ReadonlyArray<DailyView> }>) {
  if (dailyViews.length === 0) {
    return (
      <section className="rounded-[10px] bg-neutral-100 px-[14px] py-5">
        <h2 className="text-[18px] leading-[21px] font-bold text-neutral-900">일자별 현금흐름</h2>
        <p className="mt-5 text-[13px] text-secondary-300">표시할 현금흐름이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="rounded-[10px] bg-neutral-100 px-[14px] py-5">
      <h2 className="text-[18px] leading-[21px] font-bold text-neutral-900">일자별 현금흐름</h2>
      <ul className="mt-5">
        {dailyViews.map((day) => (
          <li key={day.targetDate}>
            <Link
              aria-label={`${formatDate(day.targetDate)} 상세 보기`}
              className="grid min-h-[30px] grid-cols-[168px_minmax(0,1fr)] items-center gap-[14px] rounded px-0.5 py-1 text-[12px] leading-[14px] focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
              href={`/cashflow/daily/${day.targetDate}`}
            >
              <span className="font-medium whitespace-nowrap text-primary-100">
                {formatDate(day.targetDate)}
              </span>
              <span
                className={
                  day.shortfall
                    ? 'min-w-0 truncate font-semibold text-warning-700'
                    : 'min-w-0 truncate font-semibold text-info-500'
                }
              >
                {getDailyDescription(day)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CashflowTimelineError({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <section className="rounded-[10px] bg-neutral-100 px-[14px] py-5" role="alert">
      <h2 className="text-[18px] leading-[21px] font-bold text-primary-200">
        현금흐름을 불러오지 못했습니다.
      </h2>
      <p className="mt-2 text-[13px] text-secondary-300">잠시 후 다시 시도해 주세요.</p>
      <Button className="mt-5" onClick={onRetry} variant="secondary">
        다시 시도
      </Button>
    </section>
  )
}

export function CashflowDashboardScreen({ client }: CashflowDashboardScreenProps = {}) {
  const queries = useForecastTimelineQueries(
    DEMO_BUSINESS_ID,
    client === undefined ? {} : { client },
  )
  const summaryQueries = useForecastSummaryQueries(
    DEMO_BUSINESS_ID,
    client === undefined ? {} : { client },
  )
  const isError =
    (queries.latest.isError && queries.latest.data === undefined) ||
    (queries.daily.isError && queries.daily.data === undefined) ||
    (queries.narratives.isError && queries.narratives.data === undefined) ||
    (summaryQueries.shortfall.isError && summaryQueries.shortfall.data === undefined)
  const isLoading =
    queries.latest.data === undefined ||
    queries.daily.data === undefined ||
    queries.narratives.data === undefined
  const dailyViews = queries.daily.data ?? []

  const retry = () => {
    ;[queries.latest, queries.daily, queries.narratives, summaryQueries.shortfall].forEach(
      (query) => {
        if (query.isError) {
          void query.refetch()
        }
      },
    )
  }

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
          <CashflowStatus
            dDay={queries.daily.data?.find((day) => day.shortfall)?.dDay}
            isLoading={isLoading && !isError}
            narratives={queries.narratives.data}
          />
        </div>
        <div className="mt-3">
          {isError ? (
            <CashflowTimelineError onRetry={retry} />
          ) : isLoading ? (
            <section className="rounded-[10px] bg-neutral-100 px-[14px] py-5" role="status">
              현금흐름을 불러오는 중입니다.
            </section>
          ) : (
            <CashflowTimeline dailyViews={dailyViews} />
          )}
        </div>
        <div className="mt-5">
          <CashflowFactors />
        </div>
      </div>

      <ServiceBottomNavigation activeItem="cashflow" className="mt-[72px]" />
    </MobileScreen>
  )
}
