'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { ApiContractError, ApiError } from '@/shared/api/api-response'

type QueryProviderProps = Readonly<{
  children: ReactNode
}>

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiContractError) {
    return false
  }

  if (error instanceof ApiError && error.status !== undefined && error.status < 500) {
    return false
  }

  return failureCount < 1
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: shouldRetryQuery,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
