import { normalizeSelfActionOptionId } from '@/features/recovery/model/recovery-execution-data'
import { SelfActionSetupScreen } from '@/features/recovery/ui/self-action-setup-screen'

type SelfActionSavePageProps = Readonly<{
  searchParams: Promise<Readonly<{ plan?: string | readonly string[] }>>
}>

export default async function SelfActionSavePage({
  searchParams,
}: SelfActionSavePageProps): Promise<React.JSX.Element> {
  const { plan } = await searchParams

  return <SelfActionSetupScreen optionId={normalizeSelfActionOptionId(plan)} />
}
