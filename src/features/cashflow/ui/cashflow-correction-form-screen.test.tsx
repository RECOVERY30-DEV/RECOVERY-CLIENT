import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

import { CashflowCorrectionFormScreen } from './cashflow-correction-form-screen'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('현금흐름 보정 입력 공통 화면', () => {
  it.each([
    [
      'cash-sales',
      '현금매출 입력',
      '반복 여부',
      '예정일 예정일을 선택해주세요.',
      ['반복 여부를 선택해주세요.', '반복 없음', '매주', '매월'],
    ],
    [
      'external-funds',
      '타행·외부자금 입력',
      '자금 출처',
      '입금 예정일 예정일을 선택해주세요.',
      ['자금 출처를 선택해주세요.', '타행 계좌', '사업 외부 자금', '기타'],
    ],
    [
      'expected-income',
      '예정수입 추가',
      '반복주기',
      '예정일 예정일을 선택해주세요.',
      ['반복 주기를 선택해주세요.', '반복 없음', '매주', '매월'],
    ],
    [
      'expected-expenses',
      '예정지출 입력',
      '반복주기',
      '예정일 예정일을 선택해주세요.',
      ['반복 주기를 선택해주세요.', '반복 없음', '매주', '매월'],
    ],
  ] as const)(
    '%s kind에 맞는 문구와 선택 구성을 제공한다',
    (kind, title, selectionLabel, dateButtonName, options) => {
      render(<CashflowCorrectionFormScreen kind={kind} />)

      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: dateButtonName })).toBeInTheDocument()
      expect(
        Array.from(screen.getByLabelText(selectionLabel).querySelectorAll('option')).map(
          (option) => option.textContent,
        ),
      ).toEqual(options)
    },
  )

  it('필수 입력이 모두 채워질 때까지 저장을 비활성화한다', () => {
    render(<CashflowCorrectionFormScreen kind="expected-expenses" />)

    const saveButton = screen.getByRole('button', { name: '저장' })
    expect(saveButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('지출 항목'), { target: { value: '임대료' } })
    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '1200000' } })
    fireEvent.change(screen.getByLabelText('반복주기'), { target: { value: 'monthly' } })
    expect(saveButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '예정일 예정일을 선택해주세요.' }))
    fireEvent.click(screen.getByRole('button', { name: '2025년 7월 15일' }))
    expect(saveButton).toBeEnabled()
  })

  it('날짜 입력의 placeholder와 focus 표시에 충분한 대비 토큰을 적용한다', () => {
    render(<CashflowCorrectionFormScreen kind="cash-sales" />)

    const dateButton = screen.getByRole('button', { name: '예정일 예정일을 선택해주세요.' })

    expect(dateButton).toHaveClass('focus-visible:ring-primary-blue-800')
    expect(screen.getByText('예정일을 선택해주세요.')).toHaveClass('text-secondary-300')
    expect(screen.getByText(/^서버 저장 기능은/)).toHaveClass('text-secondary-300')
    expect(screen.getByText(/^확정 매출과 예정 매출을/)).toHaveClass('text-secondary-300')
  })

  it('2025년 7월 날짜 dialog에서 날짜를 선택하고 원래 버튼으로 focus를 복원한다', () => {
    render(<CashflowCorrectionFormScreen kind="cash-sales" />)

    const dateButton = screen.getByRole('button', { name: '예정일 예정일을 선택해주세요.' })
    fireEvent.click(dateButton)

    expect(screen.getByRole('dialog', { name: '예정일 선택' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
    expect(screen.getByRole('button', { name: '2025년 7월 1일' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '2025년 7월 15일' }))

    expect(screen.queryByRole('dialog', { name: '예정일 선택' })).not.toBeInTheDocument()
    expect(dateButton).toHaveFocus()
    expect(dateButton).toHaveTextContent('2025년 7월 15일')
  })

  it('inert가 해제된 뒤 날짜 trigger에 focus를 복원하고 kind별 선택 날짜를 accessible name에 포함한다', () => {
    preventFocusInsideInertContainer()
    render(<CashflowCorrectionFormScreen kind="external-funds" />)

    const dateButton = screen.getByRole('button', {
      name: '입금 예정일 예정일을 선택해주세요.',
    })
    fireEvent.click(dateButton)
    fireEvent.click(screen.getByRole('button', { name: '2025년 7월 15일' }))

    expect(screen.getByTestId('cashflow-correction-form-background')).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: '입금 예정일 2025년 7월 15일' })).toHaveFocus()
  })

  it('변경된 입력에서 돌아가기를 누르면 초안 이탈 dialog를 열고 계속 작성 시 focus를 복원한다', () => {
    render(<CashflowCorrectionFormScreen kind="cash-sales" />)

    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '1200000' } })
    const backLink = screen.getByRole('link', { name: '정보 보정 화면으로 돌아가기' })
    fireEvent.click(backLink)

    expect(screen.getByRole('dialog', { name: '작성 중인 초안' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '계속 작성' })).toHaveFocus()

    fireEvent.click(screen.getByRole('button', { name: '계속 작성' }))

    expect(screen.queryByRole('dialog', { name: '작성 중인 초안' })).not.toBeInTheDocument()
    expect(backLink).toHaveFocus()
  })

  it.each([
    ['cash-sales', '반복 여부', '예정일 예정일을 선택해주세요.', undefined],
    ['external-funds', '자금 출처', '입금 예정일 예정일을 선택해주세요.', undefined],
    ['expected-income', '반복주기', '예정일 예정일을 선택해주세요.', undefined],
    ['expected-expenses', '반복주기', '예정일 예정일을 선택해주세요.', '임대료'],
  ] as const)(
    '%s kind의 유효한 입력은 현재 화면에만 저장하고 목록 이동을 선택지로 제공한다',
    (kind, selectionLabel, dateButtonName, expenseItem) => {
      push.mockClear()
      render(<CashflowCorrectionFormScreen kind={kind} />)

      if (expenseItem) {
        fireEvent.change(screen.getByLabelText('지출 항목'), { target: { value: expenseItem } })
      }
      fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '1200000' } })
      fireEvent.change(screen.getByLabelText(selectionLabel), {
        target: { value: kind === 'external-funds' ? 'external-account' : 'monthly' },
      })
      fireEvent.click(screen.getByRole('button', { name: dateButtonName }))
      fireEvent.click(screen.getByRole('button', { name: '2025년 7월 15일' }))
      fireEvent.click(screen.getByRole('button', { name: '저장' }))

      expect(push).not.toHaveBeenCalled()
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('현재 화면에만 저장됐습니다.')).toBeInTheDocument()
      expect(screen.getByText('새로고침하면 입력 내용이 초기화됩니다.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '저장 완료' })).toBeDisabled()
      expect(screen.getByLabelText('금액 (원)')).toBeDisabled()
      expect(screen.getByRole('link', { name: '보정 목록으로 이동' })).toHaveAttribute(
        'href',
        '/cashflow/corrections',
      )
    },
  )

  it.each(['cash-sales', 'external-funds', 'expected-income', 'expected-expenses'] as const)(
    '%s kind에서 서버 연동 전 영속화를 약속하는 Draft 문구를 노출하지 않는다',
    (kind) => {
      render(<CashflowCorrectionFormScreen kind={kind} />)

      expect(screen.queryByText(/Draft/)).not.toBeInTheDocument()
    },
  )

  it('초안 삭제 후 나가기를 누르면 정보 보정 화면으로 이동한다', () => {
    push.mockClear()
    render(<CashflowCorrectionFormScreen kind="cash-sales" />)

    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '1200000' } })
    fireEvent.click(screen.getByRole('link', { name: '정보 보정 화면으로 돌아가기' }))
    fireEvent.click(screen.getByRole('button', { name: '초안 삭제 후 나가기' }))

    expect(push).toHaveBeenCalledWith('/cashflow/corrections')
  })

  it('예정지출 지출 항목 placeholder와 외부자금 서버 연동 문구를 제공한다', () => {
    const { rerender } = render(<CashflowCorrectionFormScreen kind="expected-expenses" />)

    expect(screen.getByLabelText('지출 항목')).toHaveAttribute(
      'placeholder',
      '지출 항목을 입력해주세요',
    )

    rerender(<CashflowCorrectionFormScreen kind="external-funds" />)

    expect(
      screen.getByText(
        '확정 항목과 예상 항목을 구분하기 위한 선택입니다. 서버 연동 후 예측 시나리오에 사용됩니다.',
      ),
    ).toBeInTheDocument()
  })

  it('날짜 dialog가 Tab과 Shift+Tab 포커스를 가두고 Escape 후 trigger에 focus를 복원한다', () => {
    render(<CashflowCorrectionFormScreen kind="cash-sales" />)

    const dateButton = screen.getByRole('button', { name: '예정일 예정일을 선택해주세요.' })
    fireEvent.click(dateButton)

    const dialog = screen.getByRole('dialog', { name: '예정일 선택' })
    const closeButton = screen.getByRole('button', { name: '닫기' })
    const lastDayButton = screen.getByRole('button', { name: '2025년 7월 31일' })

    lastDayButton.focus()
    fireEvent.keyDown(lastDayButton, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true })
    expect(lastDayButton).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: '예정일 선택' })).not.toBeInTheDocument()
    expect(dateButton).toHaveFocus()
  })

  it('열린 dialog 외 배경을 inert 처리하고 두 dialog를 동시에 열지 않는다', () => {
    render(<CashflowCorrectionFormScreen kind="cash-sales" />)

    const backLink = screen.getByRole('link', { name: '정보 보정 화면으로 돌아가기' })
    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '1200000' } })
    fireEvent.click(screen.getByRole('button', { name: '예정일 예정일을 선택해주세요.' }))

    expect(screen.getByTestId('cashflow-correction-form-background')).toHaveAttribute('inert')
    fireEvent.click(backLink)

    expect(screen.getByRole('dialog', { name: '예정일 선택' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '작성 중인 초안' })).not.toBeInTheDocument()
  })

  it('초안 dialog가 Tab과 Shift+Tab 포커스를 가두고 Escape 후 back trigger에 focus를 복원한다', () => {
    render(<CashflowCorrectionFormScreen kind="cash-sales" />)

    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '1200000' } })
    const backLink = screen.getByRole('link', { name: '정보 보정 화면으로 돌아가기' })
    fireEvent.click(backLink)

    const dialog = screen.getByRole('dialog', { name: '작성 중인 초안' })
    const continueButton = screen.getByRole('button', { name: '계속 작성' })
    const discardButton = screen.getByRole('button', { name: '초안 삭제 후 나가기' })

    fireEvent.keyDown(continueButton, { key: 'Tab', shiftKey: true })
    expect(discardButton).toHaveFocus()

    fireEvent.keyDown(discardButton, { key: 'Tab' })
    expect(continueButton).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: '작성 중인 초안' })).not.toBeInTheDocument()
    expect(backLink).toHaveFocus()
  })

  it('inert가 해제된 뒤 초안 dialog의 back trigger에 focus를 복원한다', () => {
    preventFocusInsideInertContainer()
    render(<CashflowCorrectionFormScreen kind="cash-sales" />)

    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '1200000' } })
    const backLink = screen.getByRole('link', { name: '정보 보정 화면으로 돌아가기' })
    fireEvent.click(backLink)
    fireEvent.click(screen.getByRole('button', { name: '계속 작성' }))

    expect(screen.getByTestId('cashflow-correction-form-background')).not.toHaveAttribute('inert')
    expect(backLink).toHaveFocus()
  })
})

function preventFocusInsideInertContainer() {
  const originalFocus = HTMLElement.prototype.focus

  return vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function focus(
    this: HTMLElement,
  ) {
    if (!this.closest('[inert]')) {
      originalFocus.call(this)
    }
  })
}
