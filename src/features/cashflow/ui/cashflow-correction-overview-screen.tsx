'use client'

import Link from 'next/link'
import type { KyInstance } from 'ky'
import { useState } from 'react'

import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

import type { Adjustment, AdjustmentSuggestion } from '../api/adjustment-contract'
import {
  useAcceptAdjustmentSuggestionMutation,
  useAdjustmentQueries,
  useApplyAdjustmentsMutation,
  useDeleteAdjustmentMutation,
  useUpdateAdjustmentMutation,
} from '../queries/adjustment-queries'

const TYPE_LABELS = {
  CASH_SALES: '현금매출',
  EXTERNAL_FUNDS: '타행·외부자금',
  EXPECTED_INCOME: '예정수입',
  EXPECTED_EXPENSE: '예정지출',
} as const

const TYPE_HREFS = {
  CASH_SALES: '/cashflow/corrections/cash-sales/new',
  EXTERNAL_FUNDS: '/cashflow/corrections/external-funds/new',
  EXPECTED_INCOME: '/cashflow/corrections/expected-income/new',
  EXPECTED_EXPENSE: '/cashflow/corrections/expected-expenses/new',
} as const

function formatAmount(adjustment: Adjustment) {
  const sign = adjustment.adjustmentType === 'EXPECTED_EXPENSE' ? '-' : '+'
  return `${sign}${adjustment.amount.toLocaleString('ko-KR')}원`
}

function adjustmentTitle(adjustment: Adjustment) {
  return `${adjustment.memo ?? TYPE_LABELS[adjustment.adjustmentType]} ${formatAmount(adjustment)}`
}

function AdjustmentItem({
  client,
  adjustment,
}: Readonly<{ client?: KyInstance; adjustment: Adjustment }>) {
  const options = client === undefined ? {} : { client }
  const update = useUpdateAdjustmentMutation(DEMO_BUSINESS_ID, options)
  const remove = useDeleteAdjustmentMutation(DEMO_BUSINESS_ID, options)
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(String(adjustment.amount))
  const title = adjustmentTitle(adjustment)

  function save(): void {
    const nextAmount = Number(amount)
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) return
    update.mutate(
      { adjustmentId: adjustment.adjustmentId, command: { amount: nextAmount } },
      { onSuccess: () => setEditing(false) },
    )
  }

  return (
    <li className="rounded-[10px] bg-neutral-100 px-[14px] py-4">
      <p className="font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-[12px] text-secondary-300">
        {adjustment.expectedDate} · {adjustment.status}
      </p>
      {editing ? (
        <div className="mt-3 flex gap-2">
          <input
            aria-label={`${title} 금액`}
            className="w-32 rounded border px-2"
            inputMode="numeric"
            onChange={(event) => setAmount(event.target.value)}
            value={amount}
          />
          <Button disabled={update.isPending} onClick={save} size="sm" variant="secondary">
            저장
          </Button>
        </div>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Button
          disabled={update.isPending || remove.isPending}
          onClick={() => setEditing(true)}
          size="sm"
          variant="outline"
        >
          수정
        </Button>
        <Button
          aria-label={`${title} 삭제`}
          disabled={update.isPending || remove.isPending}
          onClick={() => remove.mutate(adjustment.adjustmentId)}
          size="sm"
          variant="outline"
        >
          삭제
        </Button>
      </div>
      {update.isError || remove.isError ? (
        <p className="text-alert mt-2 text-[12px]" role="alert">
          보정값을 변경하지 못했습니다. 다시 시도해 주세요.
        </p>
      ) : null}
    </li>
  )
}

function SuggestionItem({
  client,
  suggestion,
}: Readonly<{ client?: KyInstance; suggestion: AdjustmentSuggestion }>) {
  const accept = useAcceptAdjustmentSuggestionMutation(
    DEMO_BUSINESS_ID,
    client === undefined ? {} : { client },
  )
  const title = suggestion.title ?? `${TYPE_LABELS[suggestion.adjustmentType]} 반복 패턴`

  return (
    <li className="border-t border-disabled-50 pt-4 first:border-t-0 first:pt-0">
      <p className="text-[12px] leading-[15px] font-medium text-primary-100">{title}</p>
      <p className="mt-1 text-[12px] leading-[15px] text-secondary-300">
        {suggestion.expectedDate} · {suggestion.amount.toLocaleString('ko-KR')}원
      </p>
      {suggestion.status === 'PROPOSED' ? (
        <Button
          aria-label={`${title} 수락`}
          className="mt-3"
          disabled={accept.isPending}
          onClick={() => accept.mutate(suggestion.suggestionId)}
          size="sm"
          variant="secondary"
        >
          {accept.isPending ? '수락 중' : '수락'}
        </Button>
      ) : (
        <p className="mt-3 text-[12px] font-semibold text-secondary-500">{suggestion.status}</p>
      )}
      {accept.isError ? (
        <p className="text-alert mt-2 text-[12px]" role="alert">
          후보를 수락하지 못했습니다. 다시 시도해 주세요.
        </p>
      ) : null}
    </li>
  )
}

type CashflowCorrectionOverviewScreenProps = Readonly<{ client?: KyInstance }>

export function CashflowCorrectionOverviewScreen({
  client,
}: CashflowCorrectionOverviewScreenProps): React.JSX.Element {
  const options = client === undefined ? {} : { client }
  const { adjustments, suggestions } = useAdjustmentQueries(DEMO_BUSINESS_ID, options)
  const apply = useApplyAdjustmentsMutation(DEMO_BUSINESS_ID, options)

  return (
    <MobileScreen
      aria-label="현금흐름 정보 보정 허브 화면"
      className="min-h-[1300px]"
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

        <section aria-labelledby="cashflow-correction-items-title" className="mt-8">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="cashflow-correction-items-title"
          >
            저장된 보정값
          </h2>
          {adjustments.isLoading ? (
            <p className="mt-4 text-secondary-300">보정값을 불러오는 중입니다.</p>
          ) : null}
          {adjustments.isError ? (
            <div className="mt-4" role="alert">
              <p className="text-alert">보정값을 불러오지 못했습니다. 다시 시도해 주세요.</p>
              <Button
                className="mt-2"
                onClick={() => void adjustments.refetch()}
                size="sm"
                variant="outline"
              >
                보정값 다시 불러오기
              </Button>
            </div>
          ) : null}
          {adjustments.data?.length === 0 ? (
            <p className="mt-4 text-secondary-300">저장된 보정값이 없습니다.</p>
          ) : null}
          <ul className="mt-5 flex flex-col gap-3">
            {adjustments.data?.map((adjustment) => (
              <AdjustmentItem
                adjustment={adjustment}
                client={client}
                key={adjustment.adjustmentId}
              />
            ))}
          </ul>
        </section>

        <section aria-labelledby="cashflow-correction-input-title" className="mt-5">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="cashflow-correction-input-title"
          >
            보정값 추가
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <Link
                className="rounded-[10px] bg-neutral-100 px-3 py-4 text-sm font-semibold text-primary-200"
                href={TYPE_HREFS[type as keyof typeof TYPE_HREFS]}
                key={type}
              >
                {label} 입력
              </Link>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="cashflow-repeat-pattern-title"
          className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-5"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-neutral-900"
            id="cashflow-repeat-pattern-title"
          >
            반복 패턴 후보
          </h2>
          <p className="mt-2 text-[12px] leading-[15px] text-secondary-300">
            자동으로 찾은 패턴이에요. 실제와 같은지 확인해 주세요.
          </p>
          {suggestions.isLoading ? (
            <p className="mt-4 text-secondary-300">후보를 불러오는 중입니다.</p>
          ) : null}
          {suggestions.isError ? (
            <div className="mt-4" role="alert">
              <p className="text-alert">후보를 불러오지 못했습니다. 다시 시도해 주세요.</p>
              <Button
                className="mt-2"
                onClick={() => void suggestions.refetch()}
                size="sm"
                variant="outline"
              >
                후보 다시 불러오기
              </Button>
            </div>
          ) : null}
          <ul className="mt-5 flex flex-col gap-4">
            {suggestions.data?.map((suggestion) => (
              <SuggestionItem
                client={client}
                key={suggestion.suggestionId}
                suggestion={suggestion}
              />
            ))}
          </ul>
        </section>

        {apply.isSuccess ? (
          <p
            className="mt-5 rounded-[10px] bg-neutral-100 p-[14px] text-[13px] text-primary-200"
            role="status"
          >
            보정값 {apply.data.appliedCount}건 적용 요청을 완료했습니다. (실행{' '}
            {apply.data.appliedRunId})
          </p>
        ) : null}
        {apply.isError ? (
          <p className="text-alert mt-5" role="alert">
            재계산 요청에 실패했습니다. 다시 시도해 주세요.
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={apply.isPending || adjustments.isLoading}
            onClick={() => apply.mutate()}
          >
            {apply.isPending ? '재계산 요청 중' : '재계산 실행'}
          </Button>
          <Link
            className="inline-flex h-[42px] items-center justify-center rounded-[8px] border border-primary-blue-900 px-[22px] py-[8px] text-[16px] leading-6 font-medium text-primary-blue-900"
            href="/cashflow/pending"
          >
            보정 중단
          </Link>
        </div>
      </div>
    </MobileScreen>
  )
}
