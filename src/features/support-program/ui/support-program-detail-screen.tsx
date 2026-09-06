import Link from 'next/link'
import type { KyInstance } from 'ky'

import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, MobileScreen } from '@/shared/ui'

import {
  formatSupportProgramDeadline,
  getSupportProgramApplicationLabel,
} from '../model/support-program-data'
import { useSupportProgramDetailQueries } from '../queries/support-program-queries'

type SupportProgramDetailScreenProps = Readonly<{
  client?: KyInstance
  programCode: string
}>

export function SupportProgramDetailScreen({
  client,
  programCode,
}: SupportProgramDetailScreenProps): React.JSX.Element {
  const queries = useSupportProgramDetailQueries(
    DEMO_BUSINESS_ID,
    programCode,
    client === undefined ? {} : { client },
  )
  const queryResults = [queries.program, queries.documents, queries.eligibility]

  if (queryResults.some((query) => query.isError)) {
    return (
      <SupportProgramDetailErrorScreen
        onRetry={() => queryResults.forEach((query) => void query.refetch())}
      />
    )
  }

  if (
    queries.program.data === undefined ||
    queries.documents.data === undefined ||
    queries.eligibility.data === undefined
  ) {
    return <SupportProgramDetailLoadingScreen />
  }

  const program = queries.program.data
  const eligibility = queries.eligibility.data
  const documents = queries.documents.data

  return (
    <MobileScreen aria-label="지원사업 상세 화면" className="min-h-[1260px]" mode="document">
      <BackLink href="/recovery/support-programs" label="지원사업 목록으로 돌아가기" />
      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <div className="flex items-start justify-between gap-3">
            <h1 className="typo-sub-header-2 text-primary-200">{program.name}</h1>
          </div>
          <p className="mt-[6px] typo-body-6 text-secondary-300">
            {getSupportProgramApplicationLabel(program.status)} · 신청 기한{' '}
            {formatSupportProgramDeadline(program.applyDeadline)}
          </p>
        </header>

        <section aria-labelledby="support-overview-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="support-overview-title">
            지원 개요
          </h2>
          <dl className="mt-3 divide-y divide-disabled-50 rounded-[10px] bg-neutral-100 px-[14px]">
            <OverviewItem label="지원 기관" value={program.agency} />
            <OverviewItem label="지원 내용" value={program.supportContent} />
            <OverviewItem label="금리" value={program.interestRateText} />
            <OverviewItem label="지원 기간" value={program.termText} />
            <OverviewItem
              label="신청 기한"
              value={`${formatSupportProgramDeadline(program.applyDeadline)}까지`}
            />
          </dl>
        </section>

        <section aria-labelledby="support-eligibility-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="support-eligibility-title">
            자격요건 확인
          </h2>
          <p className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] typo-body-6 text-secondary-300">
            <strong className="font-semibold text-primary-100">자동 자격판정이 아님</strong>
            <br />
            예측 데이터 기반 추정이며, 최종 자격은 공식 공고와 상담을 통해 확인해야 합니다.
          </p>
          <ul className="mt-3 space-y-2">
            {eligibility.items.length > 0 ? (
              eligibility.items.map((requirement) => (
                <li
                  className="rounded-[10px] border border-disabled-50 p-[14px]"
                  key={requirement.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="typo-body-5 text-primary-100">{requirement.label}</p>
                    <span className="shrink-0 typo-caption-1 text-secondary-500">
                      {formatEligibilityResult(requirement.result)}
                    </span>
                  </div>
                  <p className="mt-1 typo-caption-3 text-secondary-300">
                    {requirement.noteText ?? '추가 확인이 필요합니다.'}
                  </p>
                </li>
              ))
            ) : (
              <li className="rounded-[10px] border border-disabled-50 p-[14px] typo-body-5 text-secondary-300">
                자격요건 판정 정보가 없습니다.
              </li>
            )}
            <li className="typo-caption-3 text-secondary-300">
              종합 판정: {formatEligibilityResult(eligibility.result)}
              {eligibility.reasonText === null ? '' : ` · ${eligibility.reasonText}`}
            </li>
          </ul>
        </section>

        <section aria-labelledby="support-documents-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="support-documents-title">
            필요서류
          </h2>
          <ul className="mt-3 space-y-2">
            {documents.length > 0 ? (
              documents.map((document) => (
                <li
                  className="flex items-center justify-between gap-3 rounded-[10px] bg-neutral-100 p-[14px]"
                  key={document.documentId}
                >
                  <span>
                    <span className="block typo-body-5 text-primary-100">{document.name}</span>
                    {document.description === null ? null : (
                      <span className="mt-1 block typo-caption-3 text-secondary-300">
                        {document.description}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 typo-caption-3 text-secondary-500">
                    {document.required ? '필수' : '선택'}
                  </span>
                </li>
              ))
            ) : (
              <li className="rounded-[10px] bg-neutral-100 p-[14px] typo-body-5 text-secondary-300">
                제출 서류 정보가 없습니다.
              </li>
            )}
          </ul>
        </section>

        <section
          aria-labelledby="support-source-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2 className="typo-sub-header-2 text-primary-200" id="support-source-title">
            공식 출처 및 신청
          </h2>
          <p className="mt-1 typo-caption-3 text-secondary-300">
            공식 출처에서 최신 조건을 반드시 확인하세요.
          </p>
          <a
            className="mt-3 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] border border-secondary-300 typo-body-3 text-primary-100"
            href={program.officialSourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            공식 공고 확인하기
          </a>
          <a
            className="mt-2 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-neutral-400 typo-body-3 text-primary-100"
            href={program.applyUrl}
            rel="noreferrer"
            target="_blank"
          >
            신청 페이지 바로가기
          </a>
        </section>

        <Link
          className="mt-5 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 typo-body-3 text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
          href={`/recovery/consultation?program=${program.programCode}`}
        >
          상담 예약하기
        </Link>
      </div>
    </MobileScreen>
  )
}

function SupportProgramDetailLoadingScreen(): React.JSX.Element {
  return (
    <MobileScreen aria-label="지원사업 상세 화면" className="min-h-[1260px]" mode="document">
      <p className="px-6 pt-[102px] typo-body-6 text-secondary-300">
        지원사업 상세 정보를 불러오는 중입니다.
      </p>
    </MobileScreen>
  )
}

function SupportProgramDetailErrorScreen({
  onRetry,
}: Readonly<{ onRetry: () => void }>): React.JSX.Element {
  return (
    <MobileScreen aria-label="지원사업 상세 화면" className="min-h-[1260px]" mode="document">
      <div className="px-6 pt-[102px]">
        <p className="typo-body-6 text-secondary-300">지원사업 상세 정보를 불러오지 못했습니다.</p>
        <button
          className="mt-4 h-[42px] rounded-[8px] bg-secondary-700 px-5 typo-body-3 text-base-white"
          onClick={onRetry}
          type="button"
        >
          다시 시도
        </button>
      </div>
    </MobileScreen>
  )
}

function formatEligibilityResult(result: string): string {
  const labels: Readonly<Record<string, string>> = {
    LIKELY_PASS: '충족 가능성 높음',
    NEEDS_REVIEW: '확인 필요',
    LIKELY_FAIL: '미충족 가능성 높음',
    UNKNOWN: '판단 보류',
  }

  return labels[result] ?? '확인 필요'
}

function OverviewItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="py-3">
      <dt className="typo-caption-1 text-secondary-300">{label}</dt>
      <dd className="mt-1 typo-body-5 text-primary-100">{value}</dd>
    </div>
  )
}
