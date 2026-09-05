import { BackLink, Button, MobileScreen } from '@/shared/ui'

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

        <Button
          className="mt-[70px] w-full disabled:bg-primary-100 disabled:text-base-white"
          disabled
        >
          보정값 추가·수정하기
        </Button>
      </div>
    </MobileScreen>
  )
}
