import type { KyInstance } from 'ky'

import {
  deleteApiData,
  getApiData,
  patchApiData,
  postApiData,
  type ApiRequestOptions,
} from '@/shared/api/api-request'

import {
  parseAdjustment,
  parseAdjustments,
  parseAdjustmentSuggestions,
  parseAppliedAdjustments,
  type AdjustmentSuggestion,
  type CreateAdjustmentCommand,
  type UpdateAdjustmentCommand,
} from './adjustment-contract'

type AdjustmentRequestOptions = Readonly<{ client?: KyInstance; signal?: AbortSignal }>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
}

function toApiRequestOptions(options: AdjustmentRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

function assertCommand(command: CreateAdjustmentCommand | UpdateAdjustmentCommand): void {
  if (
    'amount' in command &&
    command.amount !== undefined &&
    (!Number.isFinite(command.amount) || command.amount <= 0)
  ) {
    throw new RangeError('amount는 0보다 커야 합니다.')
  }
}

export function listAdjustments(businessId: number, options: AdjustmentRequestOptions = {}) {
  assertPositiveIdentifier(businessId, 'businessId')
  return getApiData(
    `/api/businesses/${businessId}/adjustments`,
    parseAdjustments,
    toApiRequestOptions(options),
  )
}

export function createAdjustment(
  businessId: number,
  command: CreateAdjustmentCommand,
  options: AdjustmentRequestOptions = {},
) {
  assertPositiveIdentifier(businessId, 'businessId')
  assertCommand(command)
  return postApiData(
    `/api/businesses/${businessId}/adjustments`,
    command,
    parseAdjustment,
    toApiRequestOptions(options),
  )
}

export function updateAdjustment(
  businessId: number,
  adjustmentId: number,
  command: UpdateAdjustmentCommand,
  options: AdjustmentRequestOptions = {},
) {
  assertPositiveIdentifier(businessId, 'businessId')
  assertPositiveIdentifier(adjustmentId, 'adjustmentId')
  assertCommand(command)
  return patchApiData(
    `/api/businesses/${businessId}/adjustments/${adjustmentId}`,
    command,
    parseAdjustment,
    toApiRequestOptions(options),
  )
}

export function deleteAdjustment(
  businessId: number,
  adjustmentId: number,
  options: AdjustmentRequestOptions = {},
) {
  assertPositiveIdentifier(businessId, 'businessId')
  assertPositiveIdentifier(adjustmentId, 'adjustmentId')
  return deleteApiData(
    `/api/businesses/${businessId}/adjustments/${adjustmentId}`,
    parseAdjustment,
    toApiRequestOptions(options),
  )
}

export function listAdjustmentSuggestions(
  businessId: number,
  options: AdjustmentRequestOptions = {},
) {
  assertPositiveIdentifier(businessId, 'businessId')
  return getApiData(
    `/api/businesses/${businessId}/adjustment-suggestions`,
    parseAdjustmentSuggestions,
    toApiRequestOptions(options),
  )
}

export function acceptAdjustmentSuggestion(
  businessId: number,
  suggestionId: number,
  options: AdjustmentRequestOptions = {},
) {
  assertPositiveIdentifier(businessId, 'businessId')
  assertPositiveIdentifier(suggestionId, 'suggestionId')
  return postApiData(
    `/api/businesses/${businessId}/adjustment-suggestions/${suggestionId}/accept`,
    {},
    (value): AdjustmentSuggestion => {
      const suggestions = parseAdjustmentSuggestions([value])
      return suggestions[0] as AdjustmentSuggestion
    },
    toApiRequestOptions(options),
  )
}

export function applyAdjustments(businessId: number, options: AdjustmentRequestOptions = {}) {
  assertPositiveIdentifier(businessId, 'businessId')
  return postApiData(
    `/api/businesses/${businessId}/adjustments/apply`,
    {},
    parseAppliedAdjustments,
    toApiRequestOptions(options),
  )
}
