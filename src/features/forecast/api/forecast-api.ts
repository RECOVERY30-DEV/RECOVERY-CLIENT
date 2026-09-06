import type { KyInstance } from 'ky'

import { getApiData, type ApiRequestOptions } from '@/shared/api/api-request'

import {
  parseForecastCoverage,
  parseForecastMinBalance,
  parseForecastRiskDrivers,
  parseForecastSafetyBuffer,
  parseForecastShortfall,
  parseLatestForecast,
} from './forecast-contract'

type ForecastRequestOptions = Readonly<{
  client?: KyInstance
  signal?: AbortSignal
}>

type RiskDriverRequestOptions = ForecastRequestOptions &
  Readonly<{
    limit?: number
    includeEvidence?: boolean
  }>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
  }
}

function toApiRequestOptions(options: ForecastRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

export function getLatestForecast(businessId: number, options: ForecastRequestOptions = {}) {
  assertPositiveIdentifier(businessId, 'businessId')

  return getApiData(
    `/api/businesses/${businessId}/forecasts/latest`,
    parseLatestForecast,
    toApiRequestOptions(options),
  )
}

export function getForecastMinBalance(forecastRunId: number, options: ForecastRequestOptions = {}) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(
    `/api/forecasts/${forecastRunId}/min-balance`,
    parseForecastMinBalance,
    toApiRequestOptions(options),
  )
}

export function getForecastShortfall(forecastRunId: number, options: ForecastRequestOptions = {}) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(
    `/api/forecasts/${forecastRunId}/shortfall`,
    parseForecastShortfall,
    toApiRequestOptions(options),
  )
}

export function getForecastSafetyBuffer(
  forecastRunId: number,
  options: ForecastRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(
    `/api/forecasts/${forecastRunId}/safety-buffer`,
    parseForecastSafetyBuffer,
    toApiRequestOptions(options),
  )
}

export function getForecastRiskDrivers(
  forecastRunId: number,
  options: RiskDriverRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  if (options.limit !== undefined) {
    assertPositiveIdentifier(options.limit, 'limit')
  }

  return getApiData(`/api/forecasts/${forecastRunId}/risk-drivers`, parseForecastRiskDrivers, {
    ...toApiRequestOptions(options),
    searchParams: {
      ...(options.limit === undefined ? {} : { limit: options.limit }),
      ...(options.includeEvidence === true ? { include: 'evidence' } : {}),
    },
  })
}

export function getForecastCoverage(forecastRunId: number, options: ForecastRequestOptions = {}) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(
    `/api/forecasts/${forecastRunId}/coverage`,
    parseForecastCoverage,
    toApiRequestOptions(options),
  )
}
