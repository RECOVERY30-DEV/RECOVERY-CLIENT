import { ApiContractError } from '@/shared/api/api-response'

export type DailyItemKind = 'CONFIRMED' | 'EXPECTED' | 'ADJUSTMENT'
export type DailyItemDirection = 'I' | 'O'
export type NarrativeKind =
  'STATUS_LABEL' | 'STABLE_REASON' | 'RISK_NOTE' | 'STATE_CHANGE_HINT' | 'DISCLAIMER'

export type DailyView = Readonly<{
  targetDate: string
  dDay: number
  openingBalance: number
  confirmedInflow: number
  confirmedOutflow: number
  expectedInflowMin: number
  expectedInflowMax: number
  expectedOutflowMin: number
  expectedOutflowMax: number
  adjustmentNet: number
  closingBalanceConservative: number
  closingBalanceExpected: number
  closingBalanceOptimistic: number
  shortfall: boolean
  holiday: boolean
  holidayShiftNote: string | null
}>

export type DailyItemView = Readonly<{
  itemKind: DailyItemKind
  label: string
  subLabel: string | null
  direction: DailyItemDirection
  amountMin: number
  amountMax: number
  refType: string | null
  refId: number | null
}>

export type DailyDetailView = DailyView &
  Readonly<{
    items: ReadonlyArray<DailyItemView>
  }>

export type NarrativeView = Readonly<{
  kind: NarrativeKind
  seq: number
  text: string
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

function readNumber(record: UnknownRecord, field: string, context: string): number {
  const value = record[field]

  if (typeof value !== 'number' || !Number.isFinite(value)) {
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

function parseDailyView(value: unknown, context: string): DailyView {
  const record = readRecord(value, context)

  return {
    targetDate: readDate(record, 'targetDate', context),
    dDay: readInteger(record, 'dDay', context),
    openingBalance: readNumber(record, 'openingBalance', context),
    confirmedInflow: readNumber(record, 'confirmedInflow', context),
    confirmedOutflow: readNumber(record, 'confirmedOutflow', context),
    expectedInflowMin: readNumber(record, 'expectedInflowMin', context),
    expectedInflowMax: readNumber(record, 'expectedInflowMax', context),
    expectedOutflowMin: readNumber(record, 'expectedOutflowMin', context),
    expectedOutflowMax: readNumber(record, 'expectedOutflowMax', context),
    adjustmentNet: readNumber(record, 'adjustmentNet', context),
    closingBalanceConservative: readNumber(record, 'closingBalanceConservative', context),
    closingBalanceExpected: readNumber(record, 'closingBalanceExpected', context),
    closingBalanceOptimistic: readNumber(record, 'closingBalanceOptimistic', context),
    shortfall: readBoolean(record, 'shortfall', context),
    holiday: readBoolean(record, 'holiday', context),
    holidayShiftNote: readNullableString(record, 'holidayShiftNote', context),
  }
}

function parseDailyItemView(value: unknown, context: string): DailyItemView {
  const record = readRecord(value, context)

  return {
    itemKind: readEnum(record, 'itemKind', ['CONFIRMED', 'EXPECTED', 'ADJUSTMENT'], context),
    label: readString(record, 'label', context),
    subLabel: readNullableString(record, 'subLabel', context),
    direction: readEnum(record, 'direction', ['I', 'O'], context),
    amountMin: readNumber(record, 'amountMin', context),
    amountMax: readNumber(record, 'amountMax', context),
    refType: readNullableString(record, 'refType', context),
    refId: readNullableInteger(record, 'refId', context),
  }
}

export function parseDailyViews(value: unknown): ReadonlyArray<DailyView> {
  if (!Array.isArray(value)) {
    throw contractError('dailyViews')
  }

  return value.map((item) => parseDailyView(item, 'dailyView'))
}

export function parseDailyDetailView(value: unknown): DailyDetailView {
  const record = readRecord(value, 'dailyDetailView')
  const dailyView = parseDailyView(record, 'dailyDetailView')
  const items = record.items

  if (!Array.isArray(items)) {
    throw contractError('dailyDetailView', 'items')
  }

  return {
    ...dailyView,
    items: items.map((item) => parseDailyItemView(item, 'dailyDetailView.items')),
  }
}

export function parseNarrativeViews(value: unknown): ReadonlyArray<NarrativeView> {
  if (!Array.isArray(value)) {
    throw contractError('narrativeViews')
  }

  return value.map((value) => {
    const context = 'narrativeView'
    const record = readRecord(value, context)

    return {
      kind: readEnum(
        record,
        'kind',
        ['STATUS_LABEL', 'STABLE_REASON', 'RISK_NOTE', 'STATE_CHANGE_HINT', 'DISCLAIMER'],
        context,
      ),
      seq: readInteger(record, 'seq', context),
      text: readString(record, 'text', context),
    }
  })
}
