import { describe, expect, it, vi } from 'vitest'

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error('NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({ notFound: notFoundMock }))

import SupportProgramDetailPage, { dynamicParams, generateStaticParams } from './page'

describe('지원사업 상세 경로', () => {
  it('fixture의 모든 ID를 정적 경로로 제공한다', () => {
    expect(dynamicParams).toBe(false)
    expect(generateStaticParams()).toEqual([
      { programId: 'small-business-stability-fund' },
      { programId: 'credit-guarantee-sales-decline' },
      { programId: 'small-business-management-improvement' },
    ])
  })

  it('알 수 없는 ID는 찾을 수 없는 화면으로 처리한다', async () => {
    await expect(
      SupportProgramDetailPage({ params: Promise.resolve({ programId: 'unknown-program' }) }),
    ).rejects.toThrow('NOT_FOUND')
  })
})
