import { ApiContractError } from '@/shared/api/api-response'

export type FollowupCheckpoint = 'D30' | 'D60' | 'D90'
export type FollowupStatus = 'SCHEDULED' | 'DONE' | 'SKIPPED'
export type BalanceRecovered = 'YES' | 'PARTIAL' | 'NO'
export type FollowupRiskStatus = 'RISK' | 'STABLE' | 'HOLD'
export type RecoveryExecutionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

export type FollowupView = Readonly<{
  id: number
  checkpoint: FollowupCheckpoint
  scheduledDate: string
  status: FollowupStatus
  forecastRunId: number | null
  packetId: number | null
  hasResult: boolean
}>

export type FollowupResultView = Readonly<{
  scheduleId: number
  balanceRecovered: BalanceRecovered | null
  delinquency: boolean
  baselineBalance: number | null
  currentBalance: number | null
  recoveryAmount: number | null
  latestForecastRunId: number | null
  riskStatus: FollowupRiskStatus | null
  recordedAt: string
}>

export type ExecutionStatusView = Readonly<{
  id: number
  recoveryOptionId: number
  status: RecoveryExecutionStatus
  blockerText: string | null
  forecastRunId: number | null
  updatedAt: string
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

function readInteger(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]

  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw contractError(context, field)
  }

  return value
}

function readPositiveInteger(record: UnknownRecord, field: string, context: string): number {
  const value = readInteger(record, field, context)

  if (value <= 0) {
    throw contractError(context, field)
  }

  return value
}

function readNullableInteger(record: UnknownRecord, field: string, context: string): number | null {
  const value = record[field]

  if (value === null) {
    return null
  }

  return readInteger(record, field, context)
}

function readNullablePositiveInteger(
  record: UnknownRecord,
  field: string,
  context: string,
): number | null {
  const value = readNullableInteger(record, field, context)

  if (value !== null && value <= 0) {
    throw contractError(context, field)
  }

  return value
}

function readString(record: UnknownRecord, field: string, context: string): string {
  const value = record[field]

  if (typeof value !== 'string') {
    throw contractError(context, field)
  }

  return value
}

function readNullableString(record: UnknownRecord, field: string, context: string): string | null {
  const value = record[field]

  if (value !== null && typeof value !== 'string') {
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
  values: readonly T[],
  context: string,
): T {
  const value = record[field]

  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw contractError(context, field)
  }

  return value as T
}

function readDate(record: UnknownRecord, field: string, context: string): string {
  const value = readString(record, field, context)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw contractError(context, field)
  }

  return value
}

function readDateTime(record: UnknownRecord, field: string, context: string): string {
  const value = readString(record, field, context)

  if (Number.isNaN(Date.parse(value))) {
    throw contractError(context, field)
  }

  return value
}

function parseFollowup(value: unknown): FollowupView {
  const context = 'followup'
  const record = readRecord(value, context)

  return {
    id: readPositiveInteger(record, 'id', context),
    checkpoint: readEnum(record, 'checkpoint', ['D30', 'D60', 'D90'], context),
    scheduledDate: readDate(record, 'scheduledDate', context),
    status: readEnum(record, 'status', ['SCHEDULED', 'DONE', 'SKIPPED'], context),
    forecastRunId: readNullablePositiveInteger(record, 'forecastRunId', context),
    packetId: readNullablePositiveInteger(record, 'packetId', context),
    hasResult: readBoolean(record, 'hasResult', context),
  }
}

export function parseFollowups(value: unknown): readonly FollowupView[] {
  if (!Array.isArray(value)) {
    throw contractError('followups')
  }

  return value.map(parseFollowup)
}

export function parseFollowupResult(value: unknown): FollowupResultView {
  const context = 'followupResult'
  const record = readRecord(value, context)

  return {
    scheduleId: readPositiveInteger(record, 'scheduleId', context),
    balanceRecovered: readNullableEnum(
      record,
      'balanceRecovered',
      ['YES', 'PARTIAL', 'NO'],
      context,
    ),
    delinquency: readBoolean(record, 'delinquency', context),
    baselineBalance: readNullableInteger(record, 'baselineBalance', context),
    currentBalance: readNullableInteger(record, 'currentBalance', context),
    recoveryAmount: readNullableInteger(record, 'recoveryAmount', context),
    latestForecastRunId: readNullablePositiveInteger(record, 'latestForecastRunId', context),
    riskStatus: readNullableEnum(record, 'riskStatus', ['RISK', 'STABLE', 'HOLD'], context),
    recordedAt: readDateTime(record, 'recordedAt', context),
  }
}

function readNullableEnum<const T extends string>(
  record: UnknownRecord,
  field: string,
  values: readonly T[],
  context: string,
): T | null {
  const value = record[field]

  if (value === null) {
    return null
  }

  return readEnum(record, field, values, context)
}

function parseExecutionStatus(value: unknown): ExecutionStatusView {
  const context = 'executionStatus'
  const record = readRecord(value, context)

  return {
    id: readPositiveInteger(record, 'id', context),
    recoveryOptionId: readPositiveInteger(record, 'recoveryOptionId', context),
    status: readEnum(record, 'status', ['NOT_STARTED', 'IN_PROGRESS', 'DONE', 'BLOCKED'], context),
    blockerText: readNullableString(record, 'blockerText', context),
    forecastRunId: readNullablePositiveInteger(record, 'forecastRunId', context),
    updatedAt: readDateTime(record, 'updatedAt', context),
  }
}

export function parseRecoveryExecutionStatuses(value: unknown): readonly ExecutionStatusView[] {
  if (!Array.isArray(value)) {
    throw contractError('recoveryExecutionStatuses')
  }

  return value.map(parseExecutionStatus)
}
