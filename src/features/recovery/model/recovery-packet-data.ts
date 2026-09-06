import type { RecoveryOptionId } from './recovery-plan-data'

type RecoveryPacketOption = Readonly<{
  id: RecoveryOptionId
  title: string
}>

type RecoveryPacketCorrection = Readonly<{
  amount: string
  date: string
  title: string
}>

type RecoveryPacketFixture = Readonly<{
  action: Readonly<{
    beforeAfter: Readonly<{
      firstShortageDay: Readonly<{ after: string; before: string }>
      minimumBalance: Readonly<{ after: string; before: string }>
    }>
    improvement: string
    nextAction: string
    option: RecoveryPacketOption
    preparationItems: readonly Readonly<{ description: string; id: string; label: string }>[]
  }>
  followUp: Readonly<{
    actionStatuses: readonly Readonly<{ status: string; title: string }>[]
    balanceRecovery: string
    consentOptions: readonly Readonly<{ defaultChecked: boolean; id: string; label: string }>[]
    latestRisk: string
    schedule: Readonly<{
      created: string
      lastReviewed: string
      nextReview: string
      milestones: readonly Readonly<{ date: string; label: string; status: string }>[]
    }>
  }>
  packet: Readonly<{
    causes: readonly Readonly<{ contribution: string; title: string }>[]
    corrections: readonly RecoveryPacketCorrection[]
    currentVersion: string
    risk: Readonly<{ label: string; minimumBalanceRange: string }>
    selectedOptions: readonly RecoveryPacketOption[]
    transmissionStatus: string
  }>
}>

export const RECOVERY_PACKET_FIXTURE: RecoveryPacketFixture = {
  action: {
    beforeAfter: {
      firstShortageDay: { after: '20일', before: '8일' },
      minimumBalance: { after: '-180만 원', before: '-240만 원' },
    },
    improvement: '첫 부족일 +12일 연장',
    nextAction: '임대인에게 납부일 조정을 요청하고 자동이체 일정과 은행 문의 결과를 확인하세요.',
    option: { id: 'fixed-cost-reschedule', title: '고정비 납부일 재배치' },
    preparationItems: [
      {
        description: '임대인과 납부일 조정 가능 여부를 확인합니다.',
        id: 'landlord-request',
        label: '임대인에게 납부일 조정 요청하기',
      },
      {
        description: '고정비 자동이체 출금일을 다시 확인합니다.',
        id: 'autopay-check',
        label: '자동이체 일정 확인하기',
      },
      {
        description: '거래 은행의 변경 절차를 확인합니다.',
        id: 'bank-inquiry',
        label: '은행에 원리금 납부일 변경을 문의하기',
      },
    ],
  },
  followUp: {
    actionStatuses: [
      { status: '완료', title: '고정비 납부일 재배치' },
      { status: '진행 중', title: '상환조건 조정 상담' },
    ],
    balanceRecovery: '-240만 원 → -180만 원',
    consentOptions: [
      { defaultChecked: true, id: 'risk-alert', label: '위험 변동 알림 받기' },
      { defaultChecked: false, id: 'support-alert', label: '지원사업 안내 받기' },
    ],
    latestRisk: '부족 위험 완화 · 다음 30일 관찰 필요',
    schedule: {
      created: '2025-07-14',
      lastReviewed: '2025-09-12',
      nextReview: '2025-10-12',
      milestones: [
        { date: '2025-08-13', label: '30일', status: '완료' },
        { date: '2025-09-12', label: '60일', status: '완료' },
        { date: '2025-10-12', label: '90일', status: '예정' },
      ],
    },
  },
  packet: {
    causes: [
      { contribution: '-180만 원', title: '최근 8주 매출 감소' },
      { contribution: '-320만 원', title: '월말 임차료·원리금 집중' },
      { contribution: '추정 중', title: '계절적 매출 회복 지연' },
    ],
    corrections: [
      { amount: '+65만 원', date: '2025-07-20', title: '현금매출 추가 입력' },
      { amount: '-120만 원', date: '2025-07-22', title: '예정 지출 (인테리어 대금)' },
    ],
    currentVersion: 'v1.0',
    risk: { label: '부족 위험', minimumBalanceRange: '-240만 원 ~ -180만 원' },
    selectedOptions: [
      { id: 'repayment-adjustment', title: '상환조건 조정 상담' },
      { id: 'fixed-cost-reschedule', title: '고정비 납부일 재배치' },
    ],
    transmissionStatus: '전송 완료',
  },
}
