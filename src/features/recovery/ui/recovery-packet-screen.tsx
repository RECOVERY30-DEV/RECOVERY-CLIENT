import Link from 'next/link'

import { ServiceBottomNavigation } from '@/features/navigation'
import {
  getRecoveryFollowUpHref,
  getRecoveryPacketActions,
  RECOVERY_PACKET_ANALYSIS_NOTE,
  RECOVERY_PACKET_CORRECTIONS,
  RECOVERY_PACKET_SCHEDULE,
  RECOVERY_PACKET_STATUS,
} from '@/features/recovery/model/recovery-execution-data'
import {
  DEFAULT_RECOVERY_OPTION_IDS,
  RECOVERY_RISK_SUMMARY,
  RECOVERY_TOP_CAUSES,
  type RecoveryOptionId,
} from '@/features/recovery/model/recovery-plan-data'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

type RecoveryPacketScreenProps = Readonly<{
  selectedOptionIds?: readonly RecoveryOptionId[]
}>

export function RecoveryPacketScreen({
  selectedOptionIds = DEFAULT_RECOVERY_OPTION_IDS,
}: RecoveryPacketScreenProps): React.JSX.Element {
  const actions = getRecoveryPacketActions(selectedOptionIds)

  return (
    <MobileScreen aria-label="Recovery Packet 화면" className="min-h-[1708px]" mode="document">
      <BackLink href="/recovery/compare" label="회복안 비교로 돌아가기" />

      <div className="px-6 pt-[103px]">
        <header>
          <p className="typo-caption-3 text-secondary-300">
            {RECOVERY_PACKET_STATUS.version} · 2025-07-14 생성
          </p>
          <h1 className="mt-1 typo-sub-header-2 text-primary-200">Recovery Packet</h1>
        </header>

        <section
          aria-labelledby="packet-risk-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="typo-sub-header-3 text-neutral-900" id="packet-risk-title">
              현재 위험 상태
            </h2>
            <span className="rounded-full bg-[#ffdadd] px-5 py-[6px] typo-body-7 text-warning-700">
              위험
            </span>
          </div>
          <dl className="mt-5 space-y-[10px] typo-caption-3">
            <KeyValueRow label="첫 부족 예상일" value={RECOVERY_RISK_SUMMARY.shortSummary} />
            <KeyValueRow label="예상 최저잔액" value={RECOVERY_RISK_SUMMARY.minimumBalanceRange} />
            <KeyValueRow label="예상 부족액" value="위험 — 부족 가능성 높음" />
          </dl>
          <p className="mt-3 typo-caption-2 text-secondary-300">
            예측값은 확정 결과가 아닌 보수적·예상 낙관 범위 기준입니다.
          </p>
        </section>

        <section aria-labelledby="packet-analysis-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="packet-analysis-title">
            보정값 및 부족 원인
          </h2>
          <div className="mt-3 rounded-[10px] border border-disabled-50 p-[14px]">
            <ul className="space-y-1 typo-caption-3">
              {RECOVERY_PACKET_CORRECTIONS.map((correction) => (
                <li className="flex items-start justify-between gap-4" key={correction.title}>
                  <span>{correction.title}</span>
                  <span className="shrink-0 font-medium text-primary-100">
                    {correction.amount} / {correction.date}
                  </span>
                </li>
              ))}
            </ul>

            <ol className="mt-4 space-y-3">
              {RECOVERY_TOP_CAUSES.map((cause, index) => (
                <li className="flex items-center justify-between gap-3" key={cause.title}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-[3px] bg-secondary-700 typo-caption-1 text-base-white">
                      {index + 1}
                    </span>
                    <span className="typo-caption-3 text-primary-100">{cause.title}</span>
                  </div>
                  <span className="shrink-0 typo-caption-3 text-primary-100">
                    {cause.contribution === '추정 중' ? '확인 필요' : `${cause.contribution} 기여`}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-4 border-t border-disabled-50 pt-3">
              <p className="typo-caption-3 text-primary-100">분석 기준</p>
              <p className="mt-1 typo-caption-2 text-secondary-300">
                {RECOVERY_PACKET_ANALYSIS_NOTE}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="packet-actions-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="packet-actions-title">
            선택한 회복안
          </h2>
          <div className="mt-3 rounded-[10px] border border-disabled-50 p-[14px]">
            {actions.map((action, index) => (
              <article
                className={index > 0 ? 'mt-4 border-t border-disabled-50 pt-4' : undefined}
                key={action.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="typo-caption-3 font-medium text-primary-100">{action.title}</h3>
                  <p className="text-right typo-caption-3 text-primary-blue-800">{action.effect}</p>
                </div>
                <dl className="mt-4 space-y-1 typo-caption-3">
                  <KeyValueRow label="준비 항목" value={action.preparation} valueColor="default" />
                  <KeyValueRow label="다음 행동" value={action.nextAction} valueColor="default" />
                </dl>
              </article>
            ))}
          </div>
          <p className="mt-4 typo-caption-2 text-secondary-300">
            금융상품 승인·금리·한도는 상담자 및 공식 출처의 최종 확인이 필요합니다.
          </p>
        </section>

        <section aria-labelledby="packet-status-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="packet-status-title">
            Packet 버전 및 전송 상태
          </h2>
          <div className="mt-3 rounded-[10px] border border-disabled-50 p-[14px]">
            <dl className="space-y-1 typo-caption-3">
              <KeyValueRow
                label="현재버전"
                value={RECOVERY_PACKET_STATUS.version}
                valueColor="default"
              />
              <KeyValueRow
                label="생성일"
                value={RECOVERY_PACKET_STATUS.createdAt}
                valueColor="default"
              />
              <KeyValueRow
                label="상담자 전송"
                value={RECOVERY_PACKET_STATUS.transmission}
                valueColor="default"
              />
              <KeyValueRow
                label="전송 범위"
                value={RECOVERY_PACKET_STATUS.scope}
                valueColor="default"
              />
            </dl>
            <p className="mt-4 typo-caption-2 text-secondary-300">
              수정 시 기존 Packet을 덮어쓰지 않고 새 버전이 생성됩니다.
            </p>
            <Button className="mt-4 w-full" disabled variant="secondary">
              전송 기능 준비 중
            </Button>
          </div>
        </section>

        <section aria-labelledby="packet-schedule-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="packet-schedule-title">
            사후 점검 일정
          </h2>
          <div className="mt-3 rounded-[10px] border border-disabled-50 p-[14px]">
            <dl className="space-y-1 typo-caption-3">
              {RECOVERY_PACKET_SCHEDULE.map((schedule) => (
                <KeyValueRow
                  key={schedule.day}
                  label={`${schedule.day}일 점검`}
                  value={`${schedule.date} ${schedule.status}`}
                  valueColor="default"
                />
              ))}
            </dl>
            <p className="mt-4 typo-caption-2 text-secondary-300">
              추적 동의 범위 안에서 잔액 회복과 연체 발생 여부를 확인합니다.
            </p>
            <Link
              className="mt-4 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-neutral-400 px-[22px] py-2 typo-body-5 text-primary-blue-800 transition-colors hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              href={getRecoveryFollowUpHref(selectedOptionIds)}
            >
              최신 사후점검 확인
            </Link>
          </div>
        </section>

        <Link
          className="mt-10 inline-block typo-caption-3 text-secondary-300 underline"
          href="/recovery/support-programs"
        >
          지원사업 확인
        </Link>
      </div>

      <ServiceBottomNavigation activeItem="recovery" className="mt-[42px]" />
    </MobileScreen>
  )
}

function KeyValueRow({
  label,
  value,
  valueColor = 'accent',
}: Readonly<{
  label: string
  value: string
  valueColor?: 'accent' | 'default'
}>) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-primary-100">{label}</dt>
      <dd
        className={
          valueColor === 'accent'
            ? 'text-right font-medium text-primary-blue-800'
            : 'text-right text-primary-100'
        }
      >
        {value}
      </dd>
    </div>
  )
}
