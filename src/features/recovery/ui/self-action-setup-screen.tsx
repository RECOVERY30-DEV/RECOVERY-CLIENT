'use client'

import Link from 'next/link'
import { useState } from 'react'

import {
  getRecoveryPacketHref,
  SELF_ACTION_EFFECT,
  SELF_ACTION_OPTION_ID,
  SELF_ACTION_PLAN,
  SELF_ACTION_PREPARATION_ITEMS,
} from '@/features/recovery/model/recovery-execution-data'
import { BackLink, Button, Checkbox, MobileScreen } from '@/shared/ui'

type SelfActionSetupScreenProps = Readonly<{
  optionId?: typeof SELF_ACTION_OPTION_ID
}>

export function SelfActionSetupScreen({
  optionId = SELF_ACTION_OPTION_ID,
}: SelfActionSetupScreenProps): React.JSX.Element {
  const [checkedItemIds, setCheckedItemIds] = useState<readonly string[]>(
    SELF_ACTION_PREPARATION_ITEMS.map(({ id }) => id),
  )
  const isReady = checkedItemIds.length === SELF_ACTION_PREPARATION_ITEMS.length

  function handlePreparationChange(id: string) {
    setCheckedItemIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    )
  }

  return (
    <MobileScreen aria-label="자체 실행 저장 화면" className="min-h-[1093px]" mode="document">
      <BackLink href="/recovery/compare" label="회복안 비교로 돌아가기" />

      <div className="px-6 pt-[103px] pb-12">
        <header>
          <h1 className="typo-sub-header-2 text-primary-200">자체 실행 저장</h1>
          <p className="mt-1 typo-body-7 text-secondary-300">
            선택한 회복안을 실행 계획으로 저장합니다.
          </p>
        </header>

        <section
          aria-labelledby="selected-self-action-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <p className="typo-caption-3 text-secondary-300">선택한 회복안</p>
          <h2 className="mt-1 typo-sub-header-2 text-primary-100" id="selected-self-action-title">
            {SELF_ACTION_PLAN.title}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="회복안 특징">
            <span className="rounded-full border border-disabled-50 px-3 py-1 typo-caption-3 text-secondary-300">
              납부일 조정
            </span>
            <span className="rounded-full border border-disabled-50 px-3 py-1 typo-caption-3 text-secondary-300">
              월말 집중 해소
            </span>
          </div>
          <p className="mt-3 typo-caption-3 text-secondary-300">
            예상 효과: {SELF_ACTION_EFFECT.summary}
          </p>
        </section>
        <p className="mt-[10px] typo-caption-2 text-secondary-300">
          ※ {SELF_ACTION_EFFECT.disclaimer}
        </p>

        <section
          aria-label="자체 실행 예상 효과"
          className="mt-7 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <div className="grid grid-cols-2 gap-4">
            <EffectComparison
              after={SELF_ACTION_EFFECT.firstShortageAfter}
              before={SELF_ACTION_EFFECT.firstShortageBefore}
              label="부족일까지 여유"
            />
            <EffectComparison
              after={SELF_ACTION_EFFECT.minimumBalanceAfter}
              before={SELF_ACTION_EFFECT.minimumBalanceBefore}
              label="예상 최저 잔액"
            />
          </div>
          <div className="mt-[14px] flex items-center justify-between border-t border-disabled-50 pt-[14px]">
            <span className="typo-caption-3 text-secondary-300">적용 옵션</span>
            <span className="typo-caption-3 text-secondary-300">
              선택 <strong className="font-semibold text-primary-blue-800">총 1개</strong>
            </span>
          </div>
        </section>

        <section aria-labelledby="self-action-preparation-title" className="mt-8">
          <h2 className="typo-sub-header-2 text-primary-200" id="self-action-preparation-title">
            자체 실행 준비 항목
          </h2>
          <div className="mt-3 space-y-2 rounded-[10px] bg-neutral-100 p-[14px]">
            {SELF_ACTION_PREPARATION_ITEMS.map((item) => (
              <Checkbox
                checked={checkedItemIds.includes(item.id)}
                className="bg-neutral-400"
                description={item.description}
                id={item.id}
                key={item.id}
                label={item.title}
                onChange={() => handlePreparationChange(item.id)}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="self-action-next-title" className="mt-8">
          <h2 className="typo-sub-header-2 text-primary-200" id="self-action-next-title">
            다음 행동 안내
          </h2>
          <div className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] typo-body-7 text-secondary-300">
            <p>저장 후 Recovery Packet에서 실행 계획 전체를 확인하고 관리할 수 있습니다.</p>
            <p className="mt-2">수정 시 기존 Packet은 유지되며 새 버전으로 저장됩니다.</p>
          </div>
        </section>

        {isReady ? (
          <Link
            className="mt-[76px] inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-primary-100 px-[22px] py-2 typo-body-3 text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            href={getRecoveryPacketHref([optionId])}
          >
            실행 계획 확인
          </Link>
        ) : (
          <Button className="mt-[76px] w-full" disabled>
            실행 계획 확인
          </Button>
        )}
      </div>
    </MobileScreen>
  )
}

function EffectComparison({
  after,
  before,
  label,
}: Readonly<{ after: string; before: string; label: string }>) {
  return (
    <div>
      <p className="typo-caption-3 text-secondary-300">{label}</p>
      <p className="mt-2 flex items-baseline gap-2 whitespace-nowrap text-primary-100">
        <span className="typo-body-8">{before}</span>
        <span aria-hidden="true" className="text-disabled-200">
          →
        </span>
        <strong className="typo-sub-header-2 text-primary-blue-800">{after}</strong>
      </p>
    </div>
  )
}
