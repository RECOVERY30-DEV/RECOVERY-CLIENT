'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import { forecastQueryKeys } from '@/features/forecast/queries/forecast-queries'

import {
  acceptAdjustmentSuggestion,
  applyAdjustments,
  createAdjustment,
  deleteAdjustment,
  listAdjustments,
  listAdjustmentSuggestions,
  updateAdjustment,
} from '../api/adjustment-api'

type AdjustmentQueryOptions = Readonly<{ client?: KyInstance }>

export const adjustmentQueryKeys = {
  all: ['cashflow', 'adjustments'] as const,
  business: (businessId: number) => [...adjustmentQueryKeys.all, 'business', businessId] as const,
  adjustments: (businessId: number) =>
    [...adjustmentQueryKeys.business(businessId), 'items'] as const,
  suggestions: (businessId: number) =>
    [...adjustmentQueryKeys.business(businessId), 'suggestions'] as const,
}

function requestOptions(options: AdjustmentQueryOptions, signal?: AbortSignal) {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(signal === undefined ? {} : { signal }),
  }
}

function useInvalidateAdjustmentQueries(businessId: number) {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: adjustmentQueryKeys.adjustments(businessId) })
    void queryClient.invalidateQueries({ queryKey: adjustmentQueryKeys.suggestions(businessId) })
  }
}

export function useAdjustmentQueries(businessId: number, options: AdjustmentQueryOptions = {}) {
  return {
    adjustments: useQuery({
      queryKey: adjustmentQueryKeys.adjustments(businessId),
      queryFn: ({ signal }) => listAdjustments(businessId, requestOptions(options, signal)),
    }),
    suggestions: useQuery({
      queryKey: adjustmentQueryKeys.suggestions(businessId),
      queryFn: ({ signal }) =>
        listAdjustmentSuggestions(businessId, requestOptions(options, signal)),
    }),
  }
}

export function useCreateAdjustmentMutation(
  businessId: number,
  options: AdjustmentQueryOptions = {},
) {
  const invalidate = useInvalidateAdjustmentQueries(businessId)
  return useMutation({
    mutationFn: (command: Parameters<typeof createAdjustment>[1]) =>
      createAdjustment(businessId, command, requestOptions(options)),
    onSuccess: invalidate,
  })
}

export function useUpdateAdjustmentMutation(
  businessId: number,
  options: AdjustmentQueryOptions = {},
) {
  const invalidate = useInvalidateAdjustmentQueries(businessId)
  return useMutation({
    mutationFn: ({
      adjustmentId,
      command,
    }: Readonly<{ adjustmentId: number; command: Parameters<typeof updateAdjustment>[2] }>) =>
      updateAdjustment(businessId, adjustmentId, command, requestOptions(options)),
    onSuccess: invalidate,
  })
}

export function useDeleteAdjustmentMutation(
  businessId: number,
  options: AdjustmentQueryOptions = {},
) {
  const invalidate = useInvalidateAdjustmentQueries(businessId)
  return useMutation({
    mutationFn: (adjustmentId: number) =>
      deleteAdjustment(businessId, adjustmentId, requestOptions(options)),
    onSuccess: invalidate,
  })
}

export function useAcceptAdjustmentSuggestionMutation(
  businessId: number,
  options: AdjustmentQueryOptions = {},
) {
  const invalidate = useInvalidateAdjustmentQueries(businessId)
  return useMutation({
    mutationFn: (suggestionId: number) =>
      acceptAdjustmentSuggestion(businessId, suggestionId, requestOptions(options)),
    onSuccess: invalidate,
  })
}

export function useApplyAdjustmentsMutation(
  businessId: number,
  options: AdjustmentQueryOptions = {},
) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateAdjustmentQueries(businessId)
  return useMutation({
    mutationFn: () => applyAdjustments(businessId, requestOptions(options)),
    onSuccess: () => {
      invalidate()
      void queryClient.invalidateQueries({ queryKey: forecastQueryKeys.latest(businessId) })
    },
  })
}
