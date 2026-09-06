'use client'

import Link from 'next/link'
import { useState } from 'react'

import { BackLink, Button, MobileScreen } from '@/shared/ui'

import { getSelfActionHref } from '../model/recovery-execution-data'
import {
  DEFAULT_RECOVERY_OPTION_IDS,
  RECOVERY_OPTION_CATALOG,
  RECOVERY_RISK_SUMMARY,
  RECOVERY_TOP_CAUSES,
  type RecoveryOptionId,
} from '../model/recovery-plan-data'
import { RecoveryOptionCard } from './recovery-option-card'

function getConsultationHref(selectedOptionIds: readonly RecoveryOptionId[]): string {
  const parameters = new URLSearchParams()
  selectedOptionIds.forEach((id) => parameters.append('plans', id))
  return `/recovery/consultation?${parameters.toString()}`
}

export function RecoveryPlanComparisonScreen(): React.JSX.Element {
  const [selectedOptionIds, setSelectedOptionIds] = useState<readonly RecoveryOptionId[]>(
    DEFAULT_RECOVERY_OPTION_IDS,
  )
  const selfActionHref = getSelfActionHref(selectedOptionIds)

  function handleOptionSelect(optionId: RecoveryOptionId) {
    setSelectedOptionIds((currentIds) => {
      if (currentIds.includes(optionId)) {
        return currentIds.filter((id) => id !== optionId)
      }

      if (currentIds.length === 2) {
        return currentIds
      }

      return [...currentIds, optionId]
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
          <div className="mt-3 space-y-3">
            {RECOVERY_OPTION_CATALOG.map((option) => (
              <RecoveryOptionCard
                isSelected={selectedOptionIds.includes(option.id)}
                key={option.id}
                onSelect={() => handleOptionSelect(option.id)}
                optionId={option.id}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="recovery-scenarios-title" className="mt-5">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="recovery-scenarios-title"
          >
            시나리오 비교
          </h2>
          <div className="mt-3 grid gap-2">
            <ScenarioCard description="현재 현금흐름 예측을 유지합니다." title="기준" />
            <ScenarioCard
              description="상환조건 조정 가능 여부를 상담으로 확인합니다."
              title="상환조건 조정 상담"
            />
            <ScenarioCard
              description="월말 고정비 납부일을 분산하는 방안을 확인합니다."
              title="고정비 납부일 재배치"
            />
          </div>
        </section>

        <div className="mt-8 grid gap-3">
          <Link
            className="inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 text-[16px] leading-6 font-medium text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            href={getConsultationHref(selectedOptionIds)}
          >
            상담 예약하기
          </Link>
          <Link
            className="inline-flex h-[42px] w-full items-center justify-center rounded-[8px] border border-primary-blue-900 px-[22px] py-2 text-[16px] leading-6 font-medium text-primary-blue-900 transition-colors hover:border-primary-blue-700 hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/recovery/support-programs"
          >
            지원사업 확인
          </Link>
          {selfActionHref ? (
            <Link
              className="inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-neutral-400 px-[22px] py-2 typo-body-3 text-primary-blue-900 transition-colors hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              href={selfActionHref}
            >
              셀프 실행으로 저장
            </Link>
          ) : (
            <Button className="w-full" disabled variant="secondary">
              셀프 실행으로 저장
            </Button>
          )}
          <Button className="w-full" disabled variant="outline">
            확인 필요
          </Button>
        </div>
      </div>
    </MobileScreen>
  )
}

function ScenarioCard({ description, title }: Readonly<{ description: string; title: string }>) {
  return (
    <article className="rounded-[10px] border border-disabled-50 bg-neutral-100 p-[14px]">
      <h3 className="text-[12px] leading-[14px] font-medium text-secondary-800">{title}</h3>
      <p className="mt-1 text-[11px] leading-[15px] text-secondary-300">{description}</p>
    </article>
  )
}
