import { normalizeRecoveryOptionIds } from '@/features/recovery/model/recovery-plan-data'
import { RecoveryFollowUpScreen } from '@/features/recovery/ui/recovery-follow-up-screen'

type RecoveryFollowUpPageProps = Readonly<{
  searchParams: Promise<Readonly<{ plans?: string | readonly string[] }>>
}>

export default async function RecoveryFollowUpPage({
  searchParams,
}: RecoveryFollowUpPageProps): Promise<React.JSX.Element> {
  const { plans } = await searchParams

  return <RecoveryFollowUpScreen selectedOptionIds={normalizeRecoveryOptionIds(plans)} />
}
