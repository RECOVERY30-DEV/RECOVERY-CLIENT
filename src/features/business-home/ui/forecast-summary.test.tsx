import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ForecastSummary } from './forecast-summary'

describe('예측 요약', () => {
  it('안전 잔액 아이콘을 24px 프레임 안의 원본 크기로 렌더링한다', () => {
    render(
      <ForecastSummary
        range={{
          conservative: '−128만 원',
          expectedPosition: 50,
          optimistic: '+54만 원',
          summary: '−128만 원 ~ +54만 원',
        }}
        safety={{ amount: '약 54만원', status: '안전 잔액 미충족' }}
        shortage={{ dDay: 'D-2', expectedDate: '2025년 7월 18일', progress: 30 }}
      />,
    )

    const iconFrame = screen.getByTestId('safety-icon-frame')

    expect(iconFrame).toHaveClass('size-6', 'shrink-0', 'overflow-hidden')
    expect(iconFrame.querySelector('svg')).toHaveClass('h-[14px]', 'w-3')
  })
})
