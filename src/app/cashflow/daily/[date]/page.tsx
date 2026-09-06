import { CashflowDailyDetailScreen } from '@/features/cashflow/ui/cashflow-daily-detail-screen'

type CashflowDailyDetailPageProps = Readonly<{
  params: Promise<{ date: string }>
}>

export default async function CashflowDailyDetailPage({ params }: CashflowDailyDetailPageProps) {
  const { date } = await params

  return <CashflowDailyDetailScreen date={date} />
}
