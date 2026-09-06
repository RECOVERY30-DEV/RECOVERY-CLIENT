import { getSupportProgram } from './model/support-program-data'

export type SupportProgramConsultationContext = Readonly<{
  id: string
  title: string
}>

export function getSupportProgramConsultationContext(
  programId: string | undefined,
): SupportProgramConsultationContext | undefined {
  if (!programId) {
    return undefined
  }

  const program = getSupportProgram(programId)

  return program ? { id: program.id, title: program.title } : undefined
}
