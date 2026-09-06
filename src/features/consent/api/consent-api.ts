import type { KyInstance } from 'ky'

import { getApiData, putApiData, type ApiRequestOptions } from '@/shared/api/api-request'

import { parseConsent, parseConsents, type Consent, type ConsentTypeCode } from './consent-contract'

type ConsentRequestOptions = Readonly<{
  client?: KyInstance
  signal?: AbortSignal
}>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
  }
}

function assertConsentTypeCode(value: string): asserts value is ConsentTypeCode {
  if (value !== 'ANALYSIS' && value !== 'FOLLOWUP_TRACKING' && value !== 'PACKET_TRANSFER') {
    throw new RangeError('지원하지 않는 동의 유형입니다.')
  }
}

function toApiRequestOptions(options: ConsentRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

export function getConsents(businessId: number, options: ConsentRequestOptions = {}) {
  assertPositiveIdentifier(businessId, 'businessId')

  return getApiData(
    `/api/businesses/${businessId}/consents`,
    parseConsents,
    toApiRequestOptions(options),
  )
}

export function updateConsent(
  businessId: number,
  typeCode: ConsentTypeCode,
  granted: boolean,
  options: ConsentRequestOptions = {},
): Promise<Consent> {
  assertPositiveIdentifier(businessId, 'businessId')
  assertConsentTypeCode(typeCode)

  return putApiData(
    `/api/businesses/${businessId}/consents/${typeCode}`,
    { granted },
    parseConsent,
    toApiRequestOptions(options),
  )
}
