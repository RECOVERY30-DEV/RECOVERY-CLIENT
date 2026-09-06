import { ApiContractError } from '@/shared/api/api-response'

export type SupportProgramStatus = 'ACTIVE' | 'CLOSED'
export type EligibilityEvaluationType = 'AUTO' | 'COUNSELOR_ONLY'
export type EligibilityResult = 'LIKELY_PASS' | 'NEEDS_REVIEW' | 'LIKELY_FAIL' | 'UNKNOWN'

export type SupportProgramSummary = Readonly<{
  programId: number
  programCode: string
  name: string
  agency: string
  supportContent: string
  limitAmount: number | null
  interestRateText: string | null
  applyDeadline: string | null
  status: SupportProgramStatus
}>

export type SupportProgramDetail = Readonly<{
  programId: number
  programCode: string
  name: string
  agency: string
  supportContent: string
  limitAmount: number | null
  interestRateText: string
  termText: string
  applyDeadline: string
  applyUrl: string
  officialSourceUrl: string
  rulesetVersion: string
  status: SupportProgramStatus
}>

export type ProgramDocument = Readonly<{
  documentId: number
  name: string
  description: string | null
  required: boolean
}>

export type ProgramRecommendation = Readonly<{
  rankNo: number
  programCode: string
  name: string
  agency: string
  applyDeadline: string | null
  matchReason: string
}>

export type ProgramEligibilityItem = Readonly<{
  ruleCode: string
  label: string
  evaluationType: EligibilityEvaluationType
  result: EligibilityResult
  noteText: string | null
}>

export type ProgramEligibility = Readonly<{
  programCode: string
  result: EligibilityResult
  reasonText: string | null
  advisory: boolean
  rulesetVersion: string
  checkedAt: string | null
  items: ReadonlyArray<ProgramEligibilityItem>
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

function readBoolean(record: UnknownRecord, field: string, context: string): boolean {
  const value = record[field]

  if (typeof value !== 'boolean') {
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

function readDate(record: UnknownRecord, field: string, context: string): string {
  const value = readString(record, field, context)

  if (!DATE_PATTERN.test(value)) {
    throw contractError(context, field)
  }

  return value
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

function parseSupportProgramSummary(value: unknown): SupportProgramSummary {
  const context = 'supportProgramSummary'
  const record = readRecord(value, context)

  return {
    programId: readInteger(record, 'programId', context),
    programCode: readString(record, 'programCode', context),
    name: readString(record, 'name', context),
    agency: readString(record, 'agency', context),
    supportContent: readString(record, 'supportContent', context),
    limitAmount: readNullableInteger(record, 'limitAmount', context),
    interestRateText: readNullableString(record, 'interestRateText', context),
    applyDeadline: readNullableDate(record, 'applyDeadline', context),
    status: readEnum(record, 'status', ['ACTIVE', 'CLOSED'], context),
  }
}

export function parseSupportPrograms(value: unknown): ReadonlyArray<SupportProgramSummary> {
  if (!Array.isArray(value)) {
    throw contractError('supportPrograms')
  }

  return value.map(parseSupportProgramSummary)
}

export function parseSupportProgramDetail(value: unknown): SupportProgramDetail {
  const context = 'supportProgramDetail'
  const record = readRecord(value, context)

  return {
    programId: readInteger(record, 'programId', context),
    programCode: readString(record, 'programCode', context),
    name: readString(record, 'name', context),
    agency: readString(record, 'agency', context),
    supportContent: readString(record, 'supportContent', context),
    limitAmount: readNullableInteger(record, 'limitAmount', context),
    interestRateText: readString(record, 'interestRateText', context),
    termText: readString(record, 'termText', context),
    applyDeadline: readDate(record, 'applyDeadline', context),
    applyUrl: readString(record, 'applyUrl', context),
    officialSourceUrl: readString(record, 'officialSourceUrl', context),
    rulesetVersion: readString(record, 'rulesetVersion', context),
    status: readEnum(record, 'status', ['ACTIVE', 'CLOSED'], context),
  }
}

function parseProgramDocument(value: unknown): ProgramDocument {
  const context = 'programDocument'
  const record = readRecord(value, context)

  return {
    documentId: readInteger(record, 'documentId', context),
    name: readString(record, 'name', context),
    description: readNullableString(record, 'description', context),
    required: readBoolean(record, 'required', context),
  }
}

export function parseProgramDocuments(value: unknown): ReadonlyArray<ProgramDocument> {
  if (!Array.isArray(value)) {
    throw contractError('programDocuments')
  }

  return value.map(parseProgramDocument)
}

function parseProgramRecommendation(value: unknown): ProgramRecommendation {
  const context = 'programRecommendation'
  const record = readRecord(value, context)

  return {
    rankNo: readInteger(record, 'rankNo', context),
    programCode: readString(record, 'programCode', context),
    name: readString(record, 'name', context),
    agency: readString(record, 'agency', context),
    applyDeadline: readNullableDate(record, 'applyDeadline', context),
    matchReason: readString(record, 'matchReason', context),
  }
}

export function parseProgramRecommendations(value: unknown): ReadonlyArray<ProgramRecommendation> {
  if (!Array.isArray(value)) {
    throw contractError('programRecommendations')
  }

  return value.map(parseProgramRecommendation)
}

function parseProgramEligibilityItem(value: unknown): ProgramEligibilityItem {
  const context = 'programEligibilityItem'
  const record = readRecord(value, context)

  return {
    ruleCode: readString(record, 'ruleCode', context),
    label: readString(record, 'label', context),
    evaluationType: readEnum(record, 'evaluationType', ['AUTO', 'COUNSELOR_ONLY'], context),
    result: readEnum(
      record,
      'result',
      ['LIKELY_PASS', 'NEEDS_REVIEW', 'LIKELY_FAIL', 'UNKNOWN'],
      context,
    ),
    noteText: readNullableString(record, 'noteText', context),
  }
}

export function parseProgramEligibility(value: unknown): ProgramEligibility {
  const context = 'programEligibility'
  const record = readRecord(value, context)
  const items = record.items

  if (!Array.isArray(items)) {
    throw contractError(context, 'items')
  }

  return {
    programCode: readString(record, 'programCode', context),
    result: readEnum(
      record,
      'result',
      ['LIKELY_PASS', 'NEEDS_REVIEW', 'LIKELY_FAIL', 'UNKNOWN'],
      context,
    ),
    reasonText: readNullableString(record, 'reasonText', context),
    advisory: readBoolean(record, 'advisory', context),
    rulesetVersion: readString(record, 'rulesetVersion', context),
    checkedAt: readNullableDateTime(record, 'checkedAt', context),
    items: items.map(parseProgramEligibilityItem),
  }
}
