import { ApiContractError } from '@/shared/api/api-response'

export type ConsultationChannel = 'PHONE' | 'VISIT' | 'VIDEO' | 'CHAT'
export type ConsultationStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED'
export type CounselorSlotStatus = 'OPEN' | 'BOOKED' | 'BLOCKED'

export type Counselor = Readonly<{
  counselorId: number
  name: string
  institution: string | null
  branch: string | null
  role: string | null
}>

export type CounselorSlot = Readonly<{
  slotId: number
  startAt: string
  endAt: string
  capacity: number
  bookedCount: number
  remainingSeats: number
  status: CounselorSlotStatus
  bookable: boolean
}>

export type BookConsultationCommand = Readonly<{
  channel: ConsultationChannel
  counselorId?: number
  slotId?: number
  scheduledAt?: string
  purposeText?: string
  preQuestion?: string
  transferConsentGranted?: boolean
  packetId?: number
  recoveryOptionIds?: readonly number[]
}>

export type BookedConsultation = Readonly<{
  consultationId: number
  status: ConsultationStatus
  channel: ConsultationChannel
  scheduledAt: string
}>

export type Consultation = Readonly<{
  consultationId: number
  businessId: number
  packetId: number | null
  counselorId: number | null
  counselorName: string | null
  channel: ConsultationChannel
  scheduledAt: string
  purposeText: string
  preQuestion: string | null
  transferConsentGranted: boolean
  status: ConsultationStatus
  recoveryOptionIds: ReadonlyArray<number>
  finalDecision: string | null
  resultNote: string | null
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

function readIntegerArray(
  record: UnknownRecord,
  field: string,
  context: string,
): ReadonlyArray<number> {
  const value = record[field]

  if (!Array.isArray(value) || value.some((item) => !Number.isSafeInteger(item))) {
    throw contractError(context, field)
  }

  return value as number[]
}

function parseCounselor(value: unknown): Counselor {
  const context = 'counselor'
  const record = readRecord(value, context)

  return {
    counselorId: readInteger(record, 'counselorId', context),
    name: readString(record, 'name', context),
    institution: readNullableString(record, 'institution', context),
    branch: readNullableString(record, 'branch', context),
    role: readNullableString(record, 'role', context),
  }
}

export function parseCounselors(value: unknown): ReadonlyArray<Counselor> {
  if (!Array.isArray(value)) {
    throw contractError('counselors')
  }

  return value.map(parseCounselor)
}

function parseCounselorSlot(value: unknown): CounselorSlot {
  const context = 'counselorSlot'
  const record = readRecord(value, context)

  return {
    slotId: readInteger(record, 'slotId', context),
    startAt: readDateTime(record, 'startAt', context),
    endAt: readDateTime(record, 'endAt', context),
    capacity: readInteger(record, 'capacity', context),
    bookedCount: readInteger(record, 'bookedCount', context),
    remainingSeats: readInteger(record, 'remainingSeats', context),
    status: readEnum(record, 'status', ['OPEN', 'BOOKED', 'BLOCKED'], context),
    bookable: readBoolean(record, 'bookable', context),
  }
}

export function parseCounselorSlots(value: unknown): ReadonlyArray<CounselorSlot> {
  if (!Array.isArray(value)) {
    throw contractError('counselorSlots')
  }

  return value.map(parseCounselorSlot)
}

export function parseBookedConsultation(value: unknown): BookedConsultation {
  const context = 'bookedConsultation'
  const record = readRecord(value, context)

  return {
    consultationId: readInteger(record, 'consultationId', context),
    status: readEnum(
      record,
      'status',
      ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELED'],
      context,
    ),
    channel: readEnum(record, 'channel', ['PHONE', 'VISIT', 'VIDEO', 'CHAT'], context),
    scheduledAt: readDateTime(record, 'scheduledAt', context),
  }
}

export function parseConsultation(value: unknown): Consultation {
  const context = 'consultation'
  const record = readRecord(value, context)

  return {
    consultationId: readInteger(record, 'consultationId', context),
    businessId: readInteger(record, 'businessId', context),
    packetId: readNullableInteger(record, 'packetId', context),
    counselorId: readNullableInteger(record, 'counselorId', context),
    counselorName: readNullableString(record, 'counselorName', context),
    channel: readEnum(record, 'channel', ['PHONE', 'VISIT', 'VIDEO', 'CHAT'], context),
    scheduledAt: readDateTime(record, 'scheduledAt', context),
    purposeText: readString(record, 'purposeText', context),
    preQuestion: readNullableString(record, 'preQuestion', context),
    transferConsentGranted: readBoolean(record, 'transferConsentGranted', context),
    status: readEnum(
      record,
      'status',
      ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELED'],
      context,
    ),
    recoveryOptionIds: readIntegerArray(record, 'recoveryOptionIds', context),
    finalDecision: readNullableString(record, 'finalDecision', context),
    resultNote: readNullableString(record, 'resultNote', context),
  }
}
