import type { KyInstance } from 'ky'

import { getApiData, type ApiRequestOptions } from '@/shared/api/api-request'

import { parseDataSources } from './data-source-contract'

export type DataSourceRequestOptions = Readonly<{
  client?: KyInstance
  signal?: AbortSignal
}>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
  }
}

function toApiRequestOptions(options: DataSourceRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

export function getDataSources(businessId: number, options: DataSourceRequestOptions = {}) {
  assertPositiveIdentifier(businessId, 'businessId')

  return getApiData(
    `/api/businesses/${businessId}/data-sources`,
    parseDataSources,
    toApiRequestOptions(options),
  )
}
