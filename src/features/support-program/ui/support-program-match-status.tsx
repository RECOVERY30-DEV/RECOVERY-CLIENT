import type { SupportProgramMatchStatus } from '../model/support-program-data'

export const SUPPORT_PROGRAM_MATCH_STATUS_CLASS_NAMES: Readonly<
  Record<SupportProgramMatchStatus, string>
> = {
  '매칭 가능성 높음': 'bg-primary-blue-100 text-primary-blue-800',
  '조건 확인 필요': 'bg-neutral-300 text-secondary-500',
}

type SupportProgramMatchStatusProps = Readonly<{
  status: SupportProgramMatchStatus
}>

export function SupportProgramMatchStatus({
  status,
}: SupportProgramMatchStatusProps): React.JSX.Element {
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-[6px] typo-body-8 ${SUPPORT_PROGRAM_MATCH_STATUS_CLASS_NAMES[status]}`}
      data-testid="support-program-match-status"
    >
      {status}
    </span>
  )
}
