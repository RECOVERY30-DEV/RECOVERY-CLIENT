'use client'

import Link from 'next/link'

import { useConsultationQuery } from '@/features/consultation'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

type ConsultationCompleteScreenProps = Readonly<{
  consultationId: number
}>

export function ConsultationCompleteScreen({
  consultationId,
}: ConsultationCompleteScreenProps): React.JSX.Element {
  const consultationQuery = useConsultationQuery(consultationId)

  return (
    <MobileScreen aria-label="상담 예약 완료 화면" className="min-h-[720px]" mode="document">
      <BackLink href="/recovery/compare" label="회복안 비교로 돌아가기" />
      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">예약 완료</h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            상담 예약 정보를 확인해 주세요.
          </p>
        </header>

        {consultationQuery.isPending ? (
          <p className="mt-5 rounded-[10px] bg-neutral-100 p-[14px] text-[13px] text-secondary-300">
            예약 정보를 불러오는 중입니다.
          </p>
        ) : consultationQuery.isError ? (
          <div className="bg-error-50 mt-5 rounded-[10px] p-[14px] typo-caption-3 text-error-500">
            <p role="alert">예약 상세 정보를 불러오지 못했습니다.</p>
            <Button
              className="mt-3"
              onClick={() => void consultationQuery.refetch()}
              size="sm"
              variant="outline"
            >
              다시 시도
            </Button>
          </div>
        ) : consultationQuery.data ? (
          <section className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]" aria-live="polite">
            <h2 className="text-[18px] leading-[21px] font-bold text-primary-200">
              {consultationQuery.data.status === 'REQUESTED'
                ? '상담 예약이 접수되었습니다.'
                : '상담 예약 정보를 확인했습니다.'}
            </h2>
            <dl className="mt-4 space-y-3 text-[12px] leading-[14px]">
              <CompletionSummaryRow label="상담사" value={consultationQuery.data.counselorName ?? '배정 중'} />
              <CompletionSummaryRow
                label="예약 일시"
                value={formatConsultationSchedule(consultationQuery.data.scheduledAt)}
              />
              <CompletionSummaryRow label="상담 채널" value={getChannelLabel(consultationQuery.data.channel)} />
            </dl>
          </section>
        ) : null}

        <div className="mt-8 grid gap-3">
          <Link
            className="inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 text-[16px] leading-6 font-medium text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/recovery/compare"
          >
            회복안 비교로 돌아가기
          </Link>
          <Link
            className="inline-flex h-[42px] w-full items-center justify-center rounded-[8px] border border-primary-blue-900 px-[22px] py-2 text-[16px] leading-6 font-medium text-primary-blue-900 transition-colors hover:border-primary-blue-700 hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/recovery"
          >
            Recovery Packet 확인
          </Link>
        </div>
      </div>
    </MobileScreen>
  )
}

function CompletionSummaryRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-secondary-300">{label}</dt>
      <dd className="text-right font-medium text-primary-blue-800">{value}</dd>
    </div>
  )
}

function getChannelLabel(channel: string): string {
  return channel === 'PHONE' ? '전화 상담' : channel
}

function formatConsultationSchedule(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value))
}
