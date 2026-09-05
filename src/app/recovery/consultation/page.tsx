import { normalizeRecoveryOptionIds } from '@/features/recovery/model/recovery-plan-data'
import { ConsultationReservationScreen } from '@/features/recovery/ui/consultation-reservation-screen'

type ConsultationPageProps = Readonly<{
  searchParams: Promise<Readonly<{ plans?: string | readonly string[] }>>
}>

export default async function ConsultationPage({
  searchParams,
}: ConsultationPageProps): Promise<React.JSX.Element> {
  const { plans } = await searchParams

  return <ConsultationReservationScreen selectedOptionIds={normalizeRecoveryOptionIds(plans)} />
}
