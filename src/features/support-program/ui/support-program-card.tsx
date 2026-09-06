import Link from 'next/link'

import {
  formatSupportProgramDeadline,
  getSupportProgramApplicationLabel,
  type SupportProgram,
} from '../model/support-program-data'
import { SupportProgramMatchStatus } from './support-program-match-status'

type SupportProgramCardProps = Readonly<{
  program: SupportProgram
}>

export function SupportProgramCard({ program }: SupportProgramCardProps): React.JSX.Element {
  return (
    <article className="rounded-[10px] bg-neutral-100 p-[14px]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="typo-sub-header-2 text-neutral-900">{program.title}</h2>
        <SupportProgramMatchStatus status={program.matchStatus} />
      </div>
      <div className="mt-[15px] border-b border-disabled-50 pb-[10px] typo-body-5 text-primary-100">
        <p>{program.institution}</p>
        <p className="mt-1">{program.supportSummary}</p>
        <p className="mt-[10px] typo-caption-1 text-primary-blue-800">
          {getSupportProgramApplicationLabel(program.applicationDeadline)} · 신청기한{' '}
          {formatSupportProgramDeadline(program.applicationDeadline)}
        </p>
      </div>
      <div className="mt-[14px]">
        <p className="typo-caption-1 text-secondary-500">추천 근거</p>
        <p className="mt-1 typo-body-5 text-primary-100">{program.matchReason}</p>
      </div>
      <Link
        aria-label={`${program.title} 상세 확인`}
        className="mt-[14px] inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-neutral-400 px-[22px] py-2 typo-body-3 text-primary-blue-800 transition-colors hover:text-primary-blue-800 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
        href={`/recovery/support-programs/${program.id}`}
      >
        상세 확인
      </Link>
    </article>
  )
}
