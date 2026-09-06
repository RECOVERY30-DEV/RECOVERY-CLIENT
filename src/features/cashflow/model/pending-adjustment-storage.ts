import type { AdjustmentCertainty, AdjustmentType } from '../api/adjustment-contract'

export const PENDING_ADJUSTMENTS_STORAGE_KEY = 'recovery30.pending-adjustments.v1'

type PendingAdjustment = Readonly<{
  adjustmentType: AdjustmentType
  amount: number
  certainty: AdjustmentCertainty
  expectedDate: string
  memo?: string
  savedAt: string
  selection: string
}>

type PendingAdjustmentInput = Omit<PendingAdjustment, 'savedAt'>

function isPendingAdjustment(value: unknown): value is PendingAdjustment {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false

  const record = value as Record<string, unknown>
  return (
    typeof record.adjustmentType === 'string' &&
    typeof record.amount === 'number' &&
    typeof record.certainty === 'string' &&
    typeof record.expectedDate === 'string' &&
    typeof record.savedAt === 'string' &&
    typeof record.selection === 'string'
  )
}

function readPendingAdjustments(): PendingAdjustment[] {
  const stored = window.localStorage.getItem(PENDING_ADJUSTMENTS_STORAGE_KEY)
  if (stored === null) return []

  const parsed: unknown = JSON.parse(stored)
  return Array.isArray(parsed) ? parsed.filter(isPendingAdjustment) : []
}

export function persistPendingAdjustment(input: PendingAdjustmentInput): boolean {
  if (typeof window === 'undefined') return false

  try {
    const pendingAdjustment: PendingAdjustment = { ...input, savedAt: new Date().toISOString() }
    window.localStorage.setItem(
      PENDING_ADJUSTMENTS_STORAGE_KEY,
      JSON.stringify([...readPendingAdjustments(), pendingAdjustment]),
    )
    return true
  } catch {
    return false
  }
}
