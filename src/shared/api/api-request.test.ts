import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from './api-client'
import { ApiContractError } from './api-response'
import { getApiData } from './api-request'

const parseIdentifier = (value: unknown) => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'number'
  ) {
    throw new ApiContractError('식별자 응답 형식이 올바르지 않습니다.')
  }

  return { id: value.id }
}

describe('getApiData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET 성공 응답을 검증하고 data만 반환한다', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({
        success: true,
        data: { id: 4821 },
        error: null,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await getApiData('forecasts/latest', parseIdentifier, {
      client: createApiClient('https://api.example.com/api'),
    })

    const request = fetchMock.mock.calls[0]?.[0]

    expect(result).toEqual({ id: 4821 })
    expect(request).toBeInstanceOf(Request)

    if (!(request instanceof Request)) {
      throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
    }

    expect(request.url).toBe('https://api.example.com/api/forecasts/latest')
  })

  it('HTTP 오류 응답의 상태와 백엔드 오류 코드를 보존한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        Response.json(
          {
            code: 'FORECAST_404',
            message: '예측 실행을 찾을 수 없습니다.',
          },
          { status: 404 },
        ),
      ),
    )

    const request = getApiData('forecasts/4821', parseIdentifier, {
      client: createApiClient('https://api.example.com/api'),
    })

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'FORECAST_404',
      message: '예측 실행을 찾을 수 없습니다.',
    })
  })

  it('네트워크 오류를 사용자에게 표시 가능한 ApiError로 변환한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )

    const request = getApiData('forecasts/4821', parseIdentifier, {
      client: createApiClient('https://api.example.com/api'),
    })

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: undefined,
      message: '서버와 통신할 수 없습니다.',
    })
  })

  it('요청 취소 오류는 변환하지 않는다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => {
        throw new DOMException('요청이 취소되었습니다.', 'AbortError')
      }),
    )

    const request = getApiData('forecasts/4821', parseIdentifier, {
      client: createApiClient('https://api.example.com/api'),
    })

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
})
