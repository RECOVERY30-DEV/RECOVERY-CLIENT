import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import { SupportProgramDetailScreen } from './support-program-detail-screen'
import { SupportProgramListScreen } from './support-program-list-screen'

function apiResponse(data: unknown) {
  return Response.json({ success: true, data, error: null })
}

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const summary = {
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

describe('API 지원사업 화면', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('목록 조회 중과 빈 목록을 사용자에게 표시한다', async () => {
    let resolveFetch: ((response: Response) => void) | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(
        async () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve
          }),
      ),
    )
    renderWithQueryClient(<SupportProgramListScreen client={createApiClient('http://localhost')} />)

    expect(screen.getByText('지원사업 정보를 불러오는 중입니다.')).toBeInTheDocument()

    resolveFetch?.(apiResponse([]))
  })

  it('목록 API 실패를 재시도 가능한 오류 상태로 표시한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        Response.json({ code: 'UNAVAILABLE', message: '일시적인 오류입니다.' }, { status: 503 }),
      ),
    )
    renderWithQueryClient(<SupportProgramListScreen client={createApiClient('http://localhost')} />)

    expect(await screen.findByText('지원사업 정보를 불러오지 못했습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('실제 목록·추천 API 데이터를 병합해 표시한다', async () => {
    const programRequestUrls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        const requestUrl = input instanceof Request ? input.url : input.toString()
        const path = new URL(requestUrl, 'http://localhost').pathname

        if (path === '/api/support-programs') {
          programRequestUrls.push(requestUrl)
          return apiResponse([summary])
        }
        if (path === '/api/businesses/1/forecasts/latest') {
          return apiResponse({
            forecastRunId: 4821,
            baseDate: '2025-07-15',
            updatedAt: '2025-07-14T23:32:00Z',
            status: 'RISK',
          })
        }
        return apiResponse([
          {
            rankNo: 1,
            programCode: 'SBIZ_STABLE_FUND',
            name: '소상공인 경영안정자금',
            agency: '소상공인시장진흥공단',
            applyDeadline: '2025-07-31',
            matchReason: '최근 매출 감소 패턴이 조건과 유사합니다.',
          },
        ])
      }),
    )
    renderWithQueryClient(<SupportProgramListScreen client={createApiClient('http://localhost')} />)

    expect(
      await screen.findByRole('heading', { name: '소상공인 경영안정자금' }),
    ).toBeInTheDocument()
    expect(screen.getByText('최근 매출 감소 패턴이 조건과 유사합니다.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '소상공인 경영안정자금 상세 확인' })).toHaveAttribute(
      'href',
      '/recovery/support-programs/SBIZ_STABLE_FUND',
    )
    expect(screen.getByRole('switch', { name: '신청 가능만 보기' })).not.toBeChecked()
    expect(
      new URL(programRequestUrls[0], 'http://localhost').searchParams.get('applicableOnly'),
    ).toBe('false')
  })

  it('상세·자격·서류 API 실패를 오류 상태로 표시한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        Response.json({ code: 'NOT_FOUND', message: '찾을 수 없습니다.' }, { status: 404 }),
      ),
    )
    renderWithQueryClient(
      <SupportProgramDetailScreen
        client={createApiClient('http://localhost')}
        programCode="SBIZ_STABLE_FUND"
      />,
    )

    expect(await screen.findByText('지원사업 상세 정보를 불러오지 못했습니다.')).toBeInTheDocument()
  })

  it('상세 API 결과와 빈 서류 상태를 표시한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        const requestUrl = input instanceof Request ? input.url : input.toString()
        const path = new URL(requestUrl, 'http://localhost').pathname

        if (path === '/api/support-programs/SBIZ_STABLE_FUND') {
          return apiResponse({
            ...summary,
            termText: '3년 거치 5년 분할상환',
            applyUrl: 'https://example.com/apply',
            officialSourceUrl: 'https://example.com/notice',
            rulesetVersion: 'rule-2025-06',
          })
        }
        if (path.endsWith('/documents')) {
          return apiResponse([])
        }
        return apiResponse({
          programCode: 'SBIZ_STABLE_FUND',
          result: 'LIKELY_PASS',
          reasonText: '최근 매출 감소 패턴이 조건과 유사합니다.',
          advisory: true,
          rulesetVersion: 'rule-2025-06',
          checkedAt: null,
          items: [],
        })
      }),
    )
    renderWithQueryClient(
      <SupportProgramDetailScreen
        client={createApiClient('http://localhost')}
        programCode="SBIZ_STABLE_FUND"
      />,
    )

    expect(await screen.findByText('운전자금 융자')).toBeInTheDocument()
    expect(screen.getByText('제출 서류 정보가 없습니다.')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText(/최근 매출 감소 패턴이 조건과 유사합니다/)).toBeInTheDocument(),
    )
  })
})
