import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/shared/api/api-client'

import {
  getForecastDaily,
  getForecastDailyDetail,
  getForecastNarratives,
} from './forecast-timeline-api'
import {
  parseDailyDetailView,
  parseDailyViews,
  parseNarrativeViews,
} from './forecast-timeline-contract'

const API_BASE_URL = 'https://api.example.com'

function createJsonFetch(...responses: ReadonlyArray<unknown>) {
  let index = 0

  return vi.fn<typeof fetch>(async () =>
    Response.json({
      success: true,
      data: responses[Math.min(index++, responses.length - 1)],
      error: null,
    }),
  )
}

function readRequest(fetchMock: ReturnType<typeof createJsonFetch>, index: number) {
  const request = fetchMock.mock.calls[index]?.[0]

  if (!(request instanceof Request)) {
    throw new TypeError('Ky가 fetch에 Request를 전달해야 합니다.')
  }

  return request
}

describe('forecast timeline contract', () => {
  it('부족 위험일과 공휴일 이동일을 파싱한다', () => {
    expect(
      parseDailyViews([
        {
          targetDate: '2025-07-20',
          dDay: 5,
          openingBalance: 1400000,
          confirmedInflow: 520000,
          confirmedOutflow: 0,
          expectedInflowMin: 400000,
          expectedInflowMax: 700000,
          expectedOutflowMin: 180000,
          expectedOutflowMax: 220000,
          adjustmentNet: -1200000,
          closingBalanceConservative: -180000,
          closingBalanceExpected: 220000,
          closingBalanceOptimistic: 610000,
          shortfall: true,
          holiday: false,
          holidayShiftNote: null,
        },
        {
          targetDate: '2025-07-18',
          dDay: 7,
          openingBalance: 1820000,
          confirmedInflow: 0,
          confirmedOutflow: 0,
          expectedInflowMin: 0,
          expectedInflowMax: 0,
          expectedOutflowMin: 0,
          expectedOutflowMax: 0,
          adjustmentNet: 0,
          closingBalanceConservative: 1240000,
          closingBalanceExpected: 1380000,
          closingBalanceOptimistic: 1510000,
          shortfall: false,
          holiday: true,
          holidayShiftNote: '공휴일 거래가 다음 영업일로 반영됩니다.',
        },
      ]),
    ).toMatchObject([
      { targetDate: '2025-07-20', shortfall: true, holidayShiftNote: null },
      { targetDate: '2025-07-18', shortfall: false },
    ])
  })

  it('확정·예상·보정 근거가 있는 일자 상세를 파싱한다', () => {
    expect(
      parseDailyDetailView({
        targetDate: '2025-07-20',
        dDay: 5,
        openingBalance: 1400000,
        confirmedInflow: 520000,
        confirmedOutflow: 0,
        expectedInflowMin: 400000,
        expectedInflowMax: 700000,
        expectedOutflowMin: 180000,
        expectedOutflowMax: 220000,
        adjustmentNet: -1200000,
        closingBalanceConservative: -180000,
        closingBalanceExpected: 220000,
        closingBalanceOptimistic: 610000,
        shortfall: true,
        holiday: false,
        holidayShiftNote: null,
        items: [
          {
            itemKind: 'CONFIRMED',
            label: '카드 정산',
            subLabel: '확정 매출',
            direction: 'I',
            amountMin: 520000,
            amountMax: 520000,
            refType: 'CARD_SETTLEMENT',
            refId: 1,
          },
          {
            itemKind: 'EXPECTED',
            label: '현금 매출 추정',
            subLabel: '최근 4주 기준',
            direction: 'I',
            amountMin: 400000,
            amountMax: 700000,
            refType: null,
            refId: null,
          },
          {
            itemKind: 'ADJUSTMENT',
            label: '사용자 보정',
            subLabel: '인테리어 대금',
            direction: 'O',
            amountMin: 1200000,
            amountMax: 1200000,
            refType: 'ADJUSTMENT',
            refId: 2,
          },
        ],
      }),
    ).toMatchObject({
      targetDate: '2025-07-20',
      items: [{ itemKind: 'CONFIRMED' }, { itemKind: 'EXPECTED' }, { itemKind: 'ADJUSTMENT' }],
    })
  })

  it('유효하지 않은 일자 형식을 거부한다', () => {
    expect(() =>
      parseDailyViews([
        {
          targetDate: '2025/07/20',
          dDay: 5,
          openingBalance: 1400000,
          confirmedInflow: 0,
          confirmedOutflow: 0,
          expectedInflowMin: 0,
          expectedInflowMax: 0,
          expectedOutflowMin: 0,
          expectedOutflowMax: 0,
          adjustmentNet: 0,
          closingBalanceConservative: -180000,
          closingBalanceExpected: 220000,
          closingBalanceOptimistic: 610000,
          shortfall: true,
          holiday: false,
          holidayShiftNote: null,
        },
      ]),
    ).toThrow('dailyView.targetDate')
  })

  it('상태 안내 문구를 종류별로 파싱한다', () => {
    expect(
      parseNarrativeViews([
        { kind: 'STATUS_LABEL', seq: 1, text: '주의 필요' },
        { kind: 'RISK_NOTE', seq: 2, text: '부족 위험이 있습니다.' },
      ]),
    ).toEqual([
      { kind: 'STATUS_LABEL', seq: 1, text: '주의 필요' },
      { kind: 'RISK_NOTE', seq: 2, text: '부족 위험이 있습니다.' },
    ])
  })
})

describe('forecast timeline API', () => {
  it('일자별 현금흐름, 상세, 상태 안내를 정확한 경로로 요청한다', async () => {
    const dailyView = {
      targetDate: '2025-07-20',
      dDay: 5,
      openingBalance: 1400000,
      confirmedInflow: 520000,
      confirmedOutflow: 0,
      expectedInflowMin: 400000,
      expectedInflowMax: 700000,
      expectedOutflowMin: 180000,
      expectedOutflowMax: 220000,
      adjustmentNet: -1200000,
      closingBalanceConservative: -180000,
      closingBalanceExpected: 220000,
      closingBalanceOptimistic: 610000,
      shortfall: true,
      holiday: false,
      holidayShiftNote: null,
    }
    const fetchMock = createJsonFetch([dailyView], { ...dailyView, items: [] }, [
      { kind: 'RISK_NOTE', seq: 1, text: '부족 위험이 있습니다.' },
    ])
    vi.stubGlobal('fetch', fetchMock)
    const client = createApiClient(API_BASE_URL)

    await getForecastDaily(1, { client })
    await getForecastDailyDetail(1, '2025-07-20', { client })
    await getForecastNarratives(1, { client, kind: 'RISK_NOTE' })

    expect(readRequest(fetchMock, 0).url).toBe('https://api.example.com/api/forecasts/1/daily')
    expect(readRequest(fetchMock, 1).url).toBe(
      'https://api.example.com/api/forecasts/1/daily/2025-07-20',
    )
    expect(readRequest(fetchMock, 2).url).toBe(
      'https://api.example.com/api/forecasts/1/narratives?kind=RISK_NOTE',
    )
  })
})
