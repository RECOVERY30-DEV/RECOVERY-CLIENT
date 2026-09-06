import { notFound } from 'next/navigation'

import {
  SUPPORT_PROGRAMS,
  getSupportProgram,
} from '@/features/support-program/model/support-program-data'
import { SupportProgramDetailScreen } from '@/features/support-program/ui/support-program-detail-screen'

type SupportProgramDetailPageProps = Readonly<{
  params: Promise<{ programId: string }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return SUPPORT_PROGRAMS.map(({ id }) => ({ programId: id }))
}

export default async function SupportProgramDetailPage({
  params,
}: SupportProgramDetailPageProps): Promise<React.JSX.Element> {
  const { programId } = await params

  if (!getSupportProgram(programId)) {
    notFound()
  }

  return <SupportProgramDetailScreen programId={programId} />
}
