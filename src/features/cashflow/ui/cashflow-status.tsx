'use client'

import Link from 'next/link'
import type { KyInstance } from 'ky'

import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

import type { NarrativeView } from '../api/forecast-timeline-contract'
import { useForecastTimelineQueries } from '../queries/forecast-timeline-queries'

type CashflowStatusProps = Readonly<{
  narratives?: ReadonlyArray<NarrativeView>
  dDay?: number
  isLoading?: boolean
}>

function getNarrative(
  narratives: ReadonlyArray<NarrativeView> | undefined,
  kind: NarrativeView['kind'],
): string | undefined {
  return narratives?.find((narrative) => narrative.kind === kind)?.text
}

export function CashflowStatus({ narratives, dDay, isLoading = false }: CashflowStatusProps) {
  const statusLabel = getNarrative(narratives, 'STATUS_LABEL')
  const riskNote = getNarrative(narratives, 'RISK_NOTE')

  return (
    <section aria-labelledby="cashflow-status-title" className="min-h-[210px]">
      <h2
        className="text-[18px] leading-[21px] font-bold text-primary-200"
        id="cashflow-status-title"
      >
        현재 상태
      </h2>

      <div className="mt-5 rounded-[10px] border border-disabled-50 bg-neutral-100 px-[14px] py-5">
        {isLoading ? (
          <p className="text-[12px] leading-[14px] text-secondary-300" role="status">
            상태 안내를 불러오는 중입니다.
          </p>
        ) : narratives === undefined ? (
          <p className="text-[12px] leading-[14px] text-secondary-300">
            상태 안내를 확인할 수 없습니다.
          </p>
        ) : (
          <>
            <div className="flex min-h-[22px] items-center justify-between gap-3">
              {statusLabel === undefined ? (
                <p className="text-[12px] leading-[14px] text-secondary-300">
                  상태 안내가 없습니다.
                </p>
              ) : (
                <Link
                  aria-label="위험상태 상세 보기"
                  className="inline-flex min-h-[22px] items-center rounded-[4px] bg-[#ffd4d5] px-[11px] text-[11px] leading-[13px] font-semibold text-warning-700 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
                  href="/cashflow/status"
                >
                  {statusLabel}
                </Link>
              )}
              {dDay === undefined ? null : (
                <p className="text-[12px] leading-[14px] font-medium text-neutral-900">D-{dDay}</p>
              )}
            </div>
            {riskNote === undefined ? null : (
              <p className="mt-[15px] text-[12px] leading-[14px] text-neutral-900">{riskNote}</p>
            )}
            <Link
              className="mt-5 flex h-[42px] items-center justify-center rounded-[8px] bg-neutral-400 text-[14px] leading-[20px] font-medium text-primary-blue-500 transition-colors hover:text-primary-blue-600 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
              href="/cashflow/corrections"
            >
              누락 정보 보정하기
            </Link>
          </>
        )}
      </div>
    </section>
  )
}

export function CashflowStatusPage({ client }: Readonly<{ client?: KyInstance }> = {}) {
  const queries = useForecastTimelineQueries(
    DEMO_BUSINESS_ID,
    client === undefined ? {} : { client },
  )
  const hasError =
    (queries.latest.isError && queries.latest.data === undefined) ||
    (queries.narratives.isError && queries.narratives.data === undefined)
  const isLoading = queries.latest.data === undefined || queries.narratives.data === undefined
  const narratives = queries.narratives.data ?? []

  return (
    <MobileScreen aria-label="현금흐름 상태 안내 화면" className="min-h-screen" mode="document">
      <BackLink href="/cashflow" label="현금흐름 대시보드로 돌아가기" />
      <div className="px-6 pt-[102px] pb-[62px]">
        <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">현재 상태 안내</h1>
        {hasError ? (
          <section className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-5" role="alert">
            <p className="text-[13px] text-secondary-300">상태 안내를 불러오지 못했습니다.</p>
            <Button
              className="mt-5"
              onClick={() => {
                if (queries.latest.isError) void queries.latest.refetch()
                if (queries.narratives.isError) void queries.narratives.refetch()
              }}
              variant="secondary"
            >
              다시 시도
            </Button>
          </section>
        ) : isLoading ? (
          <p className="mt-5 text-[13px] text-secondary-300" role="status">
            상태 안내를 불러오는 중입니다.
          </p>
        ) : narratives.length === 0 ? (
          <p className="mt-5 text-[13px] text-secondary-300">표시할 상태 안내가 없습니다.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {narratives.map((narrative) => (
              <li
                className="rounded-[10px] bg-neutral-100 px-[14px] py-5"
                key={`${narrative.kind}-${narrative.seq}`}
              >
                <p className="text-[11px] font-semibold text-info-500">{narrative.kind}</p>
                <p className="mt-2 text-[14px] leading-5 text-primary-100">{narrative.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MobileScreen>
  )
}
