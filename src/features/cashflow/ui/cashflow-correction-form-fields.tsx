'use client'

import { useId, type RefObject } from 'react'

import { Input, Select, Switch, Textarea } from '@/shared/ui'

import type { CashflowCorrectionFormConfig } from '../model/cashflow-correction-form-data'

type CashflowCorrectionFormFieldsProps = Readonly<{
  config: CashflowCorrectionFormConfig
  date: string
  dateButtonRef: RefObject<HTMLButtonElement | null>
  expenseItem: string
  isConfirmed: boolean
  memo: string
  onConfirmedChange: (checked: boolean) => void
  onDateClick: () => void
  onExpenseItemChange: (value: string) => void
  onMemoChange: (value: string) => void
  onSelectionChange: (value: string) => void
  onValueChange: (value: string) => void
  selection: string
  value: string
}>

export function CashflowCorrectionFormFields({
  config,
  date,
  dateButtonRef,
  expenseItem,
  isConfirmed,
  memo,
  onConfirmedChange,
  onDateClick,
  onExpenseItemChange,
  onMemoChange,
  onSelectionChange,
  onValueChange,
  selection,
  value,
}: CashflowCorrectionFormFieldsProps) {
  const dateLabelId = useId()
  const dateValueId = useId()

  return (
    <div className="flex flex-col gap-5">
      {config.hasExpenseItem ? (
        <label className="flex flex-col gap-[15px]">
          <span className="text-[18px] leading-[21px] font-bold text-primary-200">지출 항목</span>
          <Input
            onChange={(event) => onExpenseItemChange(event.target.value)}
            placeholder="지출 항목을 입력해주세요"
            value={expenseItem}
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-[15px]">
        <span className="text-[18px] leading-[21px] font-bold text-primary-200">금액 (원)</span>
        <Input
          inputMode="numeric"
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="금액을 입력해주세요"
          value={value}
        />
      </label>
      <div className="flex flex-col gap-[15px]">
        <span className="text-[18px] leading-[21px] font-bold text-primary-200" id={dateLabelId}>
          {config.dateLabel}
        </span>
        <button
          aria-haspopup="dialog"
          aria-labelledby={`${dateLabelId} ${dateValueId}`}
          className="flex h-9 w-full items-center justify-between rounded border border-field bg-base-white px-3 typo-body-5 text-primary-100 transition-colors focus-visible:border-primary-blue-400 focus-visible:ring-2 focus-visible:ring-primary-blue-100 focus-visible:outline-none"
          onClick={onDateClick}
          ref={dateButtonRef}
          type="button"
        >
          <span className={date ? 'text-primary-100' : 'text-neutral-600'} id={dateValueId}>
            {date || '예정일을 선택해주세요.'}
          </span>
          <span aria-hidden="true">⌄</span>
        </button>
      </div>
      <label className="flex flex-col gap-[15px]">
        <span className="text-[18px] leading-[21px] font-bold text-primary-200">
          {config.selectionLabel}
        </span>
        <Select
          onChange={(event) => onSelectionChange(event.target.value)}
          placeholder={config.selectionPlaceholder}
          value={selection}
        >
          {config.selectionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-[15px]">
        <span className="text-[18px] leading-[21px] font-bold text-primary-200">메모 (선택)</span>
        <Textarea
          className="min-h-[82px] border-field bg-base-white typo-body-5"
          onChange={(event) => onMemoChange(event.target.value)}
          placeholder="내용을 입력해주세요."
          value={memo}
        />
      </label>
      <div className="flex flex-col gap-2">
        <Switch
          checked={isConfirmed}
          label={config.confirmationLabel}
          onChange={(event) => onConfirmedChange(event.target.checked)}
        />
        <p className="typo-caption-3 text-neutral-700">{config.confirmationDescription}</p>
      </div>
    </div>
  )
}
