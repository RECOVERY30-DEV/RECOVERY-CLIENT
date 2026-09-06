'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLayoutEffect, useRef, useState } from 'react'
import type { KyInstance } from 'ky'

import { createAdjustment } from '@/features/cashflow/api/adjustment-api'
import type { AdjustmentType } from '@/features/cashflow/api/adjustment-contract'
import { ApiError } from '@/shared/api/api-response'
import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { Button, MobileScreen } from '@/shared/ui'

import {
  getCashflowCorrectionFormConfig,
  type CashflowCorrectionKind,
} from '../model/cashflow-correction-form-data'
import { persistPendingAdjustment } from '../model/pending-adjustment-storage'
import { CashflowCorrectionFormFields } from './cashflow-correction-form-fields'
import { CashflowDatePickerDialog } from './cashflow-date-picker-dialog'
import { CashflowDraftExitDialog } from './cashflow-draft-exit-dialog'

type CashflowCorrectionFormScreenProps = Readonly<{
  client?: KyInstance
  kind: CashflowCorrectionKind
}>

type ActiveDialog = 'date-picker' | 'draft-exit' | null
type FocusRestoreTarget = 'back-link' | 'date-button'
type SaveLocation = 'server' | 'device' | null

const ADJUSTMENT_TYPES = {
  'cash-sales': 'CASH_SALES',
  'expected-expenses': 'EXPECTED_EXPENSE',
  'expected-income': 'EXPECTED_INCOME',
  'external-funds': 'EXTERNAL_FUND',
} as const satisfies Record<CashflowCorrectionKind, AdjustmentType>

function toApiDate(date: string): string {
  const match = /^(\d{4})년 (\d{1,2})월 (\d{1,2})일$/.exec(date)
  if (match === null) return date

  const [, year, month, day] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function CashflowCorrectionFormScreen({
  client,
  kind,
}: CashflowCorrectionFormScreenProps): React.JSX.Element {
  const config = getCashflowCorrectionFormConfig(kind)
  const router = useRouter()
  const backLinkRef = useRef<HTMLAnchorElement>(null)
  const dateButtonRef = useRef<HTMLButtonElement>(null)
  const focusRestoreTargetRef = useRef<FocusRestoreTarget | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [selection, setSelection] = useState('')
  const [expenseItem, setExpenseItem] = useState('')
  const [memo, setMemo] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [saveLocation, setSaveLocation] = useState<SaveLocation>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)

  const isSaved = saveLocation !== null
  const isDirty =
    !isSaved && Boolean(amount || date || selection || expenseItem || memo || isConfirmed)
  const numericAmount = Number(amount)
  const canSave =
    !isSaved &&
    !isSaving &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    Boolean(date && selection && (!config.hasExpenseItem || expenseItem))

  useLayoutEffect(() => {
    if (activeDialog !== null) {
      return
    }

    const focusRestoreTarget = focusRestoreTargetRef.current
    focusRestoreTargetRef.current = null

    if (focusRestoreTarget === 'date-button') {
      dateButtonRef.current?.focus()
    }

    if (focusRestoreTarget === 'back-link') {
      backLinkRef.current?.focus()
    }
  }, [activeDialog])

  function closeDialogAndRestoreFocus(target: FocusRestoreTarget) {
    focusRestoreTargetRef.current = target
    setActiveDialog(null)
  }

  function handleDateSelect(nextDate: string) {
    setDate(nextDate)
    closeDialogAndRestoreFocus('date-button')
  }

  function handleDatePickerClose() {
    closeDialogAndRestoreFocus('date-button')
  }

  function handleBackClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (activeDialog) {
      event.preventDefault()
      return
    }

    if (!isDirty) {
      return
    }

    event.preventDefault()
    setActiveDialog('draft-exit')
  }

  function handleContinueWriting() {
    closeDialogAndRestoreFocus('back-link')
  }

  function handleDiscardDraft() {
    focusRestoreTargetRef.current = null
    router.push('/cashflow/corrections')
  }

  function getAdjustmentType(): AdjustmentType {
    return ADJUSTMENT_TYPES[kind]
  }

  async function saveAdjustment() {
    if (!canSave) return

    setIsSaving(true)
    setSaveError(false)

    try {
      await createAdjustment(
        DEMO_BUSINESS_ID,
        {
          adjustmentType: getAdjustmentType(),
          amount: numericAmount,
          certainty: isConfirmed ? 'CONFIRMED' : 'ESTIMATED',
          expectedDate: toApiDate(date),
          ...(memo || expenseItem ? { memo: memo || expenseItem } : {}),
        },
        client === undefined ? {} : { client },
      )
      focusRestoreTargetRef.current = null
      setSaveLocation('server')
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 400) {
        setSaveError(true)
        return
      }

      const savedOnDevice = persistPendingAdjustment({
        adjustmentType: getAdjustmentType(),
        amount: numericAmount,
        certainty: isConfirmed ? 'CONFIRMED' : 'ESTIMATED',
        expectedDate: toApiDate(date),
        ...(memo || expenseItem ? { memo: memo || expenseItem } : {}),
        selection,
      })

      if (savedOnDevice) {
        focusRestoreTargetRef.current = null
        setSaveLocation('device')
      } else {
        setSaveError(true)
      }
    } finally {
      setIsSaving(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void saveAdjustment()
  }

  return (
    <MobileScreen aria-label={`${config.title} 화면`} className="min-h-[1040px]" mode="document">
      <div
        aria-hidden={activeDialog ? true : undefined}
        data-testid="cashflow-correction-form-background"
        inert={activeDialog ? true : undefined}
      >
        <Link
          aria-label="정보 보정 화면으로 돌아가기"
          className="absolute top-[61px] left-[11px] z-20 flex size-6 items-center justify-center text-primary-200 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
          href="/cashflow/corrections"
          onClick={handleBackClick}
          ref={backLinkRef}
        >
          ←
        </Link>
        <form className="px-6 pt-[102px] pb-[62px]" onSubmit={handleSubmit}>
          <header>
            <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">
              {config.title}
            </h1>
            <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
              {config.description}
            </p>
          </header>
          <section className="mt-5">
            <CashflowCorrectionFormFields
              config={config}
              date={date}
              dateButtonRef={dateButtonRef}
              disabled={isSaved}
              expenseItem={expenseItem}
              isConfirmed={isConfirmed}
              memo={memo}
              onConfirmedChange={setIsConfirmed}
              onDateClick={() => setActiveDialog('date-picker')}
              onExpenseItemChange={setExpenseItem}
              onMemoChange={setMemo}
              onSelectionChange={setSelection}
              onValueChange={setAmount}
              selection={selection}
              value={amount}
            />
          </section>
          <aside className="mt-10 rounded-[10px] bg-neutral-100 px-[14px] py-[10px]">
            <h2 className="typo-body-5 text-neutral-900">{config.helpTitle}</h2>
            <p className="mt-[15px] typo-caption-3 text-secondary-300">{config.helpDescription}</p>
          </aside>
          {saveLocation === 'server' ? (
            <div
              className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-[10px] text-secondary-300"
              role="status"
            >
              <p className="typo-body-5 text-neutral-900">보정값이 저장되었습니다.</p>
              <p className="mt-1 typo-caption-3">
                재계산 실행 전까지 예측 결과에는 반영되지 않습니다.
              </p>
              <Link
                className="mt-3 inline-flex border-b border-primary-blue-800 typo-body-8 text-primary-blue-800 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/cashflow/corrections"
              >
                보정 목록으로 이동
              </Link>
            </div>
          ) : null}
          {saveLocation === 'device' ? (
            <div
              className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-[10px] text-secondary-300"
              role="status"
            >
              <p className="typo-body-5 text-neutral-900">이 기기에 임시 저장되었습니다.</p>
              <p className="mt-1 typo-caption-3">
                서버 연동 전까지 예측 결과에는 반영되지 않습니다.
              </p>
              <Link
                className="mt-3 inline-flex border-b border-primary-blue-800 typo-body-8 text-primary-blue-800 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/cashflow/corrections"
              >
                보정 목록으로 이동
              </Link>
            </div>
          ) : null}
          {saveError ? (
            <div className="mt-5" role="alert">
              <p className="text-alert typo-caption-3">
                보정값을 저장하지 못했습니다. 입력을 확인한 뒤 다시 시도해 주세요.
              </p>
              <Button
                className="mt-3"
                disabled={isSaving}
                onClick={() => void saveAdjustment()}
                size="sm"
                type="button"
                variant="outline"
              >
                다시 시도
              </Button>
            </div>
          ) : null}
          <Button className="mt-10 w-full" disabled={!canSave} type="submit">
            {isSaved ? '저장 완료' : isSaving ? '저장 중' : '저장'}
          </Button>
        </form>
      </div>
      {activeDialog === 'date-picker' ? (
        <CashflowDatePickerDialog onClose={handleDatePickerClose} onSelect={handleDateSelect} />
      ) : null}
      {activeDialog === 'draft-exit' ? (
        <CashflowDraftExitDialog
          onContinue={handleContinueWriting}
          onDiscard={handleDiscardDraft}
        />
      ) : null}
    </MobileScreen>
  )
}
