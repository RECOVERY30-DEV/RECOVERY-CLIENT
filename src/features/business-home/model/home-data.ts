export const HOME_DATA_SOURCES = [
  { label: '사업자 계좌', refreshedAt: '최근 갱신 2시간 전' },
  { label: '카드 정산', refreshedAt: '최근 갱신 어제 오전 9시' },
  { label: '자동이체·대출', refreshedAt: '최근 갱신 3일 전' },
] as const

export const HOME_DATA_STATUSES = [
  { label: '사업자 계좌', status: '갱신 완료' },
  { label: '카드 정산', status: '갱신 완료' },
  { label: '자동이체/대출', status: '부분 반영' },
] as const
