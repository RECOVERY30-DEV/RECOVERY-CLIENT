export type ApiErrorData = Readonly<{
  code: string
  message: string
  details?: unknown
}>

export type ApiResponse<T> = Readonly<{
  success: boolean
  data: T | null
  error: ApiErrorData | null
}>

type ApiErrorOptions = Readonly<{
  status?: number
  code?: string
  details?: unknown
  cause?: unknown
}>

export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
  }
}

export class ApiContractError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'ApiContractError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseApiErrorData(value: unknown): ApiErrorData {
  if (!isRecord(value) || typeof value.code !== 'string' || typeof value.message !== 'string') {
    throw new ApiContractError('API 오류 응답 형식이 올바르지 않습니다.')
  }

  return {
    code: value.code,
    message: value.message,
    ...('details' in value ? { details: value.details } : {}),
  }
}

export function parseApiResponse<T>(value: unknown, parseData: (data: unknown) => T): T {
  if (!isRecord(value) || typeof value.success !== 'boolean') {
    throw new ApiContractError('API 응답 형식이 올바르지 않습니다.')
  }

  if (!value.success) {
    const error = parseApiErrorData(value.error)

    throw new ApiError(error.message, {
      code: error.code,
      details: error.details,
    })
  }

  if (!('data' in value)) {
    throw new ApiContractError('API 성공 응답에 data가 없습니다.')
  }

  return parseData(value.data)
}
