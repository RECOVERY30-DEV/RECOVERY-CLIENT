import { notFound } from 'next/navigation'

import { ConsultationCompleteScreen } from '@/features/consultation/ui/consultation-complete-screen'

type ConsultationCompletePageProps = Readonly<{
  params: Promise<Readonly<{ consultationId: string }>>
}>

export default async function ConsultationCompletePage({
  params,
}: ConsultationCompletePageProps): Promise<React.JSX.Element> {
  const { consultationId: rawConsultationId } = await params
  const consultationId = Number(rawConsultationId)

  if (
    !Number.isSafeInteger(consultationId) ||
    consultationId <= 0 ||
    String(consultationId) !== rawConsultationId
  ) {
    notFound()
  }

  return <ConsultationCompleteScreen consultationId={consultationId} />
}
