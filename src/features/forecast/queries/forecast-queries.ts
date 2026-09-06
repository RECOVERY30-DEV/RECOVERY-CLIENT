'use client'

import { skipToken, useQuery } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import {
  getForecastCoverage,
  getForecastMinBalance,
  getForecastRiskDrivers,
  getForecastSafetyBuffer,
  getForecastShortfall,
  getLatestForecast,
} from '../api/forecast-api'

type ForecastQueryOptions = Readonly<{
  client?: KyInstance
}>

export const forecastQueryKeys = {
  all: ['forecast'] as const,
  latest: (businessId: number) =>
    [...forecastQueryKeys.all, 'business', businessId, 'latest'] as const,
  minBalance: (forecastRunId: number | null) =>
    [...forecastQueryKeys.all, 'run', forecastRunId, 'min-balance'] as const,
  shortfall: (forecastRunId: number | null) =>
    [...forecastQueryKeys.all, 'run', forecastRunId, 'shortfall'] as const,
  safetyBuffer: (forecastRunId: number | null) =>
    [...forecastQueryKeys.all, 'run', forecastRunId, 'safety-buffer'] as const,
  riskDrivers: (forecastRunId: number | null) =>
    [...forecastQueryKeys.all, 'run', forecastRunId, 'risk-drivers'] as const,
  coverage: (forecastRunId: number | null) =>
    [...forecastQueryKeys.all, 'run', forecastRunId, 'coverage'] as const,
}

export function useForecastSummaryQueries(businessId: number, options: ForecastQueryOptions = {}) {
  const latest = useQuery({
    queryKey: forecastQueryKeys.latest(businessId),
    queryFn: ({ signal }) =>
      getLatestForecast(businessId, {
        ...(options.client === undefined ? {} : { client: options.client }),
        signal,
      }),
  })
  const forecastRunId = latest.data?.forecastRunId
  const runId = forecastRunId ?? null
  const requestOptions = (signal: AbortSignal) => ({
    ...(options.client === undefined ? {} : { client: options.client }),
    signal,
  })

  const minBalance = useQuery({
    queryKey: forecastQueryKeys.minBalance(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) => getForecastMinBalance(forecastRunId, requestOptions(signal)),
  })
  const shortfall = useQuery({
    queryKey: forecastQueryKeys.shortfall(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) => getForecastShortfall(forecastRunId, requestOptions(signal)),
  })
  const safetyBuffer = useQuery({
    queryKey: forecastQueryKeys.safetyBuffer(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) => getForecastSafetyBuffer(forecastRunId, requestOptions(signal)),
  })
  const coverage = useQuery({
    queryKey: forecastQueryKeys.coverage(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) => getForecastCoverage(forecastRunId, requestOptions(signal)),
  })

  return {
    latest,
    minBalance,
    shortfall,
    safetyBuffer,
    coverage,
  }
}

export function useForecastOverviewQueries(businessId: number, options: ForecastQueryOptions = {}) {
  const summary = useForecastSummaryQueries(businessId, options)
  const forecastRunId = summary.latest.data?.forecastRunId
  const runId = forecastRunId ?? null
  const riskDrivers = useQuery({
    queryKey: forecastQueryKeys.riskDrivers(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) =>
            getForecastRiskDrivers(forecastRunId, {
              ...(options.client === undefined ? {} : { client: options.client }),
              signal,
            }),
  })

  return {
    ...summary,
    riskDrivers,
  }
}
