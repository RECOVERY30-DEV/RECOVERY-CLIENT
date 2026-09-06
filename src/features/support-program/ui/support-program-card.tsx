import Link from 'next/link'

import type { SupportProgramSummary } from '../api/support-program-contract'
import {
  formatSupportProgramDeadline,
  getSupportProgramApplicationLabel,
} from '../model/support-program-data'
import { SupportProgramMatchStatus } from './support-program-match-status'

type SupportProgramCardProps = Readonly<{
  program: SupportProgramSummary
  matchReason: string
  matchStatus: '추천됨' | '추천 정보 없음'
}>

export function SupportProgramCard({
  program,
  matchReason,
  matchStatus,
}: SupportProgramCardProps): React.JSX.Element {
  const deadline = program.applyDeadline

  return (
    <article className="rounded-[10px] bg-neutral-100 p-[14px]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="typo-sub-header-2 text-neutral-900">{program.name}</h2>
        <SupportProgramMatchStatus status={matchStatus} />
      </div>
      <div className="mt-[15px] border-b border-disabled-50 pb-[10px] typo-body-5 text-primary-100">
        <p>{program.agency}</p>
        <p className="mt-1">
          {program.supportContent}
          {program.limitAmount === null
            ? ''
            : ` · 최대 ${program.limitAmount.toLocaleString('ko-KR')}원`}
          {program.interestRateText === null ? '' : ` / ${program.interestRateText}`}
        </p>
        <p className="mt-[10px] typo-caption-1 text-primary-blue-800">
          {getSupportProgramApplicationLabel(program.status)} · 신청기한{' '}
          {formatSupportProgramDeadline(deadline)}
        </p>
      </div>
      <div className="mt-[14px]">
        <p className="typo-caption-1 text-secondary-500">추천 근거</p>
        <p className="mt-1 typo-body-5 text-primary-100">{matchReason}</p>
      </div>
      <Link
        aria-label={`${program.name} 상세 확인`}
        className="mt-[14px] inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-neutral-400 px-[22px] py-2 typo-body-3 text-primary-blue-800 transition-colors hover:text-primary-blue-800 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
        href={`/recovery/support-programs/${program.programCode}`}
      >
        상세 확인
      </Link>
    </article>
  )
}
