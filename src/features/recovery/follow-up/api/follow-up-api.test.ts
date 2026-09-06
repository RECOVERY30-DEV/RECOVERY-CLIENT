import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { getFollowupResult, getFollowups, getRecoveryExecutionStatuses } from './follow-up-api'

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

describe('follow-up API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('사업자의 D30·D60·D90 사후점검 일정을 조회한다', async () => {
    const fetchMock = createJsonFetch([
      {
        id: 1,
        checkpoint: 'D30',
        scheduledDate: '2025-08-14',
        status: 'DONE',
        forecastRunId: 1,
        packetId: null,
        hasResult: true,
      },
      {
        id: 2,
        checkpoint: 'D60',
        scheduledDate: '2025-09-13',
        status: 'SCHEDULED',
        forecastRunId: 1,
        packetId: null,
        hasResult: false,
      },
    ])
    vi.stubGlobal('fetch', fetchMock)

    const result = await getFollowups(1, { client: createApiClient(API_BASE_URL) })

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ checkpoint: 'D30', hasResult: true })
    expect(readRequest(fetchMock).url).toBe('https://api.example.com/api/businesses/1/followups')
  })

  it('기록된 사후점검 결과를 조회한다', async () => {
    const fetchMock = createJsonFetch({
      scheduleId: 1,
      balanceRecovered: 'PARTIAL',
      delinquency: false,
      baselineBalance: -1280000,
      currentBalance: 360000,
      recoveryAmount: 1640000,
      latestForecastRunId: 1,
      riskStatus: 'STABLE',
      recordedAt: '2025-08-14T09:00:00Z',
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getFollowupResult(1, { client: createApiClient(API_BASE_URL) })

    expect(result).toMatchObject({
      balanceRecovered: 'PARTIAL',
      recoveryAmount: 1640000,
      riskStatus: 'STABLE',
    })
    expect(readRequest(fetchMock).url).toBe('https://api.example.com/api/followups/1/result')
  })

  it('회복안 실행 상태와 차단 사유를 조회한다', async () => {
    const fetchMock = createJsonFetch([
      {
        id: 3,
        recoveryOptionId: 1,
        status: 'IN_PROGRESS',
        blockerText: null,
        forecastRunId: 1,
        updatedAt: '2025-08-14T09:00:00Z',
      },
      {
        id: 4,
        recoveryOptionId: 3,
        status: 'BLOCKED',
        blockerText: '임대인 회신 지연',
        forecastRunId: 1,
        updatedAt: '2025-08-14T09:00:00Z',
      },
    ])
    vi.stubGlobal('fetch', fetchMock)

    const result = await getRecoveryExecutionStatuses(1, {
      client: createApiClient(API_BASE_URL),
    })

    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({ status: 'BLOCKED', blockerText: '임대인 회신 지연' })
    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/businesses/1/recovery-execution-status',
    )
  })
})
