import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QueryProvider } from './query-provider'

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
})
