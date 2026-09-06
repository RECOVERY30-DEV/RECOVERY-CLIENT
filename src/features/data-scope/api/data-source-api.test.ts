import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { getDataSources } from './data-source-api'
import { parseDataSources } from './data-source-contract'

const dataSources = [
  {
    sourceType: 'BANK_ACCOUNT',
    institutionName: 'KB국민은행 · 신한은행',
    coverageRate: 95,
    periodMonths: 6,
    lastSyncedAt: '2025-07-14T21:14:00Z',
    syncStatus: 'SYNCED',
    belowThreshold: false,
  },
  {
    sourceType: 'CARD_SETTLEMENT',
    institutionName: 'BC카드 · KB카드 가맹점 정산',
    coverageRate: 92,
    periodMonths: 3,
    lastSyncedAt: '2025-07-13T14:42:00Z',
    syncStatus: 'SYNCED',
    belowThreshold: false,
  },
  {
    sourceType: 'LOAN',
    institutionName: 'IBK기업은행 사업자대출 약정',
    coverageRate: 88,
    periodMonths: 12,
    lastSyncedAt: '2025-07-14T21:00:00Z',
    syncStatus: 'SYNCED',
    belowThreshold: false,
  },
  {
    sourceType: 'AUTO_TRANSFER',
    institutionName: '공과금 · 구독 · 보험료 등',
    coverageRate: 61,
    periodMonths: 1,
    lastSyncedAt: '2025-07-11T00:00:00Z',
    syncStatus: 'PARTIAL',
    belowThreshold: true,
  },
]

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

describe('data source API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('네 데이터 출처를 파싱하고 자동이체의 낮은 반영률을 보존한다', () => {
    const result = parseDataSources(dataSources)

    expect(result).toHaveLength(4)
    expect(result[3]).toMatchObject({
      sourceType: 'AUTO_TRANSFER',
      coverageRate: 61,
      syncStatus: 'PARTIAL',
      belowThreshold: true,
    })
  })

  it('선택 정보가 비어 있는 출처도 허용한다', () => {
    const [result] = parseDataSources([
      {
        ...dataSources[0],
        institutionName: null,
        coverageRate: null,
        lastSyncedAt: null,
      },
    ])

    expect(result).toMatchObject({
      institutionName: null,
      coverageRate: null,
      lastSyncedAt: null,
    })
  })

  it('사업자 데이터 출처를 조회한다', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => apiResponse(dataSources))
    vi.stubGlobal('fetch', fetchMock)

    const result = await getDataSources(1, {
      client: createApiClient('https://api.example.com'),
    })
    const request = fetchMock.mock.calls[0]?.[0]

    expect(result[0]?.sourceType).toBe('BANK_ACCOUNT')
    expect(request).toBeInstanceOf(Request)
    expect(request instanceof Request ? request.url : '').toBe(
      'https://api.example.com/api/businesses/1/data-sources',
    )
  })
})
