import { notFound } from 'next/navigation'

import { getCashflowDailyDetail } from '@/features/cashflow/model/cashflow-daily-detail-data'
import { DAILY_CASHFLOW_ITEMS } from '@/features/cashflow/model/cashflow-dashboard-data'
import { CashflowDailyDetailScreen } from '@/features/cashflow/ui/cashflow-daily-detail-screen'

type CashflowDailyDetailPageProps = Readonly<{
  params: Promise<{ date: string }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return DAILY_CASHFLOW_ITEMS.map(({ id }) => ({ date: id }))
}

export default async function CashflowDailyDetailPage({ params }: CashflowDailyDetailPageProps) {
  const { date } = await params

  if (!getCashflowDailyDetail(date)) {
    notFound()
  }

  return <CashflowDailyDetailScreen date={date} />
}
