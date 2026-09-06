import { describe, expect, it } from 'vitest'

import { ApiContractError, ApiError, parseApiResponse, type ApiResponse } from './api-response'

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

describe('parseApiResponse', () => {
  it('성공 응답의 data를 검증한 결과로 반환한다', () => {
    const response: ApiResponse<unknown> = {
      success: true,
      data: { id: 4821 },
      error: null,
    }

    expect(parseApiResponse(response, parseIdentifier)).toEqual({ id: 4821 })
  })

  it('백엔드 실패 응답을 코드가 포함된 ApiError로 변환한다', () => {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'FORECAST_404',
        message: '예측 실행을 찾을 수 없습니다.',
      },
    }

    expect(() => parseApiResponse(response, parseIdentifier)).toThrowError(
      expect.objectContaining({
        name: 'ApiError',
        code: 'FORECAST_404',
        message: '예측 실행을 찾을 수 없습니다.',
      }),
    )
  })

  it('성공 여부가 없는 응답을 계약 오류로 거부한다', () => {
    expect(() => parseApiResponse({ data: { id: 4821 } }, parseIdentifier)).toThrowError(
      ApiContractError,
    )
  })

  it('실패 응답의 error 형식이 잘못되면 계약 오류로 거부한다', () => {
    expect(() =>
      parseApiResponse(
        {
          success: false,
          data: null,
          error: { message: 404 },
        },
        parseIdentifier,
      ),
    ).toThrowError(ApiContractError)
  })

  it('ApiError가 표준 Error처럼 동작한다', () => {
    expect(new ApiError('요청에 실패했습니다.')).toBeInstanceOf(Error)
  })
})
