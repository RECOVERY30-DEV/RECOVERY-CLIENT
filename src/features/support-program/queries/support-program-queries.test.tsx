import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  supportProgramQueryKeys,
  useSupportProgramDetailQueries,
  useSupportProgramListQueries,
} from './support-program-queries'

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return {
    queryClient,
    wrapper: ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  }
}

const program = {
  programId: 1,
  programCode: 'SBIZ_STABLE_FUND',
  name: '소상공인 경영안정자금',
  agency: '소상공인시장진흥공단',
  supportContent: '운전자금 융자',
  limitAmount: 20000000,
  interestRateText: '연 3.4%',
  applyDeadline: '2025-07-31',
  status: 'ACTIVE',
}

describe('support program queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('최신 예측 실행을 캐시한 뒤 지원제도 추천을 조회한다', async () => {
    const requestedPaths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const url = new URL(input.url)
        requestedPaths.push(`${url.pathname}${url.search}`)

        if (url.pathname === '/api/businesses/1/forecasts/latest') {
          return apiResponse({
            forecastRunId: 4821,
            baseDate: '2025-07-15',
            updatedAt: '2025-07-14T23:32:00Z',
            status: 'RISK',
          })
        }

        if (url.pathname === '/api/support-programs') {
          return apiResponse([program])
        }

        if (url.pathname === '/api/forecasts/4821/program-recommendations') {
          return apiResponse([
            {
              rankNo: 1,
              programCode: 'SBIZ_STABLE_FUND',
              name: '소상공인 경영안정자금',
              agency: '소상공인시장진흥공단',
              applyDeadline: '2025-07-31',
              matchReason: '매출 감소 패턴이 조건과 유사합니다.',
            },
          ])
        }

        return Response.json(
          { code: 'NOT_FOUND', message: '테스트 응답이 없습니다.' },
          { status: 404 },
        )
      }),
    )
    const { queryClient, wrapper } = createWrapper()
    const { result } = renderHook(
      () =>
        useSupportProgramListQueries(1, {
          client: createApiClient('https://api.example.com'),
          applicableOnly: true,
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.recommendations.isSuccess).toBe(true))

    expect(requestedPaths).toEqual(
      expect.arrayContaining([
        '/api/support-programs?applicableOnly=true',
        '/api/businesses/1/forecasts/latest',
        '/api/forecasts/4821/program-recommendations',
      ]),
    )
    expect(queryClient.getQueryData(supportProgramQueryKeys.recommendations(4821))).toHaveLength(1)
  })

  it('상세 화면에 필요한 상세·서류·자격 판정을 각각 조회한다', async () => {
    const requestedPaths: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        if (!(input instanceof Request)) {
          throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
        }

        const path = new URL(input.url).pathname
        requestedPaths.push(path)

        if (path === '/api/support-programs/SBIZ_STABLE_FUND') {
          return apiResponse({
            ...program,
            termText: '3년 거치 5년 분할상환',
            applyUrl: 'https://example.com/apply',
            officialSourceUrl: 'https://example.com/notice',
            rulesetVersion: 'rule-2025-06',
          })
        }
        if (path.endsWith('/documents')) {
          return apiResponse([])
        }
        if (path.endsWith('/eligibility')) {
          return apiResponse({
            programCode: 'SBIZ_STABLE_FUND',
            result: 'LIKELY_PASS',
            reasonText: '조건과 유사합니다.',
            advisory: true,
            rulesetVersion: 'rule-2025-06',
            checkedAt: null,
            items: [],
          })
        }
        return Response.json(
          { code: 'NOT_FOUND', message: '테스트 응답이 없습니다.' },
          { status: 404 },
        )
      }),
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () =>
        useSupportProgramDetailQueries(1, 'SBIZ_STABLE_FUND', {
          client: createApiClient('https://api.example.com'),
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.eligibility.isSuccess).toBe(true))
    expect(requestedPaths).toEqual(
      expect.arrayContaining([
        '/api/support-programs/SBIZ_STABLE_FUND',
        '/api/support-programs/SBIZ_STABLE_FUND/documents',
        '/api/businesses/1/support-programs/SBIZ_STABLE_FUND/eligibility',
      ]),
    )
  })
})
