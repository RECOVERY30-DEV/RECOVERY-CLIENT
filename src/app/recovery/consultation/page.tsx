import {
  isRecoveryOptionId,
  type RecoveryOptionId,
} from '@/features/recovery/model/recovery-plan-data'
import { ConsultationReservationScreen } from '@/features/recovery/ui/consultation-reservation-screen'

type ConsultationPageProps = Readonly<{
  searchParams: Promise<Readonly<{ plans?: string | readonly string[] }>>
}>

function getSelectedOptionIds(
  plans: string | readonly string[] | undefined,
): readonly RecoveryOptionId[] {
  const planValues = Array.isArray(plans) ? plans : plans ? [plans] : []
  return planValues.filter(isRecoveryOptionId).slice(0, 2)
}

export default async function ConsultationPage({
  searchParams,
}: ConsultationPageProps): Promise<React.JSX.Element> {
  const { plans } = await searchParams

  return <ConsultationReservationScreen selectedOptionIds={getSelectedOptionIds(plans)} />
}
