export type CashflowCorrectionKind =
  'cash-sales' | 'external-funds' | 'expected-income' | 'expected-expenses'

type SelectionOption = Readonly<{
  label: string
  value: string
}>

export type CashflowCorrectionFormConfig = Readonly<{
  confirmationDescription: string
  confirmationLabel: string
  dateLabel: string
  description: string
  hasExpenseItem: boolean
  helpDescription: string
  helpTitle: string
  kind: CashflowCorrectionKind
  selectionLabel: string
  selectionOptions: readonly SelectionOption[]
  selectionPlaceholder: string
  title: string
}>

const REPEAT_OPTIONS = [
  { label: '반복 없음', value: 'none' },
  { label: '매주', value: 'weekly' },
  { label: '매월', value: 'monthly' },
] as const

export const CASHFLOW_CORRECTION_FORM_CONFIGS = {
  'cash-sales': {
    confirmationDescription:
      '확정 매출: 이미 확정된 현금매출입니다. 예정 매출: 발생 가능성이 있는 매출로 보수적 범위 계산에만 반영됩니다.',
    confirmationLabel: '확정 매출',
    dateLabel: '예정일',
    description:
      '은행 거래 내역에 잡히지 않는 현금매출을 입력하세요. 입력값은 Draft로 보관되며 재계산 시 예측에 반영됩니다.',
    hasExpenseItem: false,
    helpDescription:
      '확정 매출: 이미 확정된 현금매출입니다. 예정 매출: 발생 가능성이 있는 매출로 보수적 범위 계산에만 반영됩니다.',
    helpTitle: '입력 안내',
    kind: 'cash-sales',
    selectionLabel: '반복 여부',
    selectionOptions: REPEAT_OPTIONS,
    selectionPlaceholder: '반복 여부를 선택해주세요.',
    title: '현금매출 입력',
  },
  'external-funds': {
    confirmationDescription: '확정 항목은 보수적·예상·낙관 시나리오에 반영됩니다.',
    confirmationLabel: '확정 여부',
    dateLabel: '입금 예정일',
    description: '은행 계좌에 잡히지 않는 입금 예정액을 추가하면 30일 예측 정확도가 높아집니다.',
    hasExpenseItem: false,
    helpDescription:
      '확정 항목은 보수적·예상·낙관 시나리오에 반영됩니다. 예상 항목은 낙관 시나리오에만 반영됩니다.',
    helpTitle: '예측 반영 기준',
    kind: 'external-funds',
    selectionLabel: '자금 출처',
    selectionOptions: [
      { label: '타행 계좌', value: 'external-account' },
      { label: '사업 외부 자금', value: 'outside-business-funds' },
      { label: '기타', value: 'other' },
    ],
    selectionPlaceholder: '자금 출처를 선택해주세요.',
    title: '타행·외부자금 입력',
  },
  'expected-income': {
    confirmationDescription: '확정으로 표시하면 예측 범위 산정에 가중치가 높아집니다.',
    confirmationLabel: '확정 수입',
    dateLabel: '예정일',
    description: '은행 거래 내역에 없는 수입을 직접 입력하면 예측에 반영됩니다.',
    hasExpenseItem: false,
    helpDescription:
      '저장 전까지 입력 내용은 임시 보관됩니다. 저장 후 재계산을 실행하면 예측에 반영됩니다.',
    helpTitle: 'Draft 저장 안내',
    kind: 'expected-income',
    selectionLabel: '반복주기',
    selectionOptions: REPEAT_OPTIONS,
    selectionPlaceholder: '반복 주기를 선택해주세요.',
    title: '예정수입 추가',
  },
  'expected-expenses': {
    confirmationDescription: '확정되지 않은 지출도 입력할 수 있습니다.',
    confirmationLabel: '확정 지출',
    dateLabel: '예정일',
    description: '향후 30일 예측에 반영됩니다. 확정되지 않은 지출도 입력할 수 있습니다.',
    hasExpenseItem: true,
    helpDescription: '입력한 지출은 Draft로 저장되며, 저장 후 30일 예측에 즉시 반영됩니다.',
    helpTitle: '예측 반영 안내',
    kind: 'expected-expenses',
    selectionLabel: '반복주기',
    selectionOptions: REPEAT_OPTIONS,
    selectionPlaceholder: '반복 주기를 선택해주세요.',
    title: '예정지출 입력',
  },
} as const satisfies Record<CashflowCorrectionKind, CashflowCorrectionFormConfig>

export function getCashflowCorrectionFormConfig(
  kind: CashflowCorrectionKind,
): CashflowCorrectionFormConfig {
  return CASHFLOW_CORRECTION_FORM_CONFIGS[kind]
}
