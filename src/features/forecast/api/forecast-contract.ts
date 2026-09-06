import { ApiContractError } from '@/shared/api/api-response'

export type ForecastStatus = 'RISK' | 'STABLE' | 'HOLD'

export type LatestForecast = Readonly<{
  forecastRunId: number
  baseDate: string
  updatedAt: string
  status: ForecastStatus
}>

export type ForecastMinBalance = Readonly<{
  forecastRunId: number
  available: boolean
  conservative: number | null
  expected: number | null
  optimistic: number | null
}>

export type ForecastShortfall = Readonly<{
  forecastRunId: number
  hasShortfall: boolean
  dDay: number | null
  expectedDate: string | null
  horizonDays: number | null
  shortfallAmountMin: number | null
  shortfallAmountMax: number | null
}>

export type ForecastSafetyBuffer = Readonly<{
  forecastRunId: number
  amount: number
  bufferMet: boolean
}>

export type ForecastEvidence = Readonly<{
  refType: string
  refId: number
  label: string
  periodText: string
}>

export type ForecastRiskDriver = Readonly<{
  rank: number
  driverCode: string
  title: string
  occurrenceDate: string | null
  occurrenceText: string | null
  impactPeriodText: string | null
  metricText: string | null
  contributionAmount: number | null
  estimating: boolean
  evidence?: ReadonlyArray<ForecastEvidence>
}>

export type ForecastCoverageSource = 'BANK_ACCOUNT' | 'CARD_SETTLEMENT' | 'LOAN' | 'AUTO_TRANSFER'

export type ForecastCoverageStatus = 'COMPLETE' | 'PARTIAL'

export type ForecastCoverage = Readonly<{
  sourceType: ForecastCoverageSource
  status: ForecastCoverageStatus
  coverageRate: number
  lastSyncedAt: string
  belowThreshold: boolean
}>

type UnknownRecord = Record<string, unknown>

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

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

function readInteger(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]

  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw contractError(context, field)
  }

  return value
}

function readNullableInteger(record: UnknownRecord, field: string, context: string): number | null {
  const value = record[field]

  if (value !== null && (typeof value !== 'number' || !Number.isSafeInteger(value))) {
    throw contractError(context, field)
  }

  return value
}

function readNumber(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]

  if (typeof value !== 'number' || !Number.isFinite(value)) {
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

function readDate(record: UnknownRecord, field: string, context: string): string {
  const value = readString(record, field, context)

  if (!DATE_PATTERN.test(value)) {
    throw contractError(context, field)
  }

  return value
}

function readNullableDate(record: UnknownRecord, field: string, context: string): string | null {
  const value = readNullableString(record, field, context)

  if (value !== null && !DATE_PATTERN.test(value)) {
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

export function parseLatestForecast(value: unknown): LatestForecast {
  const context = 'latestForecast'
  const record = readRecord(value, context)

  return {
    forecastRunId: readInteger(record, 'forecastRunId', context),
    baseDate: readDate(record, 'baseDate', context),
    updatedAt: readDateTime(record, 'updatedAt', context),
    status: readEnum(record, 'status', ['RISK', 'STABLE', 'HOLD'], context),
  }
}

export function parseForecastMinBalance(value: unknown): ForecastMinBalance {
  const context = 'forecastMinBalance'
  const record = readRecord(value, context)
  const available = readBoolean(record, 'available', context)
  const conservative = readNullableInteger(record, 'conservative', context)
  const expected = readNullableInteger(record, 'expected', context)
  const optimistic = readNullableInteger(record, 'optimistic', context)
  const balances = [conservative, expected, optimistic]

  if (
    (available && balances.some((balance) => balance === null)) ||
    (!available && balances.some((balance) => balance !== null))
  ) {
    throw contractError(context)
  }

  return {
    forecastRunId: readInteger(record, 'forecastRunId', context),
    available,
    conservative,
    expected,
    optimistic,
  }
}

export function parseForecastShortfall(value: unknown): ForecastShortfall {
  const context = 'forecastShortfall'
  const record = readRecord(value, context)
  const hasShortfall = readBoolean(record, 'hasShortfall', context)
  const dDay = readNullableInteger(record, 'dDay', context)
  const expectedDate = readNullableDate(record, 'expectedDate', context)
  const horizonDays = readNullableInteger(record, 'horizonDays', context)
  const shortfallAmountMin = readNullableInteger(record, 'shortfallAmountMin', context)
  const shortfallAmountMax = readNullableInteger(record, 'shortfallAmountMax', context)
  const shortfallValues = [dDay, expectedDate, horizonDays, shortfallAmountMin, shortfallAmountMax]

  if (
    (hasShortfall && shortfallValues.some((shortfallValue) => shortfallValue === null)) ||
    (!hasShortfall && shortfallValues.some((shortfallValue) => shortfallValue !== null))
  ) {
    throw contractError(context)
  }

  return {
    forecastRunId: readInteger(record, 'forecastRunId', context),
    hasShortfall,
    dDay,
    expectedDate,
    horizonDays,
    shortfallAmountMin,
    shortfallAmountMax,
  }
}

export function parseForecastSafetyBuffer(value: unknown): ForecastSafetyBuffer {
  const context = 'forecastSafetyBuffer'
  const record = readRecord(value, context)

  return {
    forecastRunId: readInteger(record, 'forecastRunId', context),
    amount: readInteger(record, 'amount', context),
    bufferMet: readBoolean(record, 'bufferMet', context),
  }
}

function parseForecastEvidence(value: unknown): ForecastEvidence {
  const context = 'forecastEvidence'
  const record = readRecord(value, context)

  return {
    refType: readString(record, 'refType', context),
    refId: readInteger(record, 'refId', context),
    label: readString(record, 'label', context),
    periodText: readString(record, 'periodText', context),
  }
}

function parseForecastRiskDriver(value: unknown): ForecastRiskDriver {
  const context = 'forecastRiskDriver'
  const record = readRecord(value, context)
  const evidence = record.evidence

  if (evidence !== undefined && !Array.isArray(evidence)) {
    throw contractError(context, 'evidence')
  }

  return {
    rank: readInteger(record, 'rank', context),
    driverCode: readString(record, 'driverCode', context),
    title: readString(record, 'title', context),
    occurrenceDate: readNullableDate(record, 'occurrenceDate', context),
    occurrenceText: readNullableString(record, 'occurrenceText', context),
    impactPeriodText: readNullableString(record, 'impactPeriodText', context),
    metricText: readNullableString(record, 'metricText', context),
    contributionAmount: readNullableInteger(record, 'contributionAmount', context),
    estimating: readBoolean(record, 'estimating', context),
    ...(evidence === undefined ? {} : { evidence: evidence.map(parseForecastEvidence) }),
  }
}

export function parseForecastRiskDrivers(value: unknown): ReadonlyArray<ForecastRiskDriver> {
  if (!Array.isArray(value)) {
    throw contractError('forecastRiskDrivers')
  }

  return value.map(parseForecastRiskDriver)
}

function parseForecastCoverageItem(value: unknown): ForecastCoverage {
  const context = 'forecastCoverage'
  const record = readRecord(value, context)

  return {
    sourceType: readEnum(
      record,
      'sourceType',
      ['BANK_ACCOUNT', 'CARD_SETTLEMENT', 'LOAN', 'AUTO_TRANSFER'],
      context,
    ),
    status: readEnum(record, 'status', ['COMPLETE', 'PARTIAL'], context),
    coverageRate: readNumber(record, 'coverageRate', context),
    lastSyncedAt: readDateTime(record, 'lastSyncedAt', context),
    belowThreshold: readBoolean(record, 'belowThreshold', context),
  }
}

export function parseForecastCoverage(value: unknown): ReadonlyArray<ForecastCoverage> {
  if (!Array.isArray(value)) {
    throw contractError('forecastCoverage')
  }

  return value.map(parseForecastCoverageItem)
}
