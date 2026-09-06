'use client'

import { skipToken, useQuery } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import { getLatestForecast } from '@/features/forecast/api/forecast-api'
import { forecastQueryKeys } from '@/features/forecast/queries/forecast-queries'

import {
  getProgramDocuments,
  getProgramEligibility,
  getProgramRecommendations,
  getSupportProgram,
  getSupportPrograms,
} from '../api/support-program-api'

type SupportProgramQueryOptions = Readonly<{
  client?: KyInstance
}>

type SupportProgramListQueryOptions = SupportProgramQueryOptions &
  Readonly<{
    applicableOnly: boolean
  }>

export const supportProgramQueryKeys = {
  all: ['support-program'] as const,
  list: (applicableOnly: boolean) =>
    [...supportProgramQueryKeys.all, 'list', { applicableOnly }] as const,
  detail: (programCode: string) => [...supportProgramQueryKeys.all, 'detail', programCode] as const,
  documents: (programCode: string) =>
    [...supportProgramQueryKeys.all, 'documents', programCode] as const,
  eligibility: (businessId: number, programCode: string) =>
    [...supportProgramQueryKeys.all, 'eligibility', businessId, programCode] as const,
  recommendations: (forecastRunId: number | null) =>
    [...supportProgramQueryKeys.all, 'forecast', forecastRunId, 'recommendations'] as const,
}

function requestOptions(options: SupportProgramQueryOptions, signal: AbortSignal) {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    signal,
  }
}

export function useSupportProgramListQueries(
  businessId: number,
  options: SupportProgramListQueryOptions,
) {
  const programs = useQuery({
    queryKey: supportProgramQueryKeys.list(options.applicableOnly),
    queryFn: ({ signal }) =>
      getSupportPrograms({
        ...requestOptions(options, signal),
        applicableOnly: options.applicableOnly,
      }),
  })
  const latestForecast = useQuery({
    queryKey: forecastQueryKeys.latest(businessId),
    queryFn: ({ signal }) => getLatestForecast(businessId, requestOptions(options, signal)),
  })
  const forecastRunId = latestForecast.data?.forecastRunId
  const runId = forecastRunId ?? null
  const recommendations = useQuery({
    queryKey: supportProgramQueryKeys.recommendations(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) => getProgramRecommendations(forecastRunId, requestOptions(options, signal)),
  })

  return { programs, latestForecast, recommendations }
}

export function useSupportProgramDetailQueries(
  businessId: number,
  programCode: string,
  options: SupportProgramQueryOptions = {},
) {
  const program = useQuery({
    queryKey: supportProgramQueryKeys.detail(programCode),
    queryFn: ({ signal }) => getSupportProgram(programCode, requestOptions(options, signal)),
  })
  const documents = useQuery({
    queryKey: supportProgramQueryKeys.documents(programCode),
    queryFn: ({ signal }) => getProgramDocuments(programCode, requestOptions(options, signal)),
  })
  const eligibility = useQuery({
    queryKey: supportProgramQueryKeys.eligibility(businessId, programCode),
    queryFn: ({ signal }) =>
      getProgramEligibility(businessId, programCode, requestOptions(options, signal)),
  })

  return { program, documents, eligibility }
}
