# Recovery30 데모 실데이터 API 연동 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement one track per isolated worktree. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `businessId=1`, `forecastRunId=1`의 Recovery30 데모 흐름을 Swagger 계약의 실제 API 응답과 연결한다.

**Architecture:** `codex/feat-api-mutation-methods`가 먼저 `src/shared/api`에 typed mutation helper를 제공한다. 이후 각 작업은 feature 내부의 `contract → api → queries → screen` 수직 슬라이스로 helper를 재사용하고, 공용 API 기반이나 전역 설정은 수정하지 않는다. 첫 배치와 두 번째 배치는 파일 소유권을 분리해 네 개씩 병렬 실행한다.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, TanStack Query, Ky, Vitest, Testing Library, pnpm

**Spec:** `docs/superpowers/specs/2026-09-06-demo-api-integration-design.md`

## Global Constraints

- 모든 작업은 지원사업 API PR이 병합된 최신 `origin/develop`에서 분기한다.
- 새 production dependency를 추가하지 않는다. 오직 `codex/feat-api-mutation-methods`만 `src/shared/api/**`를 수정하며, 다른 모든 트랙은 그 helper를 사용한다. 어떤 트랙도 `src/shared/config/business.ts`를 수정하지 않는다.
- feature 내부 파일은 직접 import하고, 공용 barrel export를 동시에 수정하지 않는다.
- 외부 API 응답은 `unknown`에서 parser로 검증한다. 숫자 ID는 양의 안전 정수, 날짜/일시는 Swagger 형식을 검증한다.
- 읽기 GET은 `businessId=1`, `forecastRunId=1`로 스모크 확인한다. 생성·수정·삭제·적용·전송 요청은 테스트 mock으로만 검증하고 실제 데모 데이터를 변경하지 않는다.
- 각 PR은 자신이 소유한 파일과 테스트만 stage한다. 커밋·push·PR은 사용자의 별도 요청을 받은 경우에만 실행한다.

## File Ownership Map

| Track                | Branch                                            | Files it may modify                                                                                                                         | Files it must not modify                   |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Mutation foundation  | `codex/feat-api-mutation-methods`                 | `src/shared/api/api-request.ts`, `src/shared/api/api-request.test.ts`                                                                       | 모든 feature 및 route 파일                 |
| Timeline             | `codex/feat-cashflow-timeline-api-integration`    | `src/app/cashflow/page.tsx`, `src/app/cashflow/daily/[date]/page.tsx`, `src/app/cashflow/status/page.tsx`, timeline-specific cashflow files | correction screens, `features/forecast/**` |
| Adjustments          | `codex/feat-cashflow-adjustments-api-integration` | `src/app/cashflow/corrections/**`, correction-specific cashflow files                                                                       | timeline pages, `features/data-scope/**`   |
| Data scope           | `codex/feat-data-scope-api-integration`           | `src/app/data-scope/page.tsx`, `src/features/data-scope/**`                                                                                 | all cashflow and consent files             |
| Consent              | `codex/feat-consent-api-integration`              | `src/app/consents/**`, `src/features/consent/**`                                                                                            | recovery follow-up files                   |
| Consultation handoff | `codex/feat-consultation-recovery-handoff`        | consultation route, completion route, `features/consultation/**`, reservation and compare UI                                                | Packet, self-action, follow-up files       |
| Self action          | `codex/feat-self-action-api-integration`          | self-action routes and UI, `features/recovery/self-action/**`                                                                               | packet and follow-up files                 |
| Packet               | `codex/feat-recovery-packet-api-integration`      | `src/app/recovery/page.tsx`, packet UI, `features/recovery/packet/**`                                                                       | consultation and follow-up files           |
| Follow-up            | `codex/feat-followup-api-integration`             | follow-up route and UI, `features/recovery/follow-up/**`                                                                                    | consent and packet files                   |

---

### Task 0: Shared API Mutation Methods

**Branch:** `codex/feat-api-mutation-methods`

**Files:**

- Modify: `src/shared/api/api-request.ts`
- Modify: `src/shared/api/api-request.test.ts`

**Interfaces:**

- Produces `putApiData<T>(path, body, parseData, options)`, `patchApiData<T>(path, body, parseData, options)`, and `deleteApiData<T>(path, parseData, options)`.
- Each helper uses the existing `ApiRequestOptions`, calls the matching `KyInstance` method, applies `parseApiResponse`, preserves `AbortError`, and normalizes `HTTPError` through the existing `normalizeHttpError` function.

- [ ] **Step 1: Write failing helper tests**

  Add one success and one HTTP error test for each HTTP method. The success assertions must prove the JSON body for PUT/PATCH and no body for DELETE:

  ```ts
  await putApiData('/api/businesses/1/consents/ANALYSIS', { granted: true }, parseBoolean, {
    client,
  })
  await patchApiData(
    '/api/forecasts/1/self-action-plans/items/11',
    { status: 'DONE' },
    parseBoolean,
    { client },
  )
  await deleteApiData('/api/businesses/1/adjustments/10', parseBoolean, { client })
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `pnpm vitest run src/shared/api/api-request.test.ts`

  Expected: FAIL because the new helper exports do not exist.

- [ ] **Step 3: Implement the three helpers with the existing error path**

  ```ts
  export async function patchApiData<T>(
    path: string,
    body: unknown,
    parseData: (data: unknown) => T,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const client = options.client ?? apiClient
    try {
      const payload = await client
        .patch(path, {
          json: body,
          ...(options.signal === undefined ? {} : { signal: options.signal }),
        })
        .json<unknown>()
      return parseApiResponse(payload, parseData)
    } catch (error) {
      return throwNormalizedApiError(error)
    }
  }
  ```

  Extract `throwNormalizedApiError(error: unknown): never` only if `getApiData` and `postApiData` are moved to use the same function without behavior changes. `putApiData` is identical except for `client.put`; `deleteApiData` calls `client.delete(path, signalOptions)`.

- [ ] **Step 4: Verify the common behavior**

  Run:

  ```bash
  pnpm vitest run src/shared/api/api-request.test.ts
  pnpm typecheck
  git diff --check
  ```

---

### Task 1: Cashflow Timeline and Narrative API Integration

**Branch:** `codex/feat-cashflow-timeline-api-integration`

**Files:**

- Create: `src/features/cashflow/api/forecast-timeline-contract.ts`
- Create: `src/features/cashflow/api/forecast-timeline-api.ts`
- Create: `src/features/cashflow/api/forecast-timeline-api.test.ts`
- Create: `src/features/cashflow/queries/forecast-timeline-queries.ts`
- Create: `src/features/cashflow/queries/forecast-timeline-queries.test.tsx`
- Modify: `src/features/cashflow/ui/cashflow-dashboard-screen.tsx`
- Modify: `src/features/cashflow/ui/cashflow-daily-detail-screen.tsx`
- Modify: `src/features/cashflow/ui/cashflow-status.tsx`
- Modify: `src/app/cashflow/page.tsx`
- Modify: `src/app/cashflow/daily/[date]/page.tsx`
- Modify: `src/app/cashflow/status/page.tsx`

**Interfaces:**

- Consumes: `forecastRunId` from `useForecastSummaryQueries(DEMO_BUSINESS_ID)`.
- Produces: `getForecastDaily(forecastRunId)`, `getForecastDailyDetail(forecastRunId, date)`, `getForecastNarratives(forecastRunId, kind?)`, and matching query hooks.
- Contract types: `DailyView`, `DailyDetailView`, `DailyItemView`, `NarrativeView`; `DailyView.targetDate` is `YYYY-MM-DD`, and `NarrativeView.kind` is one of `STATUS_LABEL`, `STABLE_REASON`, `RISK_NOTE`, `STATE_CHANGE_HINT`, `DISCLAIMER`.

- [ ] **Step 1: Write contract and request tests first**

  Add parser test fixtures for a shortfall day, a holiday day, a detail with `CONFIRMED`/`EXPECTED`/`ADJUSTMENT` items, and an invalid `targetDate`. Add API tests that expect these exact requests:

  ```ts
  await getForecastDaily(1, { client })
  await getForecastDailyDetail(1, '2025-07-20', { client })
  await getForecastNarratives(1, { client, kind: 'RISK_NOTE' })

  expect(client.get).toHaveBeenNthCalledWith(1, '/api/forecasts/1/daily', expect.anything())
  expect(client.get).toHaveBeenNthCalledWith(
    2,
    '/api/forecasts/1/daily/2025-07-20',
    expect.anything(),
  )
  ```

- [ ] **Step 2: Run the API test and verify it fails**

  Run: `pnpm vitest run src/features/cashflow/api/forecast-timeline-api.test.ts`

  Expected: FAIL because the timeline API module and exported functions do not exist.

- [ ] **Step 3: Implement contract, API functions, and query keys**

  Implement the public boundary below and use `getApiData` with the feature parser functions.

  ```ts
  export function getForecastDaily(forecastRunId: number, options: RequestOptions = {})
  export function getForecastDailyDetail(
    forecastRunId: number,
    date: string,
    options: RequestOptions = {},
  )
  export function getForecastNarratives(
    forecastRunId: number,
    options: NarrativeRequestOptions = {},
  )

  export const forecastTimelineQueryKeys = {
    daily: (forecastRunId: number | null) => ['cashflow', 'run', forecastRunId, 'daily'] as const,
    detail: (forecastRunId: number | null, date: string) =>
      ['cashflow', 'run', forecastRunId, 'daily', date] as const,
    narratives: (forecastRunId: number | null, kind?: NarrativeKind) =>
      ['cashflow', 'run', forecastRunId, 'narratives', kind] as const,
  }
  ```

- [ ] **Step 4: Replace static timeline and status content with query states**

  Map `DailyView` values to the existing day card and map `DailyDetailView.items` to the existing detail source rows. Use `targetDate` for the route href, `closingBalanceExpected` for the displayed expected balance, `shortfall` for the risk treatment, and `holidayShiftNote` only when not null. Render loading, empty, error, and retry states. Use narratives by kind rather than fixed copy; preserve static layout only as a presentation shell.

- [ ] **Step 5: Add UI and error-code coverage**

  Add a screen test that renders a 30-row API payload, opens `2025-07-20`, and shows four detail items. Add an error fixture for `FORECAST_404_1` from `/api/forecasts/999999/shortfall` and ensure the visible retry copy does not render the stale static data.

- [ ] **Step 6: Verify this track**

  Run:

  ```bash
  pnpm vitest run src/features/cashflow/api/forecast-timeline-api.test.ts src/features/cashflow/queries/forecast-timeline-queries.test.tsx src/features/cashflow/ui/cashflow-dashboard-screen.test.tsx src/features/cashflow/ui/cashflow-daily-detail-screen.test.tsx
  pnpm typecheck
  git diff --check
  ```

### Task 2: Cashflow Adjustment API Integration

**Branch:** `codex/feat-cashflow-adjustments-api-integration`

**Files:**

- Create: `src/features/cashflow/api/adjustment-contract.ts`
- Create: `src/features/cashflow/api/adjustment-api.ts`
- Create: `src/features/cashflow/api/adjustment-api.test.ts`
- Create: `src/features/cashflow/queries/adjustment-queries.ts`
- Create: `src/features/cashflow/queries/adjustment-queries.test.tsx`
- Modify: `src/features/cashflow/ui/cashflow-correction-overview-screen.tsx`
- Modify: `src/features/cashflow/ui/cashflow-correction-form-screen.tsx`
- Modify: `src/features/cashflow/ui/cashflow-repeat-pattern-candidates.tsx`
- Modify: relevant `src/app/cashflow/corrections/**/page.tsx` routes

**Interfaces:**

- Consumes: `DEMO_BUSINESS_ID` and user-entered `CreateAdjustmentCommand` fields.
- Produces: `listAdjustments`, `createAdjustment`, `updateAdjustment`, `deleteAdjustment`, `listAdjustmentSuggestions`, `acceptAdjustmentSuggestion`, `applyAdjustments` and invalidating mutations.
- `CreateAdjustmentCommand` requires `adjustmentType`, positive `amount`, `certainty`, and `expectedDate`; `applyAdjustments` returns `{ appliedCount, appliedRunId }`.

- [ ] **Step 1: Write failing API and mutation tests**

  Test create payload forwarding, PATCH only changed values, DELETE by adjustment ID, suggestion acceptance, and apply invalidation. Use this apply assertion:

  ```ts
  await applyAdjustments(1, { client })
  expect(client.post).toHaveBeenCalledWith('/api/businesses/1/adjustments/apply', expect.anything())
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `pnpm vitest run src/features/cashflow/api/adjustment-api.test.ts`

  Expected: FAIL because the adjustment module is absent.

- [ ] **Step 3: Implement parsers, API functions, and mutation invalidation**

  Define positive-ID and positive-amount guards. After every successful mutation, invalidate both `adjustments(businessId)` and `suggestions(businessId)` query keys. After `applyAdjustments`, also invalidate `forecastQueryKeys.latest(businessId)` so later forecast views refetch.

  ```ts
  export function useApplyAdjustmentsMutation(businessId: number) {
    return useMutation({
      mutationFn: () => applyAdjustments(businessId),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: adjustmentQueryKeys.business(businessId) }),
    })
  }
  ```

- [ ] **Step 4: Bind the correction UI to live state**

  Render API adjustments rather than `CASHFLOW_CORRECTION_ITEMS`. On submit create a DRAFT adjustment, show field validation for non-positive amount, accept a `PROPOSED` suggestion into DRAFT, and enable the apply button only when a mutation is not pending. Show `appliedCount` and `appliedRunId` after a successful apply; do not claim that the forecast engine has already recalculated.

- [ ] **Step 5: Add interaction tests**

  Cover the two demo SAVED adjustments, two PROPOSED suggestions, a successful accept, an apply success message, and a 400 create failure with retry. Ensure a pending apply button cannot issue a duplicate POST.

- [ ] **Step 6: Verify this track**

  Run:

  ```bash
  pnpm vitest run src/features/cashflow/api/adjustment-api.test.ts src/features/cashflow/queries/adjustment-queries.test.tsx src/features/cashflow/ui/cashflow-correction-overview-screen.test.tsx src/features/cashflow/ui/cashflow-correction-form-screen.test.tsx
  pnpm typecheck
  git diff --check
  ```

### Task 3: Data Scope API Integration

**Branch:** `codex/feat-data-scope-api-integration`

**Files:**

- Create: `src/features/data-scope/api/data-source-contract.ts`
- Create: `src/features/data-scope/api/data-source-api.ts`
- Create: `src/features/data-scope/api/data-source-api.test.ts`
- Create: `src/features/data-scope/queries/data-source-queries.ts`
- Create: `src/features/data-scope/queries/data-source-queries.test.tsx`
- Modify: `src/features/data-scope/ui/data-scope-screen.tsx`
- Modify: `src/features/data-scope/ui/data-scope-screen.test.tsx`
- Modify: `src/app/data-scope/page.tsx`

**Interfaces:**

- Produces `getDataSources(businessId)` and `useDataSourcesQuery(businessId)`.
- `DataSourceView` maps `BANK_ACCOUNT`, `CARD_SETTLEMENT`, `LOAN`, `AUTO_TRANSFER` with nullable institution/coverage/sync time, and `belowThreshold` controls the warning treatment.

- [ ] **Step 1: Write a failing parser and screen test**

  Use four source fixtures—KB·신한 account, BC·KB card, IBK loan, and automatic transfer—and assert a 61% source is visually marked as below threshold.

- [ ] **Step 2: Run the test and verify it fails**

  Run: `pnpm vitest run src/features/data-scope/api/data-source-api.test.ts src/features/data-scope/ui/data-scope-screen.test.tsx`

  Expected: FAIL because the screen still uses the static data-scope model.

- [ ] **Step 3: Implement the vertical slice**

  ```ts
  export function getDataSources(businessId: number, options: RequestOptions = {}) {
    return getApiData(
      `/api/businesses/${businessId}/data-sources`,
      parseDataSources,
      toApiRequestOptions(options),
    )
  }

  export function useDataSourcesQuery(businessId: number) {
    return useQuery({
      queryKey: ['data-scope', businessId],
      queryFn: ({ signal }) => getDataSources(businessId, { signal }),
    })
  }
  ```

- [ ] **Step 4: Render API state and retry behavior**

  Replace static source cards with parsed source views, preserve existing source icons by source type, render `SYNCED`/`PARTIAL`/`FAILED`, and expose a retry button on request failure. Empty data must render a no-connected-source message.

- [ ] **Step 5: Verify this track**

  Run:

  ```bash
  pnpm vitest run src/features/data-scope/api/data-source-api.test.ts src/features/data-scope/queries/data-source-queries.test.tsx src/features/data-scope/ui/data-scope-screen.test.tsx
  pnpm typecheck
  git diff --check
  ```

### Task 4: Consent API Integration

**Branch:** `codex/feat-consent-api-integration`

**Files:**

- Create: `src/features/consent/api/consent-contract.ts`
- Create: `src/features/consent/api/consent-api.ts`
- Create: `src/features/consent/api/consent-api.test.ts`
- Create: `src/features/consent/queries/consent-queries.ts`
- Create: `src/features/consent/queries/consent-queries.test.tsx`
- Modify: `src/features/consent/ui/consent-management-screen.tsx`
- Modify: `src/features/consent/ui/consent-setup-screen.tsx`
- Modify: `src/features/consent/ui/consent-screens.test.tsx`

**Interfaces:**

- Produces `getConsentTypes()`, `getConsentStatuses(businessId)`, `updateConsent(businessId, typeCode, { granted })`.
- The UI joins the type master and current status by `code`/`typeCode`; `GRANTED` maps to checked and `WITHDRAWN`/`NOT_SET` to unchecked.

- [ ] **Step 1: Write failing request and screen tests**

  Assert the exact update contract and a required consent withdrawal confirmation:

  ```ts
  await updateConsent(1, 'FOLLOWUP_TRACKING', { granted: false }, { client })
  expect(client.put).toHaveBeenCalledWith(
    '/api/businesses/1/consents/FOLLOWUP_TRACKING',
    expect.objectContaining({ json: { granted: false } }),
  )
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `pnpm vitest run src/features/consent/api/consent-api.test.ts src/features/consent/ui/consent-screens.test.tsx`

  Expected: FAIL because consent state is local-only.

- [ ] **Step 3: Implement query join and optimistic-safe mutation**

  Fetch master and status lists in parallel. Do not update local checked state before the PUT succeeds; disable only the changed switch while pending, invalidate consent status on success, and restore interaction on error.

- [ ] **Step 4: Bind the existing withdrawal dialog to the API**

  Keep the modal for required analysis withdrawal. Confirming it calls `updateConsent(..., { granted: false })`; canceling sends no request. Show the backend `lastChangedAt` as the latest changed date and retain current data-use explanations from the consent master.

- [ ] **Step 5: Verify this track**

  Run:

  ```bash
  pnpm vitest run src/features/consent/api/consent-api.test.ts src/features/consent/queries/consent-queries.test.tsx src/features/consent/ui/consent-screens.test.tsx
  pnpm typecheck
  git diff --check
  ```

### Task 5: Recovery Option to Consultation Completion Handoff

**Branch:** `codex/feat-consultation-recovery-handoff`

**Files:**

- Modify: `src/features/recovery/ui/recovery-plan-comparison-screen.tsx`
- Modify: `src/app/recovery/consultation/page.tsx`
- Create: `src/app/recovery/consultation/[consultationId]/complete/page.tsx`
- Create: `src/features/consultation/ui/consultation-complete-screen.tsx`
- Create: `src/features/consultation/ui/consultation-complete-screen.test.tsx`
- Modify: `src/features/consultation/api/consultation-contract.ts`
- Modify: `src/features/recovery/ui/consultation-reservation-screen.tsx`
- Modify: `src/features/recovery/ui/consultation-reservation-screen.test.tsx`

**Interfaces:**

- Consumes the numeric `selectedOptionIds` already maintained by `RecoveryPlanComparisonScreen`.
- Extends `BookConsultationCommand` with `recoveryOptionIds?: readonly number[]`.
- Produces `/recovery/consultation/{consultationId}/complete`, which calls the existing `useConsultationQuery(consultationId)`.

- [ ] **Step 1: Write a failing handoff test**

  Select option IDs `[1, 3]`, assert the comparison link contains `plans=1&plans=3`, submit the reservation, and assert the POST body contains the same numeric IDs. Assert success navigation targets `/recovery/consultation/8/complete`.

- [ ] **Step 2: Run the test and verify it fails**

  Run: `pnpm vitest run src/features/recovery/ui/recovery-plan-comparison-screen.test.tsx src/features/recovery/ui/consultation-reservation-screen.test.tsx`

  Expected: FAIL because the current link drops selected numeric IDs and success remains inline.

- [ ] **Step 3: Preserve selected IDs in the route and POST body**

  Build the route without static string option IDs:

  ```ts
  const parameters = new URLSearchParams()
  selectedOptionIds.forEach((optionId) => parameters.append('plans', String(optionId)))
  const href = `/recovery/consultation?${parameters.toString()}`

  booking.mutate({
    channel: 'PHONE',
    counselorId: selectedCounselorId,
    slotId: selectedSlotId,
    transferConsentGranted: selectedTransfers.length > 0,
    recoveryOptionIds: selectedOptionIds,
  })
  ```

  Parse only positive integer `plans` values in the consultation page and omit the property for support-program-only consultations.

- [ ] **Step 4: Implement the completion route**

  On POST success use `router.push` with the returned ID. The complete screen fetches that ID, renders `REQUESTED` as “상담 예약이 접수되었습니다”, shows counselor and `scheduledAt`, handles GET failure with retry, and provides exact links to `/recovery/compare` and `/recovery`.

- [ ] **Step 5: Add duplicate-submit and failure coverage**

  Keep the reservation button disabled while `booking.isPending`, retain inputs on API failure, and prove retry calls one new POST. Verify a completion GET failure keeps the back actions visible.

- [ ] **Step 6: Verify this track**

  Run:

  ```bash
  pnpm vitest run src/features/consultation src/features/recovery/ui/recovery-plan-comparison-screen.test.tsx
  pnpm typecheck
  git diff --check
  ```

### Task 6: Self-action API Integration

**Branch:** `codex/feat-self-action-api-integration`

**Files:**

- Create: `src/features/recovery/self-action/api/self-action-contract.ts`
- Create: `src/features/recovery/self-action/api/self-action-api.ts`
- Create: `src/features/recovery/self-action/api/self-action-api.test.ts`
- Create: `src/features/recovery/self-action/queries/self-action-queries.ts`
- Create: `src/features/recovery/self-action/queries/self-action-queries.test.tsx`
- Modify: `src/features/recovery/ui/self-action-setup-screen.tsx`
- Modify: `src/features/recovery/ui/self-action-setup-screen.test.tsx`
- Modify: `src/app/recovery/self-action/page.tsx`
- Modify: `src/app/recovery/actions/fixed-cost-reschedule/save/page.tsx`

**Interfaces:**

- Produces `getSelfActionPlans(forecastRunId)`, `createSelfActionPlan(forecastRunId, command)`, `updateSelfActionItem(forecastRunId, itemId, command)`.
- A plan has `{ id, recoveryOptionId, expectedEffectText, status, savedAt, items }`; an item status is `PENDING` or `DONE`.

- [ ] **Step 1: Write failing query and toggle tests**

  Use one plan with three items. Assert a `DONE` checkbox sends only `{ status: 'DONE' }` to `PATCH /api/forecasts/1/self-action-plans/items/11`.

- [ ] **Step 2: Run the test and verify it fails**

  Run: `pnpm vitest run src/features/recovery/self-action/api/self-action-api.test.ts src/features/recovery/ui/self-action-setup-screen.test.tsx`

  Expected: FAIL because the setup screen reads static recovery execution data.

- [ ] **Step 3: Implement parsers, queries, and mutations**

  Use a per-item mutation key containing `forecastRunId` and `itemId`. Invalidate `['self-action', forecastRunId]` after create or patch. A failed item update must leave the last server value on screen after refetch.

- [ ] **Step 4: Bind saved plan and create flow**

  Render returned preparation items. If no plan exists, expose a save action that creates a plan with selected backend `recoveryOptionId`; then render its returned items. Do not derive backend numeric IDs from the old static string catalog.

- [ ] **Step 5: Verify this track**

  Run:

  ```bash
  pnpm vitest run src/features/recovery/self-action/api/self-action-api.test.ts src/features/recovery/self-action/queries/self-action-queries.test.tsx src/features/recovery/ui/self-action-setup-screen.test.tsx
  pnpm typecheck
  git diff --check
  ```

### Task 7: Recovery Packet API Integration

**Branch:** `codex/feat-recovery-packet-api-integration`

**Files:**

- Create: `src/features/recovery/packet/api/packet-contract.ts`
- Create: `src/features/recovery/packet/api/packet-api.ts`
- Create: `src/features/recovery/packet/api/packet-api.test.ts`
- Create: `src/features/recovery/packet/queries/packet-queries.ts`
- Create: `src/features/recovery/packet/queries/packet-queries.test.tsx`
- Modify: `src/features/recovery/ui/recovery-packet-screen.tsx`
- Modify: `src/features/recovery/ui/recovery-packet-screen.test.tsx`
- Modify: `src/app/recovery/page.tsx`

**Interfaces:**

- Produces `getLatestPacket(businessId)`, `getPacket(packetId)`, `createPacket(forecastRunId, { snapshot })`, `getPacketTransfers(packetId)`, `createPacketTransfer(packetId, command)`.
- Packet transfer command requires `consentId`; its UI must never submit unless the consent ID has been obtained from the consent track.

- [ ] **Step 1: Write failing API tests**

  Assert latest lookup uses `/api/businesses/1/packets/latest`, no-history 404 is distinguishable from a malformed response, creation POST preserves a JSON object snapshot, and transfer POST is rejected locally if `consentId` is absent.

- [ ] **Step 2: Run the test and verify it fails**

  Run: `pnpm vitest run src/features/recovery/packet/api/packet-api.test.ts`

  Expected: FAIL because Packet API modules do not exist.

- [ ] **Step 3: Implement Packet queries and snapshot boundary**

  Parse packet metadata separately from `snapshot: Record<string, unknown>`. Render known snapshot display fields only after type narrowing; never cast `snapshot` to the old static packet model. For a latest-packet 404, show a create-available empty state rather than an error alert.

- [ ] **Step 4: Bind Packet screen and transfer history**

  Replace static version, generated time, status, and send time with `PacketView`. Render transfer history by `sentAt`. The transfer action is disabled without a valid `PACKET_TRANSFER` GRANTED consent; after successful transfer invalidate both packet detail and transfers queries.

- [ ] **Step 5: Verify this track**

  Run:

  ```bash
  pnpm vitest run src/features/recovery/packet/api/packet-api.test.ts src/features/recovery/packet/queries/packet-queries.test.tsx src/features/recovery/ui/recovery-packet-screen.test.tsx
  pnpm typecheck
  git diff --check
  ```

### Task 8: Follow-up API Integration

**Branch:** `codex/feat-followup-api-integration`

**Files:**

- Create: `src/features/recovery/follow-up/api/follow-up-contract.ts`
- Create: `src/features/recovery/follow-up/api/follow-up-api.ts`
- Create: `src/features/recovery/follow-up/api/follow-up-api.test.ts`
- Create: `src/features/recovery/follow-up/queries/follow-up-queries.ts`
- Create: `src/features/recovery/follow-up/queries/follow-up-queries.test.tsx`
- Modify: `src/features/recovery/ui/recovery-follow-up-screen.tsx`
- Modify: `src/features/recovery/ui/recovery-follow-up-screen.test.tsx`
- Modify: `src/app/recovery/follow-up/page.tsx`

**Interfaces:**

- Produces `getFollowups(businessId)`, `getFollowupResult(scheduleId)`, `getRecoveryExecutionStatuses(businessId)`.
- The result query runs only for the first returned schedule where `hasResult` is true; a 404 result is rendered as “결과가 아직 기록되지 않았습니다”, not as a page-wide failure.

- [ ] **Step 1: Write failing API and screen tests**

  Use D30 `DONE` with `hasResult=true`, D60/D90 `SCHEDULED`, a `PARTIAL` result with `recoveryAmount=1640000` and `riskStatus='STABLE'`, plus execution states `IN_PROGRESS` and `BLOCKED` with blocker text.

- [ ] **Step 2: Run the test and verify it fails**

  Run: `pnpm vitest run src/features/recovery/follow-up/api/follow-up-api.test.ts src/features/recovery/ui/recovery-follow-up-screen.test.tsx`

  Expected: FAIL because the follow-up screen reads the static execution model.

- [ ] **Step 3: Implement parser and dependent queries**

  ```ts
  const resultScheduleId = followups.data?.find((item) => item.hasResult)?.id ?? null
  const result = useQuery({
    queryKey: followUpQueryKeys.result(resultScheduleId),
    queryFn:
      resultScheduleId === null
        ? skipToken
        : ({ signal }) => getFollowupResult(resultScheduleId, { signal }),
  })
  ```

  Keep schedules and execution statuses independently retryable.

- [ ] **Step 4: Render real D30/D60/D90, result, and blockers**

  Map `checkpoint`, `scheduledDate`, and `status` to the milestone cards. Map `PARTIAL` to “부분 회복”, format `recoveryAmount` in KRW, map `riskStatus='STABLE'` to the existing stable treatment, and show `blockerText` only for `BLOCKED` execution rows. Replace in-screen consent toggles with the existing link to `/consents` so this track does not modify consent state.

- [ ] **Step 5: Add the specified 404 coverage**

  Mock `GET /api/followups/999999/result` with `FOLLOWUP_404_1`. Assert the page keeps D60/D90 and execution rows visible while the result section shows its retry/empty-result treatment.

- [ ] **Step 6: Verify this track**

  Run:

  ```bash
  pnpm vitest run src/features/recovery/follow-up/api/follow-up-api.test.ts src/features/recovery/follow-up/queries/follow-up-queries.test.tsx src/features/recovery/ui/recovery-follow-up-screen.test.tsx
  pnpm typecheck
  git diff --check
  ```

## Program-level Verification and Integration

- [ ] Rebase or recreate every active worktree from the current `origin/develop` after the support-program API PR is merged; do not merge work against stale local `develop`.
- [ ] Review each PR against its File Ownership Map row before integration; reject edits to another track's files or `src/shared/api/**`.
- [ ] After all tracks merge, run `pnpm test`, `pnpm typecheck`, and `git diff --check` on updated `develop`.
- [ ] Start the application and perform read-only smoke checks for home → timeline → day detail → data scope → recovery comparison → consultation completion → Packet → follow-up using `businessId=1` and `forecastRunId=1`.
- [ ] Do not run live create, update, delete, apply, or transfer calls as smoke tests without a separate user confirmation because they persist demo data.
