import Link from 'next/link'

import { BackLink, Button, MobileScreen } from '@/shared/ui'

import { getSupportProgram } from '../model/support-program-data'

type SupportProgramDetailScreenProps = Readonly<{
  programId: string
}>

export function SupportProgramDetailScreen({
  programId,
}: SupportProgramDetailScreenProps): React.JSX.Element {
  const program = getSupportProgram(programId)

  if (!program) {
    throw new Error(`Unknown support program: ${programId}`)
  }

  return (
    <MobileScreen aria-label="지원사업 상세 화면" className="min-h-[1260px]" mode="document">
      <BackLink href="/recovery/support-programs" label="지원사업 목록으로 돌아가기" />
      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <div className="flex items-start justify-between gap-3">
            <h1 className="typo-sub-header-2 text-primary-200">{program.title}</h1>
            <span className="shrink-0 rounded-full bg-primary-blue-100 px-3 py-[6px] typo-body-8 text-primary-blue-900">
              {program.matchStatus}
            </span>
          </div>
          <p className="mt-[6px] typo-body-6 text-secondary-300">
            신청 마감 {program.applicationDeadline}
          </p>
        </header>

        <section aria-labelledby="support-overview-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="support-overview-title">
            지원 개요
          </h2>
          <dl className="mt-3 divide-y divide-disabled-50 rounded-[10px] bg-neutral-100 px-[14px]">
            <OverviewItem label="지원 기관" value={program.institution} />
            <OverviewItem label="지원 내용" value={program.description} />
            <OverviewItem label="금리" value={program.interestRate} />
            <OverviewItem label="지원 기간" value={program.repaymentPeriod} />
            <OverviewItem label="신청 기한" value={`${program.applicationDeadline}까지`} />
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
            {program.eligibilityRequirements.map((requirement) => (
              <li
                className="rounded-[10px] border border-disabled-50 p-[14px]"
                key={requirement.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="typo-body-5 text-primary-100">{requirement.label}</p>
                  <span
                    className={`shrink-0 typo-caption-1 ${
                      requirement.status === '충족 가능'
                        ? 'text-primary-blue-800'
                        : 'text-warning-500'
                    }`}
                  >
                    {requirement.status}
                  </span>
                </div>
                <p className="mt-1 typo-caption-3 text-secondary-300">{requirement.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="support-documents-title" className="mt-5">
          <h2 className="typo-sub-header-2 text-primary-200" id="support-documents-title">
            필요서류
          </h2>
          <ul className="mt-3 space-y-2">
            {program.requiredDocuments.map((document) => (
              <li
                className="flex items-center justify-between gap-3 rounded-[10px] bg-neutral-100 p-[14px]"
                key={document.label}
              >
                <span className="typo-body-5 text-primary-100">{document.label}</span>
                <span className="shrink-0 typo-caption-3 text-secondary-300">
                  {document.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="support-source-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2 className="typo-sub-header-2 text-primary-200" id="support-source-title">
            공식 출처 및 신청
          </h2>
          <p className="mt-3 typo-body-5 text-primary-100">{program.officialAnnouncement}</p>
          <p className="mt-1 typo-caption-3 text-secondary-300">
            공식 URL이 확인되지 않아 바로가기를 제공하지 않습니다.
          </p>
          <p className="mt-1 typo-caption-3 text-secondary-300">
            공식 출처에서 최신 조건을 반드시 확인하세요.
          </p>
          <Button className="mt-3 w-full" disabled variant="outline">
            공식 공고 확인하기
          </Button>
        </section>

        <Link
          className="mt-5 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 typo-body-3 text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          href={`/recovery/consultation?program=${program.id}`}
        >
          상담 예약하기
        </Link>
      </div>
    </MobileScreen>
  )
}

function OverviewItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="py-3">
      <dt className="typo-caption-1 text-secondary-300">{label}</dt>
      <dd className="mt-1 typo-body-5 text-primary-100">{value}</dd>
    </div>
  )
}
