import type { KyInstance } from 'ky'

import { getApiData, type ApiRequestOptions } from '@/shared/api/api-request'

import {
  parseDailyDetailView,
  parseDailyViews,
  parseNarrativeViews,
  type NarrativeKind,
} from './forecast-timeline-contract'

export type RequestOptions = Readonly<{
  client?: KyInstance
  signal?: AbortSignal
}>

export type NarrativeRequestOptions = RequestOptions &
  Readonly<{
    kind?: NarrativeKind
  }>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
  }
}

function assertDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError('date는 YYYY-MM-DD 형식이어야 합니다.')
  }
}

function toApiRequestOptions(options: RequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

export function getForecastDaily(forecastRunId: number, options: RequestOptions = {}) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(
    `/api/forecasts/${forecastRunId}/daily`,
    parseDailyViews,
    toApiRequestOptions(options),
  )
}

export function getForecastDailyDetail(
  forecastRunId: number,
  date: string,
  options: RequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')
  assertDate(date)

  return getApiData(
    `/api/forecasts/${forecastRunId}/daily/${date}`,
    parseDailyDetailView,
    toApiRequestOptions(options),
  )
}

export function getForecastNarratives(
  forecastRunId: number,
  options: NarrativeRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(`/api/forecasts/${forecastRunId}/narratives`, parseNarrativeViews, {
    ...toApiRequestOptions(options),
    ...(options.kind === undefined ? {} : { searchParams: { kind: options.kind } }),
  })
}
