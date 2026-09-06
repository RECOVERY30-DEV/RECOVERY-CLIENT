import { HTTPError, type KyInstance } from 'ky'

import { getApiData, type ApiRequestOptions } from '@/shared/api/api-request'
import { apiClient } from '@/shared/api/api-client'
import { ApiContractError, ApiError, parseApiResponse } from '@/shared/api/api-response'

import {
  parseRecoveryOptionSelections,
  parseRecoveryOptions,
  parseRecoveryScenarios,
} from './recovery-option-contract'

type RecoveryOptionRequestOptions = Readonly<{
  client?: KyInstance
  signal?: AbortSignal
}>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
  }
}

function toApiRequestOptions(options: RecoveryOptionRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

function assertOptionIds(optionIds: readonly number[]): void {
  if (
    optionIds.length > 2 ||
    optionIds.some((optionId) => !Number.isSafeInteger(optionId) || optionId <= 0)
  ) {
    throw new RangeError('optionIds는 최대 2개의 1 이상 정수여야 합니다.')
  }
}

async function putApiData<T>(
  path: string,
  body: unknown,
  parseData: (data: unknown) => T,
  options: RecoveryOptionRequestOptions,
): Promise<T> {
  const client = options.client ?? apiClient

  try {
    const payload = await client
      .put(path, {
        json: body,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
      .json<unknown>()

    return parseApiResponse(payload, parseData)
  } catch (error) {
    if (error instanceof ApiError || error instanceof ApiContractError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    if (error instanceof HTTPError) {
      throw new ApiError(`API 요청에 실패했습니다. (${error.response.status})`, {
        status: error.response.status,
        cause: error,
      })
    }

    throw new ApiError('서버와 통신할 수 없습니다.', { cause: error })
  }
}

export function getRecoveryOptions(
  forecastRunId: number,
  options: RecoveryOptionRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(
    `/api/forecasts/${forecastRunId}/recovery-options`,
    parseRecoveryOptions,
    toApiRequestOptions(options),
  )
}

export function getRecoveryScenarios(
  forecastRunId: number,
  options: RecoveryOptionRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(
    `/api/forecasts/${forecastRunId}/scenarios`,
    parseRecoveryScenarios,
    toApiRequestOptions(options),
  )
}

export function saveRecoveryOptionSelections(
  forecastRunId: number,
  optionIds: readonly number[],
  options: RecoveryOptionRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')
  assertOptionIds(optionIds)

  return putApiData(
    `/api/forecasts/${forecastRunId}/option-selections`,
    { optionIds },
    parseRecoveryOptionSelections,
    options,
  )
}
