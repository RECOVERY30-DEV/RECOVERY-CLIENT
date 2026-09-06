import { ApiContractError } from '@/shared/api/api-response'

export type RecoveryOptionCategory = 'FINANCIAL_CONSULT' | 'SELF_ACTION' | 'SUPPORT_PROGRAM'
export type RecoveryOptionDifficulty = 'LOW' | 'MID' | 'HIGH'
export type RecoveryScenarioType = 'BASELINE' | 'SIMULATED'

export type RecoveryOptionView = Readonly<{
  optionId: number
  optionCode: string
  category: RecoveryOptionCategory
  expectedEffectText: string
  monthlyBurdenChangeText: string
  preconditionText: string
  difficulty: RecoveryOptionDifficulty
  requiresReview: boolean
  disclaimer: string
  selected: boolean
}>

export type RecoveryScenario = Readonly<{
  scenarioId: number
  scenarioType: RecoveryScenarioType
  firstShortfallDate: string
  minBalance: number
  deltaDays: number
  deltaMinBalance: number
  monthlyPaymentDelta: number
  note: string
  appliedOptionIds: readonly number[]
}>

export type RecoveryOptionSelections = Readonly<{
  selectedOptionIds: readonly number[]
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

function readString(record: UnknownRecord, field: string, context: string): string {
  const value = record[field]

  if (typeof value !== 'string') {
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

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw contractError(context, field)
  }

  return value
}

function readIntegerArray(
  record: UnknownRecord,
  field: string,
  context: string,
): readonly number[] {
  const value = record[field]

  if (!Array.isArray(value) || value.some((item) => !Number.isSafeInteger(item))) {
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

export function parseRecoveryOptions(value: unknown): readonly RecoveryOptionView[] {
  if (!Array.isArray(value)) {
    throw contractError('recoveryOptions')
  }

  return value.map((item) => {
    const context = 'recoveryOptions[]'
    const record = readRecord(item, context)

    return {
      optionId: readInteger(record, 'optionId', context),
      optionCode: readString(record, 'optionCode', context),
      category: readEnum(
        record,
        'category',
        ['FINANCIAL_CONSULT', 'SELF_ACTION', 'SUPPORT_PROGRAM'],
        context,
      ),
      expectedEffectText: readString(record, 'expectedEffectText', context),
      monthlyBurdenChangeText: readString(record, 'monthlyBurdenChangeText', context),
      preconditionText: readString(record, 'preconditionText', context),
      difficulty: readEnum(record, 'difficulty', ['LOW', 'MID', 'HIGH'], context),
      requiresReview: readBoolean(record, 'requiresReview', context),
      disclaimer: readString(record, 'disclaimer', context),
      selected: readBoolean(record, 'selected', context),
    }
  })
}

export function parseRecoveryScenarios(value: unknown): readonly RecoveryScenario[] {
  if (!Array.isArray(value)) {
    throw contractError('recoveryScenarios')
  }

  return value.map((item) => {
    const context = 'recoveryScenarios[]'
    const record = readRecord(item, context)

    return {
      scenarioId: readInteger(record, 'scenarioId', context),
      scenarioType: readEnum(record, 'scenarioType', ['BASELINE', 'SIMULATED'], context),
      firstShortfallDate: readDate(record, 'firstShortfallDate', context),
      minBalance: readInteger(record, 'minBalance', context),
      deltaDays: readInteger(record, 'deltaDays', context),
      deltaMinBalance: readInteger(record, 'deltaMinBalance', context),
      monthlyPaymentDelta: readInteger(record, 'monthlyPaymentDelta', context),
      note: readString(record, 'note', context),
      appliedOptionIds: readIntegerArray(record, 'appliedOptionIds', context),
    }
  })
}

export function parseRecoveryOptionSelections(value: unknown): RecoveryOptionSelections {
  const context = 'recoveryOptionSelections'
  const record = readRecord(value, context)

  return {
    selectedOptionIds: readIntegerArray(record, 'selectedOptionIds', context),
  }
}
