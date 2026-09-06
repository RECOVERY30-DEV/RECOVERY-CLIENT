'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { useForecastSummaryQueries } from '@/features/forecast'
import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

import type { RecoveryScenario } from '../api/recovery-option-contract'
import { RECOVERY_RISK_SUMMARY, RECOVERY_TOP_CAUSES } from '../model/recovery-plan-data'
import {
  useRecoveryOptionQueries,
  useSaveRecoveryOptionSelectionsMutation,
} from '../queries/recovery-option-queries'
import { getRecoveryOptionTitle, RecoveryOptionCard } from './recovery-option-card'

function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export function RecoveryPlanComparisonScreen(): React.JSX.Element {
  const forecastQueries = useForecastSummaryQueries(DEMO_BUSINESS_ID)
  const forecastRunId = forecastQueries.latest.data?.forecastRunId
  const { recoveryOptions, scenarios } = useRecoveryOptionQueries(forecastRunId)
  const saveSelections = useSaveRecoveryOptionSelectionsMutation(forecastRunId ?? 0)
  const [selectedOptionIds, setSelectedOptionIds] = useState<readonly number[]>([])
  const initializedForecastRunId = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (
      forecastRunId === undefined ||
      recoveryOptions.data === undefined ||
      initializedForecastRunId.current === forecastRunId
    ) {
      return
    }

    initializedForecastRunId.current = forecastRunId
    setSelectedOptionIds(
      recoveryOptions.data
        .filter((option) => option.selected)
        .map((option) => option.optionId)
        .slice(0, 2),
    )
  }, [forecastRunId, recoveryOptions.data])

  const failedQueries = [forecastQueries.latest, recoveryOptions, scenarios].filter(
    (query) => query.isError,
  )

  function retryFailedQueries() {
    failedQueries.forEach((query) => {
      void query.refetch()
    })
  }

  function handleOptionSelect(optionId: number) {
    if (forecastRunId === undefined || saveSelections.isPending) {
      return
    }

    setSelectedOptionIds((currentIds) => {
      const nextIds = currentIds.includes(optionId)
        ? currentIds.filter((id) => id !== optionId)
        : currentIds.length === 2
          ? currentIds
          : [...currentIds, optionId]

      if (nextIds !== currentIds) {
        saveSelections.mutate(nextIds)
      }

      return nextIds
    })
  }

  return (
    <MobileScreen aria-label="회복안 비교 화면" className="min-h-[1360px]" mode="document">
      <BackLink href="/cashflow/causes" label="현금부족 원인 분석으로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">회복안 비교</h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            위험 시점과 주요 원인을 기준으로 실행 가능한 회복안을 비교합니다.
          </p>
        </header>

        <RiskSummary />
        <CauseList />

        {failedQueries.length > 0 ? (
          <RequestError onRetry={retryFailedQueries} />
        ) : forecastRunId === undefined ||
          recoveryOptions.data === undefined ||
          scenarios.data === undefined ? (
          <p className="mt-5 rounded-[10px] bg-neutral-100 p-[14px] text-[13px] text-secondary-300">
            회복안을 불러오는 중입니다.
          </p>
        ) : (
          <>
            <RecoveryOptionList
              isSaving={saveSelections.isPending}
              onSelect={handleOptionSelect}
              options={recoveryOptions.data}
              selectedOptionIds={selectedOptionIds}
            />
            {saveSelections.isError ? (
              <div
                className="border-error-200 bg-error-50 mt-3 rounded-[10px] border p-[14px]"
                role="alert"
              >
                <p className="text-error-600 text-[12px] leading-[14px]">
                  선택한 회복안을 저장하지 못했습니다.
                </p>
                <Button
                  className="mt-3"
                  onClick={() => saveSelections.mutate(selectedOptionIds)}
                  size="sm"
                  variant="outline"
                >
                  다시 저장
                </Button>
              </div>
            ) : null}
            <ScenarioList options={recoveryOptions.data} scenarios={scenarios.data} />
            <ActionLinks />
          </>
        )}
      </div>
    </MobileScreen>
  )
}

function RiskSummary(): React.JSX.Element {
  return (
    <section
      aria-labelledby="recovery-risk-summary-title"
      className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
    >
      <h2
        className="text-[18px] leading-[21px] font-bold text-neutral-900"
        id="recovery-risk-summary-title"
      >
        현재 위험 요약
      </h2>
      <dl className="mt-[14px] grid grid-cols-2 gap-3 border-b border-disabled-50 pb-[9px]">
        <div>
          <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
            첫 부족 예상일
          </dt>
          <dd className="mt-1 text-[14px] leading-[18px] font-semibold text-primary-100">
            {RECOVERY_RISK_SUMMARY.shortSummary}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
            예상 최저 잔액
          </dt>
          <dd className="mt-1 text-[14px] leading-[18px] font-semibold text-primary-100">
            {RECOVERY_RISK_SUMMARY.minimumBalanceRange}
          </dd>
        </div>
      </dl>
      <p className="mt-[10px] text-[11px] leading-[13px] text-secondary-300">
        예상 최저 잔액 기준 범위이며 확정 금액이 아닙니다.
      </p>
    </section>
  )
}

function CauseList(): React.JSX.Element {
  return (
    <section aria-labelledby="recovery-cause-list-title" className="mt-5">
      <h2
        className="text-[18px] leading-[21px] font-bold text-primary-200"
        id="recovery-cause-list-title"
      >
        주요 원인 TOP 3
      </h2>
      <ol className="mt-3 space-y-2">
        {RECOVERY_TOP_CAUSES.map((cause, index) => (
          <li className="rounded-[10px] bg-neutral-100 p-[14px]" key={cause.title}>
            <p className="text-[12px] leading-[14px] font-medium text-secondary-800">
              {index + 1}. {cause.title}
            </p>
            <p className="mt-1 text-[12px] leading-[14px] text-primary-100">
              기여 금액 <strong className="font-semibold">{cause.contribution}</strong>
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function RecoveryOptionList({
  isSaving,
  onSelect,
  options,
  selectedOptionIds,
}: Readonly<{
  isSaving: boolean
  onSelect: (optionId: number) => void
  options: ReadonlyArray<Parameters<typeof RecoveryOptionCard>[0]['option']>
  selectedOptionIds: readonly number[]
}>): React.JSX.Element {
  return (
    <section aria-labelledby="recovery-options-title" className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-[18px] leading-[21px] font-bold text-primary-200"
          id="recovery-options-title"
        >
          회복안 선택
        </h2>
        <p className="text-[12px] leading-[14px] text-secondary-300">
          선택{' '}
          <strong className="font-medium text-primary-blue-800">
            총 {selectedOptionIds.length}건
          </strong>
        </p>
      </div>
      <p className="mt-1 text-[11px] leading-[13px] text-secondary-300">
        최대 2개까지 선택할 수 있습니다.
      </p>
      {options.length === 0 ? (
        <p className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] text-[13px] text-secondary-300">
          현재 선택할 수 있는 회복안이 없습니다.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {options.map((option) => (
            <RecoveryOptionCard
              isSelected={selectedOptionIds.includes(option.optionId)}
              key={option.optionId}
              onSelect={() => onSelect(option.optionId)}
              option={option}
            />
          ))}
        </div>
      )}
      {isSaving ? (
        <p className="mt-2 text-[11px] text-secondary-300">선택을 저장하는 중입니다.</p>
      ) : null}
    </section>
  )
}

function ScenarioList({
  options,
  scenarios,
}: Readonly<{
  options: ReadonlyArray<Parameters<typeof RecoveryOptionCard>[0]['option']>
  scenarios: readonly RecoveryScenario[]
}>): React.JSX.Element {
  return (
    <section aria-labelledby="recovery-scenarios-title" className="mt-5">
      <h2
        className="text-[18px] leading-[21px] font-bold text-primary-200"
        id="recovery-scenarios-title"
      >
        시나리오 비교
      </h2>
      {scenarios.length === 0 ? (
        <p className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] text-[13px] text-secondary-300">
          비교할 시나리오가 없습니다.
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.scenarioId} options={options} scenario={scenario} />
          ))}
        </div>
      )}
    </section>
  )
}

function ScenarioCard({
  options,
  scenario,
}: Readonly<{
  options: ReadonlyArray<Parameters<typeof RecoveryOptionCard>[0]['option']>
  scenario: RecoveryScenario
}>): React.JSX.Element {
  const appliedOptionTitles = options
    .filter((option) => scenario.appliedOptionIds.includes(option.optionId))
    .map((option) => getRecoveryOptionTitle(option.optionCode))
  const title =
    scenario.scenarioType === 'BASELINE'
      ? '기준'
      : appliedOptionTitles.join(', ') || '회복안 적용 시나리오'

  return (
    <article className="rounded-[10px] border border-disabled-50 bg-neutral-100 p-[14px]">
      <h3 className="text-[12px] leading-[14px] font-medium text-secondary-800">{title}</h3>
      <p className="mt-1 text-[11px] leading-[15px] text-secondary-300">{scenario.note}</p>
      <p className="mt-1 text-[11px] leading-[15px] text-secondary-300">
        부족일 {scenario.deltaDays}일 지연 · 최저 잔액 {formatWon(scenario.minBalance)}원
      </p>
    </article>
  )
}

function RequestError({ onRetry }: Readonly<{ onRetry: () => void }>): React.JSX.Element {
  return (
    <section className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]" role="alert">
      <h2 className="text-[16px] leading-5 font-bold text-primary-200">
        회복안을 불러오지 못했습니다.
      </h2>
      <p className="mt-2 text-[13px] leading-4 text-secondary-300">잠시 후 다시 시도해 주세요.</p>
      <Button className="mt-4" onClick={onRetry} variant="outline">
        다시 시도
      </Button>
    </section>
  )
}

function ActionLinks(): React.JSX.Element {
  return (
    <div className="mt-8 grid gap-3">
      <Link
        className="inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 text-[16px] leading-6 font-medium text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
        href="/recovery/consultation"
      >
        상담 예약하기
      </Link>
      <Link
        className="inline-flex h-[42px] w-full items-center justify-center rounded-[8px] border border-primary-blue-900 px-[22px] py-2 text-[16px] leading-6 font-medium text-primary-blue-900 transition-colors hover:border-primary-blue-700 hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
        href="/recovery/support-programs"
      >
        지원사업 확인
      </Link>
      <Button className="w-full" disabled variant="secondary">
        자체 실행으로 저장
      </Button>
      <Button className="w-full" disabled variant="outline">
        확인 필요
      </Button>
    </div>
  )
}
