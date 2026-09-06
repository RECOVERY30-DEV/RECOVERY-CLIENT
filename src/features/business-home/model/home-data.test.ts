import { describe, expect, it } from 'vitest'

import { formatHomeDataUpdatedAt } from './home-data'

describe('formatHomeDataUpdatedAt', () => {
  const referenceAt = new Date('2025-07-15T11:00:00+09:00')

  it.each([
    ['2025-07-15T10:31:00+09:00', '최근 갱신 1시간 전'],
    ['2025-07-15T10:00:00+09:00', '최근 갱신 1시간 전'],
    ['2025-07-14T12:00:00+09:00', '최근 갱신 23시간 전'],
    ['2025-07-14T11:00:00+09:00', '최근 갱신 1일 전'],
    ['2025-07-12T11:00:00+09:00', '최근 갱신 3일 전'],
  ])('%s를 %s로 가공한다', (updatedAt, expected) => {
    expect(formatHomeDataUpdatedAt(updatedAt, referenceAt)).toBe(expected)
  })

  it('유효하지 않은 갱신 시각은 확인 가능한 문구로 대체한다', () => {
    expect(formatHomeDataUpdatedAt('invalid-date', referenceAt)).toBe('갱신 시간 확인 필요')
  })
})
