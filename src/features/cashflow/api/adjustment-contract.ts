import { ApiContractError } from '@/shared/api/api-response'

export type AdjustmentType =
  'CASH_SALES' | 'EXTERNAL_FUNDS' | 'EXPECTED_INCOME' | 'EXPECTED_EXPENSE'
export type AdjustmentCertainty = 'CONFIRMED' | 'EXPECTED'
export type AdjustmentStatus = 'DRAFT' | 'SAVED' | 'APPLIED'
export type AdjustmentSuggestionStatus = 'PROPOSED' | 'ACCEPTED' | 'DISMISSED'

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
  amount: number
  certainty: AdjustmentCertainty
  expectedDate: string
  status: AdjustmentSuggestionStatus
  title: string | null
}>

export type CreateAdjustmentCommand = Readonly<{
  adjustmentType: AdjustmentType
  amount: number
  certainty: AdjustmentCertainty
  expectedDate: string
  memo?: string
}>

export type UpdateAdjustmentCommand = Readonly<{
  adjustmentType?: AdjustmentType
  amount?: number
  certainty?: AdjustmentCertainty
  expectedDate?: string
  memo?: string | null
}>

export type AppliedAdjustments = Readonly<{
  appliedCount: number
  appliedRunId: number
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

function readNullableString(record: UnknownRecord, field: string, context: string): string | null {
  const value = record[field]
  if (value !== null && typeof value !== 'string') throw contractError(context, field)
  return value
}

function readPositiveInteger(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw contractError(context, field)
  }
  return value
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

function parseAdjustmentRecord(value: unknown): Adjustment {
  const context = 'adjustment'
  const record = readRecord(value, context)
  return {
    adjustmentId: readPositiveInteger(record, 'adjustmentId', context),
    adjustmentType: readEnum(
      record,
      'adjustmentType',
      ['CASH_SALES', 'EXTERNAL_FUNDS', 'EXPECTED_INCOME', 'EXPECTED_EXPENSE'],
      context,
    ),
    amount: readPositiveNumber(record, 'amount', context),
    certainty: readEnum(record, 'certainty', ['CONFIRMED', 'EXPECTED'], context),
    expectedDate: readDate(record, 'expectedDate', context),
    status: readEnum(record, 'status', ['DRAFT', 'SAVED', 'APPLIED'], context),
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
      suggestionId: readPositiveInteger(record, 'suggestionId', context),
      adjustmentType: readEnum(
        record,
        'adjustmentType',
        ['CASH_SALES', 'EXTERNAL_FUNDS', 'EXPECTED_INCOME', 'EXPECTED_EXPENSE'],
        context,
      ),
      amount: readPositiveNumber(record, 'amount', context),
      certainty: readEnum(record, 'certainty', ['CONFIRMED', 'EXPECTED'], context),
      expectedDate: readDate(record, 'expectedDate', context),
      status: readEnum(record, 'status', ['PROPOSED', 'ACCEPTED', 'DISMISSED'], context),
      title: 'title' in record ? readNullableString(record, 'title', context) : null,
    }
  })
}

export function parseAppliedAdjustments(value: unknown): AppliedAdjustments {
  const context = 'appliedAdjustments'
  const record = readRecord(value, context)
  return {
    appliedCount: readPositiveInteger(record, 'appliedCount', context),
    appliedRunId: readPositiveInteger(record, 'appliedRunId', context),
  }
}

export function parseDeletedAdjustment(value: unknown): Readonly<{ deleted: boolean }> {
  const context = 'deletedAdjustment'
  const record = readRecord(value, context)
  if (record.deleted !== true) throw contractError(context, 'deleted')
  return { deleted: true }
}
