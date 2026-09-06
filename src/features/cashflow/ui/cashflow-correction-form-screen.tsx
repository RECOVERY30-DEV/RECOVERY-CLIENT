'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLayoutEffect, useRef, useState } from 'react'

import { Button, MobileScreen } from '@/shared/ui'

import {
  getCashflowCorrectionFormConfig,
  type CashflowCorrectionKind,
} from '../model/cashflow-correction-form-data'
import { CashflowCorrectionFormFields } from './cashflow-correction-form-fields'
import { CashflowDatePickerDialog } from './cashflow-date-picker-dialog'
import { CashflowDraftExitDialog } from './cashflow-draft-exit-dialog'

type CashflowCorrectionFormScreenProps = Readonly<{
  kind: CashflowCorrectionKind
}>

type ActiveDialog = 'date-picker' | 'draft-exit' | null
type FocusRestoreTarget = 'back-link' | 'date-button'

export function CashflowCorrectionFormScreen({
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
  const [isSaved, setIsSaved] = useState(false)
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)

  const isDirty =
    !isSaved && Boolean(amount || date || selection || expenseItem || memo || isConfirmed)
  const canSave =
    !isSaved && Boolean(amount && date && selection && (!config.hasExpenseItem || expenseItem))

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (canSave) {
      focusRestoreTargetRef.current = null
      setIsSaved(true)
    }
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
          {isSaved ? (
            <div
              className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-[10px] text-secondary-300"
              role="status"
            >
              <p className="typo-body-5 text-neutral-900">현재 화면에만 저장됐습니다.</p>
              <p className="mt-1 typo-caption-3">새로고침하면 입력 내용이 초기화됩니다.</p>
              <Link
                className="mt-3 inline-flex border-b border-primary-blue-800 typo-body-8 text-primary-blue-800 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/cashflow/corrections"
              >
                보정 목록으로 이동
              </Link>
            </div>
          ) : null}
          <Button className="mt-10 w-full" disabled={!canSave} type="submit">
            {isSaved ? '저장 완료' : '저장'}
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
