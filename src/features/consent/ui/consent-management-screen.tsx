'use client'

import { useState } from 'react'

import { ServiceBottomNavigation } from '@/features/navigation/ui/service-bottom-navigation'
import { DEMO_BUSINESS_ID } from '@/shared/config/business'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

import { type Consent, type ConsentTypeCode } from '../api/consent-contract'
import { CONSENT_DATA_USAGE_ITEMS } from '../model/consent-data'
import { useConsentQueries, useUpdateConsentMutation } from '../queries/consent-queries'
import { ConsentControls } from './consent-controls'
import { ConsentWithdrawalDialog } from './consent-withdrawal-dialog'

function isGranted(consents: ReadonlyArray<Consent>, typeCode: ConsentTypeCode) {
  return consents.some((consent) => consent.typeCode === typeCode && consent.status === 'GRANTED')
}

export function ConsentManagementScreen() {
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false)
  const consents = useConsentQueries(DEMO_BUSINESS_ID)
  const updateConsent = useUpdateConsentMutation(DEMO_BUSINESS_ID)
  const consentData = consents.data ?? []
  const hasAnalysisConsent = isGranted(consentData, 'ANALYSIS')
  const hasFollowUpConsent = isGranted(consentData, 'FOLLOWUP_TRACKING')

  function updateConsentStatus(typeCode: ConsentTypeCode, granted: boolean, closeDialog = false) {
    updateConsent.mutate(
      { typeCode, granted },
      {
        onSuccess: () => {
          if (closeDialog) {
            setIsWithdrawalOpen(false)
          }
        },
      },
    )
  }

  if (consents.isPending) {
    return (
      <MobileScreen aria-label="동의 관리 화면" className="min-h-[1214px]" mode="document">
        <BackLink href="/home" label="홈으로 돌아가기" />
        <p className="px-6 pt-[102px] text-secondary-300" role="status">
          동의 내역을 불러오는 중입니다.
        </p>
      </MobileScreen>
    )
  }

  if (consents.isError) {
    return (
      <MobileScreen aria-label="동의 관리 화면" className="min-h-[1214px]" mode="document">
        <BackLink href="/home" label="홈으로 돌아가기" />
        <div className="px-6 pt-[102px]">
          <p className="text-secondary-300" role="alert">
            동의 내역을 불러오지 못했습니다.
          </p>
          <Button className="mt-4" onClick={() => void consents.refetch()} variant="secondary">
            다시 시도
          </Button>
        </div>
      </MobileScreen>
    )
  }

  return (
    <MobileScreen aria-label="동의 관리 화면" className="min-h-[1214px]" mode="document">
      <BackLink href="/home" label="홈으로 돌아가기" />

      <div className="px-6 pt-[102px]">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">동의 철회 안내</h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            선택 동의 철회는 해당 기능만 중단되며 분석 이용에는 영향이 없습니다.
            <br />
            필수 분석 동의를 철회하면 30일 현금흐름 분석을 포함한 모든 서비스 이용이 중단됩니다.
          </p>
          <p className="mt-2 text-[12px] leading-4 font-medium text-info-500">
            동의 상태는 변경 즉시 반영됩니다.
          </p>
        </header>

        {updateConsent.isError ? (
          <p className="mt-3 text-[12px] leading-4 text-warning-700" role="alert">
            동의 변경에 실패했습니다. 다시 시도해 주세요.
          </p>
        ) : null}

        <div className="mt-5">
          <ConsentControls
            analysisDisabled={updateConsent.isPending}
            counselorDisabled
            followUpDisabled={updateConsent.isPending}
            hasAnalysisConsent={hasAnalysisConsent}
            hasCounselorConsent={false}
            hasFollowUpConsent={hasFollowUpConsent}
            onAnalysisChange={() => {
              if (hasAnalysisConsent) {
                setIsWithdrawalOpen(true)
                return
              }

              updateConsentStatus('ANALYSIS', true)
            }}
            onCounselorChange={() => undefined}
            onFollowUpChange={() => updateConsentStatus('FOLLOWUP_TRACKING', !hasFollowUpConsent)}
          />
        </div>

        <section className="mt-[58px]">
          <h2 className="text-[18px] leading-[21px] font-bold text-primary-200">
            데이터 활용 범위
          </h2>
          <ul className="mt-5 flex flex-col gap-1">
            {CONSENT_DATA_USAGE_ITEMS.map((item) => (
              <li
                className="rounded-[10px] bg-neutral-100 px-[14px] py-[10px] text-[13px] leading-4 text-secondary-300"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex justify-center py-10">
          <button
            className="border-b border-warning-500 py-0.5 text-[12px] leading-4 font-medium text-warning-700"
            disabled={!hasAnalysisConsent || updateConsent.isPending}
            onClick={() => setIsWithdrawalOpen(true)}
            type="button"
          >
            철회하기
          </button>
        </div>
      </div>

      <ServiceBottomNavigation activeItem="manage" />

      {isWithdrawalOpen ? (
        <ConsentWithdrawalDialog
          errorMessage={
            updateConsent.isError ? '동의 철회에 실패했습니다. 다시 시도해 주세요.' : undefined
          }
          isPending={updateConsent.isPending}
          onCancel={() => setIsWithdrawalOpen(false)}
          onConfirm={() => updateConsentStatus('ANALYSIS', false, true)}
        />
      ) : null}
    </MobileScreen>
  )
}
