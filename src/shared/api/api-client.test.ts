import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from './api-client'

describe('createApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('기준 URL 아래로 요청을 전송한다', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await createApiClient('https://api.example.com/v1').get('health')

    const request = fetchMock.mock.calls[0]?.[0]

    expect(request).toBeInstanceOf(Request)

    if (!(request instanceof Request)) {
      throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
    }

    expect(request.url).toBe('https://api.example.com/v1/health')
  })

  it('요청 경로가 슬래시로 시작해도 기준 URL의 경로를 유지한다', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await createApiClient('https://api.example.com/v1').get('/health')

    const request = fetchMock.mock.calls[0]?.[0]

    if (!(request instanceof Request)) {
      throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
    }

    expect(request.url).toBe('https://api.example.com/v1/health')
  })

  it('HTTP 오류를 자체 재시도하지 않는다', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)

    const request = createApiClient('https://api.example.com').get('health')

    await expect(request).rejects.toMatchObject({ response: { status: 500 } })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
