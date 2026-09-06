'use client'

import { useEffect, useRef, useState } from 'react'

import {
  DEFAULT_RECOVERY_OPTION_IDS,
  getRecoveryOptions,
  type RecoveryOptionId,
} from '@/features/recovery/model/recovery-plan-data'
import type { SupportProgramConsultationContext } from '@/features/support-program'
import { BackLink, Button, Checkbox, MobileScreen, Textarea } from '@/shared/ui'
import { useDialogFocusTrap } from '@/shared/ui/use-dialog-focus-trap'

import { ConsultationChoice } from './consultation-choice'

const CONSULTATION_SLOTS = [
  '2025년 7월 14일 오전 10시',
  '2025년 7월 14일 오후 2시',
  '2025년 7월 15일 오전 11시',
] as const

const TRANSFER_ITEMS = [
  { id: 'cashflow-summary', label: '현금흐름 요약' },
  { id: 'cause-analysis', label: '주요 원인 분석' },
  { id: 'selected-recovery-options', label: '선택한 회복안' },
] as const

type ConsultationReservationScreenProps = Readonly<{
  backHref?: string
  backLabel?: string
  isSupportProgramConsultation?: boolean
  selectedOptionIds?: readonly RecoveryOptionId[]
  supportProgram?: SupportProgramConsultationContext
}>

export function ConsultationReservationScreen({
  backHref = '/recovery/compare',
  backLabel = '회복안 비교로 돌아가기',
  isSupportProgramConsultation = false,
  selectedOptionIds = DEFAULT_RECOVERY_OPTION_IDS,
  supportProgram,
}: ConsultationReservationScreenProps): React.JSX.Element {
  const [selectedSlot, setSelectedSlot] = useState<(typeof CONSULTATION_SLOTS)[number]>(
    CONSULTATION_SLOTS[0],
  )
  const [selectedTransfers, setSelectedTransfers] = useState<readonly string[]>([
    'cashflow-summary',
    'selected-recovery-options',
  ])
  const [isInformationOpen, setIsInformationOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const informationButtonRef = useRef<HTMLButtonElement>(null)
  const shouldRestoreInformationFocus = useRef(false)
  const selectedOptions = getRecoveryOptions(selectedOptionIds)

  useEffect(() => {
    if (!isInformationOpen && shouldRestoreInformationFocus.current) {
      informationButtonRef.current?.focus()
      shouldRestoreInformationFocus.current = false
    }
  }, [isInformationOpen])

  function handleTransferChange(id: string) {
    setSelectedTransfers((currentTransfers) =>
      currentTransfers.includes(id)
        ? currentTransfers.filter((transferId) => transferId !== id)
        : [...currentTransfers, id],
    )
  }

  function handleInformationClose() {
    shouldRestoreInformationFocus.current = true
    setIsInformationOpen(false)
  }

  return (
    <MobileScreen aria-label="상담 예약 화면" className="min-h-[1260px]" mode="document">
      <div
        aria-hidden={isInformationOpen ? true : undefined}
        data-testid="consultation-reservation-background"
        inert={isInformationOpen ? true : undefined}
      >
        <BackLink href={backHref} label={backLabel} />
        <div className="px-6 pt-[102px] pb-[62px]">
          <header>
            <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">
              {isSupportProgramConsultation ? '지원사업 상담' : '상담 예약'}
            </h1>
            <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
              {supportProgram
                ? '선택한 지원사업을 우선으로 상담 내용을 확인합니다.'
                : isSupportProgramConsultation
                  ? '지원사업 관련 상담 내용을 확인합니다.'
                  : '선택한 회복안을 바탕으로 상담 시간을 예약합니다.'}
            </p>
          </header>

          <section aria-labelledby="consultation-purpose-title" className="mt-5">
            <h2
              className="text-[18px] leading-[21px] font-bold text-primary-200"
              id="consultation-purpose-title"
            >
              {supportProgram ? '상담 목적 및 지원사업' : '상담 목적 및 회복안'}
            </h2>
            {supportProgram ? (
              <div
                aria-label="선택한 지원사업"
                className="mt-3 flex flex-wrap gap-2"
                data-testid="support-program-summary"
              >
                <span className="rounded-full bg-primary-blue-100 px-3 py-1 text-[12px] leading-[14px] font-medium text-primary-blue-900">
                  {supportProgram.title}
                </span>
              </div>
            ) : null}
            {selectedOptions.length > 0 ? (
              <div
                aria-label="선택한 상담 회복안"
                className="mt-3 flex flex-wrap gap-2"
                data-testid="selected-recovery-options-summary"
              >
                {selectedOptions.map((option) => (
                  <span
                    className="rounded-full bg-primary-blue-100 px-3 py-1 text-[12px] leading-[14px] font-medium text-primary-blue-900"
                    key={option.id}
                  >
                    {option.title}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] text-[12px] leading-[18px] text-secondary-300">
              상담사는 선택한 회복안과 전송에 동의한 정보만 확인합니다.
            </p>
          </section>

          <fieldset className="mt-5">
            <legend className="text-[18px] leading-[21px] font-bold text-primary-200">
              상담 채널
            </legend>
            <div className="mt-3">
              <ConsultationChoice
                checked
                name="consultation-channel"
                onChange={() => {}}
                value="전화 상담"
              />
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-[18px] leading-[21px] font-bold text-primary-200">
              예약 시간
            </legend>
            <div className="mt-3 space-y-2">
              {CONSULTATION_SLOTS.map((slot) => (
                <ConsultationChoice
                  checked={selectedSlot === slot}
                  key={slot}
                  name="consultation-slot"
                  onChange={() => setSelectedSlot(slot)}
                  value={slot}
                />
              ))}
            </div>
          </fieldset>

          <section aria-labelledby="consultation-transfer-title" className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h2
                className="text-[18px] leading-[21px] font-bold text-primary-200"
                id="consultation-transfer-title"
              >
                상담사에게 전송할 정보
              </h2>
              <button
                aria-controls="transfer-information-popover"
                aria-expanded={isInformationOpen}
                className="text-[12px] leading-[14px] text-primary-blue-800 underline focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:outline-none"
                onClick={() => setIsInformationOpen(true)}
                ref={informationButtonRef}
                type="button"
              >
                전송 정보 안내
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {TRANSFER_ITEMS.map((item) => (
                <Checkbox
                  checked={selectedTransfers.includes(item.id)}
                  id={item.id}
                  key={item.id}
                  label={item.label}
                  onChange={() => handleTransferChange(item.id)}
                />
              ))}
            </div>
          </section>

          <div className="mt-5">
            <label
              className="text-[18px] leading-[21px] font-bold text-primary-200"
              htmlFor="consultation-note"
            >
              상담 전 메모{' '}
              <span className="text-[12px] font-normal text-secondary-300">(선택)</span>
            </label>
            <Textarea
              className="mt-3"
              id="consultation-note"
              placeholder="상담 시 확인하고 싶은 내용을 입력해주세요"
            />
          </div>

          <Button
            className="mt-8 w-full"
            disabled={isCompleted}
            onClick={() => setIsCompleted(true)}
          >
            {isCompleted ? '예약 요청 완료' : '예약 확정하기'}
          </Button>
        </div>
      </div>

      {isInformationOpen ? <TransferInformationPopover onClose={handleInformationClose} /> : null}
    </MobileScreen>
  )
}

function TransferInformationPopover({ onClose }: Readonly<{ onClose: () => void }>) {
  const { dialogRef, handleKeyDown } = useDialogFocusTrap({ onClose })

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-base-black/30 px-6">
      <section
        aria-labelledby="transfer-information-title"
        aria-modal="true"
        className="w-full max-w-[342px] rounded-[10px] bg-base-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
        id="transfer-information-popover"
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <h2
          className="text-[18px] leading-[21px] font-bold text-primary-200"
          id="transfer-information-title"
        >
          전송 정보 안내
        </h2>
        <p className="mt-3 text-[13px] leading-5 text-secondary-300">
          선택한 항목만 상담사에게 전달되며, 예약 요청 외의 용도로 사용하지 않습니다.
        </p>
        <Button className="mt-5 w-full" onClick={onClose} variant="secondary">
          안내 닫기
        </Button>
      </section>
    </div>
  )
}
