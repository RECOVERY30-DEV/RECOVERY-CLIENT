'use client'

import Link from 'next/link'
import { useState } from 'react'

import { ServiceBottomNavigation } from '@/features/navigation'
import {
  FOLLOW_UP_BALANCE_STATUS,
  FOLLOW_UP_CONSENTS,
  FOLLOW_UP_MILESTONES,
  FOLLOW_UP_RISK_STATUS,
  FOLLOW_UP_SUMMARY,
  getFollowUpExecutionStatuses,
  getRecoveryPacketHref,
} from '@/features/recovery/model/recovery-execution-data'
import {
  DEFAULT_RECOVERY_OPTION_IDS,
  type RecoveryOptionId,
} from '@/features/recovery/model/recovery-plan-data'
import { BackLink, MobileScreen, Switch } from '@/shared/ui'

type RecoveryFollowUpScreenProps = Readonly<{
  selectedOptionIds?: readonly RecoveryOptionId[]
}>

export function RecoveryFollowUpScreen({
  selectedOptionIds = DEFAULT_RECOVERY_OPTION_IDS,
}: RecoveryFollowUpScreenProps): React.JSX.Element {
  const [consents, setConsents] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FOLLOW_UP_CONSENTS.map((consent) => [consent.id, consent.isEnabled])),
  )

  function handleConsentChange(id: string) {
    setConsents((current) => ({ ...current, [id]: !current[id] }))
  }

  const executionStatuses = getFollowUpExecutionStatuses(selectedOptionIds)

  return (
    <MobileScreen aria-label="사후점검 화면" className="min-h-[1380px]" mode="document">
      <BackLink
        href={getRecoveryPacketHref(selectedOptionIds)}
        label="Recovery Packet으로 돌아가기"
      />

      <div className="px-6 pt-[103px]">
        <header>
          <h1 className="typo-sub-header-2 text-primary-200">실행 상태 점검</h1>
          <p className="mt-1 typo-body-7 text-secondary-300">
            마지막 점검 {FOLLOW_UP_SUMMARY.lastCheckedAt}
          </p>
        </header>

        <section aria-labelledby="follow-up-milestones-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-milestones-title">
            30·60·90일 점검 현황
          </h2>
          <div className="mt-3 rounded-[10px] bg-neutral-100 p-[14px]">
            <ol className="grid grid-cols-3 border-b border-disabled-50 pb-4">
              {FOLLOW_UP_MILESTONES.map((milestone) => (
                <li className="flex items-center gap-2 typo-caption-3" key={milestone.day}>
                  <span
                    aria-hidden="true"
                    className={
                      milestone.status === '완료'
                        ? 'text-[24px] font-bold text-primary-blue-800'
                        : 'text-[24px] font-bold text-secondary-300'
                    }
                  >
                    ✓
                  </span>
                  <span>{milestone.day}일</span>
                  <span
                    className={
                      milestone.status === '완료' ? 'text-primary-blue-800' : 'text-secondary-300'
                    }
                  >
                    {milestone.status}
                  </span>
                </li>
              ))}
            </ol>
            <dl className="mt-5 flex items-center justify-between typo-caption-3">
              <dt>다음 점검일</dt>
              <dd className="font-medium text-primary-blue-800">{FOLLOW_UP_SUMMARY.nextCheckAt}</dd>
            </dl>
          </div>
        </section>

        <section aria-labelledby="follow-up-balance-title" className="mt-7">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-balance-title">
            잔액 회복 현황
          </h2>
          <dl className="mt-3 space-y-3 rounded-[10px] bg-neutral-100 p-[14px] typo-caption-3">
            <FollowUpRow
              label="잔액 회복 여부"
              tone="success"
              value={FOLLOW_UP_BALANCE_STATUS.balanceStatus}
            />
            <FollowUpRow
              label="연체 발생 여부"
              value={FOLLOW_UP_BALANCE_STATUS.delinquencyStatus}
            />
            <FollowUpRow
              label="기준일 잔액"
              tone="accent"
              value={`${FOLLOW_UP_BALANCE_STATUS.recoveredBalance} 회복`}
            />
          </dl>
        </section>

        <section aria-labelledby="follow-up-execution-title" className="mt-7">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-execution-title">
            회복안 실행 상태
          </h2>
          <div className="mt-3 space-y-3">
            {executionStatuses.map((execution) => (
              <article className="rounded-[10px] bg-neutral-100 p-[14px]" key={execution.optionId}>
                <div className="flex items-center justify-between gap-3 typo-caption-3">
                  <h3 className="font-normal text-primary-100">{execution.title}</h3>
                  <p
                    className={
                      execution.status === '완료' ? 'text-success-700' : 'text-primary-blue-800'
                    }
                  >
                    {execution.status}
                  </p>
                </div>
                <p
                  className={
                    execution.status === '완료'
                      ? 'mt-3 typo-caption-3 text-secondary-300'
                      : 'mt-3 typo-caption-3 text-warning-700'
                  }
                >
                  {execution.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="follow-up-risk-title" className="mt-7">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-risk-title">
            최신 현금흐름 위험
          </h2>
          <div className="mt-3 rounded-[10px] bg-neutral-100 p-[14px]">
            <dl className="flex items-center justify-between typo-caption-3">
              <dt>현재 위험 수준</dt>
              <dd className="font-medium text-primary-blue-800">{FOLLOW_UP_RISK_STATUS.level}</dd>
            </dl>
            <p className="mt-3 typo-caption-3 text-secondary-300">
              {FOLLOW_UP_RISK_STATUS.description}
            </p>
            <div className="relative mt-3 h-3 rounded-full bg-[linear-gradient(90deg,#ff5a55_0%,#ffd65b_45%,#73e8af_75%)]">
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-[55%] h-5 w-[88px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-base-white/70 bg-base-white/45 shadow-[0_0_8px_rgba(48,48,48,0.15)]"
              />
            </div>
            <dl className="mt-4 grid grid-cols-3 items-end typo-caption-3 text-secondary-300">
              <div>
                <dt className="sr-only">최소 잔액</dt>
                <dd>{FOLLOW_UP_RISK_STATUS.minimumBalance}</dd>
              </div>
              <div className="text-center">
                <dt className="text-secondary-300">예상 최저 잔액</dt>
                <dd className="sr-only">범위 중앙값</dd>
              </div>
              <div className="text-right">
                <dt className="sr-only">최대 잔액</dt>
                <dd>{FOLLOW_UP_RISK_STATUS.maximumBalance}</dd>
              </div>
            </dl>
            <p className="mt-4 typo-caption-3 text-secondary-300">
              {FOLLOW_UP_RISK_STATUS.disclaimer}
            </p>
            <Link
              className="mt-3 inline-block typo-caption-3 text-secondary-300 underline"
              href="/cashflow"
            >
              최신 현금흐름 확인
            </Link>
          </div>
        </section>

        <section aria-labelledby="follow-up-consents-title" className="mt-7">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-consents-title">
            사후점검 알림 및 추적 동의
          </h2>
          <div className="mt-3 rounded-[10px] bg-neutral-100 p-[14px]">
            <div className="space-y-4">
              {FOLLOW_UP_CONSENTS.map((consent) => (
                <Switch
                  checked={consents[consent.id]}
                  className="w-full text-secondary-300"
                  id={consent.id}
                  key={consent.id}
                  label={consent.label}
                  onChange={() => handleConsentChange(consent.id)}
                />
              ))}
            </div>
            <div className="mt-4 border-t border-disabled-50 pt-4">
              <p className="typo-caption-3 text-secondary-300">
                {FOLLOW_UP_RISK_STATUS.disclaimer}
              </p>
              <Link
                className="mt-3 inline-block typo-caption-3 text-secondary-300 underline"
                href="/consents"
              >
                동의 설정 변경
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ServiceBottomNavigation activeItem="recovery" className="mt-[72px]" />
    </MobileScreen>
  )
}

function FollowUpRow({
  label,
  tone = 'default',
  value,
}: Readonly<{
  label: string
  tone?: 'accent' | 'default' | 'success'
  value: string
}>) {
  const valueClassName = {
    accent: 'text-primary-blue-800',
    default: 'text-primary-100',
    success: 'text-success-700',
  }[tone]

  return (
    <div className="flex items-center justify-between gap-4">
      <dt>{label}</dt>
      <dd className={valueClassName}>{value}</dd>
    </div>
  )
}
