import { ApiContractError } from '@/shared/api/api-response'

export type ConsentTypeCode = 'ANALYSIS' | 'FOLLOWUP_TRACKING' | 'PACKET_TRANSFER'
export type ConsentStatus = 'GRANTED' | 'WITHDRAWN' | 'NOT_SET'

export type Consent = Readonly<{
  typeCode: ConsentTypeCode
  status: ConsentStatus
}>

type UnknownRecord = Record<string, unknown>

function contractError(context: string, field?: string): ApiContractError {
  return new ApiContractError(
    `${field === undefined ? context : `${context}.${field}`} 응답 형식이 올바르지 않습니다.`,
  )
}

function readRecord(value: unknown, context: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw contractError(context)
  }

  return value as UnknownRecord
}

function readEnum<const T extends string>(
  record: UnknownRecord,
  field: string,
  values: readonly T[],
  context: string,
): T {
  const value = record[field]

  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw contractError(context, field)
  }

  return value as T
}

function parseConsentRecord(value: unknown): Consent {
  const context = 'consent'
  const record = readRecord(value, context)

  return {
    typeCode: readEnum(
      record,
      'typeCode',
      ['ANALYSIS', 'FOLLOWUP_TRACKING', 'PACKET_TRANSFER'],
      context,
    ),
    status: readEnum(record, 'status', ['GRANTED', 'WITHDRAWN', 'NOT_SET'], context),
  }
}

export function parseConsents(value: unknown): ReadonlyArray<Consent> {
  if (!Array.isArray(value)) {
    throw contractError('consents')
  }

  return value.map(parseConsentRecord)
}

export function parseConsent(value: unknown): Consent {
  return parseConsentRecord(value)
}
