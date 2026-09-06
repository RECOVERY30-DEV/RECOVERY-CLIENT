import { describe, expect, it } from 'vitest'

import CashflowDailyDetailPage from './page'

describe('일자별 현금흐름 상세 경로', () => {
  it('API에서 제공하는 동적 날짜를 상세 화면에 전달한다', async () => {
    await expect(
      CashflowDailyDetailPage({ params: Promise.resolve({ date: '2025-07-20' }) }),
    ).resolves.toBeDefined()
  })
})
