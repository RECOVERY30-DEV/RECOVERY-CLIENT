'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { KyInstance } from 'ky'

import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, MobileScreen } from '@/shared/ui'

import { useSupportProgramListQueries } from '../queries/support-program-queries'
import { SupportProgramCard } from './support-program-card'
import { SupportProgramFilters } from './support-program-filters'

type SupportProgramListScreenProps = Readonly<{
  client?: KyInstance
}>

export function SupportProgramListScreen({
  client,
}: SupportProgramListScreenProps = {}): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [isApplicationOpenOnly, setIsApplicationOpenOnly] = useState(false)
  const queries = useSupportProgramListQueries(DEMO_BUSINESS_ID, {
    applicableOnly: isApplicationOpenOnly,
    ...(client === undefined ? {} : { client }),
  })

  const filteredPrograms = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase('ko-KR')
    const recommendationsByCode = new Map(
      (queries.recommendations.data ?? []).map((recommendation) => [
        recommendation.programCode,
        recommendation,
      ]),
    )

    return (queries.programs.data ?? []).flatMap((program) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        [program.name, program.agency, program.supportContent]
          .join(' ')
          .toLocaleLowerCase('ko-KR')
          .includes(normalizedSearchTerm)
      const recommendation = recommendationsByCode.get(program.programCode)

      return matchesSearch
        ? [
            {
              program,
              matchStatus: recommendation === undefined ? '추천 정보 없음' : '추천됨',
              matchReason: recommendation?.matchReason ?? '예측 기반 추천 정보가 없습니다.',
            } as const,
          ]
        : []
    })
  }, [queries.programs.data, queries.recommendations.data, searchTerm])

  const queryResults = [queries.programs, queries.latestForecast, queries.recommendations]

  if (queryResults.some((query) => query.isError)) {
    return (
      <SupportProgramListErrorScreen
        onRetry={() => queryResults.forEach((query) => void query.refetch())}
      />
    )
  }

  if (
    queries.programs.data === undefined ||
    queries.latestForecast.data === undefined ||
    queries.recommendations.data === undefined
  ) {
    return <SupportProgramListLoadingScreen />
  }

  return (
    <MobileScreen aria-label="지원사업 목록 화면" className="min-h-[1280px]" mode="document">
      <BackLink href="/recovery/compare" label="회복안 비교로 돌아가기" />
      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <h1 className="typo-sub-header-2 text-primary-200">지원사업</h1>
          <p className="mt-[6px] typo-body-6 text-secondary-300">
            현재 상황을 바탕으로 확인할 수 있는 지원사업입니다.
          </p>
        </header>

        <div className="mt-5">
          <SupportProgramFilters
            isApplicationOpenOnly={isApplicationOpenOnly}
            onApplicationOpenOnlyChange={setIsApplicationOpenOnly}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
          />
        </div>

        <section aria-labelledby="support-program-results-title" className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="typo-body-6 text-secondary-300" id="support-program-results-title">
              검색 결과
            </h2>
            <p aria-live="polite" className="typo-caption-1 text-primary-blue-800">
              총 {filteredPrograms.length}건
            </p>
          </div>

          {filteredPrograms.length > 0 ? (
            <div className="mt-[15px] space-y-[15px]">
              {filteredPrograms.map(({ program, matchReason, matchStatus }) => (
                <SupportProgramCard
                  key={program.programCode}
                  matchReason={matchReason}
                  matchStatus={matchStatus}
                  program={program}
                />
              ))}
            </div>
          ) : (
            <p className="mt-[15px] rounded-[10px] bg-neutral-100 p-[14px] typo-body-6 text-secondary-300">
              표시할 지원사업이 없습니다.
            </p>
          )}
        </section>

        <section
          aria-labelledby="support-program-source-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2 className="typo-body-5 text-primary-100" id="support-program-source-title">
            출처 안내
          </h2>
          <p className="mt-1 typo-caption-3 text-secondary-500">
            지원 조건과 신청 일정은 공식 출처에서 최신 정보를 확인하세요.
          </p>
        </section>

        <Link
          className="mt-5 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 typo-body-3 text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/recovery/consultation?source=support-programs"
        >
          지원사업 상담 예약
        </Link>
      </div>
    </MobileScreen>
  )
}

function SupportProgramListLoadingScreen(): React.JSX.Element {
  return (
    <MobileScreen aria-label="지원사업 목록 화면" className="min-h-[1280px]" mode="document">
      <p className="px-6 pt-[102px] typo-body-6 text-secondary-300">
        지원사업 정보를 불러오는 중입니다.
      </p>
    </MobileScreen>
  )
}

function SupportProgramListErrorScreen({
  onRetry,
}: Readonly<{ onRetry: () => void }>): React.JSX.Element {
  return (
    <MobileScreen aria-label="지원사업 목록 화면" className="min-h-[1280px]" mode="document">
      <div className="px-6 pt-[102px]">
        <p className="typo-body-6 text-secondary-300">지원사업 정보를 불러오지 못했습니다.</p>
        <button
          className="mt-4 h-[42px] rounded-[8px] bg-secondary-700 px-5 typo-body-3 text-base-white"
          onClick={onRetry}
          type="button"
        >
          다시 시도
        </button>
      </div>
    </MobileScreen>
  )
}
