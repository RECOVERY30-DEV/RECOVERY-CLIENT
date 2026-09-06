import { describe, expect, it } from 'vitest'

import {
  SUPPORT_PROGRAM_REFERENCE_DATE,
  SUPPORT_PROGRAMS,
  formatSupportProgramDeadline,
  isSupportProgramApplicationOpen,
} from './support-program-data'

describe('지원사업 신청 기한', () => {
  it('마지막 갱신 기준일과 ISO 신청 기한에서 신청 가능 상태를 파생한다', () => {
    expect(SUPPORT_PROGRAM_REFERENCE_DATE).toBe('2025-06-18')
    expect(
      SUPPORT_PROGRAMS.map((program) =>
        isSupportProgramApplicationOpen(program.applicationDeadline),
      ),
    ).toEqual([true, true, true])
    expect(formatSupportProgramDeadline('2025-07-31')).toBe('2025년 7월 31일')
  })

  it.each([
    ['deadline 당일', '2025-06-18', true],
    ['deadline 이전', '2025-06-17', false],
    ['deadline 이후', '2025-06-19', true],
  ] as const)('%s을 기준일과 비교한다', (_name, deadline, expected) => {
    expect(isSupportProgramApplicationOpen(deadline)).toBe(expected)
  })
})
