import type { KyInstance } from 'ky'

import { getApiData, type ApiRequestOptions } from '@/shared/api/api-request'

import {
  parseProgramDocuments,
  parseProgramEligibility,
  parseProgramRecommendations,
  parseSupportProgramDetail,
  parseSupportPrograms,
} from './support-program-contract'

type SupportProgramRequestOptions = Readonly<{
  client?: KyInstance
  signal?: AbortSignal
}>

type SupportProgramsRequestOptions = SupportProgramRequestOptions &
  Readonly<{
    applicableOnly?: boolean
  }>

function assertPositiveIdentifier(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}는 1 이상의 정수여야 합니다.`)
  }
}

function assertProgramCode(programCode: string): void {
  if (!programCode.trim()) {
    throw new RangeError('programCode는 비어 있을 수 없습니다.')
  }
}

function toApiRequestOptions(options: SupportProgramRequestOptions): ApiRequestOptions {
  return {
    ...(options.client === undefined ? {} : { client: options.client }),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  }
}

function programPath(programCode: string): string {
  assertProgramCode(programCode)

  return encodeURIComponent(programCode)
}

export function getSupportPrograms(options: SupportProgramsRequestOptions = {}) {
  return getApiData('/api/support-programs', parseSupportPrograms, {
    ...toApiRequestOptions(options),
    ...(options.applicableOnly === undefined
      ? {}
      : { searchParams: { applicableOnly: options.applicableOnly } }),
  })
}

export function getSupportProgram(programCode: string, options: SupportProgramRequestOptions = {}) {
  return getApiData(
    `/api/support-programs/${programPath(programCode)}`,
    parseSupportProgramDetail,
    toApiRequestOptions(options),
  )
}

export function getProgramDocuments(
  programCode: string,
  options: SupportProgramRequestOptions = {},
) {
  return getApiData(
    `/api/support-programs/${programPath(programCode)}/documents`,
    parseProgramDocuments,
    toApiRequestOptions(options),
  )
}

export function getProgramEligibility(
  businessId: number,
  programCode: string,
  options: SupportProgramRequestOptions = {},
) {
  assertPositiveIdentifier(businessId, 'businessId')

  return getApiData(
    `/api/businesses/${businessId}/support-programs/${programPath(programCode)}/eligibility`,
    parseProgramEligibility,
    toApiRequestOptions(options),
  )
}

export function getProgramRecommendations(
  forecastRunId: number,
  options: SupportProgramRequestOptions = {},
) {
  assertPositiveIdentifier(forecastRunId, 'forecastRunId')

  return getApiData(
    `/api/forecasts/${forecastRunId}/program-recommendations`,
    parseProgramRecommendations,
    toApiRequestOptions(options),
  )
}
