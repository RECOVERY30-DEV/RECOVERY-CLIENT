export const HOME_DATA_SOURCES = [
  { label: '사업자 계좌', updatedAt: '2025-07-15T09:00:00+09:00' },
  { label: '카드 정산', updatedAt: '2025-07-14T11:00:00+09:00' },
  { label: '자동이체·대출', updatedAt: '2025-07-12T11:00:00+09:00' },
] as const

export const HOME_DATA_REFERENCE_AT = new Date('2025-07-15T11:00:00+09:00')

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000
const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS

export function formatHomeDataUpdatedAt(updatedAt: string, referenceAt: Date): string {
  const updatedTime = Date.parse(updatedAt)
  const referenceTime = referenceAt.getTime()
  const elapsedTime = referenceTime - updatedTime

  if (Number.isNaN(updatedTime) || Number.isNaN(referenceTime) || elapsedTime < 0) {
    return '갱신 시간 확인 필요'
  }

  if (elapsedTime < HOUR_IN_MILLISECONDS) {
    return '최근 갱신 1시간 전'
  }

  if (elapsedTime < DAY_IN_MILLISECONDS) {
    return `최근 갱신 ${Math.floor(elapsedTime / HOUR_IN_MILLISECONDS)}시간 전`
  }

  return `최근 갱신 ${Math.floor(elapsedTime / DAY_IN_MILLISECONDS)}일 전`
}

export function getHomeDataSources(referenceAt: Date = HOME_DATA_REFERENCE_AT) {
  return HOME_DATA_SOURCES.map((source) => ({
    ...source,
    refreshedAt: formatHomeDataUpdatedAt(source.updatedAt, referenceAt),
  }))
}

export const HOME_DATA_STATUSES = [
  { label: '사업자 계좌', status: '갱신 완료' },
  { label: '카드 정산', status: '갱신 완료' },
  { label: '자동이체/대출', status: '부분 반영' },
] as const
