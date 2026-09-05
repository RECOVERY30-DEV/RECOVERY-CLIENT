'use client'

import { useEffect, useRef } from 'react'

type CashflowDatePickerDialogProps = Readonly<{
  onClose: () => void
  onSelect: (date: string) => void
}>

const JULY_2025_DAYS = Array.from({ length: 31 }, (_, index) => index + 1)

export function CashflowDatePickerDialog({ onClose, onSelect }: CashflowDatePickerDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-200/50 px-6">
      <section
        aria-labelledby="cashflow-date-picker-title"
        aria-modal="true"
        className="w-full max-w-[342px] rounded-[34px] bg-base-white px-[14px] py-8 shadow-[0_0_17px_rgba(0,0,0,0.1)]"
        role="dialog"
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-[18px] leading-[21px] font-bold text-primary-200"
            id="cashflow-date-picker-title"
          >
            예정일 선택
          </h2>
          <button
            className="h-[30px] border-b border-neutral-700 px-[10px] py-1 typo-body-8 text-neutral-700 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:outline-none"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            닫기
          </button>
        </div>
        <p className="mt-6 text-center text-[18px] leading-[21px] font-bold text-primary-200">
          2025년 7월
        </p>
        <div className="mt-6 grid grid-cols-7 gap-y-2 text-center text-[12px] leading-[18px] font-medium text-secondary-300">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 2 }, (_, index) => (
            <span aria-hidden="true" key={`blank-${index}`} />
          ))}
          {JULY_2025_DAYS.map((day) => {
            const date = `2025년 7월 ${day}일`

            return (
              <button
                aria-label={date}
                className="h-9 rounded-[6px] typo-body-5 text-secondary-300 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:outline-none"
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
