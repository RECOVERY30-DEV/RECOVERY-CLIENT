import { ConsultationReservationScreen } from '@/features/recovery/ui/consultation-reservation-screen'
import { getSupportProgramConsultationContext } from '@/features/support-program'

type ConsultationPageProps = Readonly<{
  searchParams: Promise<
    Readonly<{
      plans?: string | readonly string[]
      program?: string | readonly string[]
      source?: string | readonly string[]
    }>
  >
}>

export default async function ConsultationPage({
  searchParams,
}: ConsultationPageProps): Promise<React.JSX.Element> {
  const { plans, program, source } = await searchParams
  const supportProgram = getSupportProgramConsultationContext(getSingleSearchParam(program))
  const isSupportProgramConsultation =
    Boolean(supportProgram) || getSingleSearchParam(source) === 'support-programs'
  const selectedOptionIds = isSupportProgramConsultation ? [] : getSelectedRecoveryOptionIds(plans)
  const backHref = supportProgram
    ? `/recovery/support-programs/${supportProgram.id}`
    : isSupportProgramConsultation
      ? '/recovery/support-programs'
      : '/recovery/compare'
  const backLabel = supportProgram
    ? '지원사업 상세로 돌아가기'
    : isSupportProgramConsultation
      ? '지원사업 목록으로 돌아가기'
      : '회복안 비교로 돌아가기'

  return (
    <ConsultationReservationScreen
      backHref={backHref}
      backLabel={backLabel}
      isSupportProgramConsultation={isSupportProgramConsultation}
      selectedOptionIds={selectedOptionIds}
      supportProgram={supportProgram}
    />
  )
}

function getSelectedRecoveryOptionIds(
  plans: string | readonly string[] | undefined,
): readonly number[] {
  const planValues = typeof plans === 'string' ? [plans] : (plans ?? [])
  const selectedIds: number[] = []

  for (const plan of planValues) {
    const optionId = Number(plan)

    if (
      Number.isSafeInteger(optionId) &&
      optionId > 0 &&
      String(optionId) === plan &&
      !selectedIds.includes(optionId)
    ) {
      selectedIds.push(optionId)
    }

    if (selectedIds.length === 2) {
      break
    }
  }

  return selectedIds
}

function getSingleSearchParam(value: string | readonly string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined
}
