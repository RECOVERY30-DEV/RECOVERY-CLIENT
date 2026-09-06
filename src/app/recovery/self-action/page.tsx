import { normalizeSelfActionOptionId } from '@/features/recovery/model/recovery-execution-data'
import { SelfActionSetupScreen } from '@/features/recovery/ui/self-action-setup-screen'

type SelfActionPageProps = Readonly<{
  searchParams: Promise<Readonly<{ plan?: string | readonly string[] }>>
}>

export default async function SelfActionPage({
  searchParams,
}: SelfActionPageProps): Promise<React.JSX.Element> {
  const { plan } = await searchParams

  return <SelfActionSetupScreen optionId={normalizeSelfActionOptionId(plan)} />
}
