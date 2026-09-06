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
