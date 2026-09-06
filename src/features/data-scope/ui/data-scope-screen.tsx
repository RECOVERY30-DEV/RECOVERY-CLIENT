import Link from 'next/link'

import {
  DATA_SOURCE_STATUSES,
  EXCLUDED_DATA_ITEMS,
} from '@/features/data-scope/model/data-scope-data'
import { BackLink, MobileScreen } from '@/shared/ui'

import { DataSourceCard } from './data-source-card'

export function DataScopeScreen() {
  return (
    <MobileScreen aria-label="분석 데이터 범위 화면" className="min-h-[1443px]" mode="document">
      <BackLink href="/home" label="홈으로 돌아가기" />

      <div className="px-6 pt-[102px] pb-[90px]">
        <header>
          <h1 className="text-[18px] leading-[21px] font-bold text-primary-200">
            분석 데이터 범위
          </h1>
          <div className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-[10px] text-secondary-300">
            <p className="text-[13px] leading-4">이번 예측에 포함된 데이터</p>
            <p className="mt-1 text-[11px] leading-[13px]">2025년 6월 12일 기준 · 향후 30일 분석</p>
            <p className="mt-1 text-[11px] leading-[13px]">
              사업자계좌 / 카드정산 / 대출 / 자동이체
            </p>
          </div>
        </header>

        <section className="mt-[35px]">
          <h2 className="text-[18px] leading-[21px] font-bold text-primary-200">
            출처별 데이터 현황
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            {DATA_SOURCE_STATUSES.map((source) => (
              <DataSourceCard key={source.kind} {...source} />
            ))}
          </div>
        </section>

        <section className="mt-[35px]">
          <h2 className="text-[18px] leading-[21px] font-bold text-primary-200">
            예측 미반영 정보
          </h2>
          <ul className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-[10px]">
            {EXCLUDED_DATA_ITEMS.map((item) => (
              <li className="text-[11px] leading-4 text-secondary-300" key={item}>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-[15px] text-[11px] leading-[13px] text-secondary-300">
            위 항목은 보정 입력을 통해 직접 추가할 수 있습니다.
          </p>
        </section>

        <section className="mt-[35px] rounded-[10px] bg-neutral-100 px-[14px] py-[10px]">
          <h2 className="text-[14px] leading-[17px] font-medium text-neutral-900">
            분석 한계 안내
          </h2>
          <p className="mt-[15px] text-[12px] leading-[15px] text-secondary-300">
            이 예측은 연결된 계좌와 카드 데이터를 기반으로 한 추정 범위입니다. 실제 현금흐름과
            차이가 있을 수 있으며, 금융 승인·대출 한도·지원 자격은 이 분석으로 확정되지 않습니다.
            최종 판단은 상담자 및 공식 출처를 통해 확인하세요.
          </p>
        </section>

        <section className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-[10px]">
          <span className="inline-flex rounded-full border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-[6px] text-[12px] leading-[14px] text-neutral-900">
            Coverage 낮음
          </span>
          <h2 className="mt-[10px] text-[14px] leading-[17px] font-medium text-neutral-900">
            판단 보류 상태
          </h2>
          <p className="mt-[5px] text-[12px] leading-[15px] text-secondary-300">
            자동이체 데이터 Coverage가 낮아 예측의 신뢰도가 제한됩니다. 판단보류 안내를 확인하거나
            누락 정보를 직접 보정할 수 있습니다.
          </p>
          <Link
            className="mt-[10px] flex h-[42px] w-full items-center justify-center rounded-lg bg-neutral-400 text-[16px] leading-5 font-medium text-primary-blue-800"
            href="/cashflow/pending"
          >
            오류 확인
          </Link>
        </section>
      </div>
    </MobileScreen>
  )
}
