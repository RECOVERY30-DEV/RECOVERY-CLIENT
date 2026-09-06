import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ApiContractError, ApiError } from '@/shared/api/api-response'

import { QueryProvider, shouldRetryQuery } from './query-provider'

type QueryClientProbeProps = Readonly<{
  onRender: (queryClient: QueryClient) => void
}>

function QueryClientProbe({ onRender }: QueryClientProbeProps) {
  onRender(useQueryClient())

  return null
}

describe('QueryProvider', () => {
  it('다시 렌더링되어도 동일한 QueryClient를 제공한다', () => {
    const queryClients: QueryClient[] = []
    const onRender = (queryClient: QueryClient) => queryClients.push(queryClient)
    const { rerender } = render(
      <QueryProvider>
        <QueryClientProbe onRender={onRender} />
      </QueryProvider>,
    )

    rerender(
      <QueryProvider>
        <QueryClientProbe onRender={onRender} />
      </QueryProvider>,
    )

    expect(queryClients).toHaveLength(2)
    expect(queryClients[1]).toBe(queryClients[0])
  })

  it('복구 불가능한 계약 오류와 4xx 응답을 재시도하지 않는다', () => {
    expect(shouldRetryQuery(0, new ApiContractError('잘못된 응답입니다.'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError('예측을 찾을 수 없습니다.', { status: 404 }))).toBe(
      false,
    )
  })

  it('네트워크와 5xx 오류는 한 번만 재시도한다', () => {
    const networkError = new ApiError('서버와 통신할 수 없습니다.')
    const serverError = new ApiError('서버 오류입니다.', { status: 500 })

    expect(shouldRetryQuery(0, networkError)).toBe(true)
    expect(shouldRetryQuery(1, networkError)).toBe(false)
    expect(shouldRetryQuery(0, serverError)).toBe(true)
    expect(shouldRetryQuery(1, serverError)).toBe(false)
  })
})
