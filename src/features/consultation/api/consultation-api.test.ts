import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  bookConsultation,
  getConsultation,
  getCounselors,
  getCounselorSlots,
} from './consultation-api'

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

describe('consultation API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('상담사 목록을 조회한다', async () => {
    const fetchMock = createJsonFetch([
      {
        counselorId: 1,
        name: '김상담',
        institution: null,
        branch: null,
        role: null,
      },
    ])
    vi.stubGlobal('fetch', fetchMock)

    const result = await getCounselors({ client: createApiClient(API_BASE_URL) })

    expect(result[0]?.name).toBe('김상담')
    expect(readRequest(fetchMock).url).toBe('https://api.example.com/api/counselors')
  })

  it('상담사의 기간별 슬롯을 조회한다', async () => {
    const fetchMock = createJsonFetch([])
    vi.stubGlobal('fetch', fetchMock)

    await getCounselorSlots(1, {
      client: createApiClient(API_BASE_URL),
      from: '2025-07-14T00:00:00Z',
      to: '2025-07-21T00:00:00Z',
    })

    expect(readRequest(fetchMock).url).toBe(
      'https://api.example.com/api/counselors/1/slots?from=2025-07-14T00%3A00%3A00Z&to=2025-07-21T00%3A00%3A00Z',
    )
  })

  it('선택 값만 포함한 예약 요청을 사업자 경로로 전송한다', async () => {
    let requestBody: unknown
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) {
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      }

      requestBody = await input.clone().json()

      return Response.json({
        success: true,
        data: {
          consultationId: 8,
          status: 'REQUESTED',
          channel: 'PHONE',
          scheduledAt: '2025-07-14T01:00:00Z',
        },
        error: null,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await bookConsultation(
      1,
      {
        channel: 'PHONE',
        counselorId: 7,
        slotId: 31,
        preQuestion: '준비할 서류가 있나요?',
        transferConsentGranted: true,
      },
      { client: createApiClient(API_BASE_URL) },
    )
    const request = fetchMock.mock.calls[0]?.[0]

    expect(result.consultationId).toBe(8)
    expect(request).toBeInstanceOf(Request)
    expect(request instanceof Request ? request.url : '').toBe(
      'https://api.example.com/api/businesses/1/consultations',
    )
    expect(requestBody).toEqual({
      channel: 'PHONE',
      counselorId: 7,
      slotId: 31,
      preQuestion: '준비할 서류가 있나요?',
      transferConsentGranted: true,
    })
    expect(requestBody).not.toHaveProperty('recoveryOptionIds')
  })

  it('상담 예약 상세를 조회한다', async () => {
    const fetchMock = createJsonFetch({
      consultationId: 8,
      businessId: 1,
      packetId: null,
      counselorId: 1,
      counselorName: '김상담',
      channel: 'PHONE',
      scheduledAt: '2025-07-14T01:00:00Z',
      purposeText: '현금흐름 위험 대응',
      preQuestion: null,
      transferConsentGranted: true,
      status: 'REQUESTED',
      recoveryOptionIds: [],
      finalDecision: null,
      resultNote: null,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getConsultation(8, { client: createApiClient(API_BASE_URL) })

    expect(result.status).toBe('REQUESTED')
    expect(readRequest(fetchMock).url).toBe('https://api.example.com/api/consultations/8')
  })
})
