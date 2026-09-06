'use client'

import Link from 'next/link'
import { useState } from 'react'

import { ServiceBottomNavigation } from '@/features/navigation/ui/service-bottom-navigation'
import { BackLink, Button, MobileScreen } from '@/shared/ui'

import { CONSENT_DATA_USAGE_ITEMS } from '../model/consent-data'
import { ConsentControls } from './consent-controls'

export function ConsentSetupScreen() {
  const [hasAnalysisConsent, setHasAnalysisConsent] = useState(false)
  const [hasCounselorConsent, setHasCounselorConsent] = useState(false)
  const [hasFollowUpConsent, setHasFollowUpConsent] = useState(false)

  return (
    <MobileScreen aria-label="분석 동의 선택 화면" className="min-h-[1170px]" mode="document">
      <BackLink href="/login" label="로그인으로 돌아가기" />

      <div className="px-6 pt-[102px]">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">분석 동의 선택</h1>
          <p className="mt-[6px] text-[13px] leading-4 text-secondary-300">
            현금흐름을 분석하려면 아래 동의가 필요합니다.
            <br />
            항목별 목적과 데이터 사용 범위를 확인한 뒤 선택해 주세요.
          </p>
          <Link
            className="mt-2 inline-block border-b border-primary-blue-300 text-[12px] leading-4 font-medium text-primary-blue-800"
            href="/data-scope"
          >
            분석에 포함되는 데이터 범위 확인
          </Link>
        </header>

        <div className="mt-5">
          <ConsentControls
            hasAnalysisConsent={hasAnalysisConsent}
            hasCounselorConsent={hasCounselorConsent}
            hasFollowUpConsent={hasFollowUpConsent}
            onAnalysisChange={() => setHasAnalysisConsent((value) => !value)}
            onCounselorChange={() => setHasCounselorConsent((value) => !value)}
            onFollowUpChange={() => setHasFollowUpConsent((value) => !value)}
          />
        </div>

        <section className="mt-10">
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

        <div className="mt-10 flex justify-center pb-10">
          {hasAnalysisConsent ? (
            <Link
              className="flex h-[50px] w-[230px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,#060c23_0%,#0e1b39_25%,#162a4f_50%,#27487a_100%)] text-[16px] leading-[22px] text-base-white"
              href="/cashflow"
            >
              분석 시작하기
            </Link>
          ) : (
            <Button className="h-[50px] w-[230px] rounded-full" disabled>
              분석 시작하기
            </Button>
          )}
        </div>
      </div>

      <ServiceBottomNavigation activeItem="manage" />
    </MobileScreen>
  )
}
