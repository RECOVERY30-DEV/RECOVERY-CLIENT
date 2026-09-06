import { describe, expect, it, vi } from 'vitest'

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error('NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({ notFound: notFoundMock }))

import CashflowDailyDetailPage from './page'

describe('일자별 현금흐름 상세 경로', () => {
  it('지원하지 않는 날짜는 찾을 수 없는 화면으로 처리한다', async () => {
    await expect(
      CashflowDailyDetailPage({ params: Promise.resolve({ date: 'invalid-date' }) }),
    ).rejects.toThrow('NOT_FOUND')
  })
})
