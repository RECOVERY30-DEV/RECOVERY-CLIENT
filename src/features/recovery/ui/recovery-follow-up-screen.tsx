'use client'

import Link from 'next/link'
import type { KyInstance } from 'ky'

import { ServiceBottomNavigation } from '@/features/navigation'
import type {
  ExecutionStatusView,
  FollowupView,
} from '@/features/recovery/follow-up/api/follow-up-contract'
import { useFollowUpQueries } from '@/features/recovery/follow-up/queries/follow-up-queries'
import { getRecoveryPacketHref } from '@/features/recovery/model/recovery-execution-data'
import {
  DEFAULT_RECOVERY_OPTION_IDS,
  type RecoveryOptionId,
} from '@/features/recovery/model/recovery-plan-data'
import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, MobileScreen } from '@/shared/ui'

type RecoveryFollowUpScreenProps = Readonly<{
  client?: KyInstance
  selectedOptionIds?: readonly RecoveryOptionId[]
}>

const WON_FORMATTER = new Intl.NumberFormat('ko-KR')

function formatWon(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''

  return `${sign}₩${WON_FORMATTER.format(Math.abs(value))}`
}

function formatCheckpoint(checkpoint: FollowupView['checkpoint']): string {
  return checkpoint
}

function formatScheduleStatus(status: FollowupView['status']): string {
  return {
    DONE: '완료',
    SCHEDULED: '예정',
    SKIPPED: '건너뜀',
  }[status]
}

function formatExecutionStatus(status: ExecutionStatusView['status']): string {
  return {
    NOT_STARTED: '시작 전',
    IN_PROGRESS: '진행 중',
    DONE: '완료',
    BLOCKED: '차단됨',
  }[status]
}

function formatBalanceRecovered(value: 'YES' | 'PARTIAL' | 'NO' | null): string {
  if (value === null) {
    return '점검 중'
  }

  return {
    YES: '회복 완료',
    PARTIAL: '부분 회복',
    NO: '회복 미달',
  }[value]
}

function formatRiskStatus(value: 'RISK' | 'STABLE' | 'HOLD' | null): string {
  if (value === null) {
    return '점검 중'
  }

  return {
    RISK: '주의 필요',
    STABLE: '안정 구간',
    HOLD: '추가 확인 필요',
  }[value]
}

export function RecoveryFollowUpScreen({
  client,
  selectedOptionIds = DEFAULT_RECOVERY_OPTION_IDS,
}: RecoveryFollowUpScreenProps): React.JSX.Element {
  const { executionStatuses, followups, result } = useFollowUpQueries(
    DEMO_BUSINESS_ID,
    client === undefined ? {} : { client },
  )
  const nextFollowup = followups.data?.find((followup) => followup.status === 'SCHEDULED')

  return (
    <MobileScreen aria-label="사후점검 화면" className="min-h-[1180px]" mode="document">
      <BackLink
        href={getRecoveryPacketHref(selectedOptionIds)}
        label="Recovery Packet으로 돌아가기"
      />

      <div className="px-6 pt-[103px]">
        <header>
          <h1 className="typo-sub-header-2 text-primary-200">실행 상태 점검</h1>
          <p className="mt-1 typo-body-7 text-secondary-300">
            회복안 실행과 사후점검 결과를 확인합니다.
          </p>
        </header>

        <section aria-labelledby="follow-up-milestones-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-milestones-title">
            30·60·90일 점검 현황
          </h2>
          <div className="mt-3 rounded-[10px] bg-neutral-100 p-[14px]">
            {followups.isLoading ? (
              <p className="typo-caption-3 text-secondary-300">점검 일정을 불러오는 중입니다.</p>
            ) : followups.isError ? (
              <RetryNotice
                label="점검 일정을 불러오지 못했습니다."
                onRetry={() => void followups.refetch()}
              />
            ) : followups.data?.length === 0 ? (
              <p className="typo-caption-3 text-secondary-300">등록된 점검 일정이 없습니다.</p>
            ) : (
              <>
                <ol className="grid grid-cols-3 border-b border-disabled-50 pb-4">
                  {followups.data?.map((followup) => (
                    <li
                      className="flex flex-col items-center gap-1 typo-caption-3"
                      key={followup.id}
                    >
                      <span className="flex items-center gap-1">
                        <span
                          aria-hidden="true"
                          className={
                            followup.status === 'DONE'
                              ? 'text-[24px] font-bold text-primary-blue-800'
                              : 'text-[24px] font-bold text-secondary-300'
                          }
                        >
                          ✓
                        </span>
                        <span>{formatCheckpoint(followup.checkpoint)}</span>
                        <span
                          className={
                            followup.status === 'DONE'
                              ? 'text-primary-blue-800'
                              : 'text-secondary-300'
                          }
                        >
                          {formatScheduleStatus(followup.status)}
                        </span>
                      </span>
                      <time className="text-secondary-300" dateTime={followup.scheduledDate}>
                        {followup.scheduledDate}
                      </time>
                    </li>
                  ))}
                </ol>
                {nextFollowup === undefined ? null : (
                  <dl className="mt-5 flex items-center justify-between typo-caption-3">
                    <dt>다음 점검일</dt>
                    <dd className="font-medium text-primary-blue-800">
                      {nextFollowup.scheduledDate}
                    </dd>
                  </dl>
                )}
              </>
            )}
          </div>
        </section>

        <section aria-labelledby="follow-up-result-title" className="mt-7">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-result-title">
            잔액 회복 현황
          </h2>
          <div className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] typo-caption-3">
            {result.isLoading ? (
              <p className="text-secondary-300">점검 결과를 불러오는 중입니다.</p>
            ) : result.isError ? (
              <RetryNotice
                label="결과가 아직 기록되지 않았습니다"
                onRetry={() => void result.refetch()}
              />
            ) : result.data === undefined ? (
              <p className="text-secondary-300">기록된 점검 결과가 없습니다.</p>
            ) : (
              <dl className="space-y-3">
                <FollowUpRow
                  label="잔액 회복 여부"
                  tone={result.data.balanceRecovered === 'YES' ? 'success' : 'accent'}
                  value={formatBalanceRecovered(result.data.balanceRecovered)}
                />
                <FollowUpRow
                  label="연체 발생 여부"
                  value={result.data.delinquency ? '있음' : '없음'}
                />
                <FollowUpRow
                  label="회복액"
                  tone="accent"
                  value={
                    result.data.recoveryAmount === null
                      ? '확인 중'
                      : `${formatWon(result.data.recoveryAmount)} 회복`
                  }
                />
              </dl>
            )}
          </div>
        </section>

        <section aria-labelledby="follow-up-execution-title" className="mt-7">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-execution-title">
            회복안 실행 상태
          </h2>
          <div className="mt-3 space-y-3">
            {executionStatuses.isLoading ? (
              <p className="typo-caption-3 text-secondary-300">실행 상태를 불러오는 중입니다.</p>
            ) : executionStatuses.isError ? (
              <RetryNotice
                label="실행 상태를 불러오지 못했습니다."
                onRetry={() => void executionStatuses.refetch()}
              />
            ) : executionStatuses.data?.length === 0 ? (
              <p className="typo-caption-3 text-secondary-300">표시할 실행 상태가 없습니다.</p>
            ) : (
              executionStatuses.data?.map((execution) => (
                <article className="rounded-[10px] bg-neutral-100 p-[14px]" key={execution.id}>
                  <div className="flex items-center justify-between gap-3 typo-caption-3">
                    <h3 className="font-normal text-primary-100">
                      회복안 {execution.recoveryOptionId}
                    </h3>
                    <p
                      className={
                        execution.status === 'DONE'
                          ? 'text-success-700'
                          : execution.status === 'BLOCKED'
                            ? 'text-warning-700'
                            : 'text-primary-blue-800'
                      }
                    >
                      {formatExecutionStatus(execution.status)}
                    </p>
                  </div>
                  {execution.status === 'BLOCKED' && execution.blockerText !== null ? (
                    <p className="mt-3 typo-caption-3 text-warning-700">{execution.blockerText}</p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section aria-labelledby="follow-up-risk-title" className="mt-7">
          <h2 className="typo-sub-header-2 text-primary-200" id="follow-up-risk-title">
            최신 현금흐름 위험
          </h2>
          <div className="mt-3 rounded-[10px] bg-neutral-100 p-[14px]">
            <dl className="flex items-center justify-between typo-caption-3">
              <dt>현재 위험 수준</dt>
              <dd className="font-medium text-primary-blue-800">
                {result.data === undefined ? '점검 중' : formatRiskStatus(result.data.riskStatus)}
              </dd>
            </dl>
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
            <p className="typo-caption-3 text-secondary-300">
              동의 설정은 동의 관리 화면에서 변경할 수 있습니다.
            </p>
            <Link
              className="mt-3 inline-block typo-caption-3 text-secondary-300 underline"
              href="/consents"
            >
              동의 설정 변경
            </Link>
          </div>
        </section>

        <Link
          className="mt-7 inline-block typo-caption-3 text-secondary-300 underline focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
          href="/recovery/support-programs"
        >
          지원사업 확인
        </Link>
      </div>

      <ServiceBottomNavigation activeItem="recovery" className="mt-[72px]" />
    </MobileScreen>
  )
}

function RetryNotice({ label, onRetry }: Readonly<{ label: string; onRetry: () => void }>) {
  return (
    <div className="flex items-center justify-between gap-3 typo-caption-3">
      <p className="text-secondary-300">{label}</p>
      <button className="text-primary-blue-800 underline" onClick={onRetry} type="button">
        다시 시도
      </button>
    </div>
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
