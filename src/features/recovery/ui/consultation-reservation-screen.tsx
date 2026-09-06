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
  { availability: '잔여 2석', value: '2025년 7월 14일 오전 10시' },
  { availability: '잔여 3석', value: '2025년 7월 14일 오후 2시' },
  { availability: '잔여 1석', value: '2025년 7월 15일 오전 11시' },
] as const

type ConsultationSlot = (typeof CONSULTATION_SLOTS)[number]['value']

const RECOVERY_TRANSFER_ITEMS = [
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
  const [selectedSlot, setSelectedSlot] = useState<ConsultationSlot>(CONSULTATION_SLOTS[0].value)
  const transferItems = getTransferItems(isSupportProgramConsultation, supportProgram)
  const [selectedTransfers, setSelectedTransfers] = useState<readonly string[]>(() =>
    getDefaultSelectedTransferIds(isSupportProgramConsultation, supportProgram),
  )
  const [isInformationOpen, setIsInformationOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const informationButtonRef = useRef<HTMLButtonElement>(null)
  const shouldRestoreInformationFocus = useRef(false)
  const selectedOptions = isSupportProgramConsultation ? [] : getRecoveryOptions(selectedOptionIds)

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
    <MobileScreen aria-label="상담 예약 화면" className="min-h-[1755px]" mode="document">
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
              {isSupportProgramConsultation
                ? supportProgram
                  ? '상담 목적 및 지원사업'
                  : '지원사업 상담 목적'
                : '상담 목적 및 회복안'}
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
                    className="rounded border border-primary-blue-800 bg-base-white px-3 py-1 text-[12px] leading-[14px] font-medium text-primary-blue-900"
                    key={option.id}
                  >
                    {option.title}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] text-[12px] leading-[18px] text-secondary-300">
              {isSupportProgramConsultation
                ? supportProgram
                  ? '선택한 지원사업과 동의 항목은 상담 준비용 화면 예시이며 실제 전송되지 않습니다.'
                  : '지원사업 상담 요청과 동의 항목은 상담 준비용 화면 예시이며 실제 전송되지 않습니다.'
                : '선택한 회복안과 동의 항목은 상담 준비용 화면 예시이며 실제 전송되지 않습니다.'}
            </p>
          </section>

          <fieldset className="mt-5">
            <legend className="text-[18px] leading-[21px] font-bold text-primary-200">
              상담 채널
            </legend>
            <div className="mt-3 space-y-2">
              <ConsultationChoice
                checked
                description="평일 09:00 ~ 18:00"
                name="consultation-channel"
                onChange={() => {}}
                value="전화 상담"
              />
              <ConsultationChoice
                checked={false}
                description="준비 중"
                disabled
                name="consultation-channel"
                onChange={() => {}}
                value="채팅 상담"
              />
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-[18px] leading-[21px] font-bold text-primary-200">
              예약 가능 일시 선택
            </legend>
            <div className="mt-3 space-y-2">
              {CONSULTATION_SLOTS.map((slot) => (
                <ConsultationChoice
                  checked={selectedSlot === slot.value}
                  description={slot.availability}
                  key={slot.value}
                  name="consultation-slot"
                  onChange={() => setSelectedSlot(slot.value)}
                  value={slot.value}
                />
              ))}
            </div>
            <button
              className="mt-3 border-b border-secondary-300 text-[12px] leading-[16px] text-secondary-300 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
              type="button"
            >
              원하는 시간이 없어요
            </button>
          </fieldset>

          <div className="mt-8">
            <label
              className="text-[18px] leading-[21px] font-bold text-primary-200"
              htmlFor="consultation-note"
            >
              사전 질문 <span className="text-[12px] font-normal text-secondary-300">(선택)</span>
            </label>
            <p className="mt-1 text-[13px] leading-4 text-secondary-300">
              상담에서 꼭 확인하고 싶은 내용을 입력해 주세요.
            </p>
            <Textarea className="mt-3" id="consultation-note" placeholder="내용을 작성해주세요." />
          </div>

          <section aria-labelledby="consultation-transfer-title" className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h2
                className="text-[18px] leading-[21px] font-bold text-primary-200"
                id="consultation-transfer-title"
              >
                상담원 전송 정보 범위
              </h2>
              <button
                aria-controls="transfer-information-popover"
                aria-expanded={isInformationOpen}
                className="text-[12px] leading-[14px] text-primary-blue-800 underline focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
                onClick={() => setIsInformationOpen(true)}
                ref={informationButtonRef}
                type="button"
              >
                전송 정보 안내
              </button>
            </div>
            <p className="mt-1 text-[11px] leading-[15px] text-secondary-300">
              정보는 상담 목적에만 사용되며 예약일 이후 30일까지 제공되지 않습니다.
            </p>
            <div className="mt-3 space-y-2">
              {transferItems.map((item) => (
                <Checkbox
                  checked={selectedTransfers.includes(item.id)}
                  id={item.id}
                  key={item.id}
                  label={item.label}
                  onChange={() => handleTransferChange(item.id)}
                />
              ))}
            </div>
            <p className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] text-[12px] leading-[18px] text-secondary-300">
              전송 동의가 없어도 예약은 완료됩니다. 동의하면 상담원이 사전에 상황을 파악해 더 빠른
              상담이 가능합니다.
            </p>
          </section>

          <section
            aria-labelledby="consultation-final-summary-title"
            className="mt-8 rounded-[10px] bg-neutral-100 p-[14px]"
          >
            <p className="text-[11px] leading-[14px] text-secondary-300">예약 정보</p>
            <h2
              className="mt-1 text-[18px] leading-[21px] font-bold text-primary-200"
              id="consultation-final-summary-title"
            >
              예약 내용 최종 확인
            </h2>
            <dl className="mt-4 space-y-3 text-[12px] leading-[14px]">
              <ReservationSummaryRow label="상담 채널" value="전화 상담" />
              <ReservationSummaryRow label="예약 일시" value={selectedSlot} />
              <ReservationSummaryRow
                label="회복안"
                value={
                  supportProgram
                    ? '선택한 지원사업 1건'
                    : isSupportProgramConsultation
                      ? '지원사업 상담'
                      : `선택한 회복안 ${selectedOptions.length}건`
                }
              />
              <ReservationSummaryRow
                label="정보 전송"
                value={`${selectedTransfers.length}개 항목 동의`}
              />
            </dl>
          </section>

          <Button
            className="mt-8 w-full"
            disabled={isCompleted}
            onClick={() => setIsCompleted(true)}
          >
            {isCompleted ? '화면 내 확인 완료' : '예약 확정하기'}
          </Button>
          {isCompleted ? (
            <div
              aria-live="polite"
              className="mt-3 rounded-[10px] bg-neutral-100 p-[14px] typo-caption-3 text-secondary-300"
            >
              <p className="font-medium text-primary-100">화면 내 예약 정보 확인 완료</p>
              <p className="mt-1">
                이 상태는 새로고침하면 초기화되며 실제 상담사에게 전송되지 않습니다.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {isInformationOpen ? <TransferInformationPopover onClose={handleInformationClose} /> : null}
    </MobileScreen>
  )
}

function ReservationSummaryRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-secondary-300">{label}</dt>
      <dd className="text-right font-medium text-primary-blue-800">{value}</dd>
    </div>
  )
}

function getTransferItems(
  isSupportProgramConsultation: boolean,
  supportProgram: SupportProgramConsultationContext | undefined,
) {
  if (!isSupportProgramConsultation) {
    return RECOVERY_TRANSFER_ITEMS
  }

  return [
    { id: 'cashflow-summary', label: '현금흐름 요약' },
    { id: 'cause-analysis', label: '주요 원인 분석' },
    supportProgram
      ? { id: 'selected-support-program', label: '선택한 지원사업' }
      : { id: 'support-program-request', label: '지원사업 상담 요청 내용' },
  ]
}

function getDefaultSelectedTransferIds(
  isSupportProgramConsultation: boolean,
  supportProgram: SupportProgramConsultationContext | undefined,
): readonly string[] {
  if (!isSupportProgramConsultation) {
    return ['cashflow-summary', 'selected-recovery-options']
  }

  return [
    'cashflow-summary',
    supportProgram ? 'selected-support-program' : 'support-program-request',
  ]
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
          서버 연동 전에는 선택한 항목이 상담 준비 화면에만 표시되며 실제 상담사에게 전송되지
          않습니다.
        </p>
        <Button className="mt-5 w-full" onClick={onClose} variant="secondary">
          안내 닫기
        </Button>
      </section>
    </div>
  )
}
