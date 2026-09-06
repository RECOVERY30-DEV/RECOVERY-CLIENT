'use client'

import { skipToken, useMutation, useQuery } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import {
  bookConsultation,
  getConsultation,
  getCounselors,
  getCounselorSlots,
} from '../api/consultation-api'

type ConsultationQueryOptions = Readonly<{
  client?: KyInstance
}>

export const consultationQueryKeys = {
  all: ['consultation'] as const,
  counselors: () => [...consultationQueryKeys.all, 'counselors'] as const,
  slots: (counselorId: number | null) =>
    [...consultationQueryKeys.all, 'counselor', counselorId, 'slots'] as const,
  detail: (consultationId: number | null) =>
    [...consultationQueryKeys.all, 'detail', consultationId] as const,
}

function toRequestOptions(options: ConsultationQueryOptions, signal?: AbortSignal) {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(signal === undefined ? {} : { signal }),
  }
}

function getConsultationQueryFn(consultationId: number, options: ConsultationQueryOptions) {
  return ({ signal }: Readonly<{ signal: AbortSignal }>) =>
    getConsultation(consultationId, toRequestOptions(options, signal))
}

export function useCounselorsQuery(options: ConsultationQueryOptions = {}) {
  return useQuery({
    queryKey: consultationQueryKeys.counselors(),
    queryFn: ({ signal }) => getCounselors(toRequestOptions(options, signal)),
  })
}

export function useCounselorSlotsQuery(
  counselorId: number | null,
  options: ConsultationQueryOptions = {},
) {
  return useQuery({
    queryKey: consultationQueryKeys.slots(counselorId),
    queryFn:
      counselorId === null
        ? skipToken
        : ({ signal }) => getCounselorSlots(counselorId, toRequestOptions(options, signal)),
  })
}

export function useConsultationQuery(
  consultationId: number | null,
  options: ConsultationQueryOptions = {},
) {
  const detailId = consultationId

  return useQuery({
    queryKey: consultationQueryKeys.detail(detailId),
    queryFn: detailId === null ? skipToken : getConsultationQueryFn(detailId, options),
  })
}

export function useBookConsultationMutation(
  businessId: number,
  options: ConsultationQueryOptions = {},
) {
  return useMutation({
    mutationKey: [...consultationQueryKeys.all, 'business', businessId, 'book'] as const,
    mutationFn: (command: Parameters<typeof bookConsultation>[1]) =>
      bookConsultation(businessId, command, toRequestOptions(options)),
  })
}
