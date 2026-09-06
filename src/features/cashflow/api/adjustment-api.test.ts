import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  acceptAdjustmentSuggestion,
  applyAdjustments,
  createAdjustment,
  deleteAdjustment,
  listAdjustmentSuggestions,
  listAdjustments,
  updateAdjustment,
} from './adjustment-api'

const API_BASE_URL = 'https://api.example.com'

function createJsonFetch(data: unknown) {
  return vi.fn<typeof fetch>(async () => Response.json({ success: true, data, error: null }))
}

function readRequest(fetchMock: ReturnType<typeof createJsonFetch>) {
  const request = fetchMock.mock.calls[0]?.[0]

  if (!(request instanceof Request)) {
    throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
  }

  return request
}

describe('adjustment API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('저장된 보정값과 제안 후보를 각각 조회한다', async () => {
    const adjustmentsFetch = createJsonFetch([
      {
        id: 1,
        adjustmentType: 'CASH_SALES',
        direction: 'I',
        amount: 650000,
        expectedDate: '2025-07-20',
        certainty: 'ESTIMATED',
        recurrenceRule: null,
        expenseCategory: null,
        fundSource: null,
        memo: '매주 토요일 현금 매출',
        status: 'SAVED',
        appliedRunId: 1,
        createdAt: '2025-07-14T00:00:00Z',
        updatedAt: '2025-07-14T00:00:00Z',
      },
    ])
    vi.stubGlobal('fetch', adjustmentsFetch)

    await expect(
      listAdjustments(1, { client: createApiClient(API_BASE_URL) }),
    ).resolves.toMatchObject([
      {
        adjustmentId: 1,
        adjustmentType: 'CASH_SALES',
        certainty: 'ESTIMATED',
        status: 'SAVED',
      },
    ])

    expect(readRequest(adjustmentsFetch).url).toBe(
      'https://api.example.com/api/businesses/1/adjustments',
    )

    const suggestionsFetch = createJsonFetch([
      {
        id: 2,
        adjustmentType: 'EXTERNAL_FUND',
        suggestedAmount: 850000,
        suggestedRule: '매월 말일',
        evidenceText: '최근 2개월 유사 패턴',
        confidence: 0.7,
        status: 'PROPOSED',
        acceptedAdjustmentId: null,
      },
    ])
    vi.stubGlobal('fetch', suggestionsFetch)

    await expect(
      listAdjustmentSuggestions(1, { client: createApiClient(API_BASE_URL) }),
    ).resolves.toMatchObject([
      {
        suggestionId: 2,
        adjustmentType: 'EXTERNAL_FUND',
        suggestedAmount: 850000,
        suggestedRule: '매월 말일',
        evidenceText: '최근 2개월 유사 패턴',
        confidence: 0.7,
        status: 'PROPOSED',
        acceptedAdjustmentId: null,
      },
    ])

    expect(readRequest(suggestionsFetch).url).toBe(
      'https://api.example.com/api/businesses/1/adjustment-suggestions',
    )
  })

  it('새 보정값을 작성한 payload 그대로 DRAFT로 생성한다', async () => {
    let requestBody: unknown
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request))
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      requestBody = await input.clone().json()
      return Response.json({
        success: true,
        data: adjustmentFixture({ id: 31, status: 'DRAFT' }),
        error: null,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await createAdjustment(
      1,
      {
        adjustmentType: 'CASH_SALES',
        amount: 650000,
        certainty: 'CONFIRMED',
        expectedDate: '2025-07-20',
        memo: '주말 현금매출',
      },
      { client: createApiClient(API_BASE_URL) },
    )

    expect(result.status).toBe('DRAFT')
    expect(readRequest(fetchMock).method).toBe('POST')
    expect(requestBody).toEqual({
      adjustmentType: 'CASH_SALES',
      amount: 650000,
      certainty: 'CONFIRMED',
      expectedDate: '2025-07-20',
      memo: '주말 현금매출',
    })
  })

  it('수정된 필드만 PATCH로 전송한다', async () => {
    let requestBody: unknown
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request))
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      requestBody = await input.clone().json()
      return Response.json({
        success: true,
        data: adjustmentFixture({ amount: 700000 }),
        error: null,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await updateAdjustment(1, 31, { amount: 700000 }, { client: createApiClient(API_BASE_URL) })

    expect(readRequest(fetchMock).method).toBe('PATCH')
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/businesses/1/adjustments/31',
    )
    expect(requestBody).toEqual({ amount: 700000 })
  })

  it('보정 ID로 삭제 요청을 전송한다', async () => {
    const fetchMock = createJsonFetch(adjustmentFixture({ status: 'DISCARDED' }))
    vi.stubGlobal('fetch', fetchMock)

    await deleteAdjustment(1, 31, { client: createApiClient(API_BASE_URL) })

    expect(readRequest(fetchMock).method).toBe('DELETE')
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/businesses/1/adjustments/31',
    )
  })

  it('PROPOSED 후보를 수락한 결과를 반환한다', async () => {
    const fetchMock = createJsonFetch({
      id: 12,
      adjustmentType: 'CASH_SALES',
      suggestedAmount: 1200000,
      suggestedRule: '매월 15일',
      evidenceText: '최근 3개월 동일 패턴',
      confidence: 0.82,
      status: 'ACCEPTED',
      acceptedAdjustmentId: 32,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await acceptAdjustmentSuggestion(1, 12, {
      client: createApiClient(API_BASE_URL),
    })

    expect(result).toMatchObject({ suggestionId: 12, status: 'ACCEPTED', acceptedAdjustmentId: 32 })
    expect(readRequest(fetchMock).method).toBe('POST')
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/businesses/1/adjustment-suggestions/12/accept',
    )
  })

  it('보정값 적용을 요청하고 적용 결과를 반환한다', async () => {
    const fetchMock = createJsonFetch({ appliedCount: 2, appliedRunId: 9 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await applyAdjustments(1, { client: createApiClient(API_BASE_URL) })

    expect(result).toEqual({ appliedCount: 2, appliedRunId: 9 })
    expect(readRequest(fetchMock).method).toBe('POST')
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/businesses/1/adjustments/apply',
    )
  })
})

function adjustmentFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    adjustmentType: 'CASH_SALES',
    amount: 650000,
    certainty: 'CONFIRMED',
    expectedDate: '2025-07-20',
    status: 'SAVED',
    memo: null,
    ...overrides,
  }
}
