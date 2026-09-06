import { ApiContractError } from '@/shared/api/api-response'

export type AdjustmentType = 'CASH_SALES' | 'EXTERNAL_FUND' | 'EXPECTED_INCOME' | 'EXPECTED_EXPENSE'
export type AdjustmentCertainty = 'CONFIRMED' | 'ESTIMATED'
export type AdjustmentStatus = 'DRAFT' | 'SAVED' | 'DISCARDED'
export type AdjustmentSuggestionStatus = 'PROPOSED' | 'ACCEPTED' | 'REJECTED'

export type Adjustment = Readonly<{
  adjustmentId: number
  adjustmentType: AdjustmentType
  amount: number
  certainty: AdjustmentCertainty
  expectedDate: string
  status: AdjustmentStatus
  memo: string | null
}>

export type AdjustmentSuggestion = Readonly<{
  suggestionId: number
  adjustmentType: AdjustmentType
  suggestedAmount: number | null
  suggestedRule: string | null
  evidenceText: string
  confidence: number | null
  status: AdjustmentSuggestionStatus
  acceptedAdjustmentId: number | null
}>

export type CreateAdjustmentCommand = Readonly<{
  adjustmentType: AdjustmentType
  amount: number
  certainty: AdjustmentCertainty
  expectedDate: string
  memo?: string
}>

export type UpdateAdjustmentCommand = Readonly<{
  amount?: number
  certainty?: AdjustmentCertainty
  expectedDate?: string
  memo?: string | null
}>

export type AppliedAdjustments = Readonly<{
  appliedCount: number
  appliedRunId: number | null
}>

type UnknownRecord = Record<string, unknown>

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function contractError(context: string, field?: string): ApiContractError {
  return new ApiContractError(
    `${field === undefined ? context : `${context}.${field}`} 응답 형식이 올바르지 않습니다.`,
  )
}

function readRecord(value: unknown, context: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw contractError(context)
  return value as UnknownRecord
}

function readString(record: UnknownRecord, field: string, context: string): string {
  if (typeof record[field] !== 'string') throw contractError(context, field)
  return record[field]
}

function readPositiveInteger(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw contractError(context, field)
  }
  return value
}

function readPositiveIntegerFromFields(
  record: UnknownRecord,
  fields: readonly string[],
  context: string,
): number {
  for (const field of fields) {
    if (record[field] !== undefined) return readPositiveInteger(record, field, context)
  }

  throw contractError(context, fields[0])
}

function readPositiveNumber(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw contractError(context, field)
  }
  return value
}

function readDate(record: UnknownRecord, field: string, context: string): string {
  const value = readString(record, field, context)
  if (!DATE_PATTERN.test(value)) throw contractError(context, field)
  return value
}

function readEnum<const T extends string>(
  record: UnknownRecord,
  field: string,
  values: readonly T[],
  context: string,
): T {
  const value = record[field]
  if (typeof value !== 'string' || !values.includes(value as T)) throw contractError(context, field)
  return value as T
}

function readAdjustmentType(record: UnknownRecord, context: string): AdjustmentType {
  return readEnum(
    record,
    'adjustmentType',
    ['CASH_SALES', 'EXTERNAL_FUND', 'EXPECTED_INCOME', 'EXPECTED_EXPENSE'],
    context,
  )
}

function readAdjustmentCertainty(record: UnknownRecord, context: string): AdjustmentCertainty {
  return readEnum(record, 'certainty', ['CONFIRMED', 'ESTIMATED'], context)
}

function readNullablePositiveInteger(
  record: UnknownRecord,
  field: string,
  context: string,
): number | null {
  if (record[field] === null) return null
  return readPositiveInteger(record, field, context)
}

function readNullablePositiveNumber(
  record: UnknownRecord,
  field: string,
  context: string,
): number | null {
  if (record[field] === null) return null
  return readPositiveNumber(record, field, context)
}

function readNullableString(record: UnknownRecord, field: string, context: string): string | null {
  if (record[field] === null) return null
  return readString(record, field, context)
}

function readConfidence(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw contractError(context, field)
  }
  return value
}

function parseAdjustmentRecord(value: unknown): Adjustment {
  const context = 'adjustment'
  const record = readRecord(value, context)
  return {
    adjustmentId: readPositiveIntegerFromFields(record, ['id', 'adjustmentId'], context),
    adjustmentType: readAdjustmentType(record, context),
    amount: readPositiveNumber(record, 'amount', context),
    certainty: readAdjustmentCertainty(record, context),
    expectedDate: readDate(record, 'expectedDate', context),
    status: readEnum(record, 'status', ['DRAFT', 'SAVED', 'DISCARDED'], context),
    memo: readNullableString(record, 'memo', context),
  }
}

export function parseAdjustments(value: unknown): readonly Adjustment[] {
  if (!Array.isArray(value)) throw contractError('adjustments')
  return value.map(parseAdjustmentRecord)
}

export function parseAdjustment(value: unknown): Adjustment {
  return parseAdjustmentRecord(value)
}

export function parseAdjustmentSuggestions(value: unknown): readonly AdjustmentSuggestion[] {
  if (!Array.isArray(value)) throw contractError('adjustmentSuggestions')
  return value.map((item) => {
    const context = 'adjustmentSuggestion'
    const record = readRecord(item, context)
    return {
      suggestionId: readPositiveIntegerFromFields(record, ['id', 'suggestionId'], context),
      adjustmentType: readAdjustmentType(record, context),
      suggestedAmount: readNullablePositiveNumber(record, 'suggestedAmount', context),
      suggestedRule: readNullableString(record, 'suggestedRule', context),
      evidenceText: readString(record, 'evidenceText', context),
      confidence: record.confidence === null ? null : readConfidence(record, 'confidence', context),
      status: readEnum(record, 'status', ['PROPOSED', 'ACCEPTED', 'REJECTED'], context),
      acceptedAdjustmentId: readNullablePositiveInteger(record, 'acceptedAdjustmentId', context),
    }
  })
}

export function parseAppliedAdjustments(value: unknown): AppliedAdjustments {
  const context = 'appliedAdjustments'
  const record = readRecord(value, context)
  return {
    appliedCount: readPositiveInteger(record, 'appliedCount', context),
    appliedRunId: readNullablePositiveInteger(record, 'appliedRunId', context),
  }
}
