'use client'

import { useState } from 'react'

import { ServiceBottomNavigation } from '@/features/navigation/ui/service-bottom-navigation'
import { BackLink, MobileScreen } from '@/shared/ui'

import { ConsentControls } from './consent-controls'
import { ConsentWithdrawalDialog } from './consent-withdrawal-dialog'

const DATA_USAGE_ITEMS = [
  '분석 동의: 사업자 거래 내역, 보정값, 예측 결과',
  '상담원 전송 동의: Recovery Packet (위험 기록, 원인, 선택안, 질문, 준비서류)',
  '사후 점검 동의: 실행 결과, 잔액 회복 여부, 연체 발생 여부',
  '데이터는 개인별 추천 개선과 제도 연결 성과 분석에 활용',
] as const

export function ConsentManagementScreen() {
  const [hasAnalysisConsent, setHasAnalysisConsent] = useState(true)
  const [hasCounselorConsent, setHasCounselorConsent] = useState(false)
  const [hasFollowUpConsent, setHasFollowUpConsent] = useState(true)
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false)

  function handleAnalysisChange() {
    if (hasAnalysisConsent) {
      setIsWithdrawalOpen(true)
      return
    }

    setHasAnalysisConsent(true)
  }

  function handleConfirmWithdrawal() {
    setHasAnalysisConsent(false)
    setIsWithdrawalOpen(false)
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
            최종 동의 변경일: 2025년 1월 15일
          </p>
        </header>

        <div className="mt-5">
          <ConsentControls
            hasAnalysisConsent={hasAnalysisConsent}
            hasCounselorConsent={hasCounselorConsent}
            hasFollowUpConsent={hasFollowUpConsent}
            onAnalysisChange={handleAnalysisChange}
            onCounselorChange={() => setHasCounselorConsent((value) => !value)}
            onFollowUpChange={() => setHasFollowUpConsent((value) => !value)}
          />
        </div>

        <section className="mt-[58px]">
          <h2 className="text-[18px] leading-[21px] font-bold text-primary-200">
            데이터 활용 범위
          </h2>
          <ul className="mt-5 flex flex-col gap-1">
            {DATA_USAGE_ITEMS.map((item) => (
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
          onCancel={() => setIsWithdrawalOpen(false)}
          onConfirm={handleConfirmWithdrawal}
        />
      ) : null}
    </MobileScreen>
  )
}
