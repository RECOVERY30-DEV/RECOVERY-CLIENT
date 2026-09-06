'use client'

import Link from 'next/link'
import type { KyInstance } from 'ky'

import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

import type { DailyDetailView, DailyItemView } from '../api/forecast-timeline-contract'
import { useForecastDailyDetailQuery } from '../queries/forecast-timeline-queries'

type CashflowDailyDetailScreenProps = Readonly<{
  date: string
  client?: KyInstance
}>

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)

  return `${year}년 ${month}월 ${day}일`
}

function formatAmount(
  amountMin: number,
  amountMax: number,
  direction?: DailyItemView['direction'],
) {
  const format = (amount: number) =>
    new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(Math.abs(amount) / 10_000)
  const sign = direction === 'I' ? '+' : direction === 'O' ? '−' : ''
  const range =
    amountMin === amountMax ? format(amountMin) : `${format(amountMin)} ~ ${format(amountMax)}`

  return `${sign}${range}만 원`
}

function DetailSection({
  title,
  items,
}: Readonly<{ title: string; items: ReadonlyArray<DailyItemView> }>) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="rounded-[10px] bg-neutral-100 px-[14px] py-5">
      <h2 className="text-[18px] leading-[21px] font-bold text-neutral-900">{title}</h2>
      <ul className="mt-5 flex flex-col gap-2">
        {items.map((item, index) => (
          <li
            className="flex min-h-8 items-end justify-between gap-4"
            key={`${item.itemKind}-${item.label}-${index}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[12px] leading-[14px] font-medium text-primary-100">
                {item.label}
              </p>
              {item.subLabel === null ? null : (
                <p className="mt-1 text-[12px] leading-[14px] text-primary-100">{item.subLabel}</p>
              )}
            </div>
            <p className="w-[155px] shrink-0 text-right text-[12px] leading-[14px] font-semibold text-primary-blue-700">
              {formatAmount(item.amountMin, item.amountMax, item.direction)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DailySummary({ detail }: Readonly<{ detail: DailyDetailView }>) {
  return (
    <section className="rounded-[10px] bg-neutral-100 p-[14px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[16px] leading-[21px] font-semibold text-neutral-900">
          {formatDate(detail.targetDate)}
        </h1>
        <span className="text-[14px] leading-5 font-medium text-secondary-300">
          D-{detail.dDay}
        </span>
      </div>
      <dl className="mt-[14px] grid grid-cols-[115px_1fr] border-b border-disabled-50 pb-2">
        <div>
          <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">시작잔액</dt>
          <dd className="mt-1 text-[16px] leading-[21px] font-semibold text-primary-blue-700">
            {formatAmount(detail.openingBalance, detail.openingBalance)}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">
            예상 마감잔액
          </dt>
          <dd className="mt-1 text-[16px] leading-[21px] font-semibold text-primary-blue-700">
            {formatAmount(detail.closingBalanceExpected, detail.closingBalanceExpected)}
          </dd>
        </div>
      </dl>
      <p className="mt-[15px] text-right text-[11px] leading-[13px] text-secondary-300">
        보수적 {formatAmount(detail.closingBalanceConservative, detail.closingBalanceConservative)}{' '}
        · 낙관 {formatAmount(detail.closingBalanceOptimistic, detail.closingBalanceOptimistic)}
      </p>
    </section>
  )
}

function DailyDetailContent({ detail }: Readonly<{ detail: DailyDetailView }>) {
  const confirmedItems = detail.items.filter((item) => item.itemKind === 'CONFIRMED')
  const expectedItems = detail.items.filter((item) => item.itemKind === 'EXPECTED')
  const adjustmentItems = detail.items.filter((item) => item.itemKind === 'ADJUSTMENT')
  const hasItems = detail.items.length > 0

  return (
    <>
      <DailySummary detail={detail} />
      <div className="mt-5 flex flex-col gap-5">
        {hasItems ? (
          <>
            <DetailSection items={confirmedItems} title="확정 거래" />
            <DetailSection items={expectedItems} title="예상 거래" />
            <DetailSection items={adjustmentItems} title="보정값" />
          </>
        ) : (
          <section
            aria-label="거래 근거 없음"
            className="rounded-[10px] bg-neutral-100 px-[14px] py-5"
          >
            <p className="text-[13px] text-secondary-300">표시할 거래 근거가 없습니다.</p>
          </section>
        )}
        {detail.holidayShiftNote === null ? null : (
          <section className="rounded-[10px] bg-neutral-100 px-[14px] py-5">
            <h2 className="text-[18px] leading-[21px] font-bold text-neutral-900">특이사항</h2>
            <p className="mt-3 text-[12px] leading-[14px] text-secondary-300">
              {detail.holidayShiftNote}
            </p>
          </section>
        )}
      </div>
    </>
  )
}

export function CashflowDailyDetailScreen({ date, client }: CashflowDailyDetailScreenProps) {
  const query = useForecastDailyDetailQuery(
    DEMO_BUSINESS_ID,
    date,
    client === undefined ? {} : { client },
  )
  const hasError = query.isError && query.data === undefined

  return (
    <MobileScreen aria-label="일자별 현금흐름 상세 화면" className="min-h-[900px]" mode="document">
      <BackLink href="/cashflow" label="현금흐름 대시보드로 돌아가기" />
      <div className="px-6 pt-[102px] pb-[62px]">
        {hasError ? (
          <section className="rounded-[10px] bg-neutral-100 px-[14px] py-5" role="alert">
            <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">
              일자별 현금흐름을 불러오지 못했습니다.
            </h1>
            <Button className="mt-5" onClick={() => void query.refetch()} variant="secondary">
              다시 시도
            </Button>
          </section>
        ) : query.data === undefined ? (
          <p role="status">일자별 현금흐름을 불러오는 중입니다.</p>
        ) : (
          <DailyDetailContent detail={query.data} />
        )}

        <Link
          className="mt-[70px] inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 typo-body-3 text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/cashflow/corrections"
        >
          보정값 추가·수정하기
        </Link>
      </div>
    </MobileScreen>
  )
}
