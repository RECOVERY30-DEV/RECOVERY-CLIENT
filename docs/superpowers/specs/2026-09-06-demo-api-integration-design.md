# Recovery30 데모 실데이터 API 연동 설계

## 목적

`businessId=1`, `forecastRunId=1`의 데모 플로우를 정적 화면이 아닌 Recovery30 API 응답으로 표시한다. 기존에 병합된 홈·예측, 상담 예약, 회복안 API 연동을 유지하고, Swagger에 추가된 일자별 현금흐름·정보 보정·동의·자체 실행·Packet·사후점검 API를 기능별로 연결한다.

## 기준과 범위

- 기준 브랜치는 지원사업 API PR이 병합된 최신 `origin/develop`이다. 로컬 `develop`을 기준으로 새 작업을 시작하지 않는다.
- Swagger UI에는 46개 작업 API가 있으며, 데모 플로우의 1~27번 경로가 모두 존재한다.
- 이미 병합된 범위는 홈 요약(1~~6), 회복안 조회·선택(13~~15), 상담사·슬롯·예약 기본 연동(21~~23), 지원사업 API PR의 17~~19이다.
- 이번 범위는 7~~12, 16, 20, 24~~27과 회복안 선택값을 실제 예약 요청으로 전달하는 15→23 연결이다.
- 신규 production dependency는 추가하지 않는다. `PUT`·`PATCH`·`DELETE`가 필요한 기능은 별도 공용 mutation 기반 PR이 먼저 추가하는 helper만 사용한다.

## 사용자 흐름

1. 사용자는 홈에서 최신 예측을 기준으로 현금흐름 대시보드로 이동한다.
2. 대시보드는 `GET /api/forecasts/{forecastRunId}/daily`로 30일 흐름을, 날짜 상세는 `GET /daily/{date}`로 근거 항목을 표시한다.
3. 상태 화면은 `GET /narratives`의 상태라벨, 위험 부연, 변화 조건, 고지문을 표시한다.
4. 데이터 범위 화면은 `GET /api/businesses/{businessId}/data-sources`로 실제 연동 현황을 표시한다.
5. 정보 보정 화면은 adjustments와 suggestion 목록을 표시하고, 입력·수정·삭제·후보 수락 뒤 적용 API로 재계산을 요청한다.
6. 회복안 비교에서 선택한 최대 두 개의 숫자 ID는 상담 예약 링크와 POST body에 그대로 전달된다.
7. 예약 POST가 `consultationId`를 반환하면 전용 완료 경로가 GET 상세를 조회해 요청 상태와 일정을 보여 준다. 이전의 화면 내 임시 완료 상태를 사용하지 않는다.
8. 자체 실행, Packet, 동의, 사후점검은 각 화면에서 독립 API를 조회·저장하고 실패 시 해당 요청만 재시도한다.

## 기능 경계

각 트랙은 자신의 `contract`, `api`, `query`, `screen`만 소유한다. 새 API 모듈은 해당 feature 안에 두며, 다른 feature의 내부 파일을 직접 가져오지 않는다. 기존 공용 API helper를 읽기만 하고 수정하지 않는다.

| 트랙                 | 브랜치                                            | 책임                                 | 소유 화면과 파일 경계                                                                                                                                                           |
| -------------------- | ------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Timeline             | `codex/feat-cashflow-timeline-api-integration`    | 일자별 현금흐름·일자 근거·narratives | `src/app/cashflow/page.tsx`, `src/app/cashflow/daily/[date]/page.tsx`, 상태 화면과 관련 cashflow UI, `features/cashflow/api/*timeline*`, `features/cashflow/queries/*timeline*` |
| Adjustments          | `codex/feat-cashflow-adjustments-api-integration` | 보정값·후보·적용/재계산              | `src/app/cashflow/corrections/**`, 관련 correction UI, `features/cashflow/api/*adjustment*`, `features/cashflow/queries/*adjustment*`                                           |
| Data scope           | `codex/feat-data-scope-api-integration`           | 연동 데이터 소스 현황                | `src/app/data-scope/page.tsx`, `features/data-scope/**`                                                                                                                         |
| Consent              | `codex/feat-consent-api-integration`              | 동의 마스터·현재 상태·grant/withdraw | `src/app/consents/**`, `features/consent/**`                                                                                                                                    |
| Consultation handoff | `codex/feat-consultation-recovery-handoff`        | 선택 회복안 ID 전달과 예약 완료 화면 | 회복안 비교의 예약 링크, `src/app/recovery/consultation/**`, `features/consultation/**`, 상담 예약 UI                                                                           |
| Self action          | `codex/feat-self-action-api-integration`          | 자체 실행 계획·준비 항목 저장        | `src/app/recovery/self-action/**`, 관련 recovery self-action UI와 전용 API/queries                                                                                              |
| Packet               | `codex/feat-recovery-packet-api-integration`      | 최신 Packet·상세·생성·전송 이력/전송 | `src/app/recovery/page.tsx`, Packet UI와 전용 API/queries                                                                                                                       |
| Follow-up            | `codex/feat-followup-api-integration`             | 점검 일정·결과·회복안 실행 상태      | `src/app/recovery/follow-up/page.tsx`, follow-up UI와 전용 API/queries                                                                                                          |

## 병렬 순서와 병합 규칙

1. 지원사업 API PR을 먼저 `develop`에 병합한다.
2. `codex/feat-api-mutation-methods`가 `src/shared/api/api-request.ts`에 `putApiData`, `patchApiData`, `deleteApiData`와 테스트를 추가하고 먼저 병합한다. 모든 helper는 기존 `postApiData`와 동일한 오류 정규화와 응답 parsing을 사용한다.
3. Timeline, Data scope, Follow-up은 GET 전용이므로 mutation 기반 PR과 동시에 최신 `origin/develop`에서 시작할 수 있다.
4. Adjustments, Consent, Self action은 mutation 기반 PR이 병합된 develop에서 분기한다. 이들 트랙은 공용 API 파일을 수정하지 않는다.
5. Packet은 회복안과 지원사업 데이터가 포함된 최신 베이스에서 시작한다. 상담 예약과 Packet 전송은 서로 독립이며 Packet이 상담 예약 UI를 수정하지 않는다.
6. 각 PR은 자신의 테스트와 변경 파일만 포함한다. 다른 트랙의 변경을 cherry-pick하거나 함께 stage하지 않는다.

## 상담 예약 완료 계약

예약 트랙은 다음 body를 만든다. `slotId`는 슬롯 조회 응답에서 선택한 값이고, 회복안 ID는 회복안 선택 API에서 저장한 숫자 ID다.

```json
{
  "counselorId": 1,
  "slotId": 1,
  "channel": "PHONE",
  "transferConsentGranted": true,
  "recoveryOptionIds": [1, 3]
}
```

POST 성공 시 응답의 `consultationId`로 `/recovery/consultation/{consultationId}/complete`로 이동한다. 완료 화면은 `GET /api/consultations/{consultationId}`를 조회한다. 이 화면은 상태가 `REQUESTED`인 점을 명시하고, `회복안 비교로 돌아가기`와 `Recovery Packet 확인`을 제공한다. POST 실패는 같은 선택을 보존한 채 재시도한다. POST는 버튼 pending 상태에서 중복 실행하지 않는다.

## 오류와 검증

- `GET /api/forecasts/999999/shortfall`의 `FORECAST_404_1`을 Timeline API/UI 오류 처리에서 검증한다.
- 회복안 선택은 3개 ID 저장 시 `RECOVERY_400_1`이 유지되는지 기존 회귀 테스트로 확인한다.
- `GET /api/followups/999999/result`의 `FOLLOWUP_404_1`을 Follow-up API/UI 오류 처리에서 검증한다.
- 각 트랙은 contract parser 단위 테스트, API request 테스트, query 또는 화면 상태 테스트를 추가한다.
- 통합 전에는 실제 데모 read 요청으로 `businessId=1`, `forecastRunId=1`의 목록/상세 렌더링을 확인한다. 생성·수정·삭제·전송 요청은 테스트 환경 또는 사용자의 명시적 확인 없이 실제 데이터에 실행하지 않는다.

## 제외 범위

- 일자별 현금흐름의 서버 계산 로직 변경
- 예약 취소·수정 API가 없는 상태에서의 예약 취소 UI
- 지원사업 신청 제출 또는 외부 기관 전송
- 사용자 동의와 무관한 Packet 자동 전송
- 데모 식별자(`businessId=1`, `forecastRunId=1`)를 다중 사업자 선택 기능으로 확장하는 작업
