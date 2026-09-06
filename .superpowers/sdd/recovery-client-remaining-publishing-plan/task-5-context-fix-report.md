# Task 5 재검토 수정 보고서 — 지원사업 상담 맥락

## 수정 내용

- `source=support-programs`와 유효한 `program` query를 지원사업 상담 맥락으로 통일했다.
  - 둘 다 회복안 기본 선택과 recovery option chips를 주입하거나 표시하지 않는다.
  - 유효한 `program`은 사업명과 `선택한 지원사업` 전송 항목만 표시하고 해당 상세로 돌아간다.
  - generic source는 사업명 없이 지원사업 상담 목적과 `지원사업 상담 요청 내용` 전송 항목을 제공하고 목록으로 돌아간다.
  - `program`과 `plans`가 함께 오면 지원사업 맥락이 우선이며 plans를 소비하지 않는다.
  - 유효하지 않은 program은 기존 기본 회복안 상담으로 fallback한다.
- recovery option 상담은 기본 2개 chip과 `선택한 회복안` 전송 항목의 기존 동작을 유지했다.
- 지원사업 카드 상세 링크의 hover 색을 `primary-blue-800`으로 올리고 focus ring과 함께 고대비 token을 사용했다.

## TDD 및 검증

- RED: 지원사업 generic/detail/혼합 query에서 recovery chips 또는 `선택한 회복안` 항목이 남는 문제와 카드 hover class를 테스트로 재현했다.
- GREEN: 대상 상담·지원사업 UI 테스트 27개 통과.
- 전체 테스트: 28 files / 182 tests passed.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:svgr`, Prettier, `git diff --check` passed.

## 제한 사항

- `pnpm build`는 기존 Next.js 16.3.2 Turbopack의 `src/shared/config/pretendard_*.module.css` 보조 프로세스 포트 바인딩 `Operation not permitted` 오류 때문에 이전 두 검토와 동일하게 통과하지 못했다.
- 브라우저 런타임은 이전 수정에서 재연결 시 사용 가능한 browser 0개를 반환했다. 따라서 이번 수정의 390px browser 재점검은 수행하지 못했다.
