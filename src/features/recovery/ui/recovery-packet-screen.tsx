import Link from 'next/link'

import { ServiceBottomNavigation } from '@/features/navigation/ui/service-bottom-navigation'
import { BackLink, MobileScreen } from '@/shared/ui'

import { RECOVERY_PACKET_FIXTURE } from '../model/recovery-packet-data'

export function RecoveryPacketScreen(): React.JSX.Element {
  const { followUp, packet } = RECOVERY_PACKET_FIXTURE

  return (
    <MobileScreen aria-label="Recovery Packet 화면" className="min-h-[1170px]" mode="document">
      <BackLink href="/recovery/compare" label="회복안 비교로 돌아가기" />

      <div className="px-6 pt-[102px] pb-10">
        <header>
          <p className="text-[13px] leading-4 text-secondary-300">회복안 실행 계획</p>
          <h1 className="mt-1 text-[18px] leading-[21px] font-bold text-primary-200">
            Recovery Packet
          </h1>
        </header>

        <section
          aria-labelledby="packet-risk-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="packet-risk-title"
          >
            위험 요약
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
                현재 상태
              </dt>
              <dd className="mt-1 text-[14px] leading-5 font-bold text-warning-500">
                {packet.risk.label}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
                예상 최저 잔액
              </dt>
              <dd className="mt-1 text-[14px] leading-5 font-bold text-primary-100">
                {packet.risk.minimumBalanceRange}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="packet-causes-title" className="mt-5">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="packet-causes-title"
          >
            보정값·원인 TOP 3
          </h2>
          <p className="mt-1 text-[13px] leading-4 text-secondary-300">{packet.adjustments}</p>
          <ol className="mt-3 space-y-2">
            {packet.causes.map((cause, index) => (
              <li
                className="flex items-center justify-between gap-3 rounded-[10px] bg-neutral-100 p-[14px]"
                key={cause.title}
              >
                <span className="text-[13px] leading-5 text-primary-100">
                  {index + 1}. {cause.title}
                </span>
                <strong className="shrink-0 text-[13px] leading-5 font-semibold text-secondary-800">
                  {cause.contribution}
                </strong>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="packet-options-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="packet-options-title"
          >
            선택한 회복안
          </h2>
          <ul className="mt-3 space-y-2">
            {packet.selectedOptions.map((option) => (
              <li
                className="rounded-[8px] bg-neutral-400 px-3.5 py-2.5 text-[14px] leading-5 font-medium text-primary-100"
                key={option.id}
              >
                {option.title}
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="packet-status-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="packet-status-title"
          >
            버전·전송 상태
          </h2>
          <dl className="mt-3 space-y-2 text-[13px] leading-5">
            <div className="flex justify-between gap-3">
              <dt className="text-secondary-300">현재 버전</dt>
              <dd className="font-semibold text-primary-100">{packet.currentVersion}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-secondary-300">전송 상태</dt>
              <dd className="font-semibold text-primary-blue-800">{packet.transmissionStatus}</dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="packet-follow-up-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="packet-follow-up-title"
          >
            사후점검 일정
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-secondary-300">
            다음 점검 {followUp.schedule.nextReview}
          </p>
          <Link
            className="mt-3 inline-flex text-[14px] leading-5 font-semibold text-primary-blue-800 underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:outline-none"
            href="/recovery/follow-up"
          >
            30·60·90일 사후점검 보기
          </Link>
        </section>

        <Link
          className="mt-5 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] border border-primary-blue-900 px-[22px] py-2 text-[16px] leading-6 font-medium text-primary-blue-900 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/recovery/support-programs"
        >
          지원사업 확인
        </Link>
      </div>
      <ServiceBottomNavigation activeItem="recovery" />
    </MobileScreen>
  )
}
