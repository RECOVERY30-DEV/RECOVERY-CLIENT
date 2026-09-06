import type { KyInstance } from 'ky'

import { getApiData, postApiData, type ApiRequestOptions } from '@/shared/api/api-request'

import {
  parseBookedConsultation,
  parseConsultation,
  parseCounselors,
  parseCounselorSlots,
  type BookConsultationCommand,
} from './consultation-contract'

type ConsultationRequestOptions = Readonly<{
  client?: KyInstance
  signal?: AbortSignal
}>

type CounselorSlotRequestOptions = ConsultationRequestOptions &
  Readonly<{
    from?: string
    to?: string
  }>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
  }
}

function toApiRequestOptions(options: ConsultationRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

export function getCounselors(options: ConsultationRequestOptions = {}) {
  return getApiData('/api/counselors', parseCounselors, toApiRequestOptions(options))
}

export function getCounselorSlots(counselorId: number, options: CounselorSlotRequestOptions = {}) {
  assertPositiveIdentifier(counselorId, 'counselorId')

  return getApiData(`/api/counselors/${counselorId}/slots`, parseCounselorSlots, {
    ...toApiRequestOptions(options),
    searchParams: {
      ...(options.from === undefined ? {} : { from: options.from }),
      ...(options.to === undefined ? {} : { to: options.to }),
    },
  })
}

export function bookConsultation(
  businessId: number,
  command: BookConsultationCommand,
  options: ConsultationRequestOptions = {},
) {
  assertPositiveIdentifier(businessId, 'businessId')

  return postApiData(
    `/api/businesses/${businessId}/consultations`,
    command,
    parseBookedConsultation,
    toApiRequestOptions(options),
  )
}

export function getConsultation(consultationId: number, options: ConsultationRequestOptions = {}) {
  assertPositiveIdentifier(consultationId, 'consultationId')

  return getApiData(
    `/api/consultations/${consultationId}`,
    parseConsultation,
    toApiRequestOptions(options),
  )
}
