import { SupportProgramDetailScreen } from '@/features/support-program/ui/support-program-detail-screen'

type SupportProgramDetailPageProps = Readonly<{
  params: Promise<{ programId: string }>
}>

export default async function SupportProgramDetailPage({
  params,
}: SupportProgramDetailPageProps): Promise<React.JSX.Element> {
  const { programId } = await params

  return <SupportProgramDetailScreen programCode={programId} />
}
