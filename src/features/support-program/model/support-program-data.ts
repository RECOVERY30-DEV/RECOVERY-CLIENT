export const SUPPORT_PROGRAM_CATEGORIES = ['전체', '행정자금', '경영지원'] as const

export type SupportProgramCategory = (typeof SUPPORT_PROGRAM_CATEGORIES)[number]
export type SupportProgramMatchStatus = '매칭 가능성 높음' | '조건 확인 필요'
export type EligibilityStatus = '충족 가능' | '확인 필요'

type EligibilityRequirement = Readonly<{
  detail: string
  label: string
  status: EligibilityStatus
}>

type RequiredDocument = Readonly<{
  label: string
  status: '준비완료' | '준비필요' | '해당여부 확인 필요'
}>

export type SupportProgram = Readonly<{
  applicationDeadline: `${number}-${number}-${number}`
  category: Exclude<SupportProgramCategory, '전체'>
  description: string
  eligibilityRequirements: readonly EligibilityRequirement[]
  id: string
  institution: string
  interestRate: string
  matchReason: string
  matchStatus: SupportProgramMatchStatus
  officialAnnouncement: string
  regions: readonly string[]
  requiredDocuments: readonly RequiredDocument[]
  repaymentPeriod: string
  supportSummary: string
  title: string
}>

export const SUPPORT_PROGRAM_REFERENCE_DATE = '2025-06-18' as const

export const SUPPORT_PROGRAMS: readonly SupportProgram[] = [
  {
    id: 'small-business-stability-fund',
    title: '소상공인 경영안정자금',
    category: '행정자금',
    institution: '소상공인시장진흥공단',
    regions: ['서울', '경기'],
    applicationDeadline: '2025-07-31',
    supportSummary: '운전자금 최대 7,000만 원 / 연 3.4% 고정금리',
    description: '운전자금 최대 7,000만 원 융자',
    interestRate: '연 3.4% (고정, 상담자 확인 필요)',
    repaymentPeriod: '3년 거치 5년 분할상환',
    matchStatus: '매칭 가능성 높음',
    matchReason: '최근 6개월 매출 감소와 사업자 2년 이상 기준을 바탕으로 추정했습니다.',
    eligibilityRequirements: [
      { label: '사업자등록 2년 이상', detail: '등록일 기준 충족 가능성 높음', status: '충족 가능' },
      {
        label: '연매출 10억 원 이하',
        detail: '최근 매출 데이터 기준 해당 가능',
        status: '충족 가능',
      },
      { label: '금융기관 연체 없음', detail: '상담자가 최종 판단합니다', status: '확인 필요' },
      { label: '제한 업종 미해당', detail: '현재 업종 코드 기준 해당 없음', status: '충족 가능' },
    ],
    requiredDocuments: [
      { label: '사업자등록증', status: '준비필요' },
      { label: '최근 3개월 매출확인서', status: '준비완료' },
      { label: '신분증', status: '준비완료' },
      { label: '금융거래확인서', status: '준비필요' },
      { label: '임대차계약서 (해당 시)', status: '해당여부 확인 필요' },
    ],
    officialAnnouncement: '소상공인시장진흥공단 공식 공고',
  },
  {
    id: 'credit-guarantee-sales-decline',
    title: '신용보증기금 매출감소특례보증',
    category: '행정자금',
    institution: '신용보증기금',
    regions: ['부산'],
    applicationDeadline: '2025-08-15',
    supportSummary: '보증 한도 최대 1억 원 / 보증료 연 0.9%',
    description: '매출 감소 사업자의 보증 한도 최대 1억 원',
    interestRate: '보증료 연 0.9% (상담자 확인 필요)',
    repaymentPeriod: '보증 조건에 따라 상이',
    matchStatus: '조건 확인 필요',
    matchReason: '직전 연도 대비 매출 감소 여부와 보증 조건 확인이 필요합니다.',
    eligibilityRequirements: [
      {
        label: '직전 연도 대비 매출 10% 이상 감소',
        detail: '매출 데이터 확인 필요',
        status: '확인 필요',
      },
      { label: '사업자등록 2년 이상', detail: '등록일 기준 확인 필요', status: '확인 필요' },
    ],
    requiredDocuments: [
      { label: '사업자등록증', status: '준비필요' },
      { label: '부가가치세 과세표준증명', status: '준비필요' },
    ],
    officialAnnouncement: '신용보증기금 공식 공고',
  },
  {
    id: 'small-business-management-improvement',
    title: '소상공인 경영개선 지원사업',
    category: '경영지원',
    institution: '소상공인시장진흥공단',
    regions: ['서울', '대전'],
    applicationDeadline: '2025-09-30',
    supportSummary: '경영개선 컨설팅 및 최대 300만 원 지원',
    description: '경영진단과 개선 컨설팅을 지원',
    interestRate: '해당 없음',
    repaymentPeriod: '해당 없음',
    matchStatus: '매칭 가능성 높음',
    matchReason: '현재 업종과 매출 흐름을 기준으로 경영개선 지원 대상일 가능성이 높습니다.',
    eligibilityRequirements: [
      { label: '소상공인 기준 충족', detail: '현재 사업 규모 기준 충족 가능', status: '충족 가능' },
      { label: '사업자등록 2년 이상', detail: '등록일 기준 충족 가능성 높음', status: '충족 가능' },
    ],
    requiredDocuments: [
      { label: '사업자등록증', status: '준비필요' },
      { label: '경영개선 계획서', status: '준비필요' },
    ],
    officialAnnouncement: '소상공인시장진흥공단 공식 공고',
  },
]

export const SUPPORT_PROGRAM_REGIONS = ['전체', '서울', '경기', '부산', '대전'] as const

export function getSupportProgram(programId: string): SupportProgram | undefined {
  return SUPPORT_PROGRAMS.find((program) => program.id === programId)
}

export function isSupportProgramApplicationOpen(
  applicationDeadline: SupportProgram['applicationDeadline'],
  referenceDate = SUPPORT_PROGRAM_REFERENCE_DATE,
): boolean {
  return applicationDeadline >= referenceDate
}

export function formatSupportProgramDeadline(
  applicationDeadline: SupportProgram['applicationDeadline'],
): string {
  const [year, month, day] = applicationDeadline.split('-')

  return `${year}년 ${Number(month)}월 ${Number(day)}일`
}

export function getSupportProgramApplicationLabel(
  applicationDeadline: SupportProgram['applicationDeadline'],
): '신청 가능' | '신청 마감' {
  return isSupportProgramApplicationOpen(applicationDeadline) ? '신청 가능' : '신청 마감'
}
