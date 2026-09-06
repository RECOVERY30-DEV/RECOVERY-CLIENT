import { ApiContractError } from '@/shared/api/api-response'

export type SelfActionItemStatus = 'PENDING' | 'DONE'
export type SelfActionPlanStatus = 'ACTIVE' | 'ARCHIVED'

export type SelfActionItem = Readonly<{
  id: number
  title: string
  targetDate: string | null
  status: SelfActionItemStatus
  memo: string | null
}>

export type SelfActionPlan = Readonly<{
  id: number
  recoveryOptionId: number
  expectedEffectText: string | null
  status: SelfActionPlanStatus
  savedAt: string
  items: readonly SelfActionItem[]
}>

type UnknownRecord = Record<string, unknown>

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

function readInteger(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) throw contractError(context, field)
  return value
}

function readString(record: UnknownRecord, field: string, context: string): string {
  const value = record[field]
  if (typeof value !== 'string') throw contractError(context, field)
  return value
}

function readNullableString(record: UnknownRecord, field: string, context: string): string | null {
  const value = record[field]
  if (typeof value !== 'string' && value !== null) throw contractError(context, field)
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

function readSelfActionItem(value: unknown): SelfActionItem {
  const context = 'selfActionPlan.items[]'
  const record = readRecord(value, context)
  return {
    id: readInteger(record, 'id', context),
    title: readString(record, 'title', context),
    targetDate: readNullableString(record, 'targetDate', context),
    status: readEnum(record, 'status', ['PENDING', 'DONE'], context),
    memo: readNullableString(record, 'memo', context),
  }
}

export function parseSelfActionPlans(value: unknown): readonly SelfActionPlan[] {
  if (!Array.isArray(value)) throw contractError('selfActionPlans')

  return value.map((value) => {
    const context = 'selfActionPlans[]'
    const record = readRecord(value, context)
    const items = record.items
    if (!Array.isArray(items)) throw contractError(context, 'items')
    return {
      id: readInteger(record, 'id', context),
      recoveryOptionId: readInteger(record, 'recoveryOptionId', context),
      expectedEffectText: readNullableString(record, 'expectedEffectText', context),
      status: readEnum(record, 'status', ['ACTIVE', 'ARCHIVED'], context),
      savedAt: readString(record, 'savedAt', context),
      items: items.map(readSelfActionItem),
    }
  })
}

export function parseSelfActionPlan(value: unknown): SelfActionPlan {
  return parseSelfActionPlans([value])[0] as SelfActionPlan
}

export function parseSelfActionItem(value: unknown): SelfActionItem {
  return readSelfActionItem(value)
}
