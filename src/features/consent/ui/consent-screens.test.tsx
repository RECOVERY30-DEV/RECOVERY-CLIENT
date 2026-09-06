import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetch: vi.fn(),
  useConsentQueries: vi.fn(),
  useUpdateConsentMutation: vi.fn(),
}))

vi.mock('../queries/consent-queries', () => ({
  useConsentQueries: mocks.useConsentQueries,
  useUpdateConsentMutation: mocks.useUpdateConsentMutation,
}))

import { ConsentManagementScreen } from './consent-management-screen'
import { ConsentSetupScreen } from './consent-setup-screen'

function renderManagementScreen(
  query: Partial<{
    data: ReadonlyArray<{
      typeCode: 'ANALYSIS' | 'FOLLOWUP_TRACKING'
      status: 'GRANTED' | 'WITHDRAWN'
    }>
    isError: boolean
    isPending: boolean
  }> = {},
  mutation: Partial<{ isError: boolean; isPending: boolean }> = {},
) {
  mocks.useConsentQueries.mockReturnValue({
    data: [
      { typeCode: 'ANALYSIS', status: 'GRANTED' },
      { typeCode: 'FOLLOWUP_TRACKING', status: 'GRANTED' },
    ],
    isError: false,
    isPending: false,
    refetch: mocks.refetch,
    ...query,
  })
  mocks.useUpdateConsentMutation.mockReturnValue({
    isError: false,
    isPending: false,
    mutate: mocks.mutate,
    ...mutation,
  })

  return render(<ConsentManagementScreen />)
}

describe('분석 동의 선택 화면', () => {
  it('모든 동의를 해제한 상태로 시작하고 분석 시작을 비활성화한다', () => {
    render(<ConsentSetupScreen />)

    expect(screen.getByRole('heading', { name: '분석 동의 선택' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '분석에 포함되는 데이터 범위 확인' })).toHaveAttribute(
      'href',
      '/data-scope',
    )
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '상담원 전송 동의' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '30·60·90일 사후 점검 동의' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: '분석 시작하기' })).toBeDisabled()
  })

  it('필수 동의를 선택하면 현금흐름 분석으로 이동할 수 있다', () => {
    render(<ConsentSetupScreen />)

    fireEvent.click(screen.getByRole('switch', { name: '서비스 분석 동의' }))

    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).toBeChecked()
    expect(screen.getByRole('link', { name: '분석 시작하기' })).toHaveAttribute('href', '/cashflow')
  })
})

describe('동의 관리 화면', () => {
  it('조회 중 상태와 재시도 가능한 오류 상태를 표시한다', () => {
    renderManagementScreen({ data: undefined, isPending: true })
    expect(screen.getByRole('status')).toHaveTextContent('동의 내역을 불러오는 중입니다.')

    renderManagementScreen({ data: undefined, isError: true })
    expect(screen.getByRole('alert')).toHaveTextContent('동의 내역을 불러오지 못했습니다.')
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(mocks.refetch).toHaveBeenCalledTimes(1)
  })

  it('API가 준 동의 상태를 표시하고 변경 요청 중에는 제어를 막는다', () => {
    renderManagementScreen(
      {
        data: [
          { typeCode: 'ANALYSIS', status: 'GRANTED' },
          { typeCode: 'FOLLOWUP_TRACKING', status: 'WITHDRAWN' },
        ],
      },
      { isPending: true },
    )

    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).toBeChecked()
    expect(screen.getByRole('switch', { name: '30·60·90일 사후 점검 동의' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: '상담원 전송 동의' })).toBeDisabled()
    expect(screen.getByRole('switch', { name: '서비스 분석 동의' })).toBeDisabled()
  })

  it('사후 점검 동의 변경은 실제 mutation으로 요청한다', () => {
    renderManagementScreen({
      data: [
        { typeCode: 'ANALYSIS', status: 'GRANTED' },
        { typeCode: 'FOLLOWUP_TRACKING', status: 'WITHDRAWN' },
      ],
    })

    fireEvent.click(screen.getByRole('switch', { name: '30·60·90일 사후 점검 동의' }))

    expect(mocks.mutate).toHaveBeenCalledWith(
      { typeCode: 'FOLLOWUP_TRACKING', granted: true },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('분석 동의 철회는 확인창 뒤에 mutation으로 요청한다', () => {
    renderManagementScreen()

    fireEvent.click(screen.getByRole('button', { name: '철회하기' }))
    expect(screen.getByRole('dialog', { name: '동의 철회 확인' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '철회' }))

    expect(mocks.mutate).toHaveBeenCalledWith(
      { typeCode: 'ANALYSIS', granted: false },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })
})
