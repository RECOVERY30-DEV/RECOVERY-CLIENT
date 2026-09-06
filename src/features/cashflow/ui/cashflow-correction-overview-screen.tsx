import Link from 'next/link'

import { BackLink, Button, MobileScreen } from '@/shared/ui'

import { CASHFLOW_CORRECTION_ITEMS } from '../model/cashflow-correction-data'
import { CashflowCorrectionItemCard } from './cashflow-correction-item-card'
import { CashflowRepeatPatternCandidates } from './cashflow-repeat-pattern-candidates'

export function CashflowCorrectionOverviewScreen(): React.JSX.Element {
  return (
    <MobileScreen
      aria-label="현금흐름 정보 보정 허브 화면"
      className="min-h-[1817px]"
      mode="document"
    >
      <BackLink href="/cashflow/pending" label="판단 보류 화면으로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">누락 정보 보정</h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            은행이 파악하지 못한 수입·지출을 입력하면 예측 정확도가 높아집니다.
          </p>
        </header>

        <section
          aria-labelledby="cashflow-correction-progress-title"
          className="mt-8 rounded-[10px] bg-neutral-100 px-[14px] py-5"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-neutral-900"
            id="cashflow-correction-progress-title"
          >
            보정 진행 상태
          </h2>
          <dl className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[12px] leading-[14px] font-medium text-primary-100">
                데이터 반영률
              </dt>
              <dd className="text-right text-[12px] leading-[14px] font-semibold text-primary-blue-700">
                62% · 판단보류
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[12px] leading-[14px] font-medium text-primary-100">
                마지막 재계산
              </dt>
              <dd className="text-right text-[12px] leading-[14px] font-semibold text-primary-blue-700">
                오늘 오전 9:14
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-[12px] leading-[18px] text-secondary-300">
            현금매출·외부자금 정보가 누락되어 예측 신뢰도가 낮습니다. 아래 항목을 보정하면 판단보류
            상태가 해제될 수 있습니다.
          </p>
        </section>

        <section aria-labelledby="cashflow-correction-items-title" className="mt-5">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="cashflow-correction-items-title"
          >
            보정 항목
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {CASHFLOW_CORRECTION_ITEMS.map((item) => (
              <CashflowCorrectionItemCard item={item} key={item.id} />
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="cashflow-correction-impact-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-neutral-900"
            id="cashflow-correction-impact-title"
          >
            재계산 예상 영향
          </h2>
          <dl className="mt-4 space-y-3 text-[12px] leading-[14px]">
            <ImpactItem label="데이터 반영률" value="62% → 84% (예상)" />
            <ImpactItem label="첫 부족일 변화" value="D+12 → D+18 (예상)" />
            <ImpactItem label="예상 최저잔액 변화" value="-340만 원 → -190만 원 (예상)" />
          </dl>
          <p className="mt-4 text-[11px] leading-[16px] text-secondary-300">
            재계산 전 수치이며, 실제 결과는 저장 후 달라질 수 있습니다.
          </p>
        </section>

        <div className="mt-5">
          <CashflowRepeatPatternCandidates />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button className="w-full" disabled>
            재계산 실행
          </Button>
          <Link
            className="inline-flex h-[42px] items-center justify-center rounded-[8px] border border-primary-blue-900 px-[22px] py-[8px] text-[16px] leading-6 font-medium text-primary-blue-900 transition-colors hover:border-primary-blue-700 hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/cashflow/pending"
          >
            보정 중단
          </Link>
        </div>
      </div>
    </MobileScreen>
  )
}

function ImpactItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="font-medium text-primary-100">{label}</dt>
      <dd className="text-right font-semibold text-primary-blue-700">{value}</dd>
    </div>
  )
}
