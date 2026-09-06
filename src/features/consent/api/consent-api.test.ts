import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { getConsents, updateConsent } from './consent-api'

const API_BASE_URL = 'https://api.example.com'

const consents = [
  {
    typeCode: 'ANALYSIS',
    name: '서비스 분석 동의',
    required: true,
    status: 'GRANTED',
    grantedAt: '2025-07-14T23:32:00Z',
    withdrawnAt: null,
    lastChangedAt: '2025-07-14T23:32:00Z',
    consentVersion: 'v1.0',
  },
  {
    typeCode: 'FOLLOWUP_TRACKING',
    name: '30·60·90일 사후 점검 동의',
    required: false,
    status: 'WITHDRAWN',
    grantedAt: null,
    withdrawnAt: '2025-07-14T23:32:00Z',
    lastChangedAt: '2025-07-14T23:32:00Z',
    consentVersion: 'v1.0',
  },
  {
    typeCode: 'PACKET_TRANSFER',
    name: '상담원 전송 동의',
    required: false,
    status: 'NOT_SET',
    grantedAt: null,
    withdrawnAt: null,
    lastChangedAt: null,
    consentVersion: null,
  },
]

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

describe('consent API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('사업자의 동의 상태를 조회한다', async () => {
    const fetchMock = createJsonFetch(consents)
    vi.stubGlobal('fetch', fetchMock)

    await expect(getConsents(1, { client: createApiClient(API_BASE_URL) })).resolves.toEqual([
      { typeCode: 'ANALYSIS', status: 'GRANTED' },
      { typeCode: 'FOLLOWUP_TRACKING', status: 'WITHDRAWN' },
      { typeCode: 'PACKET_TRANSFER', status: 'NOT_SET' },
    ])
    expect(readRequest(fetchMock).url).toBe('https://api.example.com/api/businesses/1/consents')
  })

  it('동의 유형별 부여 여부를 PUT으로 저장한다', async () => {
    let requestBody: unknown
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) {
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      }

      requestBody = await input.clone().json()
      return Response.json({
        success: true,
        data: { typeCode: 'FOLLOWUP_TRACKING', status: 'GRANTED' },
        error: null,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      updateConsent(1, 'FOLLOWUP_TRACKING', true, { client: createApiClient(API_BASE_URL) }),
    ).resolves.toEqual({ typeCode: 'FOLLOWUP_TRACKING', status: 'GRANTED' })

    const request = readRequest(fetchMock)
    expect(request.method).toBe('PUT')
    expect(request.url).toBe('https://api.example.com/api/businesses/1/consents/FOLLOWUP_TRACKING')
    expect(requestBody).toEqual({ granted: true })
  })

  it('잘못된 사업자 식별자는 요청 전에 거부한다', () => {
    expect(() => getConsents(0)).toThrow(RangeError)
    expect(() => updateConsent(1, 'UNSUPPORTED' as never, true)).toThrow(RangeError)
  })
})
