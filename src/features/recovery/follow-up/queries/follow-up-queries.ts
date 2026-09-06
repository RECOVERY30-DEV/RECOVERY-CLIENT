'use client'

import { skipToken, useQuery } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import { getFollowupResult, getFollowups, getRecoveryExecutionStatuses } from '../api/follow-up-api'

type FollowUpQueryOptions = Readonly<{
  client?: KyInstance
}>

export const followUpQueryKeys = {
  all: ['follow-up'] as const,
  schedules: (businessId: number) => [...followUpQueryKeys.all, 'business', businessId] as const,
  result: (scheduleId: number | null) => [...followUpQueryKeys.all, 'result', scheduleId] as const,
  executionStatuses: (businessId: number) =>
    [...followUpQueryKeys.all, 'business', businessId, 'execution-status'] as const,
}

function toRequestOptions(options: FollowUpQueryOptions, signal: AbortSignal) {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    signal,
  }
}

export function useFollowUpQueries(businessId: number, options: FollowUpQueryOptions = {}) {
  const followups = useQuery({
    queryKey: followUpQueryKeys.schedules(businessId),
    queryFn: ({ signal }) => getFollowups(businessId, toRequestOptions(options, signal)),
  })
  const executionStatuses = useQuery({
    queryKey: followUpQueryKeys.executionStatuses(businessId),
    queryFn: ({ signal }) =>
      getRecoveryExecutionStatuses(businessId, toRequestOptions(options, signal)),
  })
  const resultScheduleId = followups.data?.find((item) => item.hasResult)?.id ?? null
  const result = useQuery({
    queryKey: followUpQueryKeys.result(resultScheduleId),
    queryFn:
      resultScheduleId === null
        ? skipToken
        : ({ signal }) => getFollowupResult(resultScheduleId, toRequestOptions(options, signal)),
  })

  return { executionStatuses, followups, result }
}
