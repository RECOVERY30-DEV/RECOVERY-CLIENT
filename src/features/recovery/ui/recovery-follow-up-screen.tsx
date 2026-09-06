'use client'

import Link from 'next/link'
import { useState } from 'react'

import { ServiceBottomNavigation } from '@/features/navigation/ui/service-bottom-navigation'
import { BackLink, MobileScreen, Switch } from '@/shared/ui'

import { RECOVERY_PACKET_FIXTURE } from '../model/recovery-packet-data'

export function RecoveryFollowUpScreen(): React.JSX.Element {
  const { followUp } = RECOVERY_PACKET_FIXTURE
  const [consentState, setConsentState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(followUp.consentOptions.map((option) => [option.id, option.defaultChecked])),
  )

  return (
    <MobileScreen
      aria-label="Recovery Packet 사후점검 화면"
      className="min-h-[1220px]"
      mode="document"
    >
      <BackLink href="/recovery" label="Recovery Packet으로 돌아가기" />

      <div className="px-6 pt-[102px] pb-10">
        <header>
          <p className="text-[13px] leading-4 text-secondary-300">
            Packet 생성 {followUp.schedule.created}
          </p>
          <h1 className="mt-1 text-[18px] leading-[21px] font-bold text-primary-200">
            30·60·90일 사후점검
          </h1>
        </header>

        <section
          aria-labelledby="timeline-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2 className="text-[18px] leading-[21px] font-bold text-primary-200" id="timeline-title">
            점검 시간축
          </h2>
          <ol className="mt-3 space-y-2">
            {followUp.schedule.milestones.map((milestone) => (
              <li
                className="flex items-center justify-between gap-3 rounded-[8px] bg-neutral-400 px-3.5 py-2.5"
                key={milestone.label}
              >
                <span className="text-[14px] leading-5 text-primary-100">
                  {milestone.label} · {milestone.date} · {milestone.status}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12px] leading-4 text-secondary-300">
            마지막 점검 {followUp.schedule.lastReviewed}
          </p>
          <p className="mt-1 text-[12px] leading-4 text-secondary-300">
            다음 점검 {followUp.schedule.nextReview}
          </p>
        </section>

        <section
          aria-labelledby="recovery-result-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="recovery-result-title"
          >
            잔액 회복
          </h2>
          <p className="mt-2 text-[18px] leading-6 font-bold text-primary-blue-800">
            {followUp.balanceRecovery}
          </p>
          <h3 className="mt-4 text-[14px] leading-5 font-semibold text-primary-100">실행 상태</h3>
          <ul className="mt-2 space-y-2">
            {followUp.actionStatuses.map((action) => (
              <li className="flex justify-between gap-3 text-[13px] leading-5" key={action.title}>
                <span className="text-primary-100">{action.title}</span>
                <strong className="shrink-0 font-semibold text-primary-blue-800">
                  {action.status}
                </strong>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="latest-risk-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="latest-risk-title"
          >
            현재 위험 수준
          </h2>
          <p className="mt-2 text-[14px] leading-5 font-semibold text-warning-500">
            {followUp.latestRisk}
          </p>
        </section>

        <section
          aria-labelledby="consents-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2 className="text-[18px] leading-[21px] font-bold text-primary-200" id="consents-title">
            사후점검 동의
          </h2>
          <div className="mt-3 space-y-3">
            {followUp.consentOptions.map((option) => (
              <Switch
                checked={consentState[option.id]}
                id={option.id}
                key={option.id}
                label={option.label}
                onChange={(event) => {
                  const isChecked = event.currentTarget.checked
                  setConsentState((current) => ({ ...current, [option.id]: isChecked }))
                }}
              />
            ))}
          </div>
        </section>

        <nav aria-label="사후점검 관련 링크" className="mt-5 grid gap-3">
          <Link
            className="rounded-[8px] border border-primary-blue-900 px-3.5 py-2.5 text-center text-[14px] leading-5 font-medium text-primary-blue-900 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/cashflow"
          >
            현금흐름 보기
          </Link>
          <Link
            className="rounded-[8px] border border-primary-blue-900 px-3.5 py-2.5 text-center text-[14px] leading-5 font-medium text-primary-blue-900 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/consents"
          >
            동의 관리
          </Link>
          <Link
            className="rounded-[8px] border border-primary-blue-900 px-3.5 py-2.5 text-center text-[14px] leading-5 font-medium text-primary-blue-900 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/recovery/support-programs"
          >
            지원사업 확인
          </Link>
        </nav>
      </div>
      <ServiceBottomNavigation activeItem="recovery" />
    </MobileScreen>
  )
}
