import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from './api-client'
import { ApiContractError } from './api-response'
import { deleteApiData, getApiData, patchApiData, postApiData, putApiData } from './api-request'

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

const parseBoolean = (value: unknown) => {
  if (typeof value !== 'boolean') {
    throw new ApiContractError('불리언 응답 형식이 올바르지 않습니다.')
  }

  return value
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

describe('postApiData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('JSON body를 POST하고 성공 응답의 data만 반환한다', async () => {
    let requestBody: unknown
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) {
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      }

      requestBody = await input.clone().json()

      return Response.json({
        success: true,
        data: { id: 8 },
        error: null,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await postApiData(
      'businesses/1/consultations',
      { channel: 'PHONE', slotId: 31 },
      parseIdentifier,
      { client: createApiClient('https://api.example.com/api') },
    )
    const request = fetchMock.mock.calls[0]?.[0]

    expect(result).toEqual({ id: 8 })
    expect(request).toBeInstanceOf(Request)

    if (!(request instanceof Request)) {
      throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
    }

    expect(request.method).toBe('POST')
    expect(requestBody).toEqual({ channel: 'PHONE', slotId: 31 })
  })
})

describe('putApiData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('JSON body를 PUT하고 성공 응답의 data만 반환한다', async () => {
    let requestBody: unknown
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) {
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      }

      requestBody = await input.clone().json()

      return Response.json({ success: true, data: true, error: null })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await putApiData(
      'businesses/1/consents/ANALYSIS',
      { granted: true },
      parseBoolean,
      { client: createApiClient('https://api.example.com/api') },
    )
    const request = fetchMock.mock.calls[0]?.[0]

    expect(result).toBe(true)
    expect(request).toBeInstanceOf(Request)

    if (!(request instanceof Request)) {
      throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
    }

    expect(request.method).toBe('PUT')
    expect(requestBody).toEqual({ granted: true })
  })

  it('PUT HTTP 오류 응답의 상태와 백엔드 오류 코드를 보존한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        Response.json(
          { code: 'CONSENT_400_1', message: '동의 상태가 올바르지 않습니다.' },
          { status: 400 },
        ),
      ),
    )

    const request = putApiData('businesses/1/consents/ANALYSIS', { granted: true }, parseBoolean, {
      client: createApiClient('https://api.example.com/api'),
    })

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'CONSENT_400_1',
      message: '동의 상태가 올바르지 않습니다.',
    })
  })
})

describe('patchApiData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('JSON body를 PATCH하고 성공 응답의 data만 반환한다', async () => {
    let requestBody: unknown
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (!(input instanceof Request)) {
        throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
      }

      requestBody = await input.clone().json()

      return Response.json({ success: true, data: true, error: null })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await patchApiData(
      'forecasts/1/self-action-plans/items/11',
      { status: 'DONE' },
      parseBoolean,
      { client: createApiClient('https://api.example.com/api') },
    )
    const request = fetchMock.mock.calls[0]?.[0]

    expect(result).toBe(true)
    expect(request).toBeInstanceOf(Request)

    if (!(request instanceof Request)) {
      throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
    }

    expect(request.method).toBe('PATCH')
    expect(requestBody).toEqual({ status: 'DONE' })
  })

  it('PATCH HTTP 오류 응답의 상태와 백엔드 오류 코드를 보존한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        Response.json(
          { code: 'SELF_ACTION_404_1', message: '실행 항목을 찾을 수 없습니다.' },
          { status: 404 },
        ),
      ),
    )

    const request = patchApiData(
      'forecasts/1/self-action-plans/items/11',
      { status: 'DONE' },
      parseBoolean,
      { client: createApiClient('https://api.example.com/api') },
    )

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'SELF_ACTION_404_1',
      message: '실행 항목을 찾을 수 없습니다.',
    })
  })
})

describe('deleteApiData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('body 없이 DELETE하고 성공 응답의 data만 반환한다', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({ success: true, data: true, error: null }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await deleteApiData('businesses/1/adjustments/10', parseBoolean, {
      client: createApiClient('https://api.example.com/api'),
    })
    const request = fetchMock.mock.calls[0]?.[0]

    expect(result).toBe(true)
    expect(request).toBeInstanceOf(Request)

    if (!(request instanceof Request)) {
      throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
    }

    expect(request.method).toBe('DELETE')
    await expect(request.clone().text()).resolves.toBe('')
  })

  it('DELETE HTTP 오류 응답의 상태와 백엔드 오류 코드를 보존한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        Response.json(
          { code: 'ADJUSTMENT_404_1', message: '보정값을 찾을 수 없습니다.' },
          { status: 404 },
        ),
      ),
    )

    const request = deleteApiData('businesses/1/adjustments/10', parseBoolean, {
      client: createApiClient('https://api.example.com/api'),
    })

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'ADJUSTMENT_404_1',
      message: '보정값을 찾을 수 없습니다.',
    })
  })
})
