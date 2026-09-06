'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import { getConsents, updateConsent } from '../api/consent-api'
import type { Consent, ConsentTypeCode } from '../api/consent-contract'

type ConsentQueryOptions = Readonly<{
  client?: KyInstance
}>

type UpdateConsentCommand = Readonly<{
  typeCode: ConsentTypeCode
  granted: boolean
}>

export const consentQueryKeys = {
  all: ['consents'] as const,
  list: (businessId: number) => [...consentQueryKeys.all, 'business', businessId] as const,
}

function requestOptions(options: ConsentQueryOptions, signal: AbortSignal) {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    signal,
  }
}

export function useConsentQueries(businessId: number, options: ConsentQueryOptions = {}) {
  return useQuery({
    queryKey: consentQueryKeys.list(businessId),
    queryFn: ({ signal }) => getConsents(businessId, requestOptions(options, signal)),
  })
}

export function useUpdateConsentMutation(businessId: number, options: ConsentQueryOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...consentQueryKeys.list(businessId), 'update'],
    mutationFn: ({ typeCode, granted }: UpdateConsentCommand) =>
      updateConsent(businessId, typeCode, granted, options),
    onSuccess: (updatedConsent) => {
      queryClient.setQueryData(
        consentQueryKeys.list(businessId),
        (current: ReadonlyArray<Consent> | undefined) => {
          if (current === undefined) {
            return current
          }

          const hasCurrentConsent = current.some(
            (consent) => consent.typeCode === updatedConsent.typeCode,
          )

          return hasCurrentConsent
            ? current.map((consent) =>
                consent.typeCode === updatedConsent.typeCode ? updatedConsent : consent,
              )
            : [...current, updatedConsent]
        },
      )
    },
  })
}
