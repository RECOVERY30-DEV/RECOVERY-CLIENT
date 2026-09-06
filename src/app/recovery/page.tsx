import { normalizeRecoveryOptionIds } from '@/features/recovery/model/recovery-plan-data'
import { RecoveryPacketScreen } from '@/features/recovery/ui/recovery-packet-screen'

type RecoveryPacketPageProps = Readonly<{
  searchParams: Promise<Readonly<{ plans?: string | readonly string[] }>>
}>

export default async function RecoveryPacketPage({
  searchParams,
}: RecoveryPacketPageProps): Promise<React.JSX.Element> {
  const { plans } = await searchParams

  return <RecoveryPacketScreen selectedOptionIds={normalizeRecoveryOptionIds(plans)} />
}
