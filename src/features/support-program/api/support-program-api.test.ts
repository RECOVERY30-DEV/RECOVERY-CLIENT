import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  getProgramDocuments,
  getProgramEligibility,
  getProgramRecommendations,
  getSupportProgram,
  getSupportPrograms,
} from './support-program-api'

const API_BASE_URL = 'https://api.example.com'

function createJsonFetch(data: unknown) {
  return vi.fn<typeof fetch>(async () =>
    Response.json({
      success: true,
      data,
      error: null,
    }),
  )
}

function readRequest(fetchMock: ReturnType<typeof createJsonFetch>) {
  const request = fetchMock.mock.calls[0]?.[0]

  if (!(request instanceof Request)) {
    throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
  }

  return request
}

const program = {
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

describe('support program API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('신청 가능 여부와 함께 지원제도 목록을 조회한다', async () => {
    const fetchMock = createJsonFetch([program])
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getSupportPrograms({ applicableOnly: true, client: createApiClient(API_BASE_URL) }),
    ).resolves.toEqual([program])
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/support-programs?applicableOnly=true',
    )
  })

  it('지원제도 상세와 필요서류를 프로그램 코드로 조회한다', async () => {
    const detailFetch = createJsonFetch({
      ...program,
      termText: '3년 거치 5년 분할상환',
      applyUrl: 'https://example.com/apply',
      officialSourceUrl: 'https://example.com/notice',
      rulesetVersion: 'rule-2025-06',
    })
    vi.stubGlobal('fetch', detailFetch)

    await getSupportProgram('SBIZ_STABLE_FUND', { client: createApiClient(API_BASE_URL) })
    expect(readRequest(detailFetch).url).toBe(
      'https://api.example.com/api/support-programs/SBIZ_STABLE_FUND',
    )

    const documentsFetch = createJsonFetch([
      { documentId: 5, name: '사업자등록증', description: null, required: true },
    ])
    vi.stubGlobal('fetch', documentsFetch)
    await getProgramDocuments('SBIZ_STABLE_FUND', { client: createApiClient(API_BASE_URL) })
    expect(readRequest(documentsFetch).url).toBe(
      'https://api.example.com/api/support-programs/SBIZ_STABLE_FUND/documents',
    )
  })

  it('사업자 자격과 예측 실행별 추천을 조회한다', async () => {
    const eligibilityFetch = createJsonFetch({
      programCode: 'SBIZ_STABLE_FUND',
      result: 'LIKELY_PASS',
      reasonText: '조건과 유사합니다.',
      advisory: true,
      rulesetVersion: 'rule-2025-06',
      checkedAt: null,
      items: [],
    })
    vi.stubGlobal('fetch', eligibilityFetch)
    await getProgramEligibility(1, 'SBIZ_STABLE_FUND', { client: createApiClient(API_BASE_URL) })
    expect(readRequest(eligibilityFetch).url).toBe(
      'https://api.example.com/api/businesses/1/support-programs/SBIZ_STABLE_FUND/eligibility',
    )

    const recommendationsFetch = createJsonFetch([])
    vi.stubGlobal('fetch', recommendationsFetch)
    await getProgramRecommendations(4821, { client: createApiClient(API_BASE_URL) })
    expect(readRequest(recommendationsFetch).url).toBe(
      'https://api.example.com/api/forecasts/4821/program-recommendations',
    )
  })

  it('0 이하 식별자는 요청 전에 거부한다', () => {
    expect(() => getProgramEligibility(0, 'SBIZ_STABLE_FUND')).toThrow(RangeError)
    expect(() => getProgramRecommendations(0)).toThrow(RangeError)
  })
})
