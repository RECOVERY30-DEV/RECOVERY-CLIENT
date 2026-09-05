import CounselorTransferIcon from '@/features/consent/assets/counselor-transfer.svg'
import FollowUpIcon from '@/features/consent/assets/follow-up.svg'
import ServiceAnalysisIcon from '@/features/consent/assets/service-analysis.svg'

import { ConsentOption } from './consent-option'
import { ConsentSection } from './consent-section'

type ConsentControlsProps = Readonly<{
  hasAnalysisConsent: boolean
  hasCounselorConsent: boolean
  hasFollowUpConsent: boolean
  onAnalysisChange: () => void
  onCounselorChange: () => void
  onFollowUpChange: () => void
}>

export function ConsentControls({
  hasAnalysisConsent,
  hasCounselorConsent,
  hasFollowUpConsent,
  onAnalysisChange,
  onCounselorChange,
  onFollowUpChange,
}: ConsentControlsProps) {
  return (
    <div className="flex flex-col gap-5">
      <ConsentSection
        description="30일 현금흐름 예측 및 부족 원인 분석에 사업자 거래 데이터를 활용합니다. 철회 시 분석 기능을 이용할 수 없습니다."
        footnote="분석 동의는 서비스의 핵심 기능 제공을 위한 필수 항목입니다."
        title="필수 동의"
      >
        <ConsentOption
          checked={hasAnalysisConsent}
          icon={<ServiceAnalysisIcon className="size-6" />}
          label="서비스 분석 동의"
          onChange={onAnalysisChange}
        />
      </ConsentSection>

      <ConsentSection
        description="상담 예약 시 Recovery Packet을 상담원에게 사전 전송합니다. 철회해도 상담 예약은 유지되나 Packet이 전송되지 않습니다."
        footnote="미동의 시 상담원 사전 전송을 이용하지 않으며 분석 이용에는 영향을 주지 않습니다."
        title="선택 동의"
      >
        <ConsentOption
          checked={hasCounselorConsent}
          icon={<CounselorTransferIcon className="size-6" />}
          label="상담원 전송 동의"
          onChange={onCounselorChange}
        />
      </ConsentSection>

      <div>
        <ConsentOption
          checked={hasFollowUpConsent}
          icon={<FollowUpIcon className="size-6" />}
          label="30·60·90일 사후 점검 동의"
          onChange={onFollowUpChange}
        />
        <div className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-[10px] text-neutral-700">
          <p className="text-[13px] leading-4">
            분석 이후 30·60·90일에 실행 결과와 잔액 회복 여부를 점검합니다. 철회해도 분석 이용에는
            영향이 없습니다.
          </p>
          <p className="mt-[15px] text-[11px] leading-[13px]">
            미동의 시 사후 점검 알림을 받지 않습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
