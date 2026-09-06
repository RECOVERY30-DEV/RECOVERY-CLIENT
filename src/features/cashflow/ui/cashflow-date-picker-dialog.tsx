'use client'

import { useState } from 'react'

import { useDialogFocusTrap } from '@/shared/ui/use-dialog-focus-trap'

type CashflowDatePickerDialogProps = Readonly<{
  onClose: () => void
  onSelect: (date: string) => void
}>

export function CashflowDatePickerDialog({ onClose, onSelect }: CashflowDatePickerDialogProps) {
  const { dialogRef, handleKeyDown } = useDialogFocusTrap({ onClose })
  const [visibleMonth, setVisibleMonth] = useState({ month: 6, year: 2025 })
  const dayCount = new Date(visibleMonth.year, visibleMonth.month + 1, 0).getDate()
  const firstWeekday = new Date(visibleMonth.year, visibleMonth.month, 1).getDay()
  const days = Array.from({ length: dayCount }, (_, index) => index + 1)

  function changeYear(delta: number) {
    setVisibleMonth((current) => ({ ...current, year: current.year + delta }))
  }

  function changeMonth(delta: number) {
    setVisibleMonth((current) => {
      const next = new Date(current.year, current.month + delta, 1)
      return { month: next.getMonth(), year: next.getFullYear() }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-200/50 px-6">
      <section
        aria-labelledby="cashflow-date-picker-title"
        aria-modal="true"
        className="w-full max-w-[342px] rounded-[34px] bg-base-white px-[14px] py-8 shadow-[0_0_17px_rgba(0,0,0,0.1)]"
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <h2 className="sr-only" id="cashflow-date-picker-title">
          예정일 선택
        </h2>
        <button
          className="sr-only focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
        <div className="flex items-center justify-between">
          <CalendarNavigator
            label={`${visibleMonth.year}년`}
            nextLabel="다음 연도"
            onNext={() => changeYear(1)}
            onPrevious={() => changeYear(-1)}
            previousLabel="이전 연도"
          />
          <CalendarNavigator
            label={`${visibleMonth.month + 1}월`}
            nextLabel="다음 달"
            onNext={() => changeMonth(1)}
            onPrevious={() => changeMonth(-1)}
            previousLabel="이전 달"
          />
        </div>
        <div className="mt-6 grid grid-cols-7 gap-y-2 text-center text-[12px] leading-[18px] font-medium text-secondary-300">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }, (_, index) => (
            <span aria-hidden="true" key={`blank-${index}`} />
          ))}
          {days.map((day) => {
            const date = `${visibleMonth.year}년 ${visibleMonth.month + 1}월 ${day}일`

            return (
              <button
                aria-label={date}
                className="h-9 rounded-[6px] typo-body-5 text-secondary-300 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
                key={date}
                onClick={() => onSelect(date)}
                type="button"
              >
                {day}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function CalendarNavigator({
  label,
  nextLabel,
  onNext,
  onPrevious,
  previousLabel,
}: Readonly<{
  label: string
  nextLabel: string
  onNext: () => void
  onPrevious: () => void
  previousLabel: string
}>) {
  const buttonClassName =
    'flex size-8 items-center justify-center rounded text-[22px] text-secondary-300 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none'

  return (
    <div className="flex items-center gap-1">
      <button
        aria-label={previousLabel}
        className={buttonClassName}
        onClick={onPrevious}
        type="button"
      >
        ‹
      </button>
      <strong className="min-w-14 text-center text-[18px] leading-[21px] text-primary-200">
        {label}
      </strong>
      <button aria-label={nextLabel} className={buttonClassName} onClick={onNext} type="button">
        ›
      </button>
    </div>
  )
}
