# Task 5 검토 수정 보고서 — 상태와 상담 연결 접근성

## 수정 내용

- 지원사업 상태 badge를 `SupportProgramMatchStatus`와 단일 style map으로 통합했다.
  - `매칭 가능성 높음`: `bg-primary-blue-100 text-primary-blue-800`
  - `조건 확인 필요`: `bg-neutral-300 text-secondary-500`
- 신청 기한을 ISO 문자열로 저장하고 `2025-06-18` 마지막 갱신 기준일에서 신청 가능 여부를 파생했다.
  - 세 fixture의 기한은 2025-07-31, 2025-08-15, 2025-09-30이며 기준일에는 모두 신청 가능하다.
  - 목록은 신청 가능만 보기 ON으로 시작하고 기준일 안내를 표시한다.
- 목록 하단 상담은 특정 사업을 선택하지 않고 `source=support-programs`로 이동한다.
- 상담 route는 support-program public entry로 `program`을 검증해 최소 직렬화 context만 recovery 화면에 전달한다.
  - 유효한 사업은 지원사업 상담으로 표시하고 해당 상세로 돌아간다.
  - 지원사업과 회복안 query가 함께 오면 지원사업을 우선 표시하고, 명시한 유효 회복안만 함께 표시한다.
  - 알 수 없는 사업 ID는 기본 회복안 상담과 `/recovery/compare`로 안전하게 fallback한다.
  - `source=support-programs` generic 상담은 지원사업 목록으로 돌아간다.
- 카테고리 controls를 `fieldset`/`legend` 그룹으로 만들고 지원사업 관련 대비와 focus token을 강화했다.

## TDD 및 검증

- RED: 기준일 helper, category group, 상태 대비, generic/사업별 상담 context 및 안전한 back link 테스트가 기존 구현에서 실패함을 확인했다.
- 대상 테스트: 지원사업 model/UI, 상담 화면, Switch 33 tests passed.
- 전체 테스트: 28 files / 180 tests passed.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:svgr`, `git diff --check` passed.

## 제한 사항

- `pnpm build`는 권한 확장 환경에서도 기존 Next.js 16.3.2 Turbopack의 `src/shared/config/pretendard_*.module.css` 보조 프로세스 포트 바인딩 `Operation not permitted` 오류로 실패했다.
- 개발 서버는 시작됐으나 브라우저 런타임이 세션 재연결 시 사용 가능한 브라우저 0개를 반환해 이번 수정의 390px 재점검은 수행하지 못했다. 이전 Task 5 브라우저 검증과 별개의 미확인 항목이다.
