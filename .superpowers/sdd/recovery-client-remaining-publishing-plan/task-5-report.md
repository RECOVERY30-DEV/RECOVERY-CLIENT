# Task 5 구현 보고서 — 지원사업 목록과 상세

## 구현 범위

- `/recovery/support-programs` 목록 화면을 추가했다.
  - 검색, 카테고리(전체·행정자금·경영지원), 지역, 신청 가능만 보기 필터를 화면 내부 상태로 제공한다.
  - 필터 결과 수, 빈 상태, 지원사업 카드 3개, 출처 안내, 상담 예약 링크를 제공한다.
- `/recovery/support-programs/[programId]` 상세 화면을 추가했다.
  - 지원 개요, 추정 자격요건 상태(충족 가능/확인 필요), 필요서류, 공식 출처 안내, 상담 예약 링크를 제공한다.
  - 알 수 없는 ID는 `notFound()`로 처리하고 `generateStaticParams()`로 fixture ID를 제공한다.
- 하나의 `SUPPORT_PROGRAMS` fixture를 목록과 상세 화면에서 함께 사용한다.
  - 소상공인 경영안정자금의 canonical 값은 운전자금 최대 7,000만 원과 사업자등록 2년 이상이다.
  - `매칭 가능성 높음`/`조건 확인 필요`, `금융거래확인서`, `(해당 시)` 표기를 적용했다.
  - 공식 URL을 추측하지 않고, 확인되지 않은 공식 공고 제어는 비활성화했다.

## TDD 기록

- RED: 목록·상세·동적 경로 테스트를 먼저 추가하고 대상 모듈이 존재하지 않아 실패함을 확인했다.
- GREEN: fixture, UI, route를 추가한 뒤 대상 테스트 7개가 통과했다.

## 검증

- `pnpm vitest run src/features/support-program/ui/support-program-screens.test.tsx 'src/app/recovery/support-programs/[programId]/page.test.tsx'` — 7 passed
- `pnpm lint` — passed
- `pnpm typecheck` — passed
- `pnpm test:run` — 27 files / 166 tests passed
- `pnpm test:svgr` — 1 passed
- 변경 파일 대상 `prettier --check` — passed
- `git diff --check` — passed
- 390×844 브라우저 — 목록 3개 카드·수평 overflow 없음, 행정자금/부산 필터 결과 1건→신청 가능만 보기 빈 상태, 상세 수평 overflow 없음·공식 공고 비활성 상태 확인

## 검증 제한

- `pnpm check`는 기존 `.superpowers/sdd/recovery-client-remaining-publishing-plan/task-4-brief.md`와 `task-5-brief.md`의 Prettier 경고 때문에 완료되지 않았다. 두 파일은 본 작업의 범위 밖이라 수정하지 않았다.
- `pnpm build`는 sandbox 및 권한 확장 재시도 모두에서 Next.js 16.3.2 Turbopack이 `src/shared/config/pretendard_*.module.css` 처리 중 `binding to a port: Operation not permitted` 오류로 실패했다. 개발 서버에서는 변경한 목록·상세 경로가 각각 HTTP 200으로 렌더링됐다.

## 문서 영향과 남은 위험

- 이 보고서 외 사용자 문서는 변경하지 않았다.
- 외부 공식 URL은 확정되지 않았으므로 비활성 상태로 남겨 두었다. URL이 확정되면 fixture에 추가하고 외부 링크를 활성화해야 한다.
