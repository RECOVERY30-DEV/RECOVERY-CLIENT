'use client'

import Link from 'next/link'
import { useState } from 'react'

import { BackLink, Button, Checkbox, MobileScreen } from '@/shared/ui'

import { RECOVERY_PACKET_FIXTURE } from '../model/recovery-packet-data'

export function RecoveryActionSaveScreen(): React.JSX.Element {
  const [checkedItemIds, setCheckedItemIds] = useState<readonly string[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const action = RECOVERY_PACKET_FIXTURE.action
  const arePreparationItemsComplete = checkedItemIds.length === action.preparationItems.length

  function handlePreparationChange(itemId: string, isChecked: boolean) {
    setCheckedItemIds((currentIds) => {
      if (isChecked) {
        return [...currentIds, itemId]
      }

      return currentIds.filter((id) => id !== itemId)
    })
  }

  return (
    <MobileScreen aria-label="자체 실행 저장 화면" className="min-h-[1120px]" mode="document">
      <BackLink href="/recovery/compare" label="회복안 비교로 돌아가기" />

      <div className="px-6 pt-[102px] pb-10">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">자체 실행 저장</h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            선택한 회복안을 실행 계획으로 저장합니다.
          </p>
        </header>

        <section
          aria-labelledby="selected-action-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <p className="text-[12px] leading-[14px] font-semibold text-secondary-300">
            선택한 회복안
          </p>
          <h2
            className="mt-1 text-[18px] leading-[21px] font-bold text-primary-100"
            id="selected-action-title"
          >
            {action.option.title}
          </h2>
          <p className="mt-2 text-[13px] leading-4 text-secondary-300">
            예상 효과: {action.improvement}
          </p>
        </section>

        <section aria-labelledby="comparison-title" className="mt-5">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="comparison-title"
          >
            실행 전후 비교
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 rounded-[10px] bg-neutral-100 p-[14px]">
            <ComparisonItem
              after={action.beforeAfter.firstShortageDay.after}
              before={action.beforeAfter.firstShortageDay.before}
              label="부족일까지 여유"
            />
            <ComparisonItem
              after={action.beforeAfter.minimumBalance.after}
              before={action.beforeAfter.minimumBalance.before}
              label="예상 최저 잔액"
            />
          </dl>
        </section>

        <section aria-labelledby="preparation-title" className="mt-5">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="preparation-title"
          >
            자체 실행 준비 항목
          </h2>
          <div className="mt-3 space-y-2">
            {action.preparationItems.map((item) => (
              <Checkbox
                checked={checkedItemIds.includes(item.id)}
                description={item.description}
                disabled={isSaved}
                id={item.id}
                key={item.id}
                label={item.label}
                onChange={(event) => handlePreparationChange(item.id, event.currentTarget.checked)}
              />
            ))}
          </div>
          {isSaved ? (
            <p className="mt-2 text-[12px] leading-4 text-secondary-300">
              저장 후에는 준비 항목을 변경할 수 없습니다.
            </p>
          ) : null}
        </section>

        <section
          aria-labelledby="next-action-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="next-action-title"
          >
            다음 행동 안내
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-secondary-300">{action.nextAction}</p>
        </section>

        <div className="mt-8">
          {isSaved ? (
            <div className="space-y-3">
              <p
                className="rounded-[8px] bg-primary-blue-100 px-3.5 py-2.5 text-[14px] leading-5 font-medium text-primary-blue-900"
                role="status"
              >
                저장 완료 · 실행 계획이 이 화면 안에서 저장된 상태입니다.
              </p>
              <Link
                className="inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 text-[16px] leading-6 font-medium text-base-white focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/recovery"
              >
                Recovery Packet 확인하기
              </Link>
            </div>
          ) : (
            <Button
              className="w-full"
              disabled={!arePreparationItemsComplete}
              onClick={() => setIsSaved(true)}
            >
              실행 계획 저장하기
            </Button>
          )}
        </div>
      </div>
    </MobileScreen>
  )
}

function ComparisonItem({
  after,
  before,
  label,
}: Readonly<{ after: string; before: string; label: string }>) {
  return (
    <div>
      <dt className="text-[12px] leading-[14px] font-semibold text-secondary-300">{label}</dt>
      <dd className="mt-1 flex items-center gap-1 text-[14px] leading-5">
        <span className="text-primary-100">{before}</span>
        <span aria-hidden="true" className="text-secondary-300">
          →
        </span>
        <strong className="font-bold text-primary-blue-800">{after}</strong>
      </dd>
    </div>
  )
}
