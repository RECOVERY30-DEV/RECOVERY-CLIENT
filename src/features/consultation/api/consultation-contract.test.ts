import { describe, expect, it } from 'vitest'

import { ApiContractError } from '@/shared/api/api-response'

import {
  parseBookedConsultation,
  parseConsultation,
  parseCounselors,
  parseCounselorSlots,
} from './consultation-contract'

describe('consultation contract', () => {
  it('상담사 목록의 nullable 소속 정보를 보존한다', () => {
    expect(
      parseCounselors([
        {
          counselorId: 1,
          name: '김상담',
          institution: '소상공인시장진흥공단',
          branch: null,
          role: '경영지도사',
        },
      ]),
    ).toEqual([
      {
        counselorId: 1,
        name: '김상담',
        institution: '소상공인시장진흥공단',
        branch: null,
        role: '경영지도사',
      },
    ])
  })

  it('예약 가능한 슬롯의 정원과 상태를 파싱한다', () => {
    expect(
      parseCounselorSlots([
        {
          slotId: 31,
          startAt: '2025-07-14T01:00:00Z',
          endAt: '2025-07-14T01:30:00Z',
          capacity: 3,
          bookedCount: 1,
          remainingSeats: 2,
          status: 'OPEN',
          bookable: true,
        },
      ]),
    ).toEqual([
      {
        slotId: 31,
        startAt: '2025-07-14T01:00:00Z',
        endAt: '2025-07-14T01:30:00Z',
        capacity: 3,
        bookedCount: 1,
        remainingSeats: 2,
        status: 'OPEN',
        bookable: true,
      },
    ])
  })

  it('생성된 예약의 상태와 예약 시각을 파싱한다', () => {
    expect(
      parseBookedConsultation({
        consultationId: 8,
        status: 'REQUESTED',
        channel: 'PHONE',
        scheduledAt: '2025-07-14T01:00:00Z',
      }),
    ).toEqual({
      consultationId: 8,
      status: 'REQUESTED',
      channel: 'PHONE',
      scheduledAt: '2025-07-14T01:00:00Z',
    })
  })

  it('상담 상세의 nullable 필드와 회복안 ID를 보존한다', () => {
    expect(
      parseConsultation({
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
        status: 'CONFIRMED',
        recoveryOptionIds: [1, 3],
        finalDecision: null,
        resultNote: null,
      }),
    ).toMatchObject({
      consultationId: 8,
      packetId: null,
      preQuestion: null,
      status: 'CONFIRMED',
      recoveryOptionIds: [1, 3],
    })
  })

  it('Swagger에 없는 슬롯 상태를 계약 오류로 거부한다', () => {
    expect(() =>
      parseCounselorSlots([
        {
          slotId: 31,
          startAt: '2025-07-14T01:00:00Z',
          endAt: '2025-07-14T01:30:00Z',
          capacity: 3,
          bookedCount: 1,
          remainingSeats: 2,
          status: 'UNKNOWN',
          bookable: true,
        },
      ]),
    ).toThrow(ApiContractError)
  })
})
