import { HTTPError, type KyInstance } from 'ky'

import { apiClient } from './api-client'
import { ApiContractError, ApiError, parseApiResponse, type ApiErrorData } from './api-response'

export type ApiRequestOptions = Readonly<{
  client?: KyInstance
  searchParams?: Readonly<Record<string, string | number | boolean>>
  signal?: AbortSignal
}>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readApiErrorData(value: unknown): ApiErrorData | undefined {
  const errorValue =
    isRecord(value) && value.success === false && 'error' in value ? value.error : value

  if (
    !isRecord(errorValue) ||
    typeof errorValue.code !== 'string' ||
    typeof errorValue.message !== 'string'
  ) {
    return undefined
  }

  return {
    code: errorValue.code,
    message: errorValue.message,
    ...('details' in errorValue ? { details: errorValue.details } : {}),
  }
}

function normalizeHttpError(error: HTTPError): ApiError {
  const apiError = readApiErrorData(error.data)

  return new ApiError(apiError?.message ?? `API 요청에 실패했습니다. (${error.response.status})`, {
    status: error.response.status,
    code: apiError?.code,
    details: apiError?.details,
    cause: error,
  })
}

function throwNormalizedApiError(error: unknown): never {
  if (error instanceof ApiError || error instanceof ApiContractError) {
    throw error
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    throw error
  }

  if (error instanceof HTTPError) {
    throw normalizeHttpError(error)
  }

  throw new ApiError('서버와 통신할 수 없습니다.', { cause: error })
}

export async function getApiData<T>(
  path: string,
  parseData: (data: unknown) => T,
  options: ApiRequestOptions = {},
): Promise<T> {
  const client = options.client ?? apiClient

  try {
    const payload = await client
      .get(path, {
        ...(options.searchParams === undefined ? {} : { searchParams: options.searchParams }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
      .json<unknown>()

    return parseApiResponse(payload, parseData)
  } catch (error) {
    throwNormalizedApiError(error)
  }
}

export async function postApiData<T>(
  path: string,
  body: unknown,
  parseData: (data: unknown) => T,
  options: ApiRequestOptions = {},
): Promise<T> {
  const client = options.client ?? apiClient

  try {
    const payload = await client
      .post(path, {
        json: body,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
      .json<unknown>()

    return parseApiResponse(payload, parseData)
  } catch (error) {
    throwNormalizedApiError(error)
  }
}

export async function putApiData<T>(
  path: string,
  body: unknown,
  parseData: (data: unknown) => T,
  options: ApiRequestOptions = {},
): Promise<T> {
  const client = options.client ?? apiClient

  try {
    const payload = await client
      .put(path, {
        json: body,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
      .json<unknown>()

    return parseApiResponse(payload, parseData)
  } catch (error) {
    throwNormalizedApiError(error)
  }
}

export async function patchApiData<T>(
  path: string,
  body: unknown,
  parseData: (data: unknown) => T,
  options: ApiRequestOptions = {},
): Promise<T> {
  const client = options.client ?? apiClient

  try {
    const payload = await client
      .patch(path, {
        json: body,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
      .json<unknown>()

    return parseApiResponse(payload, parseData)
  } catch (error) {
    throwNormalizedApiError(error)
  }
}

export async function deleteApiData<T>(
  path: string,
  parseData: (data: unknown) => T,
  options: ApiRequestOptions = {},
): Promise<T> {
  const client = options.client ?? apiClient

  try {
    const payload = await client
      .delete(path, {
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
      .json<unknown>()

    return parseApiResponse(payload, parseData)
  } catch (error) {
    throwNormalizedApiError(error)
  }
}
