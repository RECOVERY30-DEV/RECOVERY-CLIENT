'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { BackLink, MobileScreen } from '@/shared/ui'

import { SUPPORT_PROGRAMS, type SupportProgramCategory } from '../model/support-program-data'
import { SupportProgramCard } from './support-program-card'
import { SupportProgramFilters } from './support-program-filters'

export function SupportProgramListScreen(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SupportProgramCategory>('전체')
  const [region, setRegion] = useState('전체')
  const [isApplicationOpenOnly, setIsApplicationOpenOnly] = useState(false)

  const filteredPrograms = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase('ko-KR')

    return SUPPORT_PROGRAMS.filter((program) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        [program.title, program.institution, program.category]
          .join(' ')
          .toLocaleLowerCase('ko-KR')
          .includes(normalizedSearchTerm)
      const matchesCategory = selectedCategory === '전체' || program.category === selectedCategory
      const matchesRegion = region === '전체' || program.regions.includes(region)
      const matchesApplication = !isApplicationOpenOnly || program.isApplicationOpen

      return matchesSearch && matchesCategory && matchesRegion && matchesApplication
    })
  }, [isApplicationOpenOnly, region, searchTerm, selectedCategory])

  return (
    <MobileScreen aria-label="지원사업 목록 화면" className="min-h-[1280px]" mode="document">
      <BackLink href="/recovery/compare" label="회복안 비교로 돌아가기" />
      <div className="px-6 pt-[102px] pb-[62px]">
        <header>
          <h1 className="typo-sub-header-2 text-primary-200">지원사업</h1>
          <p className="mt-[6px] typo-body-6 text-secondary-300">
            현재 상황을 바탕으로 확인할 수 있는 지원사업입니다.
          </p>
        </header>

        <div className="mt-5">
          <SupportProgramFilters
            isApplicationOpenOnly={isApplicationOpenOnly}
            onApplicationOpenOnlyChange={setIsApplicationOpenOnly}
            onCategoryChange={setSelectedCategory}
            onRegionChange={setRegion}
            onSearchChange={setSearchTerm}
            region={region}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />
        </div>

        <section aria-labelledby="support-program-results-title" className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="typo-body-6 text-secondary-300" id="support-program-results-title">
              검색 결과
            </h2>
            <p aria-live="polite" className="typo-caption-1 text-primary-blue-500">
              총 {filteredPrograms.length}건
            </p>
          </div>

          {filteredPrograms.length > 0 ? (
            <div className="mt-[15px] space-y-[15px]">
              {filteredPrograms.map((program) => (
                <SupportProgramCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <p className="mt-[15px] rounded-[10px] bg-neutral-100 p-[14px] typo-body-6 text-secondary-300">
              조건에 맞는 지원사업이 없습니다.
            </p>
          )}
        </section>

        <section
          aria-labelledby="support-program-source-title"
          className="mt-5 rounded-[10px] bg-neutral-100 p-[14px]"
        >
          <h2 className="typo-body-5 text-primary-100" id="support-program-source-title">
            출처 안내
          </h2>
          <p className="mt-1 typo-caption-3 text-secondary-300">
            지원 조건과 신청 일정은 공식 출처에서 최신 정보를 확인하세요.
          </p>
        </section>

        <Link
          className="mt-5 inline-flex h-[42px] w-full items-center justify-center rounded-[8px] bg-secondary-700 px-[22px] py-2 typo-body-3 text-base-white transition-colors hover:bg-secondary-400 focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/recovery/consultation?program=small-business-stability-fund"
        >
          지원사업 상담 예약
        </Link>
      </div>
    </MobileScreen>
  )
}
