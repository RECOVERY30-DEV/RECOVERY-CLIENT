'use client'

import Link from 'next/link'

import { useForecastSummaryQueries } from '@/features/forecast'
import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, Button, Checkbox, MobileScreen } from '@/shared/ui'

import type { SelfActionItem, SelfActionPlan } from '../self-action/api/self-action-contract'
import {
  useCreateSelfActionPlanMutation,
  useSelfActionSetupQueries,
  useUpdateSelfActionItemMutation,
} from '../self-action/queries/self-action-queries'
import {
  getRecoveryPacketHref,
  SELF_ACTION_EFFECT,
  SELF_ACTION_OPTION_ID,
  SELF_ACTION_PLAN,
  SELF_ACTION_PREPARATION_ITEMS,
} from '../model/recovery-execution-data'

type SelfActionSetupScreenProps = Readonly<{ optionId?: typeof SELF_ACTION_OPTION_ID }>

export function SelfActionSetupScreen({
  optionId = SELF_ACTION_OPTION_ID,
}: SelfActionSetupScreenProps): React.JSX.Element {
  const forecastQueries = useForecastSummaryQueries(DEMO_BUSINESS_ID)
  const forecastRunId = forecastQueries.latest.data?.forecastRunId
  const { plans, recoveryOptions } = useSelfActionSetupQueries(forecastRunId)
  const createPlan = useCreateSelfActionPlanMutation(forecastRunId ?? 0)
  const updateItem = useUpdateSelfActionItemMutation(forecastRunId ?? 0)
  const activePlan = plans.data?.find((plan) => plan.status === 'ACTIVE') ?? plans.data?.[0]
  const selfActionOption = recoveryOptions.data?.find((option) => option.category === 'SELF_ACTION')
  const failedQueries = [forecastQueries.latest, plans, recoveryOptions].filter(
    (query) => query.isError,
  )
  const isLoading =
    forecastRunId === undefined || plans.data === undefined || recoveryOptions.data === undefined

  function retryFailedQueries() {
    failedQueries.forEach((query) => void query.refetch())
  }

  function createPlanFromCurrentOption() {
    if (selfActionOption === undefined || createPlan.isPending) return
    createPlan.mutate({
      recoveryOptionId: selfActionOption.optionId,
      expectedEffectText: selfActionOption.expectedEffectText,
      items: SELF_ACTION_PREPARATION_ITEMS.map((item) => ({ title: item.title })),
    })
  }

  function updatePreparationItem(item: SelfActionItem) {
    if (forecastRunId === undefined || updateItem.isPending) return
    updateItem.mutate({
      itemId: item.id,
      input: { status: item.status === 'DONE' ? 'PENDING' : 'DONE' },
    })
  }

  return (
    <MobileScreen aria-label="자체 실행 저장 화면" className="min-h-[1093px]" mode="document">
      <BackLink href="/recovery/compare" label="회복안 비교로 돌아가기" />

      <div className="px-6 pt-[103px] pb-12">
        <header>
          <h1 className="typo-sub-header-2 text-primary-200">자체 실행 저장</h1>
          <p className="mt-1 typo-body-7 text-secondary-300">
            선택한 회복안을 실행 계획으로 저장하고 준비 상태를 관리합니다.
          </p>
        </header>

        {failedQueries.length > 0 ? (
          <RequestError onRetry={retryFailedQueries} />
        ) : isLoading ? (
          <p className="mt-5 rounded-[10px] bg-neutral-100 p-[14px] typo-body-7 text-secondary-300">
            자체 실행 계획을 불러오는 중입니다.
          </p>
        ) : activePlan === undefined ? (
          <EmptyPlan
            isCreating={createPlan.isPending}
            isUnavailable={selfActionOption === undefined}
            onCreate={createPlanFromCurrentOption}
          />
        ) : (
          <PlanContent
            isUpdating={updateItem.isPending}
            onItemChange={updatePreparationItem}
            optionId={optionId}
            plan={activePlan}
          />
        )}

        {createPlan.isError ? (
          <MutationError
            action="실행 계획을 저장하지 못했습니다."
            onRetry={createPlanFromCurrentOption}
          />
        ) : null}
        {updateItem.isError ? (
          <MutationError
            action="준비 항목 상태를 저장하지 못했습니다."
            onRetry={() => {
              if (updateItem.variables !== undefined) updateItem.mutate(updateItem.variables)
            }}
          />
        ) : null}
      </div>
    </MobileScreen>
  )
}

function EmptyPlan({
  isCreating,
  isUnavailable,
  onCreate,
}: Readonly<{ isCreating: boolean; isUnavailable: boolean; onCreate: () => void }>) {
  return (
    <section
      aria-labelledby="empty-self-action-title"
      className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
    >
      <h2 className="typo-sub-header-2 text-primary-100" id="empty-self-action-title">
        저장된 자체 실행 계획이 없습니다.
      </h2>
      <p className="mt-2 typo-caption-3 text-secondary-300">
        납부일 조정 회복안을 계획으로 저장하면 준비 항목을 관리할 수 있습니다.
      </p>
      <Button className="mt-5 w-full" disabled={isCreating || isUnavailable} onClick={onCreate}>
        {isCreating ? '저장 중…' : '실행 계획 저장하기'}
      </Button>
    </section>
  )
}

function PlanContent({
  isUpdating,
  onItemChange,
  optionId,
  plan,
}: Readonly<{
  isUpdating: boolean
  onItemChange: (item: SelfActionItem) => void
  optionId: typeof SELF_ACTION_OPTION_ID
  plan: SelfActionPlan
}>) {
  const allDone = plan.items.length > 0 && plan.items.every((item) => item.status === 'DONE')

  return (
    <>
      <section
        aria-labelledby="selected-self-action-title"
        className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
      >
        <p className="typo-caption-3 text-secondary-300">선택한 회복안</p>
        <h2 className="mt-1 typo-sub-header-2 text-primary-100" id="selected-self-action-title">
          {SELF_ACTION_PLAN.title}
        </h2>
        <p className="mt-3 typo-caption-3 text-secondary-300">
          예상 효과: {plan.expectedEffectText ?? SELF_ACTION_EFFECT.summary}
        </p>
        <p className="mt-2 typo-caption-3 text-secondary-300">
          계획 상태: {plan.status === 'ACTIVE' ? '진행 중' : '보관됨'}
        </p>
      </section>

      <section aria-labelledby="self-action-preparation-title" className="mt-8">
        <h2 className="typo-sub-header-2 text-primary-200" id="self-action-preparation-title">
          자체 실행 준비 항목
        </h2>
        <div className="mt-3 space-y-2 rounded-[10px] bg-neutral-100 p-[14px]">
          {plan.items.length === 0 ? (
            <p className="typo-caption-3 text-secondary-300">등록된 준비 항목이 없습니다.</p>
          ) : (
            plan.items.map((item) => (
              <div key={item.id}>
                <Checkbox
                  checked={item.status === 'DONE'}
                  className="bg-neutral-400"
                  description={item.targetDate === null ? undefined : `예정일 ${item.targetDate}`}
                  disabled={isUpdating || plan.status !== 'ACTIVE'}
                  id={`self-action-item-${item.id}`}
                  label={item.title}
                  onChange={() => onItemChange(item)}
                />
                {item.memo === null ? null : (
                  <p className="mt-1 ml-8 typo-caption-3 text-secondary-300">메모: {item.memo}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="self-action-next-title" className="mt-8">
        <h2 className="typo-sub-header-2 text-primary-200" id="self-action-next-title">
          다음 행동 안내
        </h2>
        <div className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] typo-body-7 text-secondary-300">
          <p>준비 항목을 완료하면 Recovery Packet에서 실행 계획 전체를 볼 수 있습니다.</p>
          <p className="mt-2">
            현재 완료 항목: {plan.items.filter((item) => item.status === 'DONE').length}개
          </p>
        </div>
      </section>

      <Link
        aria-disabled={!allDone}
        className="mt-[76px] inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-neutral-400 px-[22px] py-2 typo-body-3 text-primary-blue-900 transition-colors hover:text-primary-blue-700 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none aria-disabled:pointer-events-none aria-disabled:text-disabled-200"
        href={getRecoveryPacketHref([optionId])}
      >
        Recovery Packet 확인하기
      </Link>
    </>
  )
}

function RequestError({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <section
      className="border-error-200 bg-error-50 mt-5 rounded-[10px] border p-[14px]"
      role="alert"
    >
      <p className="text-error-600 typo-body-7">자체 실행 계획을 불러오지 못했습니다.</p>
      <Button className="mt-3" onClick={onRetry} size="sm" variant="outline">
        다시 시도
      </Button>
    </section>
  )
}

function MutationError({ action, onRetry }: Readonly<{ action: string; onRetry: () => void }>) {
  return (
    <section
      className="border-error-200 bg-error-50 mt-3 rounded-[10px] border p-[14px]"
      role="alert"
    >
      <p className="text-error-600 typo-caption-3">{action}</p>
      <Button className="mt-3" onClick={onRetry} size="sm" variant="outline">
        다시 시도
      </Button>
    </section>
  )
}
