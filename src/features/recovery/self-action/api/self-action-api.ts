import type { KyInstance } from 'ky'

import {
  getApiData,
  patchApiData,
  postApiData,
  type ApiRequestOptions,
} from '@/shared/api/api-request'

import {
  parseSelfActionItem,
  parseSelfActionPlan,
  parseSelfActionPlans,
  type SelfActionItemStatus,
} from './self-action-contract'

type SelfActionRequestOptions = Readonly<{ client?: KyInstance; signal?: AbortSignal }>

export type CreateSelfActionPlanInput = Readonly<{
  recoveryOptionId: number
  expectedEffectText?: string
  items: readonly Readonly<{ title: string; targetDate?: string; memo?: string }>[]
}>

export type UpdateSelfActionItemInput = Readonly<{
  title?: string
  targetDate?: string
  status?: SelfActionItemStatus
  memo?: string
}>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
}

function requestOptions(options: SelfActionRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

export function getSelfActionPlans(forecastRunId: number, options: SelfActionRequestOptions = {}) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')
  return getApiData(
    `/api/forecasts/${forecastRunId}/self-action-plans`,
    parseSelfActionPlans,
    requestOptions(options),
  )
}

export function createSelfActionPlan(
  forecastRunId: number,
  input: CreateSelfActionPlanInput,
  options: SelfActionRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')
  assertPositiveIdentifier(input.recoveryOptionId, 'recoveryOptionId')
  if (input.items.some((item) => item.title.trim().length === 0)) {
    throw new RangeError('준비 항목 제목은 비어 있을 수 없습니다.')
  }
  return postApiData(
    `/api/forecasts/${forecastRunId}/self-action-plans`,
    input,
    parseSelfActionPlan,
    requestOptions(options),
  )
}

export function updateSelfActionItem(
  forecastRunId: number,
  itemId: number,
  input: UpdateSelfActionItemInput,
  options: SelfActionRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')
  assertPositiveIdentifier(itemId, 'itemId')
  return patchApiData(
    `/api/forecasts/${forecastRunId}/self-action-plans/items/${itemId}`,
    input,
    parseSelfActionItem,
    requestOptions(options),
  )
}
