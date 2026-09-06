'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import { getRecoveryOptions } from '@/features/recovery/api/recovery-option-api'

import {
  createSelfActionPlan,
  getSelfActionPlans,
  updateSelfActionItem,
  type CreateSelfActionPlanInput,
  type UpdateSelfActionItemInput,
} from '../api/self-action-api'
import type { SelfActionPlan } from '../api/self-action-contract'

type SelfActionQueryOptions = Readonly<{ client?: KyInstance }>

export const selfActionQueryKeys = {
  all: ['self-action'] as const,
  plans: (forecastRunId: number | null) =>
    [...selfActionQueryKeys.all, 'forecast', forecastRunId] as const,
  recoveryOptions: (forecastRunId: number | null) =>
    [...selfActionQueryKeys.all, 'forecast', forecastRunId, 'recovery-options'] as const,
}

export function useSelfActionPlansQuery(
  forecastRunId: number | undefined,
  options: SelfActionQueryOptions = {},
) {
  return useQuery({
    queryKey: selfActionQueryKeys.plans(forecastRunId ?? null),
    enabled: forecastRunId !== undefined,
    queryFn: ({ signal }) => getSelfActionPlans(forecastRunId as number, { ...options, signal }),
  })
}

export function useSelfActionSetupQueries(
  forecastRunId: number | undefined,
  options: SelfActionQueryOptions = {},
) {
  const plans = useSelfActionPlansQuery(forecastRunId, options)
  const recoveryOptions = useQuery({
    queryKey: selfActionQueryKeys.recoveryOptions(forecastRunId ?? null),
    enabled: forecastRunId !== undefined,
    queryFn: ({ signal }) => getRecoveryOptions(forecastRunId as number, { ...options, signal }),
  })
  return { plans, recoveryOptions }
}

export function useCreateSelfActionPlanMutation(
  forecastRunId: number,
  options: SelfActionQueryOptions = {},
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSelfActionPlanInput) =>
      createSelfActionPlan(forecastRunId, input, options),
    onSuccess: (plan) => {
      queryClient.setQueryData<readonly SelfActionPlan[]>(
        selfActionQueryKeys.plans(forecastRunId),
        (current = []) => [plan, ...current],
      )
    },
  })
}

export function useUpdateSelfActionItemMutation(
  forecastRunId: number,
  options: SelfActionQueryOptions = {},
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      itemId,
      input,
    }: Readonly<{ itemId: number; input: UpdateSelfActionItemInput }>) =>
      updateSelfActionItem(forecastRunId, itemId, input, options),
    onSuccess: (item) => {
      queryClient.setQueryData<readonly SelfActionPlan[]>(
        selfActionQueryKeys.plans(forecastRunId),
        (current) =>
          current?.map((plan) => ({
            ...plan,
            items: plan.items.map((currentItem) =>
              currentItem.id === item.id ? item : currentItem,
            ),
          })),
      )
    },
  })
}
