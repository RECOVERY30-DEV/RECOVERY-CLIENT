import Link from 'next/link'

import { BackLink, MobileScreen } from '@/shared/ui'

import { getCashflowDailyDetail } from '../model/cashflow-daily-detail-data'
import { CashflowDailyNotes } from './cashflow-daily-notes'
import { CashflowDailySources } from './cashflow-daily-sources'
import { CashflowDailySummary } from './cashflow-daily-summary'
import { CashflowDetailSection } from './cashflow-detail-section'

type CashflowDailyDetailScreenProps = Readonly<{
  date: string
}>

export function CashflowDailyDetailScreen({ date }: CashflowDailyDetailScreenProps) {
  const detail = getCashflowDailyDetail(date)

  if (!detail) {
    throw new RangeError(`지원하지 않는 현금흐름 날짜입니다: ${date}`)
  }

  return (
    <MobileScreen aria-label="일자별 현금흐름 상세 화면" className="min-h-[1811px]" mode="document">
      <BackLink href="/cashflow" label="현금흐름 대시보드로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <CashflowDailySummary date={date} summary={detail.summary} />

        <div className="mt-5 flex flex-col gap-5">
          {detail.sections.map((section) => (
            <CashflowDetailSection key={section.title} section={section} />
          ))}
          <CashflowDailyNotes notes={detail.notes} />
          <CashflowDailySources sources={detail.sources} />
        </div>

        <Link
          className="mt-[70px] inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 typo-body-3 text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/cashflow/corrections"
        >
          보정값 추가·수정하기
        </Link>
      </div>
    </MobileScreen>
  )
}
