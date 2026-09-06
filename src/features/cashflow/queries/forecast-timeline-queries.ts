'use client'

import { skipToken, useQuery } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import { getLatestForecast } from '@/features/forecast/api/forecast-api'
import { forecastQueryKeys } from '@/features/forecast/queries/forecast-queries'

import {
  getForecastDaily,
  getForecastDailyDetail,
  getForecastNarratives,
} from '../api/forecast-timeline-api'
import type { NarrativeKind } from '../api/forecast-timeline-contract'

type ForecastTimelineQueryOptions = Readonly<{
  client?: KyInstance
  narrativeKind?: NarrativeKind
}>

export const forecastTimelineQueryKeys = {
  daily: (forecastRunId: number | null) => ['cashflow', 'run', forecastRunId, 'daily'] as const,
  detail: (forecastRunId: number | null, date: string) =>
    ['cashflow', 'run', forecastRunId, 'daily', date] as const,
  narratives: (forecastRunId: number | null, kind?: NarrativeKind) =>
    ['cashflow', 'run', forecastRunId, 'narratives', kind] as const,
}

function requestOptions(signal: AbortSignal, options: ForecastTimelineQueryOptions) {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    signal,
  }
}

function useLatestForecastQuery(businessId: number, options: ForecastTimelineQueryOptions) {
  return useQuery({
    queryKey: forecastQueryKeys.latest(businessId),
    queryFn: ({ signal }) => getLatestForecast(businessId, requestOptions(signal, options)),
  })
}

export function useForecastTimelineQueries(
  businessId: number,
  options: ForecastTimelineQueryOptions = {},
) {
  const latest = useLatestForecastQuery(businessId, options)
  const forecastRunId = latest.data?.forecastRunId
  const runId = forecastRunId ?? null

  const daily = useQuery({
    queryKey: forecastTimelineQueryKeys.daily(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) => getForecastDaily(forecastRunId, requestOptions(signal, options)),
  })
  const narratives = useQuery({
    queryKey: forecastTimelineQueryKeys.narratives(runId, options.narrativeKind),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) =>
            getForecastNarratives(forecastRunId, {
              ...requestOptions(signal, options),
              ...(options.narrativeKind === undefined ? {} : { kind: options.narrativeKind }),
            }),
  })

  return { latest, daily, narratives }
}

export function useForecastDailyDetailQuery(
  businessId: number,
  date: string,
  options: ForecastTimelineQueryOptions = {},
) {
  const latest = useLatestForecastQuery(businessId, options)
  const forecastRunId = latest.data?.forecastRunId
  const runId = forecastRunId ?? null

  const detail = useQuery({
    queryKey: forecastTimelineQueryKeys.detail(runId, date),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) =>
            getForecastDailyDetail(forecastRunId, date, requestOptions(signal, options)),
  })

  return { latest, ...detail }
}
