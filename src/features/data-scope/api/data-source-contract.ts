import { ApiContractError } from '@/shared/api/api-response'

export type DataSourceType = 'BANK_ACCOUNT' | 'CARD_SETTLEMENT' | 'LOAN' | 'AUTO_TRANSFER'
export type DataSourceSyncStatus = 'SYNCED' | 'PARTIAL' | 'FAILED'

export type DataSourceView = Readonly<{
  sourceType: DataSourceType
  institutionName: string | null
  coverageRate: number | null
  periodMonths: number
  lastSyncedAt: string | null
  syncStatus: DataSourceSyncStatus
  belowThreshold: boolean
}>

type UnknownRecord = Record<string, unknown>

function contractError(context: string, field?: string): ApiContractError {
  const target = field === undefined ? context : `${context}.${field}`

  return new ApiContractError(`${target} 응답 형식이 올바르지 않습니다.`)
}

function readRecord(value: unknown, context: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw contractError(context)
  }

  return value as UnknownRecord
}

function readNullableString(record: UnknownRecord, field: string, context: string): string | null {
  const value = record[field]

  if (value !== null && typeof value !== 'string') {
    throw contractError(context, field)
  }

  return value
}

function readNullableNumber(record: UnknownRecord, field: string, context: string): number | null {
  const value = record[field]

  if (value !== null && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw contractError(context, field)
  }

  return value
}

function readPositiveInteger(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]

  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw contractError(context, field)
  }

  return value
}

function readBoolean(record: UnknownRecord, field: string, context: string): boolean {
  const value = record[field]

  if (typeof value !== 'boolean') {
    throw contractError(context, field)
  }

  return value
}

function readEnum<const T extends string>(
  record: UnknownRecord,
  field: string,
  values: ReadonlyArray<T>,
  context: string,
): T {
  const value = record[field]

  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw contractError(context, field)
  }

  return value as T
}

function readNullableDateTime(
  record: UnknownRecord,
  field: string,
  context: string,
): string | null {
  const value = readNullableString(record, field, context)

  if (value !== null && Number.isNaN(Date.parse(value))) {
    throw contractError(context, field)
  }

  return value
}

function parseDataSource(value: unknown): DataSourceView {
  const context = 'dataSource'
  const record = readRecord(value, context)

  return {
    sourceType: readEnum(
      record,
      'sourceType',
      ['BANK_ACCOUNT', 'CARD_SETTLEMENT', 'LOAN', 'AUTO_TRANSFER'],
      context,
    ),
    institutionName: readNullableString(record, 'institutionName', context),
    coverageRate: readNullableNumber(record, 'coverageRate', context),
    periodMonths: readPositiveInteger(record, 'periodMonths', context),
    lastSyncedAt: readNullableDateTime(record, 'lastSyncedAt', context),
    syncStatus: readEnum(record, 'syncStatus', ['SYNCED', 'PARTIAL', 'FAILED'], context),
    belowThreshold: readBoolean(record, 'belowThreshold', context),
  }
}

export function parseDataSources(value: unknown): ReadonlyArray<DataSourceView> {
  if (!Array.isArray(value)) {
    throw contractError('dataSources')
  }

  return value.map(parseDataSource)
}
