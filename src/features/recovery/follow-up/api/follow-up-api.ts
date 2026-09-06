import type { KyInstance } from 'ky'

import { getApiData, type ApiRequestOptions } from '@/shared/api/api-request'

import {
  parseFollowupResult,
  parseFollowups,
  parseRecoveryExecutionStatuses,
} from './follow-up-contract'

type FollowUpRequestOptions = Readonly<{
  client?: KyInstance
  signal?: AbortSignal
}>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
  }
}

function toApiRequestOptions(options: FollowUpRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

export function getFollowups(businessId: number, options: FollowUpRequestOptions = {}) {
  assertPositiveIdentifier(businessId, 'businessId')

  return getApiData(
    `/api/businesses/${businessId}/followups`,
    parseFollowups,
    toApiRequestOptions(options),
  )
}

export function getFollowupResult(scheduleId: number, options: FollowUpRequestOptions = {}) {
  assertPositiveIdentifier(scheduleId, 'scheduleId')

  return getApiData(
    `/api/followups/${scheduleId}/result`,
    parseFollowupResult,
    toApiRequestOptions(options),
  )
}

export function getRecoveryExecutionStatuses(
  businessId: number,
  options: FollowUpRequestOptions = {},
) {
  assertPositiveIdentifier(businessId, 'businessId')

  return getApiData(
    `/api/businesses/${businessId}/recovery-execution-status`,
    parseRecoveryExecutionStatuses,
    toApiRequestOptions(options),
  )
}
