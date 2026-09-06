'use client'

import { useQuery } from '@tanstack/react-query'
import type { KyInstance } from 'ky'

import { getDataSources } from '../api/data-source-api'

type DataSourceQueryOptions = Readonly<{
  client?: KyInstance
}>

export const dataSourceQueryKeys = {
  all: ['data-scope'] as const,
  list: (businessId: number) => [...dataSourceQueryKeys.all, businessId] as const,
}

export function useDataSourcesQuery(businessId: number, options: DataSourceQueryOptions = {}) {
  return useQuery({
    queryKey: dataSourceQueryKeys.list(businessId),
    queryFn: ({ signal }) =>
      getDataSources(businessId, {
        ...(options.client === undefined ? {} : { client: options.client }),
        signal,
      }),
  })
}
