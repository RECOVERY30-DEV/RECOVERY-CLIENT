import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { createSelfActionPlan, getSelfActionPlans, updateSelfActionItem } from './self-action-api'

const API_BASE_URL = 'https://api.example.com'

function response(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

const item = { id: 11, title: '임대인 협의', targetDate: null, status: 'PENDING', memo: null }
const plan = {
  id: 5,
  recoveryOptionId: 2,
  expectedEffectText: '월말 집중 부담 분산',
  status: 'ACTIVE',
  savedAt: '2025-07-14T00:00:00Z',
  items: [item],
}

describe('self action API', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('계획 목록을 조회하고 생성·준비 항목 상태를 실제 경로와 HTTP method로 요청한다', async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request))
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      requests.push(input)
      bodies.push(input.method === 'GET' ? undefined : await input.clone().json())
      return response(
        input.method === 'GET'
          ? [plan]
          : input.method === 'PATCH'
            ? { ...item, status: 'DONE' }
            : plan,
      )
    })
    vi.stubGlobal('fetch', fetchMock)
    const client = createApiClient(API_BASE_URL)

    await getSelfActionPlans(1, { client })
    await createSelfActionPlan(
      1,
      { recoveryOptionId: 2, expectedEffectText: '효과', items: [{ title: '임대인 협의' }] },
      { client },
    )
    await updateSelfActionItem(1, 11, { status: 'DONE' }, { client })

    expect(requests.map((request) => [request.method, new URL(request.url).pathname])).toEqual([
      ['GET', '/api/forecasts/1/self-action-plans'],
      ['POST', '/api/forecasts/1/self-action-plans'],
      ['PATCH', '/api/forecasts/1/self-action-plans/items/11'],
    ])
    expect(bodies[1]).toEqual({
      recoveryOptionId: 2,
      expectedEffectText: '효과',
      items: [{ title: '임대인 협의' }],
    })
    expect(bodies[2]).toEqual({ status: 'DONE' })
  })
})
