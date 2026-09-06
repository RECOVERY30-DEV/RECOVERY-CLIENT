import { describe, expect, it } from 'vitest'

import { ApiContractError } from '@/shared/api/api-response'

import {
  parseProgramDocuments,
  parseProgramEligibility,
  parseProgramRecommendations,
  parseSupportProgramDetail,
  parseSupportPrograms,
} from './support-program-contract'

const programSummary = {
  programId: 1,
  programCode: 'SBIZ_STABLE_FUND',
  name: '소상공인 경영안정자금',
  agency: '소상공인시장진흥공단',
  supportContent: '운전자금 융자',
  limitAmount: 20000000,
  interestRateText: '연 3.4%',
  applyDeadline: '2025-07-31',
  status: 'ACTIVE',
}

describe('support program API contract', () => {
  it('Swagger 지원제도 목록 응답을 런타임 검증한다', () => {
    expect(parseSupportPrograms([programSummary])).toEqual([programSummary])
  })

  it('지원제도 상세의 nullable 값과 공식 URL을 보존한다', () => {
    const detail = {
      ...programSummary,
      limitAmount: null,
      interestRateText: '금리 별도 안내',
      termText: '3년 거치 5년 분할상환',
      applyUrl: 'https://example.com/apply',
      officialSourceUrl: 'https://example.com/notice',
      rulesetVersion: 'rule-2025-06',
    }

    expect(parseSupportProgramDetail(detail)).toEqual(detail)
  })

  it('필수 문서와 자격 판정, 추천 응답을 검증한다', () => {
    expect(
      parseProgramDocuments([
        { documentId: 5, name: '사업자등록증', description: null, required: true },
      ]),
    ).toEqual([{ documentId: 5, name: '사업자등록증', description: null, required: true }])
    expect(
      parseProgramEligibility({
        programCode: 'SBIZ_STABLE_FUND',
        result: 'LIKELY_PASS',
        reasonText: null,
        advisory: true,
        rulesetVersion: 'rule-2025-06',
        checkedAt: null,
        items: [
          {
            ruleCode: 'BIZ_AGE_1Y',
            label: '사업자등록 1년 이상',
            evaluationType: 'AUTO',
            result: 'LIKELY_PASS',
            noteText: '등록일 기준 충족 가능성 높음',
          },
        ],
      }),
    ).toMatchObject({ result: 'LIKELY_PASS', checkedAt: null })
    expect(
      parseProgramRecommendations([
        {
          rankNo: 1,
          programCode: 'SBIZ_STABLE_FUND',
          name: '소상공인 경영안정자금',
          agency: '소상공인시장진흥공단',
          applyDeadline: null,
          matchReason: '매출 감소 패턴이 조건과 유사합니다.',
        },
      ]),
    ).toHaveLength(1)
  })

  it('알 수 없는 Swagger enum을 계약 오류로 거부한다', () => {
    expect(() => parseSupportPrograms([{ ...programSummary, status: 'PENDING' }])).toThrow(
      ApiContractError,
    )
    expect(() =>
      parseProgramEligibility({
        programCode: 'SBIZ_STABLE_FUND',
        result: 'INVALID',
        reasonText: null,
        advisory: true,
        rulesetVersion: 'rule-2025-06',
        checkedAt: null,
        items: [],
      }),
    ).toThrow(ApiContractError)
  })
})
