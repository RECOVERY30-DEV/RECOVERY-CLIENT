import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  getRecoveryOptions,
  getRecoveryScenarios,
  saveRecoveryOptionSelections,
} from './recovery-option-api'

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

describe('recovery option API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('예측 실행의 회복안과 저장된 선택 상태를 조회한다', async () => {
    const fetchMock = createJsonFetch([
      {
        optionId: 3,
        optionCode: 'REPAYMENT_ADJUST',
        category: 'FINANCIAL_CONSULT',
        expectedEffectText: '부족일 최대 16일 연장 가능',
        monthlyBurdenChangeText: '월 상환액 약 15만 원 감소 예상',
        preconditionText: '원리금 3회 이상 정상 납부 이력',
        difficulty: 'LOW',
        requiresReview: true,
        disclaimer: '승인 여부와 조건은 금융기관 심사 결과에 따릅니다.',
        selected: true,
      },
    ])
    vi.stubGlobal('fetch', fetchMock)

    const result = await getRecoveryOptions(4821, { client: createApiClient(API_BASE_URL) })

    expect(result).toEqual([
      {
        optionId: 3,
        optionCode: 'REPAYMENT_ADJUST',
        category: 'FINANCIAL_CONSULT',
        expectedEffectText: '부족일 최대 16일 연장 가능',
        monthlyBurdenChangeText: '월 상환액 약 15만 원 감소 예상',
        preconditionText: '원리금 3회 이상 정상 납부 이력',
        difficulty: 'LOW',
        requiresReview: true,
        disclaimer: '승인 여부와 조건은 금융기관 심사 결과에 따릅니다.',
        selected: true,
      },
    ])
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/forecasts/4821/recovery-options',
    )
  })

  it('기준과 회복안 적용 시나리오를 조회한다', async () => {
    const fetchMock = createJsonFetch([
      {
        scenarioId: 1,
        scenarioType: 'BASELINE',
        firstShortfallDate: '2025-07-26',
        minBalance: -1240000,
        deltaDays: null,
        deltaMinBalance: null,
        monthlyPaymentDelta: null,
        note: '현재 데이터 기반 기준 시나리오입니다.',
        appliedOptionIds: [],
      },
      {
        scenarioId: 12,
        scenarioType: 'SIMULATED',
        firstShortfallDate: '2025-05-30',
        minBalance: -630000,
        deltaDays: 16,
        deltaMinBalance: 610000,
        monthlyPaymentDelta: -150000,
        note: '상담 및 심사 결과에 따라 실제 효과는 달라질 수 있습니다.',
        appliedOptionIds: [3],
      },
    ])
    vi.stubGlobal('fetch', fetchMock)

    const result = await getRecoveryScenarios(4821, { client: createApiClient(API_BASE_URL) })

    expect(result[0]).toMatchObject({ scenarioType: 'BASELINE', deltaDays: null })
    expect(result[1]).toMatchObject({ scenarioType: 'SIMULATED', deltaDays: 16 })
    expect(readRequest(fetchMock).url).toBe('https://api.example.com/api/forecasts/4821/scenarios')
  })

  it('최대 두 개의 선택 회복안 ID를 PUT으로 저장한다', async () => {
    let requestBody: unknown
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) {
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      }

      requestBody = await input.clone().json()

      return Response.json({
        success: true,
        data: { selectedOptionIds: [1, 3] },
        error: null,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await saveRecoveryOptionSelections(4821, [1, 3], {
      client: createApiClient(API_BASE_URL),
    })
    const request = readRequest(fetchMock)

    expect(result).toEqual({ selectedOptionIds: [1, 3] })
    expect(request.method).toBe('PUT')
    expect(request.url).toBe('https://api.example.com/api/forecasts/4821/option-selections')
    expect(requestBody).toEqual({ optionIds: [1, 3] })
  })
})
