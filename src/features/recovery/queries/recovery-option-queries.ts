'use client'

import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import {
  getRecoveryOptions,
  getRecoveryScenarios,
  saveRecoveryOptionSelections,
} from '../api/recovery-option-api'

type RecoveryOptionQueryOptions = Readonly<{
  client?: KyInstance
}>

export const recoveryOptionQueryKeys = {
  all: ['recovery-options'] as const,
  options: (forecastRunId: number | null) =>
    [...recoveryOptionQueryKeys.all, 'forecast', forecastRunId, 'options'] as const,
  scenarios: (forecastRunId: number | null) =>
    [...recoveryOptionQueryKeys.all, 'forecast', forecastRunId, 'scenarios'] as const,
  selections: (forecastRunId: number) =>
    [...recoveryOptionQueryKeys.all, 'forecast', forecastRunId, 'selections'] as const,
}

export function useRecoveryOptionQueries(
  forecastRunId: number | undefined,
  options: RecoveryOptionQueryOptions = {},
) {
  const runId = forecastRunId ?? null
  const requestOptions = (signal: AbortSignal) => ({
    ...(options.client === undefined ? {} : { client: options.client }),
    signal,
  })

  const recoveryOptions = useQuery({
    queryKey: recoveryOptionQueryKeys.options(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) => getRecoveryOptions(forecastRunId, requestOptions(signal)),
  })
  const scenarios = useQuery({
    queryKey: recoveryOptionQueryKeys.scenarios(runId),
    queryFn:
      forecastRunId === undefined
        ? skipToken
        : ({ signal }) => getRecoveryScenarios(forecastRunId, requestOptions(signal)),
  })

  return { recoveryOptions, scenarios }
}

export function useSaveRecoveryOptionSelectionsMutation(
  forecastRunId: number,
  options: RecoveryOptionQueryOptions = {},
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (optionIds: readonly number[]) =>
      saveRecoveryOptionSelections(forecastRunId, optionIds, options),
    onSuccess: (result) => {
      queryClient.setQueryData(recoveryOptionQueryKeys.selections(forecastRunId), result)
      queryClient.setQueryData(
        recoveryOptionQueryKeys.options(forecastRunId),
        (current: Awaited<ReturnType<typeof getRecoveryOptions>> | undefined) =>
          current?.map((option) => ({
            ...option,
            selected: result.selectedOptionIds.includes(option.optionId),
          })),
      )
      void queryClient.invalidateQueries({
        queryKey: recoveryOptionQueryKeys.scenarios(forecastRunId),
      })
    },
  })
}
